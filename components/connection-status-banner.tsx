"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useVideoCallContext } from "@/components/video-call-provider"
import { Wifi, WifiOff, RefreshCw, AlertTriangle, X } from "lucide-react"

export function ConnectionStatusBanner() {
  const { callState, retryConnection } = useVideoCallContext()
  const [isRetrying, setIsRetrying] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Show banner if not connected and not initializing, and not dismissed
    const shouldShow =
      !callState.signalingConnected &&
      !callState.isInitializing &&
      !isDismissed &&
      callState.connectionState === "fallback"

    setShowBanner(shouldShow)
  }, [callState.signalingConnected, callState.isInitializing, callState.connectionState, isDismissed])

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await retryConnection()
      setIsDismissed(false) // Reset dismissal on successful retry
    } catch (error) {
      console.error("Retry failed:", error)
    } finally {
      setIsRetrying(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setShowBanner(false)
  }

  if (!showBanner) {
    return null
  }

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-600" />
          <span className="text-amber-800">
            Video calling is currently unavailable. Some features may not work properly.
          </span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={isRetrying}
            className="text-amber-800 border-amber-200 hover:bg-amber-100 bg-transparent"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Retry Connection
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-amber-600 hover:text-amber-800 hover:bg-amber-100"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
