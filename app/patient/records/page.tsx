"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Search, Calendar, User, Download, Eye, Upload, Activity } from "lucide-react"

export default function PatientRecords() {
  const [searchTerm, setSearchTerm] = useState("")

  const medicalRecords = [
    {
      id: 1,
      title: "Annual Physical Exam",
      doctor: "Dr. Sarah Smith",
      date: "2024-01-15",
      type: "Examination",
      status: "completed",
      summary: "Routine annual physical examination. All vital signs normal.",
      attachments: ["blood_work_results.pdf", "chest_xray.jpg"],
    },
    {
      id: 2,
      title: "Cardiology Consultation",
      doctor: "Dr. Michael Johnson",
      date: "2024-01-10",
      type: "Consultation",
      status: "completed",
      summary: "Follow-up for hypertension management. Blood pressure well controlled.",
      attachments: ["ecg_results.pdf"],
    },
    {
      id: 3,
      title: "Lab Results - Lipid Panel",
      doctor: "Dr. Sarah Smith",
      date: "2024-01-08",
      type: "Lab Results",
      status: "completed",
      summary: "Cholesterol levels within normal range. Continue current medication.",
      attachments: ["lipid_panel_results.pdf"],
    },
  ]

  const testResults = [
    {
      id: 1,
      testName: "Complete Blood Count (CBC)",
      orderedBy: "Dr. Sarah Smith",
      date: "2024-01-15",
      status: "completed",
      results: "Normal",
      reference: "All values within normal limits",
    },
    {
      id: 2,
      testName: "Lipid Panel",
      orderedBy: "Dr. Sarah Smith",
      date: "2024-01-08",
      status: "completed",
      results: "Normal",
      reference: "Total cholesterol: 180 mg/dL (Normal: <200)",
    },
    {
      id: 3,
      testName: "Thyroid Function Test",
      orderedBy: "Dr. Michael Johnson",
      date: "2024-01-05",
      status: "pending",
      results: "Pending",
      reference: "Results expected within 24-48 hours",
    },
  ]

  const appointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Smith",
      date: "2024-01-20",
      time: "10:00 AM",
      type: "Follow-up",
      status: "scheduled",
      reason: "Blood pressure check",
    },
    {
      id: 2,
      doctor: "Dr. Emily Davis",
      date: "2024-01-18",
      time: "2:30 PM",
      type: "Consultation",
      status: "completed",
      reason: "Skin condition review",
    },
  ]

  const filteredRecords = medicalRecords.filter(
    (record) =>
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredTests = testResults.filter(
    (test) =>
      test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.orderedBy.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
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
            <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
            <p className="text-gray-600">Access your complete medical history and documents</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Records
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-3xl font-bold text-blue-600">{medicalRecords.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Test Results</p>
                  <p className="text-3xl font-bold text-green-600">
                    {testResults.filter((t) => t.status === "completed").length}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Tests</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {testResults.filter((t) => t.status === "pending").length}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-purple-600">5</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
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
                placeholder="Search records, tests, or appointments..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Records Tabs */}
        <Tabs defaultValue="records" className="space-y-4">
          <TabsList>
            <TabsTrigger value="records">Medical Records</TabsTrigger>
            <TabsTrigger value="tests">Test Results</TabsTrigger>
            <TabsTrigger value="appointments">Appointment History</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-4">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{record.title}</h3>
                          <Badge variant="outline">{record.type}</Badge>
                          <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {record.doctor}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {record.date}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{record.summary}</p>
                        {record.attachments.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">Attachments:</p>
                            <div className="flex flex-wrap gap-2">
                              {record.attachments.map((attachment, index) => (
                                <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-gray-200">
                                  {attachment}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            {filteredTests.map((test) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Activity className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{test.testName}</h3>
                          <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Ordered by {test.orderedBy}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {test.date}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p>
                            <strong>Results:</strong> {test.results}
                          </p>
                          <p className="text-sm text-gray-600">{test.reference}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {test.status === "completed" && (
                        <>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Results
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{appointment.type}</h3>
                          <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {appointment.doctor}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {appointment.date} at {appointment.time}
                          </div>
                        </div>
                        <p className="text-gray-700">{appointment.reason}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
