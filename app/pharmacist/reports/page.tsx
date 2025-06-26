"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Calendar, BarChart3, TrendingUp } from "lucide-react"

export default function PharmacistReports() {
  const reports = [
    {
      id: 1,
      title: "Monthly Sales Report",
      description: "Detailed sales analysis for January 2024",
      type: "sales",
      generatedDate: "2024-01-15",
      status: "ready",
    },
    {
      id: 2,
      title: "Inventory Status Report",
      description: "Current stock levels and reorder recommendations",
      type: "inventory",
      generatedDate: "2024-01-14",
      status: "ready",
    },
    {
      id: 3,
      title: "Prescription Trends",
      description: "Analysis of prescription patterns and trends",
      type: "analytics",
      generatedDate: "2024-01-13",
      status: "generating",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">Reports</h1>
            <p className="text-gray-600">Generate and view pharmacy reports</p>
          </div>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month Sales</p>
                  <p className="text-3xl font-bold text-green-600">$24,580</p>
                  <p className="text-sm text-green-600">+12% from last month</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Orders Processed</p>
                  <p className="text-3xl font-bold text-blue-600">156</p>
                  <p className="text-sm text-blue-600">+8% from last month</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Patients</p>
                  <p className="text-3xl font-bold text-purple-600">89</p>
                  <p className="text-sm text-purple-600">+5% from last month</p>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
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
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{report.title}</h3>
                      <p className="text-gray-600">{report.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {report.generatedDate}
                        </div>
                        <span className="capitalize">{report.type}</span>
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
