"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Calendar, Clock, User, Bell } from "lucide-react"
import { signalingService, type AppointmentNotification } from "@/lib/signaling-service"

interface AppointmentNotificationsProps {
  userId: string
}

export default function AppointmentNotifications({ userId }: AppointmentNotificationsProps) {
  const [notifications, setNotifications] = useState<AppointmentNotification[]>([])

  useEffect(() => {
    const handleNotification = (notification: AppointmentNotification) => {
      console.log("Received appointment notification:", notification)

      // Check if notification is for this user
      const isForUser = notification.participants.some((p) => p.id === userId)
      if (!isForUser) return

      setNotifications((prev) => {
        // Avoid duplicates
        const exists = prev.some((n) => n.id === notification.id)
        if (exists) return prev

        return [...prev, notification]
      })

      // Auto-remove after 10 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
      }, 10000)
    }

    const unsubscribe = signalingService.onNotification(handleNotification)
    return unsubscribe
  }, [userId])

  const dismissNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const getNotificationIcon = (type: AppointmentNotification["type"]) => {
    switch (type) {
      case "scheduled":
        return <Calendar className="w-5 h-5 text-blue-600" />
      case "reminder":
        return <Bell className="w-5 h-5 text-orange-600" />
      case "cancelled":
        return <X className="w-5 h-5 text-red-600" />
      case "rescheduled":
        return <Clock className="w-5 h-5 text-purple-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationColor = (type: AppointmentNotification["type"]) => {
    switch (type) {
      case "scheduled":
        return "border-blue-200 bg-blue-50"
      case "reminder":
        return "border-orange-200 bg-orange-50"
      case "cancelled":
        return "border-red-200 bg-red-50"
      case "rescheduled":
        return "border-purple-200 bg-purple-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-40 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`${getNotificationColor(notification.type)} border-l-4 shadow-lg animate-in slide-in-from-right duration-300`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-gray-900">{notification.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{notification.message}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(notification.scheduledTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(notification.scheduledTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {notification.participants.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
                      <User className="w-3 h-3" />
                      <span>
                        {notification.participants
                          .filter((p) => p.id !== userId)
                          .map((p) => p.name)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-200"
                onClick={() => dismissNotification(notification.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
