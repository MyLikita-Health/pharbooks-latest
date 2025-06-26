"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Plus, Settings } from "lucide-react"

export default function DoctorSchedule() {
  const schedule = [
    {
      id: 1,
      time: "09:00 AM",
      patient: "Jane Patient",
      type: "Consultation",
      duration: "30 min",
      status: "confirmed",
    },
    {
      id: 2,
      time: "10:00 AM",
      patient: "John Smith",
      type: "Follow-up",
      duration: "15 min",
      status: "pending",
    },
    {
      id: 3,
      time: "11:00 AM",
      patient: "Available",
      type: "Open Slot",
      duration: "30 min",
      status: "available",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">My Schedule</h1>
            <p className="text-gray-600">Manage your appointments and availability</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Availability
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Block Time
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>January 2024</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                  <div key={day} className="p-2 font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 31 }, (_, i) => (
                  <div
                    key={i + 1}
                    className={`p-2 hover:bg-blue-100 cursor-pointer rounded ${
                      i + 1 === 15 ? "bg-blue-600 text-white" : ""
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Today's Schedule - January 15, 2024</CardTitle>
              <CardDescription>Your appointments for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedule.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{appointment.time}</h4>
                        <p className="text-gray-600">{appointment.patient}</p>
                        <p className="text-sm text-gray-500">
                          {appointment.type} • {appointment.duration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={
                          appointment.status === "confirmed"
                            ? "default"
                            : appointment.status === "available"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {appointment.status}
                      </Badge>
                      {appointment.status !== "available" && (
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
