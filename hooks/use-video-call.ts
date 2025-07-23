"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { signalingService } from "@/lib/signaling-service"

export interface CallParticipant {
  id: string
  name: string
  role: "doctor" | "patient" | "admin"
  avatar?: string
}

export interface CallState {
  status: "idle" | "calling" | "ringing" | "connected" | "ended" | "failed"
  isIncoming: boolean
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  remoteParticipant: CallParticipant | null
  appointmentId: string | null
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isMuted: boolean
  connectionQuality: "excellent" | "good" | "poor" | null
  error: string | null
}

export interface VideoCallHook {
  callState: CallState
  initiateCall: (participantId: string, appointmentId?: string) => Promise<void>
  answerCall: () => Promise<void>
  rejectCall: () => void
  endCall: () => void
  toggleVideo: () => void
  toggleAudio: () => void
  toggleMute: () => void
}

const initialCallState: CallState = {
  status: "idle",
  isIncoming: false,
  localStream: null,
  remoteStream: null,
  remoteParticipant: null,
  appointmentId: null,
  isVideoEnabled: true,
  isAudioEnabled: true,
  isMuted: false,
  connectionQuality: null,
  error: null,
}

export function useVideoCall(currentUser: CallParticipant): VideoCallHook {
  const [callState, setCallState] = useState<CallState>(initialCallState)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)

  // Initialize signaling service
  useEffect(() => {
    signalingService.initialize(currentUser.id)

    // Listen for incoming calls
    signalingService.onIncomingCall((data) => {
      console.log("Incoming call from:", data.from)
      setCallState((prev) => ({
        ...prev,
        status: "ringing",
        isIncoming: true,
        remoteParticipant: data.caller,
        appointmentId: data.appointmentId || null,
      }))
    })

    // Listen for call answers
    signalingService.onCallAnswered((data) => {
      console.log("Call answered by:", data.from)
      setCallState((prev) => ({
        ...prev,
        status: "connected",
        remoteParticipant: data.participant,
      }))
    })

    // Listen for call rejections
    signalingService.onCallRejected((data) => {
      console.log("Call rejected by:", data.from)
      setCallState((prev) => ({
        ...prev,
        status: "ended",
        error: "Call was rejected",
      }))
      cleanup()
    })

    // Listen for call endings
    signalingService.onCallEnded((data) => {
      console.log("Call ended by:", data.from)
      setCallState((prev) => ({
        ...prev,
        status: "ended",
      }))
      cleanup()
    })

    // Listen for WebRTC signaling
    signalingService.onOffer(handleOffer)
    signalingService.onAnswer(handleAnswer)
    signalingService.onIceCandidate(handleIceCandidate)

    return () => {
      signalingService.disconnect()
      cleanup()
    }
  }, [currentUser.id])

  // Setup peer connection
  const setupPeerConnection = useCallback(() => {
    const configuration: RTCConfiguration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    }

    const peerConnection = new RTCPeerConnection(configuration)
    peerConnectionRef.current = peerConnection

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log("Received remote stream")
      const [remoteStream] = event.streams
      remoteStreamRef.current = remoteStream
      setCallState((prev) => ({
        ...prev,
        remoteStream,
      }))
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        signalingService.sendIceCandidate(callState.remoteParticipant?.id || "", event.candidate)
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log("Connection state:", peerConnection.connectionState)

      if (peerConnection.connectionState === "connected") {
        setCallState((prev) => ({
          ...prev,
          status: "connected",
          connectionQuality: "excellent", // TODO: Implement actual quality detection
        }))
      } else if (peerConnection.connectionState === "failed") {
        setCallState((prev) => ({
          ...prev,
          status: "failed",
          error: "Connection failed",
        }))
        cleanup()
      }
    }

    return peerConnection
  }, [callState.remoteParticipant?.id])

  // Get user media
  const getUserMedia = useCallback(async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      localStreamRef.current = stream
      setCallState((prev) => ({
        ...prev,
        localStream: stream,
      }))

      return stream
    } catch (error) {
      console.error("Failed to get user media:", error)
      throw new Error("Failed to access camera/microphone")
    }
  }, [])

  // Handle WebRTC offer
  const handleOffer = useCallback(
    async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      try {
        const peerConnection = setupPeerConnection()
        const stream = await getUserMedia()

        // Add local stream to peer connection
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream)
        })

        await peerConnection.setRemoteDescription(data.offer)
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)

        signalingService.sendAnswer(data.from, answer)
      } catch (error) {
        console.error("Failed to handle offer:", error)
        setCallState((prev) => ({
          ...prev,
          status: "failed",
          error: "Failed to establish connection",
        }))
      }
    },
    [setupPeerConnection, getUserMedia],
  )

  // Handle WebRTC answer
  const handleAnswer = useCallback(async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(data.answer)
      }
    } catch (error) {
      console.error("Failed to handle answer:", error)
    }
  }, [])

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (data: { from: string; candidate: RTCIceCandidateInit }) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(data.candidate)
      }
    } catch (error) {
      console.error("Failed to handle ICE candidate:", error)
    }
  }, [])

  // Initiate call
  const initiateCall = useCallback(
    async (participantId: string, appointmentId?: string) => {
      try {
        setCallState((prev) => ({
          ...prev,
          status: "calling",
          appointmentId: appointmentId || null,
        }))

        const peerConnection = setupPeerConnection()
        const stream = await getUserMedia()

        // Add local stream to peer connection
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream)
        })

        // Create and send offer
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)

        signalingService.initiateCall(participantId, currentUser, appointmentId)
        signalingService.sendOffer(participantId, offer)
      } catch (error) {
        console.error("Failed to initiate call:", error)
        setCallState((prev) => ({
          ...prev,
          status: "failed",
          error: "Failed to start call",
        }))
      }
    },
    [currentUser, setupPeerConnection, getUserMedia],
  )

  // Answer call
  const answerCall = useCallback(async () => {
    try {
      if (callState.remoteParticipant) {
        signalingService.answerCall(callState.remoteParticipant.id, currentUser)
        // The actual WebRTC connection will be handled by the offer/answer flow
      }
    } catch (error) {
      console.error("Failed to answer call:", error)
      setCallState((prev) => ({
        ...prev,
        status: "failed",
        error: "Failed to answer call",
      }))
    }
  }, [callState.remoteParticipant, currentUser])

  // Reject call
  const rejectCall = useCallback(() => {
    if (callState.remoteParticipant) {
      signalingService.rejectCall(callState.remoteParticipant.id)
    }
    setCallState(initialCallState)
    cleanup()
  }, [callState.remoteParticipant])

  // End call
  const endCall = useCallback(() => {
    if (callState.remoteParticipant) {
      signalingService.endCall(callState.remoteParticipant.id)
    }
    setCallState(initialCallState)
    cleanup()
  }, [callState.remoteParticipant])

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setCallState((prev) => ({
          ...prev,
          isVideoEnabled: videoTrack.enabled,
        }))
      }
    }
  }, [])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setCallState((prev) => ({
          ...prev,
          isAudioEnabled: audioTrack.enabled,
        }))
      }
    }
  }, [])

  // Toggle mute (same as toggle audio for now)
  const toggleMute = useCallback(() => {
    toggleAudio()
    setCallState((prev) => ({
      ...prev,
      isMuted: !prev.isAudioEnabled,
    }))
  }, [toggleAudio])

  // Cleanup function
  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current = null
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
  }, [])

  return {
    callState,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    toggleVideo,
    toggleAudio,
    toggleMute,
  }
}
