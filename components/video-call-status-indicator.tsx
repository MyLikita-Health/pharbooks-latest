"use client"

import { useVideoCallContext } from "@/components/video-call-provider"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, PhoneCall, Loader2 } from "lucide-react"

export function VideoCallStatusIndicator() {
  const { callState } = useVideoCallContext()

  const getStatusInfo = () => {
    if (callState.isInitializing) {
      return {
        icon: <Loader2 className="w-3 h-3 animate-spin" />,
        text: "Initializing...",
        variant: "secondary" as const,
      }
    }

    if (callState.isInCall) {
      return {
        icon: <PhoneCall className="w-3 h-3" />,
        text: "In Call",
        variant: "default" as const,
      }
    }

    if (callState.signalingConnected) {
      return {
        icon: <Wifi className="w-3 h-3" />,
        text: "Online",
        variant: "default" as const,
      }
    }

    return {
      icon: <WifiOff className="w-3 h-3" />,
      text: "Offline",
      variant: "secondary" as const,
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <Badge variant={statusInfo.variant} className="flex items-center gap-1 text-xs">
      {statusInfo.icon}
      {statusInfo.text}
    </Badge>
  )
}
