"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Plus, Eye, Edit, Calendar, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"

export default function HubPatients() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const patients = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      age: 45,
      gender: "Male",
      address: "123 Main St, City, State",
      status: "active",
      lastVisit: "2024-01-15",
      upcomingAppointment: "2024-01-20",
      assignedDoctor: "Dr. Sarah Wilson",
      medicalConditions: ["Hypertension", "Diabetes"],
    },
    {
      id: 2,
      name: "Emily Johnson",
      email: "emily.johnson@email.com",
      phone: "+1 (555) 234-5678",
      age: 32,
      gender: "Female",
      address: "456 Oak Ave, City, State",
      status: "active",
      lastVisit: "2024-01-12",
      upcomingAppointment: null,
      assignedDoctor: "Dr. Michael Brown",
      medicalConditions: ["Asthma"],
    },
    {
      id: 3,
      name: "Robert Davis",
      email: "robert.davis@email.com",
      phone: "+1 (555) 345-6789",
      age: 58,
      gender: "Male",
      address: "789 Pine St, City, State",
      status: "inactive",
      lastVisit: "2023-12-20",
      upcomingAppointment: null,
      assignedDoctor: null,
      medicalConditions: ["Heart Disease"],
    },
  ]

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || patient.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
            <p className="text-gray-600">Create and manage patient records</p>
          </div>
          <Link href="/hub/patients/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Patient
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">1,247</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Patients</p>
                  <p className="text-3xl font-bold text-green-600">1,156</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New This Month</p>
                  <p className="text-3xl font-bold text-purple-600">89</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Matches</p>
                  <p className="text-3xl font-bold text-orange-600">23</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "active" ? "default" : "outline"}
                  onClick={() => setFilterStatus("active")}
                  size="sm"
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === "inactive" ? "default" : "outline"}
                  onClick={() => setFilterStatus("inactive")}
                  size="sm"
                >
                  Inactive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <div className="grid gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">{patient.name}</h3>
                        <Badge variant={patient.status === "active" ? "default" : "secondary"}>{patient.status}</Badge>
                        {patient.upcomingAppointment && (
                          <Badge variant="outline" className="text-green-600">
                            Upcoming Appointment
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{patient.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {patient.age} years, {patient.gender}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <p>
                          <strong>Last Visit:</strong> {patient.lastVisit}
                        </p>
                        {patient.assignedDoctor && (
                          <p>
                            <strong>Assigned Doctor:</strong> {patient.assignedDoctor}
                          </p>
                        )}
                        {patient.medicalConditions.length > 0 && (
                          <div className="flex items-center space-x-2 mt-1">
                            <strong>Conditions:</strong>
                            <div className="flex space-x-1">
                              {patient.medicalConditions.map((condition, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {condition}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/hub/patients/${patient.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/hub/patients/${patient.id}/edit`}>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/hub/appointments/create?patientId=${patient.id}`}>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Calendar className="w-4 h-4 mr-1" />
                        Book
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first patient"}
              </p>
              <Link href="/hub/patients/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Patient
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
