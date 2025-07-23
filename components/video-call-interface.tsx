"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Video, VideoOff, Mic, MicOff, PhoneOff, Maximize2, Minimize2, Settings, User, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import PostConsultationForm from "@/components/post-consultation-form"
import type { CallState } from "@/hooks/use-video-call"

interface VideoCallInterfaceProps {
  callState: CallState
  onEndCall: () => void
  onToggleVideo: () => void
  onToggleAudio: () => void
  onToggleMute: () => void
  userRole?: "doctor" | "patient"
  appointmentId?: string
  patientId?: string
  patientName?: string
  doctorName?: string
}

export default function VideoCallInterface({
  callState,
  onEndCall,
  onToggleVideo,
  onToggleAudio,
  onToggleMute,
  userRole = "doctor",
  appointmentId,
  patientId,
  patientName = "Patient",
  doctorName = "Doctor",
}: VideoCallInterfaceProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [showPostConsultationForm, setShowPostConsultationForm] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()

  // Update call duration
  useEffect(() => {
    if (callState.status === "connected" && !showPostConsultationForm) {
      const interval = setInterval(() => setCallDuration((prev) => prev + 1), 1000)
      return () => clearInterval(interval)
    }
  }, [callState.status, showPostConsultationForm])

  // Handle local stream
  useEffect(() => {
    if (callState.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = callState.localStream
    }
  }, [callState.localStream])

  // Handle remote stream
  useEffect(() => {
    if (callState.remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = callState.remoteStream
    }
  }, [callState.remoteStream])

  // Auto-hide controls
  useEffect(() => {
    if (showPostConsultationForm) return
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
      setShowControls(true)
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000)
    }
    resetControlsTimeout()
    document.addEventListener("mousemove", resetControlsTimeout)
    return () => {
      document.removeEventListener("mousemove", resetControlsTimeout)
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }
  }, [showPostConsultationForm])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      : `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleEndCall = () => {
    if (userRole === "doctor") {
      setShowPostConsultationForm(true)
      toast({
        title: "Call Ended",
        description: "Please complete the post-consultation form.",
        duration: 5000,
      })
    } else {
      onEndCall()
    }
  }

  const handlePostConsultationSubmit = () => {
    setShowPostConsultationForm(false)
    onEndCall()
  }

  const handlePostConsultationCancel = () => {
    setShowPostConsultationForm(false)
    onEndCall()
  }

  // If form is active, show it
  if (showPostConsultationForm) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        <PostConsultationForm
          appointmentId={appointmentId || "test-id"}
          patientName={patientName}
          patientId={patientId || "test-patient"}
          consultationDuration={callDuration}
          onSubmit={handlePostConsultationSubmit}
          onCancel={handlePostConsultationCancel}
        />
      </div>
    )
  }

  if (callState.status !== "connected") return null

  const remoteParticipantName = userRole === "doctor" ? patientName : doctorName

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Remote Video */}
      <div className="relative w-full h-full">
        {callState.remoteStream ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <Avatar className="h-32 w-32 mx-auto mb-4">
                <AvatarImage
                  src={callState.remoteParticipant?.avatar || "/placeholder.svg"}
                  alt={remoteParticipantName}
                />
                <AvatarFallback className="bg-gray-700 text-white text-4xl">
                  {remoteParticipantName[0] || <User className="h-16 w-16" />}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-white text-xl font-semibold">{remoteParticipantName}</h3>
              <p className="text-gray-400">Camera is off</p>
            </div>
          </div>
        )}

        {/* Local Video */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
          {callState.localStream && callState.isVideoEnabled ? (
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gray-600 text-white">
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <p className="text-white text-xs">You</p>
                <p className="text-gray-400 text-xs">Camera off</p>
              </div>
            </div>
          )}
        </div>

        {/* Call Info */}
        <div
          className={`absolute top-4 left-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        >
          <Card className="bg-black/50 border-white/20">
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={callState.remoteParticipant?.avatar || "/placeholder.svg"}
                    alt={remoteParticipantName}
                  />
                  <AvatarFallback className="bg-gray-600 text-white text-sm">
                    {remoteParticipantName[0] || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white text-sm font-medium">{remoteParticipantName}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(callDuration)}
                    </Badge>
                    {appointmentId && (
                      <Badge variant="outline" className="text-xs border-white/20 text-white">
                        Appointment
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div
          className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        >
          <Card className="bg-black/50 border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                {/* Mute */}
                <Button
                  variant={callState.isMuted ? "destructive" : "secondary"}
                  size="lg"
                  className="rounded-full h-12 w-12"
                  onClick={onToggleMute}
                >
                  {callState.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                {/* Video */}
                <Button
                  variant={callState.isVideoEnabled ? "secondary" : "destructive"}
                  size="lg"
                  className="rounded-full h-12 w-12"
                  onClick={onToggleVideo}
                >
                  {callState.isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>

                {/* End Call */}
                <Button variant="destructive" size="lg" className="rounded-full h-12 w-12" onClick={handleEndCall}>
                  <PhoneOff className="h-5 w-5" />
                </Button>

                {/* Fullscreen */}
                <Button variant="secondary" size="lg" className="rounded-full h-12 w-12" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </Button>

                {/* Settings */}
                <Button variant="secondary" size="lg" className="rounded-full h-12 w-12">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
