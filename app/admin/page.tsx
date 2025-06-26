"use client"

import { useAuth } from "@/contexts/auth-context"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Activity,
  Calendar,
  Pill,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  BarChart3,
  Settings,
  Shield,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const { user } = useAuth()

  const platformStats = [
    { label: "Total Users", value: "2,847", change: "+12%", icon: Users, color: "blue" },
    { label: "Active Sessions", value: "156", change: "+8%", icon: Activity, color: "green" },
    { label: "Today's Appointments", value: "89", change: "+15%", icon: Calendar, color: "purple" },
    { label: "Prescriptions Filled", value: "234", change: "+22%", icon: Pill, color: "orange" },
  ]

  const pendingApprovals = [
    {
      id: 1,
      name: "Dr. Emily Johnson",
      role: "doctor",
      specialization: "Dermatology",
      licenseNumber: "MD67890",
      submittedAt: "2 hours ago",
      status: "pending",
    },
    {
      id: 2,
      name: "PharmD. Robert Chen",
      role: "pharmacist",
      licenseNumber: "PH12345",
      submittedAt: "5 hours ago",
      status: "pending",
    },
    {
      id: 3,
      name: "Dr. Maria Rodriguez",
      role: "doctor",
      specialization: "Pediatrics",
      licenseNumber: "MD54321",
      submittedAt: "1 day ago",
      status: "under_review",
    },
  ]

  const systemAlerts = [
    {
      id: 1,
      type: "security",
      message: "Multiple failed login attempts detected",
      severity: "high",
      time: "30 minutes ago",
    },
    {
      id: 2,
      type: "system",
      message: "Database backup completed successfully",
      severity: "info",
      time: "2 hours ago",
    },
    {
      id: 3,
      type: "performance",
      message: "Server response time increased by 15%",
      severity: "medium",
      time: "4 hours ago",
    },
  ]

  const recentActivity = [
    {
      id: 1,
      action: "User Registration",
      details: "New patient registered: Jane Smith",
      time: "5 minutes ago",
      type: "user",
    },
    {
      id: 2,
      action: "Prescription Filled",
      details: "Prescription #12345 processed by PharmD. Wilson",
      time: "15 minutes ago",
      type: "prescription",
    },
    {
      id: 3,
      action: "Consultation Completed",
      details: "Dr. Sarah Smith completed consultation with John Doe",
      time: "30 minutes ago",
      type: "consultation",
    },
    {
      id: 4,
      action: "System Update",
      details: "Platform updated to version 2.1.3",
      time: "2 hours ago",
      type: "system",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-indigo-100">Welcome back, {user?.name}! Here's an overview of your MediLinka platform.</p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {platformStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                      {stat.change} from last week
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-indigo-900">Pending Approvals</CardTitle>
                <CardDescription>Healthcare professionals awaiting verification</CardDescription>
              </div>
              <Link href="/admin/users">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{approval.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{approval.role}</p>
                        {approval.specialization && <p className="text-sm text-gray-600">{approval.specialization}</p>}
                        <p className="text-sm text-gray-500">License: {approval.licenseNumber}</p>
                        <p className="text-sm text-gray-500">{approval.submittedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{approval.status.replace("_", " ")}</Badge>
                      <div className="flex space-x-1">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-indigo-900">System Alerts</CardTitle>
                <CardDescription>Important system notifications</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          alert.severity === "high"
                            ? "bg-red-100"
                            : alert.severity === "medium"
                              ? "bg-yellow-100"
                              : "bg-blue-100"
                        }`}
                      >
                        {alert.severity === "high" ? (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        ) : alert.severity === "medium" ? (
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{alert.message}</h4>
                        <p className="text-sm text-gray-600 capitalize">{alert.type} Alert</p>
                        <p className="text-sm text-gray-500">{alert.time}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        alert.severity === "high"
                          ? "destructive"
                          : alert.severity === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-indigo-900">Recent Activity</CardTitle>
              <CardDescription>Latest platform activities and events</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View Activity Log
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === "user"
                        ? "bg-green-100"
                        : activity.type === "prescription"
                          ? "bg-purple-100"
                          : activity.type === "consultation"
                            ? "bg-blue-100"
                            : "bg-gray-100"
                    }`}
                  >
                    {activity.type === "user" ? (
                      <Users className={`w-5 h-5 text-green-600`} />
                    ) : activity.type === "prescription" ? (
                      <Pill className={`w-5 h-5 text-purple-600`} />
                    ) : activity.type === "consultation" ? (
                      <Activity className={`w-5 h-5 text-blue-600`} />
                    ) : (
                      <Settings className={`w-5 h-5 text-gray-600`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.action}</h4>
                    <p className="text-sm text-gray-600">{activity.details}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-indigo-900">Admin Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/admin/users">
                <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-indigo-600 hover:bg-indigo-700">
                  <Users className="w-6 h-6" />
                  <span>Manage Users</span>
                </Button>
              </Link>

              <Link href="/admin/analytics">
                <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-green-600 hover:bg-green-700">
                  <BarChart3 className="w-6 h-6" />
                  <span>View Analytics</span>
                </Button>
              </Link>

              <Link href="/admin/settings">
                <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-purple-600 hover:bg-purple-700">
                  <Settings className="w-6 h-6" />
                  <span>System Settings</span>
                </Button>
              </Link>

              <Link href="/admin/security">
                <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-red-600 hover:bg-red-700">
                  <Shield className="w-6 h-6" />
                  <span>Security Center</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
