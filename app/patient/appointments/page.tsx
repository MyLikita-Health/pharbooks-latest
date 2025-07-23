"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Video, Search, Plus, Loader2, RefreshCw, AlertCircle, Copy } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { VideoCallProvider, useVideoCallContext } from "@/components/video-call-provider"
import type { CallParticipant } from "@/lib/signaling-service"
import { useAuth } from "@/contexts/auth-context"

// Define the Appointment type
interface Appointment {
  id: number
  doctor: string
  specialization: string
  date: string
  time: string
  type: string
  status: string
  symptoms: string
  meetingId?: string
  meetingUrl?: string
}

function PatientAppointmentsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const { initiateCall } = useVideoCallContext()

  // Fetch appointments from API
  const fetchAppointments = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      const response = await apiClient.get("/appointments")

      // Handle different possible response structures
      const appointmentsData = response.data || response

      if (Array.isArray(appointmentsData)) {
        setAppointments(appointmentsData)
      } else if (appointmentsData && Array.isArray(appointmentsData.appointments)) {
        setAppointments(appointmentsData.appointments)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      setError("Failed to load appointments. Please try again.")

      // Fallback to static data in case of error
      const fallbackAppointments: Appointment[] = [
        {
          id: 1,
          doctor: "Dr. Sarah Smith",
          specialization: "Cardiology",
          date: "2024-01-15",
          time: "10:00 AM",
          type: "Video Consultation",
          status: "confirmed",
          symptoms: "Chest pain follow-up",
          meetingId: "abc123def456",
          meetingUrl: "https://example.com/meeting/abc123def456",
        },
        {
          id: 2,
          doctor: "Dr. Michael Johnson",
          specialization: "General Medicine",
          date: "2024-01-18",
          time: "2:30 PM",
          type: "Follow-up",
          status: "pending",
          symptoms: "Regular checkup",
        },
        {
          id: 3,
          doctor: "Dr. Emily Davis",
          specialization: "Dermatology",
          date: "2024-01-20",
          time: "11:00 AM",
          type: "Initial Consultation",
          status: "confirmed",
          symptoms: "Skin condition",
          meetingId: "xyz789uvw012",
          meetingUrl: "https://example.com/meeting/xyz789uvw012",
        },
      ]
      setAppointments(fallbackAppointments)

      toast({
        title: "Warning",
        description: "Using cached appointment data. Some information may be outdated.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      setIsRefreshing(true)

      await apiClient.put(`/appointments/${appointmentId}`, {
        status: newStatus,
      })

      // Update local state
      setAppointments((prev) => prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus } : apt)))

      toast({
        title: "Success",
        description: `Appointment ${newStatus} successfully.`,
      })
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to update appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Cancel appointment
  const cancelAppointment = async (appointmentId: number) => {
    try {
      setIsRefreshing(true)

      await apiClient.delete(`/appointments/${appointmentId}`)

      // Remove from local state
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId))

      toast({
        title: "Success",
        description: "Appointment cancelled successfully.",
      })
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      (appointment.doctor?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (appointment.specialization?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || appointment.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Retry function for failed loading
  const retryFetch = () => {
    fetchAppointments()
  }

  // Refresh appointments
  const refreshAppointments = () => {
    fetchAppointments(true)
  }

  const startVideoCall = async (appointment: Appointment) => {
    try {
      const remoteParticipant: CallParticipant = {
        id: appointment.id.toString(), // In real app, this would be doctor's user ID
        name: appointment.doctor,
        role: "doctor",
        isOnline: true,
      }

      await initiateCall(appointment.id.toString(), remoteParticipant)
    } catch (error) {
      console.error("Failed to start video call:", error)
      toast({
        title: "Call Failed",
        description: "Failed to join video call. Please try again.",
        variant: "destructive",
      })
    }
  }

  const copyMeetingLink = (meetingUrl: string) => {
    navigator.clipboard.writeText(meetingUrl)
    toast({
      title: "Meeting Link Copied",
      description: "The meeting link has been copied to your clipboard.",
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading your appointments...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600">Manage your scheduled consultations</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={refreshAppointments} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/patient/appointments/book">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryFetch}
                  className="text-red-600 border-red-300 bg-transparent"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Appointments</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by doctor or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="filter">Filter by Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{appointment.doctor}</h3>
                      <p className="text-gray-600">{appointment.specialization}</p>
                      <p className="text-sm text-gray-500">{appointment.symptoms}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Video className="w-4 h-4" />
                          <span>{appointment.type}</span>
                        </div>
                      </div>
                      {/* Meeting Link Display */}
                      {appointment.meetingId && appointment.status === "confirmed" && (
                        <div className="mt-2 p-2 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Video className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-800">Meeting ID: {appointment.meetingId}</span>
                            </div>
                            {appointment.meetingUrl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyMeetingLink(appointment.meetingUrl!)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                    {appointment.status === "confirmed" && (
                      <div className="flex space-x-2">
                        {appointment.meetingId ? (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => startVideoCall(appointment)}
                          >
                            <Video className="w-4 h-4 mr-1" />
                            Join
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            <Video className="w-4 h-4 mr-1" />
                            No Meeting Link
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelAppointment(appointment.id)}
                          disabled={isRefreshing}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    {appointment.status === "pending" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                          disabled={isRefreshing}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelAppointment(appointment.id)}
                          disabled={isRefreshing}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    {appointment.status === "completed" && (
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAppointments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "You don't have any appointments scheduled yet."}
              </p>
              <Link href="/patient/appointments/book">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Book Your First Appointment
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Loading Overlay */}
        {isRefreshing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-gray-700">Updating appointments...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function PatientAppointments() {
  const { user } = useAuth()

  const currentUser: CallParticipant = {
    id: user?.id || "",
    name: user?.name || "",
    role: "patient",
    isOnline: true,
  }

  return (
    <VideoCallProvider currentUser={currentUser}>
      <PatientAppointmentsContent />
    </VideoCallProvider>
  )
}
