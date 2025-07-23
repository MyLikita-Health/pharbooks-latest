"use client"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { dashboardApi, appointmentsApi, usersApi, prescriptionsApi, messagesApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useApiData } from "@/hooks/use-api-data"
import {
  Calendar,
  Users,
  Pill,
  Video,
  MessageSquare,
  FileText,
  AlertCircle,
  Plus,
  ArrowRight,
  Loader2,
  Phone,
  Star,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

interface DoctorStats {
  totalPatients: number
  todayAppointments: number
  upcomingAppointments: number
  completedAppointments: number
  activePrescriptions: number
  totalConsultations: number
  unreadMessages: number
  rating: number
  totalEarnings: number
}

interface Appointment {
  id: string
  appointmentDate: string
  duration: number
  type: string
  status: string
  symptoms?: string
  Patient: {
    id: string
    name: string
    phone?: string
  }
}

interface Patient {
  id: string
  name: string
  email: string
  phone?: string
  lastVisit?: string
  condition?: string
}

interface Prescription {
  id: string
  status: string
  createdAt: string
  Patient: {
    name: string
  }
  Medications: Array<{
    name: string
    dosage: string
  }>
}

interface Message {
  id: string
  subject: string
  content: string
  isRead: boolean
  createdAt: string
  Patient: {
    name: string
  }
}

export default function DoctorDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()

  // Fetch dashboard statistics
  const {
    data: stats,
    loading: statsLoading,
    refetch: refetchStats,
  } = useApiData<DoctorStats>(() => dashboardApi.getDoctorStats(), [], {
    onError: () => {
      // Fallback stats if API fails
      return {
        totalPatients: 0,
        todayAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        activePrescriptions: 0,
        totalConsultations: 0,
        unreadMessages: 0,
        rating: 0,
        totalEarnings: 0,
      }
    },
  })

  // Fetch today's appointments
  const {
    data: appointmentsData,
    loading: appointmentsLoading,
    refetch: refetchAppointments,
  } = useApiData<{ appointments: Appointment[] }>(() => {
    const today = new Date().toISOString().split("T")[0]
    return appointmentsApi.getAppointments({ date: today, limit: 10 })
  }, [])

  // Fetch recent patients
  const {
    data: patientsData,
    loading: patientsLoading,
    refetch: refetchPatients,
  } = useApiData<{ users: Patient[] }>(() => usersApi.getUsers({ role: "patient", limit: 5, recent: true }), [])

  // Fetch recent prescriptions
  const {
    data: prescriptionsData,
    loading: prescriptionsLoading,
    refetch: refetchPrescriptions,
  } = useApiData<{ prescriptions: Prescription[] }>(() => prescriptionsApi.getPrescriptions({ limit: 5 }), [])

  // Fetch recent messages
  const {
    data: messagesData,
    loading: messagesLoading,
    refetch: refetchMessages,
  } = useApiData<{ messages: Message[] }>(() => messagesApi.getMessages({ limit: 5 }), [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
      case "active":
        return "bg-green-100 text-green-800"
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
        return <Calendar className="w-4 h-4" />
    }
  }

  const refreshAllData = () => {
    refetchStats()
    refetchAppointments()
    refetchPatients()
    refetchPrescriptions()
    refetchMessages()
  }

  if (statsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const todayAppointments = appointmentsData?.appointments || []
  const recentPatients = patientsData?.users || []
  const recentPrescriptions = prescriptionsData?.prescriptions || []
  const recentMessages = messagesData?.messages || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Good morning, Dr. {user?.name}!</h1>
              <p className="text-blue-100">
                You have {stats?.todayAppointments || 0} appointments scheduled for today.
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm">{stats?.rating || 0}/5.0 Rating</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">${stats?.totalEarnings || 0} Total Earnings</span>
                </div>
              </div>
            </div>
            <Button onClick={refreshAllData} variant="outline" className="bg-white/10 border-white/20 text-white">
              <ArrowRight className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold">{stats?.totalPatients || 0}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.todayAppointments || 0}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Prescriptions</p>
                  <p className="text-2xl font-bold text-purple-600">{stats?.activePrescriptions || 0}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Pill className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unread Messages</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.unreadMessages || 0}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-blue-900">Today's Schedule</CardTitle>
                <CardDescription>Your appointments for today</CardDescription>
              </div>
              <Link href="/doctor/appointments">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointmentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : todayAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No appointments scheduled for today</p>
                  </div>
                ) : (
                  todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {getTypeIcon(appointment.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{appointment.Patient.name}</h4>
                          <p className="text-sm text-gray-600">{appointment.symptoms || "General consultation"}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{formatTime(appointment.appointmentDate)}</span>
                            <span>•</span>
                            <span>{appointment.duration} min</span>
                            <span>•</span>
                            <span className="capitalize">{appointment.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                        {appointment.status === "confirmed" && appointment.type === "video" && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Video className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-blue-900">Recent Patients</CardTitle>
                <CardDescription>Patients you've seen recently</CardDescription>
              </div>
              <Link href="/doctor/patients">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : recentPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent patients</p>
                  </div>
                ) : (
                  recentPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{patient.name}</h4>
                          <p className="text-sm text-gray-600">{patient.condition || "General patient"}</p>
                          <p className="text-sm text-gray-500">
                            Last visit: {patient.lastVisit ? formatDate(patient.lastVisit) : "Never"}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View Records
                        </Button>
                        <Button size="sm" variant="outline">
                          Message
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Prescriptions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-blue-900">Recent Prescriptions</CardTitle>
                <CardDescription>Medications you've prescribed</CardDescription>
              </div>
              <Link href="/doctor/prescriptions">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : recentPrescriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent prescriptions</p>
                  </div>
                ) : (
                  recentPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Pill className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {prescription.Medications?.[0]?.name || "Multiple medications"}
                          </h4>
                          <p className="text-sm text-gray-600">For: {prescription.Patient.name}</p>
                          <p className="text-sm text-gray-500">
                            {prescription.Medications?.[0]?.dosage || ""} • {formatDate(prescription.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(prescription.status)}>{prescription.status}</Badge>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-blue-900">Recent Messages</CardTitle>
                <CardDescription>Patient communications</CardDescription>
              </div>
              <Link href="/doctor/messages">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : recentMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent messages</p>
                  </div>
                ) : (
                  recentMessages.map((message) => (
                    <div key={message.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{message.subject}</h4>
                            {!message.isRead && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                          </div>
                          <p className="text-sm text-gray-600">From: {message.Patient.name}</p>
                          <p className="text-sm text-gray-500">{formatDate(message.createdAt)}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Reply
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-900">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/doctor/appointments">
                <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-6 h-6" />
                  <span>New Appointment</span>
                </Button>
              </Link>

              <Link href="/doctor/prescriptions">
                <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-purple-600 hover:bg-purple-700">
                  <Pill className="w-6 h-6" />
                  <span>Write Prescription</span>
                </Button>
              </Link>

              <Link href="/doctor/patients">
                <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-green-600 hover:bg-green-700">
                  <Users className="w-6 h-6" />
                  <span>View Patients</span>
                </Button>
              </Link>

              <Link href="/doctor/records">
                <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-orange-600 hover:bg-orange-700">
                  <FileText className="w-6 h-6" />
                  <span>Medical Records</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {(stats?.todayAppointments || 0) > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">Today's Schedule</h3>
                  <p className="text-blue-700">
                    You have {stats?.todayAppointments} appointment{(stats?.todayAppointments || 0) > 1 ? "s" : ""}{" "}
                    scheduled for today. Make sure to review patient files before each consultation.
                  </p>
                </div>
                <Link href="/doctor/schedule">
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent">
                    View Schedule
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
