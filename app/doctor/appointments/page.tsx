"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Video, Search, User, Phone, Plus, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

interface Appointment {
  id: string
  appointmentDate: string
  duration: number
  type: string
  status: string
  symptoms?: string
  diagnosis?: string
  notes?: string
  fee: number
  paymentStatus: string
  Patient: {
    id: string
    name: string
    phone?: string
  }
}

interface AppointmentStats {
  total: number
  confirmed: number
  pending: number
  completed: number
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    confirmed: 0,
    pending: 0,
    completed: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDate, setFilterDate] = useState("today")
  const [updating, setUpdating] = useState<string | null>(null)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchAppointments()
  }, [filterStatus, filterDate])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filterStatus !== "all") {
        params.append("status", filterStatus)
      }
      
      if (filterDate === "today") {
        params.append("date", new Date().toISOString().split('T')[0])
      }
      
      params.append("limit", "50")

      const response = await apiClient.get(`/appointments?${params.toString()}`)
      
      setAppointments(response.appointments || [])
      
      // Calculate stats
      const appointmentList = response.appointments || []
      const newStats = {
        total: appointmentList.length,
        confirmed: appointmentList.filter((a: Appointment) => a.status === "confirmed").length,
        pending: appointmentList.filter((a: Appointment) => a.status === "pending").length,
        completed: appointmentList.filter((a: Appointment) => a.status === "completed").length,
      }
      setStats(newStats)
      
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
      toast({
        title: "Error",
        description: "Failed to fetch appointments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string, notes?: string) => {
    try {
      setUpdating(appointmentId)
      
      await apiClient.patch(`/appointments/${appointmentId}/status`, {
        status: newStatus,
        notes
      })

      toast({
        title: "Success",
        description: `Appointment ${newStatus} successfully.`,
      })

      // Refresh appointments
      fetchAppointments()
      
    } catch (error) {
      console.error("Failed to update appointment:", error)
      toast({
        title: "Error",
        description: "Failed to update appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

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
      case "in_progress":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />
      case "phone":
        return <Phone className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.Patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.symptoms && appointment.symptoms.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600">Manage your patient appointments and consultations</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Video className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                    placeholder="Search by patient name or symptoms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="status">Filter by Status</Label>
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
                    <SelectItem value="in_progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="date">Filter by Date</Label>
                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="grid gap-4">
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterStatus !== "all" || filterDate !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "You don't have any appointments scheduled yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {getTypeIcon(appointment.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{appointment.Patient.name}</h3>
                          {appointment.Patient.phone && (
                            <span className="text-sm text-gray-500">({appointment.Patient.phone})</span>
                          )}
                        </div>
                        {appointment.symptoms && (
                          <p className="text-gray-600">{appointment.symptoms}</p>
                        )}
                        {appointment.diagnosis && (
                          <p className="text-sm text-gray-500">Diagnosis: {appointment.diagnosis}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(appointment.appointmentDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(appointment.appointmentDate)}</span>
                          </div>
                          <span>{appointment.duration} min</span>
                          <span className="capitalize">{appointment.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                      <div className="flex space-x-2">
                        {appointment.status === "pending" && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                              disabled={updating === appointment.id}
                            >
                              {updating === appointment.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Confirm"
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                              disabled={updating === appointment.id}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {appointment.status === "confirmed" && (
                          <>
                            {appointment.type === "video" && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <Video className="w-4 h-4 mr-1" />
                                Start Call
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateAppointmentStatus(appointment.id, "in_progress")}
                              disabled={updating === appointment.id}
                            >
                              Start Session
                            </Button>
                          </>
                        )}
                        {appointment.status === "in_progress" && (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                            disabled={updating === appointment.id}
                          >
                            Complete
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}