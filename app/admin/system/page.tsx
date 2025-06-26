"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Activity, Server, Database, Wifi } from "lucide-react"

export default function AdminSystem() {
  const systemStatus = [
    {
      service: "Web Server",
      status: "healthy",
      uptime: "99.9%",
      lastCheck: "2 minutes ago",
      icon: Server,
    },
    {
      service: "Database",
      status: "healthy",
      uptime: "99.8%",
      lastCheck: "1 minute ago",
      icon: Database,
    },
    {
      service: "API Gateway",
      status: "warning",
      uptime: "98.5%",
      lastCheck: "30 seconds ago",
      icon: Wifi,
    },
  ]

  const alerts = [
    {
      id: 1,
      type: "warning",
      message: "High memory usage detected on server-02",
      time: "5 minutes ago",
      severity: "medium",
    },
    {
      id: 2,
      type: "info",
      message: "Database backup completed successfully",
      time: "1 hour ago",
      severity: "low",
    },
    {
      id: 3,
      type: "error",
      message: "Failed login attempts from suspicious IP",
      time: "2 hours ago",
      severity: "high",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900">System Health</h1>
            <p className="text-gray-600">Monitor platform infrastructure and performance</p>
          </div>
          <Button>
            <Activity className="w-4 h-4 mr-2" />
            Run Diagnostics
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className="text-3xl font-bold text-green-600">Healthy</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-3xl font-bold text-orange-600">3</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-3xl font-bold text-blue-600">99.9%</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>Current status of all platform services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemStatus.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        service.status === "healthy"
                          ? "bg-green-100"
                          : service.status === "warning"
                            ? "bg-yellow-100"
                            : "bg-red-100"
                      }`}
                    >
                      <service.icon
                        className={`w-5 h-5 ${
                          service.status === "healthy"
                            ? "text-green-600"
                            : service.status === "warning"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{service.service}</h4>
                      <p className="text-sm text-gray-500">
                        Uptime: {service.uptime} • Last check: {service.lastCheck}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      service.status === "healthy"
                        ? "default"
                        : service.status === "warning"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {service.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Recent system notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        alert.severity === "high"
                          ? "bg-red-100"
                          : alert.severity === "medium"
                            ? "bg-yellow-100"
                            : "bg-blue-100"
                      }`}
                    >
                      <AlertTriangle
                        className={`w-5 h-5 ${
                          alert.severity === "high"
                            ? "text-red-600"
                            : alert.severity === "medium"
                              ? "text-yellow-600"
                              : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{alert.message}</h4>
                      <p className="text-sm text-gray-500 capitalize">
                        {alert.type} • {alert.time}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      alert.severity === "high" ? "destructive" : alert.severity === "medium" ? "default" : "secondary"
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
    </DashboardLayout>
  )
}
