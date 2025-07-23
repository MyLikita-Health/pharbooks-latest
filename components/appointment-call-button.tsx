"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Video, Loader2 } from "lucide-react"
import { useVideoCallContext } from "@/components/video-call-provider"
import { useToast } from "@/hooks/use-toast"

interface AppointmentCallButtonProps {
  appointmentId: string
  participantId: string
  participantName: string
  participantRole: "doctor" | "patient"
  disabled?: boolean
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export default function AppointmentCallButton({
  appointmentId,
  participantId,
  participantName,
  participantRole,
  disabled = false,
  variant = "default",
  size = "default",
}: AppointmentCallButtonProps) {
  const { callState, initiateCall } = useVideoCallContext()
  const { toast } = useToast()
  const [isInitiating, setIsInitiating] = useState(false)

  const handleStartCall = async () => {
    try {
      setIsInitiating(true)

      toast({
        title: "Starting Video Call",
        description: `Calling ${participantName}...`,
      })

      await initiateCall(participantId, appointmentId)

      toast({
        title: "Call Initiated",
        description: `Calling ${participantName}. Please wait for them to answer.`,
      })
    } catch (error) {
      console.error("Failed to start call:", error)
      toast({
        title: "Call Failed",
        description: "Failed to start the video call. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsInitiating(false)
    }
  }

  const isCallInProgress = callState.status !== "idle"
  const isDisabled = disabled || isCallInProgress || isInitiating

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStartCall}
      disabled={isDisabled}
      className="flex items-center space-x-2"
    >
      {isInitiating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
      <span>
        {isInitiating ? "Starting Call..." : isCallInProgress ? "Call in Progress" : `Call ${participantName}`}
      </span>
    </Button>
  )
}
