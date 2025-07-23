"use client"

import { type ReactNode, createContext, useContext, useEffect } from "react"
import { useVideoCall, type VideoCallHook } from "@/hooks/use-video-call"
import CallNotification from "@/components/call-notification"
import VideoCallInterface from "@/components/video-call-interface"
import { useToast } from "@/hooks/use-toast"

// Define the context type
interface VideoCallContextType extends VideoCallHook {}

// Create the context
const VideoCallContext = createContext<VideoCallContextType | null>(null)

// Provider props
interface VideoCallProviderProps {
  children: ReactNode
  currentUser: {
    id: string
    name: string
    role: "doctor" | "patient" | "admin"
    isOnline: boolean
  }
}

export function VideoCallProvider({ children, currentUser }: VideoCallProviderProps) {
  const { callState, initiateCall, answerCall, rejectCall, endCall, toggleVideo, toggleAudio, toggleMute } =
    useVideoCall(currentUser)

  const { toast } = useToast()

  // Log call state changes for debugging
  useEffect(() => {
    console.log("Call state changed:", callState.status)

    // Show toast notifications for call status changes
    if (callState.status === "ringing" && callState.isIncoming) {
      toast({
        title: "Incoming Call",
        description: `${callState.remoteParticipant?.name || "Someone"} is calling you`,
        duration: 10000,
      })
    }
  }, [callState.status, callState.isIncoming, callState.remoteParticipant, toast])

  return (
    <VideoCallContext.Provider
      value={{
        callState,
        initiateCall,
        answerCall,
        rejectCall,
        endCall,
        toggleVideo,
        toggleAudio,
        toggleMute,
      }}
    >
      {children}

      {/* Call Notification - Shows when there's an incoming call */}
      <CallNotification callState={callState} onAnswer={answerCall} onReject={rejectCall} />

      {/* Video Call Interface - Shows during an active call */}
      <VideoCallInterface
        callState={callState}
        onEndCall={endCall}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onToggleMute={toggleMute}
      />
    </VideoCallContext.Provider>
  )
}

// Custom hook to use the video call context
export function useVideoCallContext() {
  const context = useContext(VideoCallContext)
  if (!context) {
    throw new Error("useVideoCallContext must be used within a VideoCallProvider")
  }
  return context
}
