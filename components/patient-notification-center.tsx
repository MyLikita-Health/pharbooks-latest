"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Bell, BellRing, Check, Clock, FileText, Pill, Calendar, X, Eye, Trash2, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data?: any
  isRead: boolean
  readAt?: string
  priority: "low" | "medium" | "high" | "urgent"
  createdAt: string
  methods: string[]
}

interface PatientNotificationCenterProps {
  patientId: string
  onClose?: () => void
}

export default function PatientNotificationCenter({ patientId, onClose }: PatientNotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "prescriptions" | "appointments" | "investigations">("all")
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    loadNotifications()
  }, [patientId])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get(`/notifications?userId=${patientId}&limit=50`)
      setNotifications(response.notifications || [])
    } catch (error) {
      console.error("Error loading notifications:", error)
      toast({
        title: "Loading Error",
        description: "Failed to load notifications.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}`, {
        isRead: true,
        readAt: new Date().toISOString(),
      })

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)),
      )

      toast({
        title: "Notification Read",
        description: "Notification marked as read.",
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Update Error",
        description: "Failed to update notification status.",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id)
      if (unreadIds.length === 0) return

      await apiClient.patch("/notifications/mark-all-read", {
        userId: patientId,
        notificationIds: unreadIds,
      })

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })))

      toast({
        title: "All Notifications Read",
        description: `Marked ${unreadIds.length} notifications as read.`,
      })
    } catch (error) {
      console.error("Error marking all as read:", error)
      toast({
        title: "Update Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      })
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))

      toast({
        title: "Notification Deleted",
        description: "Notification has been deleted.",
      })
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Delete Error",
        description: "Failed to delete notification.",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "prescription_ready":
        return <Pill className="w-5 h-5 text-blue-600" />
      case "investigation_required":
        return <FileText className="w-5 h-5 text-purple-600" />
      case "followup_required":
        return <Calendar className="w-5 h-5 text-green-600" />
      case "consultation_completed":
        return <Check className="w-5 h-5 text-green-600" />
      case "appointment_reminder":
        return <Clock className="w-5 h-5 text-orange-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case "unread":
        return !notification.isRead
      case "prescriptions":
        return notification.type === "prescription_ready"
      case "appointments":
        return notification.type.includes("appointment") || notification.type === "followup_required"
      case "investigations":
        return notification.type === "investigation_required"
      default:
        return true
    }
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BellRing className="w-6 h-6 text-blue-600" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline" size="sm">
                  <Check className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              {onClose && (
                <Button onClick={onClose} variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Filter className="w-4 h-4 text-gray-600" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="prescriptions">Prescriptions</SelectItem>
                <SelectItem value="appointments">Appointments</SelectItem>
                <SelectItem value="investigations">Medical Tests</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Notifications</h3>
            <p className="text-gray-500">
              {filter === "all" ? "You have no notifications at this time." : `No ${filter} notifications found.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !notification.isRead ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
              }`}
              onClick={() => setSelectedNotification(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900 truncate">{notification.title}</h4>
                        {!notification.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />}
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                          {notification.priority.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">{notification.message}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {notification.methods.map((method) => (
                          <Badge key={method} variant="outline" className="text-xs">
                            {method.toUpperCase()}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Mark Read
                          </Button>
                        )}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {getNotificationIcon(selectedNotification.type)}
                  <span>{selectedNotification.title}</span>
                </CardTitle>
                <Button
                  onClick={() => setSelectedNotification(null)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Badge className={getPriorityColor(selectedNotification.priority)}>
                  {selectedNotification.priority.toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-600">
                  {new Date(selectedNotification.createdAt).toLocaleString()}
                </span>
                {selectedNotification.isRead && selectedNotification.readAt && (
                  <span className="text-sm text-green-600">
                    Read on {new Date(selectedNotification.readAt).toLocaleString()}
                  </span>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Message</h4>
                <p className="text-gray-700">{selectedNotification.message}</p>
              </div>

              {selectedNotification.data && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Additional Details</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(selectedNotification.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600">Sent via: </span>
                  {selectedNotification.methods.map((method) => (
                    <Badge key={method} variant="outline" className="text-xs ml-1">
                      {method.toUpperCase()}
                    </Badge>
                  ))}
                </div>

                <div className="flex space-x-2">
                  {!selectedNotification.isRead && (
                    <Button
                      onClick={() => {
                        markAsRead(selectedNotification.id)
                        setSelectedNotification(null)
                      }}
                      variant="outline"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      deleteNotification(selectedNotification.id)
                      setSelectedNotification(null)
                    }}
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
