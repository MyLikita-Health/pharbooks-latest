"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Users,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

export default function HubAnalytics() {
  const metrics = [
    { title: "Total Patients", value: "1,247", change: "+12%", trend: "up", icon: Users },
    { title: "Appointments This Month", value: "456", change: "+8%", trend: "up", icon: Calendar },
    { title: "Successful Matches", value: "2,891", change: "+15%", trend: "up", icon: Activity },
    { title: "Average Wait Time", value: "2.3 days", change: "-18%", trend: "down", icon: Clock },
  ]

  const doctorPerformance = [
    { name: "Dr. Sarah Wilson", specialty: "Cardiology", patients: 45, rating: 4.9, completionRate: 98 },
    { name: "Dr. Michael Brown", specialty: "Pulmonology", patients: 38, rating: 4.8, completionRate: 96 },
    { name: "Dr. Jennifer Lee", specialty: "Cardiology", patients: 52, rating: 4.9, completionRate: 99 },
    { name: "Dr. David Kim", specialty: "General Medicine", patients: 41, rating: 4.7, completionRate: 94 },
  ]

  const recentActivity = [
    { type: "match", message: "3 patients matched with cardiologists", time: "2 hours ago", status: "success" },
    { type: "appointment", message: "15 appointments scheduled for tomorrow", time: "4 hours ago", status: "info" },
    { type: "alert", message: "Dr. Smith's schedule is fully booked", time: "6 hours ago", status: "warning" },
    { type: "completion", message: "Daily matching target achieved", time: "8 hours ago", status: "success" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hub Analytics</h1>
          <p className="text-gray-600">Performance metrics and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                    <div className="flex items-center mt-2">
                      {metric.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                      )}
                      <span className="text-sm text-green-600 font-medium">{metric.change}</span>
                    </div>
                  </div>
                  <metric.icon className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Doctor Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Doctor Performance</CardTitle>
              <CardDescription>Top performing doctors this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctorPerformance.map((doctor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{doctor.name}</h3>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4 text-sm">
                        <div>
                          <p className="font-medium">{doctor.patients} patients</p>
                          <p className="text-gray-600">Rating: {doctor.rating}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">{doctor.completionRate}% completion</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system activities and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">
                      {activity.status === "success" && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {activity.status === "warning" && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                      {activity.status === "info" && <Activity className="w-5 h-5 text-blue-600" />}
                    </div>
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

        {/* Performance Charts Placeholder */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Appointments</CardTitle>
              <CardDescription>Appointment trends over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Chart visualization would go here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patient Distribution</CardTitle>
              <CardDescription>Patients by specialty and location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Chart visualization would go here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
