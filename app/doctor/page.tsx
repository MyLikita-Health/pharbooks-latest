import DashboardLayout from "@/components/layout/dashboard-layout"
import { PageWrapper } from "@/components/page-wrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Users,
  Video,
  MessageSquare,
  Activity,
  FileText,
  Pill,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

export default function DoctorDashboard() {
  return (
    <DashboardLayout>
      <PageWrapper>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Good morning, Dr. Smith!</h2>
            <p className="text-green-100">You have 8 appointments scheduled for today</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Today's Appointments</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Patients</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Reviews</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Messages</p>
                    <p className="text-2xl font-bold">5</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Schedule */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Today's Schedule</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/doctor/schedule">View Full Schedule</Link>
                  </Button>
                </CardTitle>
                <CardDescription>Your appointments for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-gray-500">General Checkup</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">9:00 AM - 9:30 AM</p>
                      <Badge className="text-xs bg-blue-600">Next</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Video className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sarah Wilson</p>
                        <p className="text-sm text-gray-500">Video Consultation</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">10:00 AM - 10:30 AM</p>
                      <Badge variant="outline" className="text-xs">
                        Scheduled
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Activity className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Michael Brown</p>
                        <p className="text-sm text-gray-500">Follow-up</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">11:00 AM - 11:30 AM</p>
                      <Badge variant="outline" className="text-xs">
                        Scheduled
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/doctor/consultations">
                    <Video className="w-4 h-4 mr-2" />
                    Start Video Call
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/doctor/prescriptions">
                    <Pill className="w-4 h-4 mr-2" />
                    Write Prescription
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/doctor/patients">
                    <Users className="w-4 h-4 mr-2" />
                    View Patients
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/doctor/messages">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-1 bg-green-100 rounded-full">
                      <FileText className="w-3 h-3 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Prescription sent to John Doe</p>
                      <p className="text-xs text-gray-500">30 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-1 bg-blue-100 rounded-full">
                      <MessageSquare className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New message from Sarah Wilson</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-1 bg-purple-100 rounded-full">
                      <Calendar className="w-3 h-3 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Appointment rescheduled</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span>Alerts & Reminders</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">Lab results pending review</p>
                        <p className="text-xs text-orange-600">3 patients waiting for results</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Monthly report due</p>
                        <p className="text-xs text-blue-600">Submit by end of week</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWrapper>
    </DashboardLayout>
  )
}
