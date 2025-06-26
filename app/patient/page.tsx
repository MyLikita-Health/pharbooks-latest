"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Pill, Video, MessageSquare, Activity, Heart, Thermometer } from "lucide-react"
import Link from "next/link"

export default function PatientDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
          <p className="text-blue-100">Here's an overview of your health information and upcoming appointments.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Next: Jan 15, 10:00 AM</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 due for refill</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">From Dr. Johnson</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85</div>
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
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Dr. Sarah Johnson</p>
                  <p className="text-sm text-gray-600">Cardiologist</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Jan 15, 10:00 AM</span>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge variant="outline">Follow-up</Badge>
                  <div>
                    <Button size="sm" variant="outline">
                      <Video className="w-4 h-4 mr-1" />
                      Join
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Dr. Michael Chen</p>
                  <p className="text-sm text-gray-600">General Practitioner</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Jan 18, 2:30 PM</span>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge variant="outline">Consultation</Badge>
                  <div>
                    <Button size="sm" variant="outline">
                      <Video className="w-4 h-4 mr-1" />
                      Join
                    </Button>
                  </div>
                </div>
              </div>

              <Button asChild className="w-full" variant="outline">
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
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Lisinopril 10mg</p>
                  <p className="text-sm text-gray-600">Prescribed by Dr. Sarah Johnson</p>
                  <p className="text-sm text-gray-500">Jan 10, 2024</p>
                </div>
                <Badge>Active</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Metformin 500mg</p>
                  <p className="text-sm text-gray-600">Prescribed by Dr. Michael Chen</p>
                  <p className="text-sm text-gray-500">Jan 8, 2024</p>
                </div>
                <Badge>Active</Badge>
              </div>

              <Button asChild className="w-full" variant="outline">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-4 border rounded-lg">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Blood Pressure</p>
                  <p className="font-semibold">120/80</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Heart Rate</p>
                  <p className="font-semibold">72 bpm</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Thermometer className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Temperature</p>
                  <p className="font-semibold">98.6°F</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-semibold">165 lbs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
