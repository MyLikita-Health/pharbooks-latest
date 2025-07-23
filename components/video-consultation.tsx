"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Settings,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Copy,
  ExternalLink,
  AlertCircle,
  Loader2,
  Camera,
  PhoneCall,
  Plus,
  Trash2,
  FileText,
  Pill,
  Stethoscope,
  Send,
  User,
  CheckCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

interface VideoConsultationProps {
  appointmentId: string
  meetingId?: string
  meetingUrl?: string
  userRole: "doctor" | "patient"
  patientName?: string
  doctorName?: string
  patientId?: string
  onCallEnd: () => void
  onCallStart?: () => void
}

interface CallState {
  isConnected: boolean
  isConnecting: boolean
  isRinging: boolean
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isMuted: boolean
  isFullscreen: boolean
  callDuration: number
  connectionQuality: "excellent" | "good" | "poor" | "disconnected"
  hasLocalVideo: boolean
  hasRemoteVideo: boolean
  mediaError: string | null
  cameraPermission: "granted" | "denied" | "prompt" | "unknown"
  microphonePermission: "granted" | "denied" | "prompt" | "unknown"
  showVideoElements: boolean
  signalingState: RTCSignalingState
  iceConnectionState: RTCIceConnectionState
}

interface SignalingMessage {
  type: "offer" | "answer" | "ice-candidate" | "call-request" | "call-accept" | "call-reject"
  data?: any
  from: string
  to: string
  timestamp: number
}

interface Prescription {
  id: string
  drugName: string
  dosage: string
  frequency: string
  duration: string
  period: string
  instructions?: string
}

interface Investigation {
  id: string
  type: string
  name: string
  urgency: "routine" | "urgent" | "stat"
  instructions?: string
}

export default function VideoConsultation({
  appointmentId,
  meetingId,
  meetingUrl,
  userRole,
  patientName = "Patient",
  doctorName = "Doctor",
  patientId,
  onCallEnd,
  onCallStart,
}: VideoConsultationProps) {
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isConnecting: false,
    isRinging: false,
    isVideoEnabled: true,
    isAudioEnabled: true,
    isMuted: false,
    isFullscreen: false,
    callDuration: 0,
    connectionQuality: "excellent",
    hasLocalVideo: false,
    hasRemoteVideo: false,
    mediaError: null,
    cameraPermission: "unknown",
    microphonePermission: "unknown",
    showVideoElements: false,
    signalingState: "stable",
    iceConnectionState: "new",
  })

  const [showPostConsultationForm, setShowPostConsultationForm] = useState(false)
  const [callEnded, setCallEnded] = useState(false)

  // Post-consultation form state
  const [consultationNotes, setConsultationNotes] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [followUpRequired, setFollowUpRequired] = useState(false)
  const [followUpDays, setFollowUpDays] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Current prescription form state
  const [currentPrescription, setCurrentPrescription] = useState({
    drugName: "",
    dosage: "",
    frequency: "",
    duration: "",
    period: "days",
    instructions: "",
  })

  // Current investigation form state
  const [currentInvestigation, setCurrentInvestigation] = useState({
    type: "",
    name: "",
    urgency: "routine" as const,
    instructions: "",
  })

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [iceCandidates, setIceCandidates] = useState<RTCIceCandidate[]>([])

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const ringAudioRef = useRef<HTMLAudioElement>(null)
  const initializationTimeoutRef = useRef<NodeJS.Timeout>()
  const ringingTimeoutRef = useRef<NodeJS.Timeout>()
  const signalingTimeoutRef = useRef<NodeJS.Timeout>()

  const { toast } = useToast()

  // WebRTC Configuration
  const rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
    iceCandidatePoolSize: 10,
  }

  // Add debug logging
  const addDebugLog = useCallback((message: string) => {
    console.log(`[VideoCall] ${message}`)
    setDebugInfo((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`])
  }, [])

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (callState.isConnected) {
      interval = setInterval(() => {
        setCallState((prev) => ({
          ...prev,
          callDuration: prev.callDuration + 1,
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [callState.isConnected])

  // Handle ringing sound
  useEffect(() => {
    if (callState.isRinging && ringAudioRef.current) {
      addDebugLog("Starting ring tone...")
      ringAudioRef.current.play().catch((error) => {
        addDebugLog(`Failed to play ring tone: ${error}`)
      })
    } else if (!callState.isRinging && ringAudioRef.current) {
      addDebugLog("Stopping ring tone...")
      ringAudioRef.current.pause()
      ringAudioRef.current.currentTime = 0
    }
  }, [callState.isRinging, addDebugLog])

  // Check permissions on mount
  useEffect(() => {
    checkPermissions()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupResources()
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current)
      }
      if (ringingTimeoutRef.current) {
        clearTimeout(ringingTimeoutRef.current)
      }
      if (signalingTimeoutRef.current) {
        clearTimeout(signalingTimeoutRef.current)
      }
    }
  }, [])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setCallState((prev) => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement,
      }))
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Attach streams when video elements become available
  useEffect(() => {
    if (callState.showVideoElements) {
      addDebugLog("Video elements are now available, checking for streams to attach...")

      // Attach local stream if available
      if (localStream && localVideoRef.current && !callState.hasLocalVideo) {
        addDebugLog("Attaching local stream to video element...")
        attachStreamToVideo(localStream, localVideoRef.current, true)
      }

      // Attach remote stream if available
      if (remoteStream && remoteVideoRef.current && !callState.hasRemoteVideo) {
        addDebugLog("Attaching remote stream to video element...")
        attachStreamToVideo(remoteStream, remoteVideoRef.current, false)
      }
    }
  }, [callState.showVideoElements, localStream, remoteStream, callState.hasLocalVideo, callState.hasRemoteVideo])

  const checkPermissions = async () => {
    try {
      addDebugLog("Checking media permissions...")

      if (!navigator.permissions) {
        addDebugLog("Permissions API not supported")
        return
      }

      const cameraPermission = await navigator.permissions.query({ name: "camera" as PermissionName })
      const microphonePermission = await navigator.permissions.query({ name: "microphone" as PermissionName })

      setCallState((prev) => ({
        ...prev,
        cameraPermission: cameraPermission.state,
        microphonePermission: microphonePermission.state,
      }))

      addDebugLog(`Camera permission: ${cameraPermission.state}`)
      addDebugLog(`Microphone permission: ${microphonePermission.state}`)

      // Listen for permission changes
      cameraPermission.onchange = () => {
        setCallState((prev) => ({ ...prev, cameraPermission: cameraPermission.state }))
        addDebugLog(`Camera permission changed to: ${cameraPermission.state}`)
      }

      microphonePermission.onchange = () => {
        setCallState((prev) => ({ ...prev, microphonePermission: microphonePermission.state }))
        addDebugLog(`Microphone permission changed to: ${microphonePermission.state}`)
      }
    } catch (error) {
      addDebugLog(`Permission check failed: ${error}`)
    }
  }

  const cleanupResources = useCallback(() => {
    addDebugLog("Cleaning up video call resources...")

    // Stop ringing
    if (ringAudioRef.current) {
      ringAudioRef.current.pause()
      ringAudioRef.current.currentTime = 0
    }

    // Stop all tracks in local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        addDebugLog(`Stopping ${track.kind} track: ${track.label}`)
        track.stop()
      })
    }

    // Stop all tracks in remote stream
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => {
        track.stop()
      })
    }

    // Close peer connection
    if (peerConnection) {
      peerConnection.close()
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }

    setLocalStream(null)
    setRemoteStream(null)
    setPeerConnection(null)
    setIceCandidates([])
  }, [localStream, remoteStream, peerConnection, addDebugLog])

  const checkMediaDevices = async (): Promise<boolean> => {
    try {
      addDebugLog("Checking media devices availability...")

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media devices not supported in this browser")
      }

      // Check if devices are available
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter((device) => device.kind === "videoinput")
      const microphones = devices.filter((device) => device.kind === "audioinput")

      addDebugLog(`Found ${cameras.length} cameras and ${microphones.length} microphones`)

      if (cameras.length === 0) {
        throw new Error("No camera device found")
      }
      if (microphones.length === 0) {
        throw new Error("No microphone device found")
      }

      // Log device details
      cameras.forEach((camera, index) => {
        addDebugLog(`Camera ${index + 1}: ${camera.label || "Unknown Camera"}`)
      })

      return true
    } catch (error) {
      addDebugLog(`Media devices check failed: ${error}`)
      return false
    }
  }

  const requestMediaPermissions = async (): Promise<MediaStream | null> => {
    try {
      addDebugLog("Requesting media permissions...")

      // First check if devices are available
      const devicesAvailable = await checkMediaDevices()
      if (!devicesAvailable) {
        throw new Error("Required media devices not available")
      }

      // Start with high-quality constraints
      const constraints = {
        video: {
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          frameRate: { min: 15, ideal: 30, max: 60 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 2,
        },
      }

      addDebugLog("Requesting user media with high-quality constraints...")
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      addDebugLog(`Media stream obtained successfully!`)
      addDebugLog(`Video tracks: ${stream.getVideoTracks().length}`)
      addDebugLog(`Audio tracks: ${stream.getAudioTracks().length}`)

      // Log track details
      stream.getTracks().forEach((track, index) => {
        const settings = track.getSettings()
        addDebugLog(`Track ${index + 1} (${track.kind}): ${track.label}`)
        addDebugLog(`  - Enabled: ${track.enabled}`)
        addDebugLog(`  - Ready state: ${track.readyState}`)
        if (track.kind === "video" && settings) {
          addDebugLog(`  - Resolution: ${settings.width}x${settings.height}`)
          addDebugLog(`  - Frame rate: ${settings.frameRate}`)
        }
        if (track.kind === "audio" && settings) {
          addDebugLog(`  - Sample rate: ${settings.sampleRate}`)
          addDebugLog(`  - Channel count: ${settings.channelCount}`)
        }
      })

      return stream
    } catch (error) {
      addDebugLog(`Media permission request failed: ${error}`)

      let errorMessage = "Failed to access camera and microphone"
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage =
            "Camera and microphone access denied. Please allow permissions in your browser settings and refresh the page."
        } else if (error.name === "NotFoundError") {
          errorMessage = "No camera or microphone found. Please connect your devices and try again."
        } else if (error.name === "NotReadableError") {
          errorMessage =
            "Camera or microphone is already in use by another application. Please close other applications and try again."
        } else if (error.name === "OverconstrainedError") {
          errorMessage = "Camera settings not supported. Trying with basic settings..."

          // Try with basic constraints
          try {
            addDebugLog("Retrying with basic constraints...")
            const basicStream = await navigator.mediaDevices.getUserMedia({
              video: { width: 640, height: 480 },
              audio: true,
            })
            addDebugLog("Basic constraints worked!")
            return basicStream
          } catch (basicError) {
            addDebugLog(`Basic constraints also failed: ${basicError}`)
            errorMessage = "Camera settings not compatible with your device."
          }
        }
      }

      setCallState((prev) => ({ ...prev, mediaError: errorMessage }))
      return null
    }
  }

  const attachStreamToVideo = async (stream: MediaStream, videoElement: HTMLVideoElement, isLocal = false) => {
    try {
      addDebugLog(`Attaching ${isLocal ? "local" : "remote"} stream to video element`)

      // Clear any existing stream
      if (videoElement.srcObject) {
        addDebugLog(`Clearing existing ${isLocal ? "local" : "remote"} stream`)
        videoElement.srcObject = null
      }

      // Set up video element properties
      videoElement.srcObject = stream
      videoElement.autoplay = true
      videoElement.playsInline = true
      videoElement.muted = isLocal // Always mute local video to prevent feedback
      videoElement.controls = false

      // Set up event handlers
      const handleLoadedMetadata = () => {
        addDebugLog(`${isLocal ? "Local" : "Remote"} video metadata loaded`)
        addDebugLog(`Video dimensions: ${videoElement.videoWidth}x${videoElement.videoHeight}`)

        // Try to play the video
        videoElement
          .play()
          .then(() => {
            addDebugLog(`${isLocal ? "Local" : "Remote"} video started playing`)
            setCallState((prev) => ({
              ...prev,
              [isLocal ? "hasLocalVideo" : "hasRemoteVideo"]: true,
            }))
          })
          .catch((playError) => {
            addDebugLog(`Failed to play ${isLocal ? "local" : "remote"} video: ${playError}`)

            // Try to play again after user interaction
            const playOnClick = () => {
              videoElement.play().catch(console.error)
              document.removeEventListener("click", playOnClick)
            }
            document.addEventListener("click", playOnClick)
          })
      }

      const handleCanPlay = () => {
        addDebugLog(`${isLocal ? "Local" : "Remote"} video can play`)
        setCallState((prev) => ({
          ...prev,
          [isLocal ? "hasLocalVideo" : "hasRemoteVideo"]: true,
        }))
      }

      const handleError = (error: Event) => {
        addDebugLog(`${isLocal ? "Local" : "Remote"} video error: ${error}`)
        console.error(`Video error:`, error)
      }

      // Add event listeners
      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata)
      videoElement.addEventListener("canplay", handleCanPlay)
      videoElement.addEventListener("error", handleError)

      // Force load the video
      videoElement.load()

      // Cleanup function
      return () => {
        videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata)
        videoElement.removeEventListener("canplay", handleCanPlay)
        videoElement.removeEventListener("error", handleError)
      }
    } catch (error) {
      addDebugLog(`Failed to attach ${isLocal ? "local" : "remote"} stream: ${error}`)
      console.error(`Stream attachment error:`, error)
    }
  }

  const createPeerConnection = (): RTCPeerConnection => {
    addDebugLog("Creating new RTCPeerConnection...")
    const pc = new RTCPeerConnection(rtcConfiguration)

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState
      addDebugLog(`Connection state changed: ${state}`)

      setCallState((prev) => ({
        ...prev,
        isConnected: state === "connected",
        isConnecting: state === "connecting",
        connectionQuality: getConnectionQuality(state),
      }))

      if (state === "connected") {
        addDebugLog("📞 Call connected - stopping ring tone")
        setCallState((prev) => ({ ...prev, isRinging: false }))
        if (onCallStart) {
          onCallStart()
        }
      } else if (state === "failed" || state === "disconnected") {
        addDebugLog("❌ Connection failed or disconnected")
        setCallState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          isRinging: false,
          connectionQuality: "disconnected",
        }))
      }
    }

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState
      addDebugLog(`ICE connection state: ${state}`)
      setCallState((prev) => ({ ...prev, iceConnectionState: state }))

      if (state === "failed") {
        addDebugLog("ICE connection failed - attempting restart")
        pc.restartIce()
      }
    }

    // Handle signaling state changes
    pc.onsignalingstatechange = () => {
      const state = pc.signalingState
      addDebugLog(`Signaling state: ${state}`)
      setCallState((prev) => ({ ...prev, signalingState: state }))
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDebugLog(`New ICE candidate: ${event.candidate.candidate}`)
        setIceCandidates((prev) => [...prev, event.candidate!])
        // In a real implementation, send this candidate to the remote peer
        sendSignalingMessage({
          type: "ice-candidate",
          data: event.candidate,
          from: userRole,
          to: userRole === "doctor" ? "patient" : "doctor",
          timestamp: Date.now(),
        })
      } else {
        addDebugLog("ICE candidate gathering complete")
      }
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      addDebugLog(`Received remote track: ${event.track.kind}`)
      const [stream] = event.streams
      if (stream) {
        addDebugLog(`Remote stream received with ${stream.getTracks().length} tracks`)
        setRemoteStream(stream)

        // Log remote stream details
        stream.getTracks().forEach((track, index) => {
          addDebugLog(`Remote track ${index + 1} (${track.kind}): ${track.label}`)
          addDebugLog(`  - Enabled: ${track.enabled}`)
          addDebugLog(`  - Ready state: ${track.readyState}`)
        })
      }
    }

    // Handle data channel (for future use)
    pc.ondatachannel = (event) => {
      addDebugLog(`Data channel received: ${event.channel.label}`)
    }

    return pc
  }

  const sendSignalingMessage = (message: SignalingMessage) => {
    // In a real implementation, this would send the message through a signaling server
    // For demo purposes, we'll simulate the signaling process
    addDebugLog(`Sending signaling message: ${message.type}`)
    console.log("Signaling message:", message)

    // Simulate network delay
    setTimeout(
      () => {
        handleSignalingMessage(message)
      },
      100 + Math.random() * 200,
    )
  }

  const handleSignalingMessage = async (message: SignalingMessage) => {
    if (!peerConnection) {
      addDebugLog("No peer connection available to handle signaling message")
      return
    }

    addDebugLog(`Handling signaling message: ${message.type}`)

    try {
      switch (message.type) {
        case "offer":
          addDebugLog("Processing remote offer...")
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message.data))
          const answer = await peerConnection.createAnswer()
          await peerConnection.setLocalDescription(answer)
          sendSignalingMessage({
            type: "answer",
            data: answer,
            from: userRole,
            to: message.from,
            timestamp: Date.now(),
          })
          break

        case "answer":
          addDebugLog("Processing remote answer...")
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message.data))
          break

        case "ice-candidate":
          addDebugLog("Adding ICE candidate...")
          await peerConnection.addIceCandidate(new RTCIceCandidate(message.data))
          break

        case "call-request":
          addDebugLog("Received call request")
          setCallState((prev) => ({ ...prev, isRinging: true }))
          break

        case "call-accept":
          addDebugLog("Call accepted by remote peer")
          setCallState((prev) => ({ ...prev, isRinging: false, isConnecting: true }))
          break

        case "call-reject":
          addDebugLog("Call rejected by remote peer")
          setCallState((prev) => ({ ...prev, isRinging: false, isConnecting: false }))
          break
      }
    } catch (error) {
      addDebugLog(`Error handling signaling message: ${error}`)
      console.error("Signaling error:", error)
    }
  }

  const createRemoteVideoStream = (): MediaStream => {
    addDebugLog("Creating simulated remote video stream...")

    // Create a canvas for the remote video simulation
    const canvas = document.createElement("canvas")
    canvas.width = 1280
    canvas.height = 720
    const ctx = canvas.getContext("2d")!

    // Create more realistic video content
    let frame = 0
    const participantName = userRole === "doctor" ? patientName : doctorName

    const animate = () => {
      // Create a realistic background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2,
      )
      gradient.addColorStop(0, "#f8fafc")
      gradient.addColorStop(1, "#e2e8f0")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw a simulated person (circle for head)
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2 - 50

      // Head
      ctx.beginPath()
      ctx.arc(centerX, centerY, 80, 0, 2 * Math.PI)
      ctx.fillStyle = "#fbbf24"
      ctx.fill()
      ctx.strokeStyle = "#f59e0b"
      ctx.lineWidth = 3
      ctx.stroke()

      // Eyes
      ctx.fillStyle = "#1f2937"
      ctx.beginPath()
      ctx.arc(centerX - 25, centerY - 15, 8, 0, 2 * Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(centerX + 25, centerY - 15, 8, 0, 2 * Math.PI)
      ctx.fill()

      // Mouth (animated)
      ctx.beginPath()
      ctx.arc(centerX, centerY + 20, 15, 0, Math.PI)
      ctx.strokeStyle = "#1f2937"
      ctx.lineWidth = 3
      ctx.stroke()

      // Body
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(centerX - 60, centerY + 80, 120, 200)

      // Animated elements
      const time = frame * 0.1

      // Breathing animation
      const breathScale = 1 + Math.sin(time * 0.5) * 0.02
      ctx.save()
      ctx.translate(centerX, centerY + 150)
      ctx.scale(breathScale, breathScale)
      ctx.translate(-centerX, -(centerY + 150))
      ctx.restore()

      // Blinking animation
      if (Math.sin(time * 2) > 0.9) {
        ctx.fillStyle = "#fbbf24"
        ctx.fillRect(centerX - 35, centerY - 25, 20, 5)
        ctx.fillRect(centerX + 15, centerY - 25, 20, 5)
      }

      // Name and status
      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 32px Arial"
      ctx.textAlign = "center"
      ctx.fillText(participantName, centerX, centerY + 320)

      ctx.font = "18px Arial"
      ctx.fillStyle = "#6b7280"
      ctx.fillText("Live Video Feed", centerX, centerY + 350)

      // Connection indicator
      const connectionDot = 10 + Math.sin(time * 3) * 3
      ctx.beginPath()
      ctx.arc(centerX + 200, centerY - 200, connectionDot, 0, 2 * Math.PI)
      ctx.fillStyle = "#10b981"
      ctx.fill()

      ctx.fillStyle = "#1f2937"
      ctx.font = "14px Arial"
      ctx.textAlign = "left"
      ctx.fillText("● LIVE", centerX + 220, centerY - 195)

      // Frame counter
      ctx.textAlign = "right"
      ctx.fillStyle = "#9ca3af"
      ctx.font = "12px monospace"
      ctx.fillText(`Frame: ${frame}`, canvas.width - 20, 30)
      ctx.fillText(`${new Date().toLocaleTimeString()}`, canvas.width - 20, 50)

      frame++
      requestAnimationFrame(animate)
    }

    animate()

    // Create audio context for simulated audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const destination = audioContext.createMediaStreamDestination()

    oscillator.connect(gainNode)
    gainNode.connect(destination)

    // Create subtle background audio
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.01, audioContext.currentTime)
    oscillator.start()

    // Combine video and audio streams
    const videoStream = canvas.captureStream(30)
    const audioStream = destination.stream

    const combinedStream = new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()])

    addDebugLog(`Simulated remote stream created with ${combinedStream.getTracks().length} tracks`)
    return combinedStream
  }

  const initializeWebRTC = async () => {
    try {
      setIsInitializing(true)
      setCallState((prev) => ({
        ...prev,
        isConnecting: true,
        isRinging: true,
        mediaError: null,
        showVideoElements: true,
      }))
      setDebugInfo([])

      addDebugLog("🚀 Initializing WebRTC connection...")

      // Request media permissions and get local stream
      const stream = await requestMediaPermissions()
      if (!stream) {
        throw new Error("Failed to get media stream")
      }

      setLocalStream(stream)
      addDebugLog("Local stream obtained successfully")

      // Create peer connection
      const pc = createPeerConnection()
      setPeerConnection(pc)

      // Add local stream tracks to peer connection
      stream.getTracks().forEach((track) => {
        addDebugLog(`Adding ${track.kind} track to peer connection`)
        pc.addTrack(track, stream)
      })

      // Start the signaling process
      if (userRole === "doctor") {
        // Doctor initiates the call
        addDebugLog("Doctor initiating call...")

        // Send call request
        sendSignalingMessage({
          type: "call-request",
          from: "doctor",
          to: "patient",
          timestamp: Date.now(),
        })

        // Create offer after a short delay
        setTimeout(async () => {
          try {
            addDebugLog("Creating offer...")
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            })
            await pc.setLocalDescription(offer)

            sendSignalingMessage({
              type: "offer",
              data: offer,
              from: "doctor",
              to: "patient",
              timestamp: Date.now(),
            })
          } catch (error) {
            addDebugLog(`Failed to create offer: ${error}`)
          }
        }, 1000)
      } else {
        // Patient waits for call
        addDebugLog("Patient waiting for call...")
      }

      // Simulate remote peer connection after ringing
      ringingTimeoutRef.current = setTimeout(() => {
        addDebugLog("📞 Simulating call answer...")

        // Create simulated remote stream
        const remoteVideoStream = createRemoteVideoStream()
        setRemoteStream(remoteVideoStream)

        // Simulate connection establishment
        setCallState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          isRinging: false,
          connectionQuality: "excellent",
        }))

        if (onCallStart) {
          onCallStart()
        }

        addDebugLog("✅ Simulated connection established successfully")
      }, 3000)

      toast({
        title: "Calling...",
        description: `${userRole === "doctor" ? `Calling ${patientName}...` : `Incoming call from ${doctorName}...`}`,
      })
    } catch (error) {
      addDebugLog(`❌ WebRTC initialization failed: ${error}`)
      console.error("WebRTC initialization error:", error)

      setCallState((prev) => ({
        ...prev,
        isConnecting: false,
        isRinging: false,
        mediaError: error instanceof Error ? error.message : "Failed to initialize video call",
        showVideoElements: false,
      }))

      toast({
        title: "Connection Failed",
        description: "Failed to initialize video call. Please check your camera and microphone permissions.",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const getConnectionQuality = (state: RTCPeerConnectionState): CallState["connectionQuality"] => {
    switch (state) {
      case "connected":
        return "excellent"
      case "connecting":
        return "good"
      case "disconnected":
        return "disconnected"
      case "failed":
        return "poor"
      default:
        return "poor"
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !callState.isVideoEnabled
        setCallState((prev) => ({
          ...prev,
          isVideoEnabled: !prev.isVideoEnabled,
        }))
        addDebugLog(`📹 Video ${videoTrack.enabled ? "enabled" : "disabled"}`)
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !callState.isAudioEnabled
        setCallState((prev) => ({
          ...prev,
          isAudioEnabled: !prev.isAudioEnabled,
        }))
        addDebugLog(`🎤 Audio ${audioTrack.enabled ? "enabled" : "disabled"}`)
      }
    }
  }

  const toggleMute = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !callState.isMuted
      setCallState((prev) => ({ ...prev, isMuted: !prev.isMuted }))
      addDebugLog(`🔊 Remote audio ${callState.isMuted ? "unmuted" : "muted"}`)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const copyMeetingLink = () => {
    if (meetingUrl) {
      navigator.clipboard.writeText(meetingUrl)
      toast({
        title: "Meeting Link Copied",
        description: "The meeting link has been copied to your clipboard.",
      })
    }
  }

  const endCall = () => {
    addDebugLog("📞 Ending video call...")

    // Clear timeouts
    if (ringingTimeoutRef.current) {
      clearTimeout(ringingTimeoutRef.current)
    }
    if (signalingTimeoutRef.current) {
      clearTimeout(signalingTimeoutRef.current)
    }

    cleanupResources()

    // Reset call state
    setCallState({
      isConnected: false,
      isConnecting: false,
      isRinging: false,
      isVideoEnabled: true,
      isAudioEnabled: true,
      isMuted: false,
      isFullscreen: false,
      callDuration: 0,
      connectionQuality: "disconnected",
      hasLocalVideo: false,
      hasRemoteVideo: false,
      mediaError: null,
      cameraPermission: "unknown",
      microphonePermission: "unknown",
      showVideoElements: false,
      signalingState: "stable",
      iceConnectionState: "new",
    })

    // Show post-consultation form for doctors only
    if (userRole === "doctor") {
      addDebugLog("Showing post-consultation form for doctor")
      setCallEnded(true)
      setShowPostConsultationForm(true)

      toast({
        title: "Call Ended",
        description: "Please complete the post-consultation form.",
      })
    } else {
      addDebugLog("Patient call ended, calling onCallEnd")
      onCallEnd()
    }
  }

  const retryConnection = () => {
    addDebugLog("🔄 Retrying video call connection...")
    setCallState((prev) => ({ ...prev, mediaError: null }))
    initializeWebRTC()
  }

  const openBrowserSettings = () => {
    toast({
      title: "Camera Permission Required",
      description:
        "Please click the camera icon in your browser's address bar to allow camera access, then refresh the page.",
    })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getQualityColor = (quality: CallState["connectionQuality"]) => {
    switch (quality) {
      case "excellent":
        return "text-green-600"
      case "good":
        return "text-yellow-600"
      case "poor":
        return "text-orange-600"
      case "disconnected":
        return "text-red-600"
    }
  }

  // Post-consultation form functions
  const addPrescriptionToList = () => {
    if (
      !currentPrescription.drugName ||
      !currentPrescription.dosage ||
      !currentPrescription.frequency ||
      !currentPrescription.duration
    ) {
      toast({
        title: "Incomplete Prescription",
        description: "Please fill in all required prescription fields.",
        variant: "destructive",
      })
      return
    }

    const newPrescription: Prescription = {
      id: Date.now().toString(),
      ...currentPrescription,
    }

    setPrescriptions((prev) => [...prev, newPrescription])
    setCurrentPrescription({
      drugName: "",
      dosage: "",
      frequency: "",
      duration: "",
      period: "days",
      instructions: "",
    })

    toast({
      title: "Prescription Added",
      description: `${currentPrescription.drugName} has been added to the prescription list.`,
    })
  }

  const removePrescription = (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id))
    toast({
      title: "Prescription Removed",
      description: "Prescription has been removed from the list.",
    })
  }

  const addInvestigationToList = () => {
    if (!currentInvestigation.type || !currentInvestigation.name) {
      toast({
        title: "Incomplete Investigation",
        description: "Please fill in investigation type and name.",
        variant: "destructive",
      })
      return
    }

    const newInvestigation: Investigation = {
      id: Date.now().toString(),
      ...currentInvestigation,
    }

    setInvestigations((prev) => [...prev, newInvestigation])
    setCurrentInvestigation({
      type: "",
      name: "",
      urgency: "routine",
      instructions: "",
    })

    toast({
      title: "Investigation Added",
      description: `${currentInvestigation.name} has been added to the investigation list.`,
    })
  }

  const removeInvestigation = (id: string) => {
    setInvestigations((prev) => prev.filter((i) => i.id !== id))
    toast({
      title: "Investigation Removed",
      description: "Investigation has been removed from the list.",
    })
  }

  const handleSubmit = async () => {
    if (!consultationNotes.trim()) {
      toast({
        title: "Missing Consultation Notes",
        description: "Please provide consultation notes before submitting.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Update appointment with consultation notes
      await apiClient.patch(`/appointments/${appointmentId}`, {
        status: "completed",
        consultationNotes,
        diagnosis,
        additionalNotes,
        followUpRequired,
        followUpDays: followUpRequired ? Number.parseInt(followUpDays) : null,
      })

      // Create prescription if medications were prescribed
      if (prescriptions.length > 0) {
        const prescriptionData = {
          patientId,
          appointmentId,
          diagnosis,
          instructions: additionalNotes,
          medications: prescriptions.map((p) => ({
            name: p.drugName,
            dosage: p.dosage,
            frequency: p.frequency,
            duration: `${p.duration} ${p.period}`,
            quantity: Number.parseInt(p.duration) || 1,
            instructions: p.instructions,
          })),
        }

        await apiClient.post("/prescriptions", prescriptionData)
      }

      // Save investigations if any
      if (investigations.length > 0) {
        const investigationData = {
          appointmentId,
          patientId,
          investigations: investigations.map((i) => ({
            type: i.type,
            name: i.name,
            urgency: i.urgency,
            instructions: i.instructions,
          })),
        }

        // This would be a new endpoint for investigations
        await apiClient.post("/investigations", investigationData)
      }

      toast({
        title: "Consultation Completed",
        description: "All consultation details have been saved successfully.",
      })

      onCallEnd()
    } catch (error) {
      console.error("Submit consultation error:", error)
      toast({
        title: "Submission Failed",
        description: "Failed to save consultation details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePostConsultationCancel = () => {
    setShowPostConsultationForm(false)
    setCallEnded(false)
    onCallEnd()
  }

  // Pre-call setup screen
  if (!callState.isConnected && !callState.isConnecting && !callState.showVideoElements && !callEnded) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Video className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {userRole === "doctor" ? "Start Video Consultation" : "Join Video Consultation"}
              </h3>
              <p className="text-gray-600 mb-4">
                {userRole === "doctor"
                  ? `Ready to start consultation with ${patientName}?`
                  : `Ready to join consultation with ${doctorName}?`}
              </p>

              {/* Permission Status */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Device Permissions</h4>
                <div className="flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Camera
                      className={`w-4 h-4 ${callState.cameraPermission === "granted" ? "text-green-600" : "text-gray-400"}`}
                    />
                    <span className={callState.cameraPermission === "granted" ? "text-green-600" : "text-gray-600"}>
                      Camera: {callState.cameraPermission}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mic
                      className={`w-4 h-4 ${callState.microphonePermission === "granted" ? "text-green-600" : "text-gray-400"}`}
                    />
                    <span className={callState.microphonePermission === "granted" ? "text-green-600" : "text-gray-600"}>
                      Microphone: {callState.microphonePermission}
                    </span>
                  </div>
                </div>
                {(callState.cameraPermission === "denied" || callState.microphonePermission === "denied") && (
                  <Button
                    onClick={openBrowserSettings}
                    variant="outline"
                    size="sm"
                    className="mt-2 text-blue-600 border-blue-300 bg-transparent"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Open Browser Settings
                  </Button>
                )}
              </div>

              {/* Error Display */}
              {callState.mediaError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Connection Error</span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">{callState.mediaError}</p>
                  <div className="flex space-x-2 mt-3">
                    <Button
                      onClick={retryConnection}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 bg-transparent"
                      disabled={isInitializing}
                    >
                      {isInitializing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Try Again
                    </Button>
                    <Button
                      onClick={openBrowserSettings}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-300 bg-transparent"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              )}

              {/* Debug Information */}
              {debugInfo.length > 0 && (
                <div className="bg-gray-50 border rounded-lg p-3 mb-4 text-left">
                  <h4 className="font-medium text-gray-700 mb-2 text-center">Debug Information</h4>
                  <div className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                    {debugInfo.map((info, index) => (
                      <div key={index} className="font-mono">
                        {info}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meeting Details */}
              {meetingId && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Meeting ID:</span>
                    <div className="flex items-center space-x-2">
                      <code className="bg-white px-2 py-1 rounded text-sm">{meetingId}</code>
                      <Button size="sm" variant="ghost" onClick={copyMeetingLink}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {meetingUrl && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Meeting Link:</span>
                      <Button size="sm" variant="ghost" onClick={copyMeetingLink}>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Copy Link
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={initializeWebRTC}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
              disabled={isInitializing}
            >
              {isInitializing ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <PhoneCall className="w-5 h-5 mr-2" />
              )}
              {userRole === "doctor" ? "Start Call" : "Join Call"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Main interface - show video call and form side by side when call has ended and form is shown
  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Hidden audio element for ring tone */}
      <audio
        ref={ringAudioRef}
        loop
        preload="auto"
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWTwwOUarm7blmGgU7k9n1un"
      />

      {/* Show post-consultation form if call ended and user is doctor */}
      {showPostConsultationForm && userRole === "doctor" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Call Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Call Completed</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Patient:</span>
                  <span className="font-medium">{patientName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="font-medium">{formatDuration(callState.callDuration)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time:</span>
                  <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Post-Consultation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Post-Consultation Form</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Consultation Notes */}
              <div>
                <Label htmlFor="consultation-notes" className="text-sm font-medium">
                  Consultation Notes *
                </Label>
                <Textarea
                  id="consultation-notes"
                  placeholder="Enter detailed consultation notes..."
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  className="mt-1 min-h-[100px]"
                  required
                />
              </div>

              {/* Diagnosis */}
              <div>
                <Label htmlFor="diagnosis" className="text-sm font-medium">
                  Diagnosis
                </Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Enter diagnosis..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Prescriptions Section */}
              <div>
                <Label className="text-sm font-medium flex items-center space-x-2">
                  <Pill className="w-4 h-4" />
                  <span>Prescriptions</span>
                </Label>

                {/* Current Prescription Form */}
                <div className="mt-2 p-4 border rounded-lg bg-gray-50 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="drug-name" className="text-xs">
                        Drug Name
                      </Label>
                      <Input
                        id="drug-name"
                        placeholder="e.g., Amoxicillin"
                        value={currentPrescription.drugName}
                        onChange={(e) => setCurrentPrescription((prev) => ({ ...prev, drugName: e.target.value }))}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dosage" className="text-xs">
                        Dosage
                      </Label>
                      <Input
                        id="dosage"
                        placeholder="e.g., 500mg"
                        value={currentPrescription.dosage}
                        onChange={(e) => setCurrentPrescription((prev) => ({ ...prev, dosage: e.target.value }))}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="frequency" className="text-xs">
                        Frequency
                      </Label>
                      <Select
                        value={currentPrescription.frequency}
                        onValueChange={(value) => setCurrentPrescription((prev) => ({ ...prev, frequency: value }))}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Once daily">Once daily</SelectItem>
                          <SelectItem value="Twice daily">Twice daily</SelectItem>
                          <SelectItem value="Three times daily">Three times daily</SelectItem>
                          <SelectItem value="Four times daily">Four times daily</SelectItem>
                          <SelectItem value="As needed">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration" className="text-xs">
                        Duration
                      </Label>
                      <Input
                        id="duration"
                        placeholder="e.g., 7"
                        value={currentPrescription.duration}
                        onChange={(e) => setCurrentPrescription((prev) => ({ ...prev, duration: e.target.value }))}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="period" className="text-xs">
                        Period
                      </Label>
                      <Select
                        value={currentPrescription.period}
                        onValueChange={(value) => setCurrentPrescription((prev) => ({ ...prev, period: value }))}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="instructions" className="text-xs">
                      Instructions
                    </Label>
                    <Input
                      id="instructions"
                      placeholder="e.g., Take with food"
                      value={currentPrescription.instructions}
                      onChange={(e) => setCurrentPrescription((prev) => ({ ...prev, instructions: e.target.value }))}
                      className="text-sm"
                    />
                  </div>

                  <Button onClick={addPrescriptionToList} size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Prescription
                  </Button>
                </div>

                {/* Prescription List */}
                {prescriptions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {prescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">{prescription.drugName}</div>
                          <div className="text-xs text-gray-600">
                            {prescription.dosage} • {prescription.frequency} • {prescription.duration}{" "}
                            {prescription.period}
                          </div>
                          {prescription.instructions && (
                            <div className="text-xs text-gray-500 italic">{prescription.instructions}</div>
                          )}
                        </div>
                        <Button
                          onClick={() => removePrescription(prescription.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Investigations Section */}
              <div>
                <Label className="text-sm font-medium flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4" />
                  <span>Investigations</span>
                </Label>

                {/* Current Investigation Form */}
                <div className="mt-2 p-4 border rounded-lg bg-gray-50 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="investigation-type" className="text-xs">
                        Type
                      </Label>
                      <Select
                        value={currentInvestigation.type}
                        onValueChange={(value) => setCurrentInvestigation((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Blood Test">Blood Test</SelectItem>
                          <SelectItem value="X-Ray">X-Ray</SelectItem>
                          <SelectItem value="CT Scan">CT Scan</SelectItem>
                          <SelectItem value="MRI">MRI</SelectItem>
                          <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                          <SelectItem value="ECG">ECG</SelectItem>
                          <SelectItem value="Urine Test">Urine Test</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="investigation-name" className="text-xs">
                        Investigation Name
                      </Label>
                      <Input
                        id="investigation-name"
                        placeholder="e.g., Complete Blood Count"
                        value={currentInvestigation.name}
                        onChange={(e) => setCurrentInvestigation((prev) => ({ ...prev, name: e.target.value }))}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="urgency" className="text-xs">
                        Urgency
                      </Label>
                      <Select
                        value={currentInvestigation.urgency}
                        onValueChange={(value: "routine" | "urgent" | "stat") =>
                          setCurrentInvestigation((prev) => ({ ...prev, urgency: value }))
                        }
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">Routine</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="stat">STAT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="investigation-instructions" className="text-xs">
                        Instructions
                      </Label>
                      <Input
                        id="investigation-instructions"
                        placeholder="Special instructions"
                        value={currentInvestigation.instructions}
                        onChange={(e) => setCurrentInvestigation((prev) => ({ ...prev, instructions: e.target.value }))}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <Button onClick={addInvestigationToList} size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Investigation
                  </Button>
                </div>

                {/* Investigation List */}
                {investigations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {investigations.map((investigation) => (
                      <div
                        key={investigation.id}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">{investigation.name}</div>
                          <div className="text-xs text-gray-600">
                            {investigation.type} • {investigation.urgency}
                          </div>
                          {investigation.instructions && (
                            <div className="text-xs text-gray-500 italic">{investigation.instructions}</div>
                          )}
                        </div>
                        <Button
                          onClick={() => removeInvestigation(investigation.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="additional-notes" className="text-sm font-medium">
                  Additional Notes
                </Label>
                <Textarea
                  id="additional-notes"
                  placeholder="Any additional notes or recommendations..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Follow-up */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="follow-up"
                    checked={followUpRequired}
                    onChange={(e) => setFollowUpRequired(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="follow-up" className="text-sm font-medium">
                    Follow-up required
                  </Label>
                </div>

                {followUpRequired && (
                  <div>
                    <Label htmlFor="follow-up-days" className="text-sm">
                      Follow-up in (days)
                    </Label>
                    <Input
                      id="follow-up-days"
                      type="number"
                      placeholder="e.g., 7"
                      value={followUpDays}
                      onChange={(e) => setFollowUpDays(e.target.value)}
                      className="mt-1 w-32"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button onClick={handleSubmit} disabled={isSubmitting || !consultationNotes.trim()} className="flex-1">
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Submit Consultation
                </Button>
                <Button onClick={handlePostConsultationCancel} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main video interface - only show if form is not shown */}
      {!showPostConsultationForm && (
        <div
          ref={containerRef}
          className={`relative bg-gray-900 rounded-lg overflow-hidden ${
            callState.isFullscreen ? "fixed inset-0 z-50 rounded-none" : "aspect-video"
          }`}
        >
          {/* Connection Status Overlay */}
          {(callState.isConnecting || callState.isRinging) && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
              <div className="text-center text-white">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {callState.isRinging
                    ? userRole === "doctor"
                      ? `Calling ${patientName}...`
                      : `Incoming call from ${doctorName}...`
                    : "Connecting..."}
                </h3>
                <p className="text-gray-300">
                  {callState.isRinging ? "Please wait while we connect you" : "Establishing connection..."}
                </p>
                <div className="mt-4 text-sm text-gray-400">Duration: {formatDuration(callState.callDuration)}</div>
              </div>
            </div>
          )}

          {/* Video Streams */}
          <div className="relative w-full h-full">
            {/* Remote Video (Main) */}
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              {callState.showVideoElements && callState.isConnected ? (
                <video
                  ref={remoteVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted={callState.isMuted}
                />
              ) : (
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12" />
                  </div>
                  <p className="text-lg font-medium">
                    {callState.isConnected
                      ? userRole === "doctor"
                        ? patientName
                        : doctorName
                      : "Waiting for connection..."}
                  </p>
                  {!callState.isConnected && (
                    <p className="text-sm text-gray-400 mt-2">{callState.isRinging ? "Ringing..." : "Connecting..."}</p>
                  )}
                </div>
              )}
            </div>

            {/* Local Video (Picture-in-Picture) */}
            {callState.showVideoElements && (
              <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                {!callState.hasLocalVideo && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <User className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs">You</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Call Info Overlay */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${getConnectionQuality(callState.connectionQuality)}`} />
                <span className="capitalize">{callState.connectionQuality}</span>
                <span>•</span>
                <span>{formatDuration(callState.callDuration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-4 bg-black bg-opacity-75 px-6 py-3 rounded-full">
                {/* Video Toggle */}
                <Button
                  onClick={toggleVideo}
                  variant="ghost"
                  size="sm"
                  className={`w-12 h-12 rounded-full ${
                    callState.isVideoEnabled
                      ? "bg-gray-600 hover:bg-gray-500 text-white"
                      : "bg-red-600 hover:bg-red-500 text-white"
                  }`}
                >
                  {callState.isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>

                {/* Audio Toggle */}
                <Button
                  onClick={toggleAudio}
                  variant="ghost"
                  size="sm"
                  className={`w-12 h-12 rounded-full ${
                    callState.isAudioEnabled
                      ? "bg-gray-600 hover:bg-gray-500 text-white"
                      : "bg-red-600 hover:bg-red-500 text-white"
                  }`}
                >
                  {callState.isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>

                {/* End Call */}
                <Button
                  onClick={endCall}
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white"
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>

                {/* Mute Remote */}
                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  size="sm"
                  className={`w-12 h-12 rounded-full ${
                    callState.isMuted
                      ? "bg-red-600 hover:bg-red-500 text-white"
                      : "bg-gray-600 hover:bg-gray-500 text-white"
                  }`}
                >
                  {callState.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>

                {/* Fullscreen Toggle */}
                <Button
                  onClick={toggleFullscreen}
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-500 text-white"
                >
                  {callState.isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Debug Panel (Development) */}
          {debugInfo.length > 0 && process.env.NODE_ENV === "development" && (
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg max-w-sm">
              <h4 className="text-xs font-semibold mb-2">Debug Info</h4>
              <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index} className="font-mono">
                    {info}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
