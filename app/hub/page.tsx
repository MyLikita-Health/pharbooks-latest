"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Activity, UserPlus, CalendarPlus, Stethoscope, TrendingUp, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function HubDashboard() {
  const stats = [
    { title: "Total Patients", value: "1,247", change: "+12%", icon: Users, color: "text-blue-600" },
    { title: "Today's Appointments", value: "34", change: "+8%", icon: Calendar, color: "text-green-600" },
    { title: "Available Doctors", value: "18", change: "-2", icon: Stethoscope, color: "text-purple-600" },
    { title: "Pending Matches", value: "7", change: "+3", icon: Activity, color: "text-orange-600" },
  ]

  const recentActivities = [
    { id: 1, type: "patient_created", message: "New patient John Doe registered", time: "5 min ago" },
    { id: 2, type: "appointment_booked", message: "Appointment booked for Sarah Wilson", time: "12 min ago" },
    { id: 3, type: "doctor_matched", message: "Dr. Smith matched with patient Mike Johnson", time: "25 min ago" },
    {
      id: 4,
      type: "appointment_completed",
      message: "Consultation completed - Dr. Davis & Emma Brown",
      time: "1 hour ago",
    },
  ]

  const urgentTasks = [
    { id: 1, task: "Match 3 patients with cardiologists", priority: "high" },
    { id: 2, task: "Follow up on cancelled appointments", priority: "medium" },
    { id: 3, task: "Review new doctor applications", priority: "low" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hub Dashboard</h1>
            <p className="text-gray-600">Manage patients, appointments, and doctor matching</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/hub/patients/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </Link>
            <Link href="/hub/appointments/create">
              <Button variant="outline">
                <CalendarPlus className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest actions and updates in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Urgent Tasks */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Urgent Tasks</CardTitle>
                <CardDescription>Items requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {urgentTasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <AlertCircle
                        className={`w-4 h-4 mt-0.5 ${
                          task.priority === "high"
                            ? "text-red-500"
                            : task.priority === "medium"
                              ? "text-yellow-500"
                              : "text-green-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{task.task}</p>
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                          className="mt-1"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used hub operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/hub/matching">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Activity className="w-6 h-6" />
                  <span>Doctor Matching</span>
                </Button>
              </Link>
              <Link href="/hub/patients">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Users className="w-6 h-6" />
                  <span>Manage Patients</span>
                </Button>
              </Link>
              <Link href="/hub/appointments">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Calendar className="w-6 h-6" />
                  <span>View Appointments</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
