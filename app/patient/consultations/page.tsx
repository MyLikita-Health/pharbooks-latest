"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Video, Phone, Calendar, Clock, Search, Plus } from "lucide-react"

export default function PatientConsultations() {
  const [searchTerm, setSearchTerm] = useState("")

  const consultations = [
    {
      id: 1,
      doctor: "Dr. Sarah Smith",
      specialty: "Cardiologist",
      date: "2024-01-20",
      time: "10:00 AM",
      type: "video",
      status: "scheduled",
      reason: "Follow-up consultation",
      duration: "30 minutes",
    },
    {
      id: 2,
      doctor: "Dr. Michael Johnson",
      specialty: "General Practitioner",
      date: "2024-01-18",
      time: "2:30 PM",
      type: "video",
      status: "completed",
      reason: "General checkup",
      duration: "45 minutes",
    },
    {
      id: 3,
      doctor: "Dr. Emily Davis",
      specialty: "Dermatologist",
      date: "2024-01-15",
      time: "11:15 AM",
      type: "phone",
      status: "completed",
      reason: "Skin condition review",
      duration: "20 minutes",
    },
  ]

  const filteredConsultations = consultations.filter(
    (consultation) =>
      consultation.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.reason.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Consultations</h1>
            <p className="text-gray-600">View and manage your virtual consultations</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Consultation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Consultations</p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                </div>
                <Video className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-green-600">3</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-3xl font-bold text-orange-600">1</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                  <p className="text-3xl font-bold text-purple-600">32m</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search consultations by doctor, specialty, or reason..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Consultations List */}
        <div className="space-y-4">
          {filteredConsultations.map((consultation) => (
            <Card key={consultation.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {consultation.type === "video" ? (
                        <Video className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Phone className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg">{consultation.doctor}</h3>
                        <Badge variant="outline">{consultation.specialty}</Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{consultation.reason}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {consultation.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {consultation.time}
                        </div>
                        <span>Duration: {consultation.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(consultation.status)}>{consultation.status}</Badge>
                    {consultation.status === "scheduled" && (
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Video className="w-4 h-4 mr-2" />
                        Join Call
                      </Button>
                    )}
                    {consultation.status === "completed" && <Button variant="outline">View Summary</Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredConsultations.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Try adjusting your search terms" : "You haven't scheduled any consultations yet"}
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Your First Consultation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
