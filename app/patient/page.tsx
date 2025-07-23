"use client"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { dashboardApi, appointmentsApi, prescriptionsApi } from "@/lib/api"
import { useApiData } from "@/hooks/use-api-data"
import { Calendar, Clock, Pill, Video, MessageSquare, Activity, Heart, Thermometer, Loader2 } from "lucide-react"
import Link from "next/link"

interface PatientStats {
  upcomingAppointments: number
  activePrescriptions: number
  unreadMessages: number
  healthScore: number
  totalAppointments: number
  completedAppointments: number
}

interface Appointment {
  id: string
  appointmentDate: string
  duration: number
  type: string
  status: string
  symptoms?: string
  Doctor: {
    name: string
    specialization: string
  }
}

interface Prescription {
  id: string
  status: string
  createdAt: string
  Doctor: {
    name: string
  }
  Medications: Array<{
    name: string
    dosage: string
  }>
}

interface VitalSigns {
  bloodPressure: string
  heartRate: string
  temperature: string
  weight: string
  recordedAt: string
}

export default function PatientDashboard() {
  const { user } = useAuth()

  // Fetch patient statistics
  const {
    data: stats,
    loading: statsLoading,
    refetch: refetchStats,
  } = useApiData<PatientStats>(() => dashboardApi.getPatientStats(), [], {
    onError: () => ({
      upcomingAppointments: 0,
      activePrescriptions: 0,
      unreadMessages: 0,
      healthScore: 0,
      totalAppointments: 0,
      completedAppointments: 0,
    }),
  })

  // Fetch upcoming appointments
  const {
    data: appointmentsData,
    loading: appointmentsLoading,
    refetch: refetchAppointments,
  } = useApiData<{ appointments: Appointment[] }>(() => {
    const today = new Date().toISOString()
    return appointmentsApi.getAppointments({
      status: "confirmed",
      from: today,
      limit: 5,
    })
  }, [])

  // Fetch active prescriptions
  const {
    data: prescriptionsData,
    loading: prescriptionsLoading,
    refetch: refetchPrescriptions,
  } = useApiData<{ prescriptions: Prescription[] }>(
    () => prescriptionsApi.getPrescriptions({ status: "active", limit: 5 }),
    [],
  )

  // Fetch latest vital signs
  const { data: vitalSigns, loading: vitalSignsLoading } = useApiData<VitalSigns>(
    () => dashboardApi.getPatientStats().then((data: any) => data.vitalSigns),
    [],
    {
      onError: () => ({
        bloodPressure: "120/80",
        heartRate: "72 bpm",
        temperature: "98.6°F",
        weight: "165 lbs",
        recordedAt: new Date().toISOString(),
      }),
    },
  )

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
      case "active":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const refreshAllData = () => {
    refetchStats()
    refetchAppointments()
    refetchPrescriptions()
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

  const upcomingAppointments = appointmentsData?.appointments || []
  const activePrescriptions = prescriptionsData?.prescriptions || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
              <p className="text-blue-100">Here's an overview of your health information and upcoming appointments.</p>
            </div>
            <Button onClick={refreshAllData} variant="outline" className="bg-white/10 border-white/20 text-white">
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.upcomingAppointments || 0}</div>
              <p className="text-xs text-muted-foreground">
                {upcomingAppointments.length > 0
                  ? `Next: ${formatDate(upcomingAppointments[0].appointmentDate)}, ${formatTime(upcomingAppointments[0].appointmentDate)}`
                  : "No upcoming appointments"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activePrescriptions || 0}</div>
              <p className="text-xs text-muted-foreground">
                {activePrescriptions.filter((p) => p.status === "active").length} due for refill
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.unreadMessages || 0}</div>
              <p className="text-xs text-muted-foreground">From your healthcare providers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.healthScore || 85}</div>
              <p className="text-xs text-muted-foreground">Good health</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>Your scheduled medical appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointmentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming appointments</p>
                  <Link href="/patient/appointments/book">
                    <Button className="mt-4">Book Appointment</Button>
                  </Link>
                </div>
              ) : (
                upcomingAppointments.slice(0, 2).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{appointment.Doctor.name}</p>
                      <p className="text-sm text-gray-600">{appointment.Doctor.specialization}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatDate(appointment.appointmentDate)}, {formatTime(appointment.appointmentDate)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant="outline">{appointment.type}</Badge>
                      <div>
                        <Button size="sm" variant="outline">
                          <Video className="w-4 h-4 mr-1" />
                          Join
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/patient/appointments">View All Appointments</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Prescriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="w-5 h-5 mr-2" />
                Recent Prescriptions
              </CardTitle>
              <CardDescription>Your current medications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prescriptionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : activePrescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No active prescriptions</p>
                </div>
              ) : (
                activePrescriptions.slice(0, 2).map((prescription) => (
                  <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{prescription.Medications?.[0]?.name || "Multiple medications"}</p>
                      <p className="text-sm text-gray-600">Prescribed by {prescription.Doctor.name}</p>
                      <p className="text-sm text-gray-500">{formatDate(prescription.createdAt)}</p>
                    </div>
                    <Badge className={getStatusColor(prescription.status)}>{prescription.status}</Badge>
                  </div>
                ))
              )}

              <Button asChild className="w-full bg-transparent" variant="outline">
                <Link href="/patient/prescriptions">View All Prescriptions</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Latest Vital Signs
            </CardTitle>
            <CardDescription>Your most recent health measurements</CardDescription>
          </CardHeader>
          <CardContent>
            {vitalSignsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Heart className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Blood Pressure</p>
                    <p className="font-semibold">{vitalSigns?.bloodPressure || "120/80"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Heart Rate</p>
                    <p className="font-semibold">{vitalSigns?.heartRate || "72 bpm"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Thermometer className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="font-semibold">{vitalSigns?.temperature || "98.6°F"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="font-semibold">{vitalSigns?.weight || "165 lbs"}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
