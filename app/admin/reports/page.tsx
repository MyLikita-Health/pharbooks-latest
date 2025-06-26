"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Calendar, BarChart3, Users, Activity } from "lucide-react"

export default function AdminReports() {
  const reports = [
    {
      id: 1,
      title: "Platform Usage Report",
      description: "Comprehensive platform analytics and user activity",
      type: "analytics",
      generatedDate: "2024-01-15",
      status: "ready",
    },
    {
      id: 2,
      title: "Financial Summary",
      description: "Revenue, payments, and financial metrics",
      type: "financial",
      generatedDate: "2024-01-14",
      status: "ready",
    },
    {
      id: 3,
      title: "User Activity Report",
      description: "User engagement and activity patterns",
      type: "user_activity",
      generatedDate: "2024-01-13",
      status: "generating",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900">Reports</h1>
            <p className="text-gray-600">Generate and manage platform reports</p>
          </div>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-blue-600">2,847</p>
                  <p className="text-sm text-green-600">+12% this month</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-green-600">$45,678</p>
                  <p className="text-sm text-green-600">+22% this month</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                  <p className="text-3xl font-bold text-purple-600">156</p>
                  <p className="text-sm text-green-600">+8% this week</p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reports Generated</p>
                  <p className="text-3xl font-bold text-orange-600">89</p>
                  <p className="text-sm text-green-600">+15% this month</p>
                </div>
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{report.title}</h3>
                      <p className="text-gray-600">{report.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {report.generatedDate}
                        </div>
                        <span className="capitalize">{report.type.replace("_", " ")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={report.status === "ready" ? "default" : "secondary"}>{report.status}</Badge>
                    {report.status === "ready" && (
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
