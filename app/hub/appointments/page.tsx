"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Plus, Clock, Stethoscope, Eye, Edit, Phone, Video } from "lucide-react"
import Link from "next/link"

export default function HubAppointments() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDate, setFilterDate] = useState("all")

  const appointments = [
    {
      id: 1,
      patientName: "John Smith",
      doctorName: "Dr. Sarah Wilson",
      date: "2024-01-20",
      time: "10:00 AM",
      type: "video",
      status: "scheduled",
      reason: "Hypertension Follow-up",
      duration: 30,
      patientPhone: "+1 (555) 123-4567",
      doctorSpecialty: "Cardiology",
    },
    {
      id: 2,
      patientName: "Emily Johnson",
      doctorName: "Dr. Michael Brown",
      date: "2024-01-22",
      time: "02:30 PM",
      type: "video",
      status: "scheduled",
      reason: "Asthma Consultation",
      duration: 45,
      patientPhone: "+1 (555) 234-5678",
      doctorSpecialty: "Pulmonology",
    },
    {
      id: 3,
      patientName: "Robert Davis",
      doctorName: "Dr. Jennifer Lee",
      date: "2024-01-18",
      time: "09:00 AM",
      type: "video",
      status: "completed",
      reason: "Chest Pain Evaluation",
      duration: 60,
      patientPhone: "+1 (555) 345-6789",
      doctorSpecialty: "Cardiology",
    },
    {
      id: 4,
      patientName: "Sarah Wilson",
      doctorName: "Dr. David Kim",
      date: "2024-01-19",
      time: "11:30 AM",
      type: "video",
      status: "cancelled",
      reason: "General Checkup",
      duration: 30,
      patientPhone: "+1 (555) 456-7890",
      doctorSpecialty: "General Medicine",
    },
  ]

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus
    const matchesDate =
      filterDate === "all" ||
      (filterDate === "today" && appointment.date === "2024-01-18") ||
      (filterDate === "upcoming" && new Date(appointment.date) > new Date("2024-01-18"))
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const stats = [
    { title: "Total Appointments", value: "156", color: "text-blue-600", icon: Calendar },
    { title: "Today's Appointments", value: "12", color: "text-green-600", icon: Clock },
    { title: "Completed", value: "89", color: "text-purple-600", icon: Calendar },
    { title: "Cancelled", value: "8", color: "text-red-600", icon: Calendar },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
            <p className="text-gray-600">Manage and monitor all appointments</p>
          </div>
          <Link href="/hub/appointments/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient or doctor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {appointment.type === "video" ? (
                        <Video className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Phone className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                        <Badge variant="outline" className="capitalize">
                          {appointment.type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="w-4 h-4" />
                          <span>{appointment.doctorName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {appointment.date} at {appointment.time}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.duration} minutes</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <p>
                          <strong>Reason:</strong> {appointment.reason}
                        </p>
                        <p>
                          <strong>Specialty:</strong> {appointment.doctorSpecialty}
                        </p>
                        <p>
                          <strong>Patient Phone:</strong> {appointment.patientPhone}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    {appointment.status === "scheduled" && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Video className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Try adjusting your search terms" : "No appointments match the selected filters"}
              </p>
              <Link href="/hub/appointments/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Book New Appointment
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
