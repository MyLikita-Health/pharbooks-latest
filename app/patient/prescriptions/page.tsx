"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pill, Search, Calendar, User, RefreshCw, Download, AlertCircle } from "lucide-react"

export default function PatientPrescriptions() {
  const [searchTerm, setSearchTerm] = useState("")

  const prescriptions = [
    {
      id: 1,
      medication: "Lisinopril 10mg",
      doctor: "Dr. Sarah Smith",
      prescribedDate: "2024-01-15",
      instructions: "Take once daily with food",
      quantity: "30 tablets",
      refills: 2,
      status: "active",
      pharmacy: "MediLinka Pharmacy",
      nextRefill: "2024-02-15",
    },
    {
      id: 2,
      medication: "Metformin 500mg",
      doctor: "Dr. Michael Johnson",
      prescribedDate: "2024-01-10",
      instructions: "Take twice daily with meals",
      quantity: "60 tablets",
      refills: 5,
      status: "active",
      pharmacy: "MediLinka Pharmacy",
      nextRefill: "2024-02-10",
    },
    {
      id: 3,
      medication: "Amoxicillin 250mg",
      doctor: "Dr. Emily Davis",
      prescribedDate: "2024-01-05",
      instructions: "Take three times daily for 7 days",
      quantity: "21 capsules",
      refills: 0,
      status: "completed",
      pharmacy: "MediLinka Pharmacy",
      completedDate: "2024-01-12",
    },
  ]

  const activePrescriptions = prescriptions.filter((p) => p.status === "active")
  const completedPrescriptions = prescriptions.filter((p) => p.status === "completed")

  const filteredActive = activePrescriptions.filter(
    (p) =>
      p.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.doctor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredCompleted = completedPrescriptions.filter(
    (p) =>
      p.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.doctor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "expired":
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
            <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
            <p className="text-gray-600">Manage your medications and refills</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download History
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
                  <p className="text-3xl font-bold text-green-600">{activePrescriptions.length}</p>
                </div>
                <Pill className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Due for Refill</p>
                  <p className="text-3xl font-bold text-orange-600">1</p>
                </div>
                <RefreshCw className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Refills</p>
                  <p className="text-3xl font-bold text-blue-600">7</p>
                </div>
                <RefreshCw className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-purple-600">3</p>
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
                placeholder="Search prescriptions by medication or doctor..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Prescriptions</TabsTrigger>
            <TabsTrigger value="completed">Prescription History</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {filteredActive.map((prescription) => (
              <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Pill className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{prescription.medication}</h3>
                          <Badge className={getStatusColor(prescription.status)}>{prescription.status}</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Prescribed by {prescription.doctor}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Prescribed on {prescription.prescribedDate}
                          </div>
                          <p>
                            <strong>Instructions:</strong> {prescription.instructions}
                          </p>
                          <p>
                            <strong>Quantity:</strong> {prescription.quantity}
                          </p>
                          <p>
                            <strong>Refills remaining:</strong> {prescription.refills}
                          </p>
                          <p>
                            <strong>Pharmacy:</strong> {prescription.pharmacy}
                          </p>
                        </div>
                        {prescription.nextRefill && (
                          <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                            <div className="flex items-center">
                              <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                              <span className="text-sm text-orange-800">
                                Next refill due: {prescription.nextRefill}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Request Refill
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredActive.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active prescriptions</h3>
                  <p className="text-gray-600">
                    {searchTerm ? "No prescriptions match your search" : "You don't have any active prescriptions"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filteredCompleted.map((prescription) => (
              <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Pill className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{prescription.medication}</h3>
                          <Badge className={getStatusColor(prescription.status)}>{prescription.status}</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Prescribed by {prescription.doctor}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Prescribed: {prescription.prescribedDate}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Completed: {prescription.completedDate}
                          </div>
                          <p>
                            <strong>Instructions:</strong> {prescription.instructions}
                          </p>
                          <p>
                            <strong>Quantity:</strong> {prescription.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredCompleted.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No prescription history</h3>
                  <p className="text-gray-600">
                    {searchTerm
                      ? "No completed prescriptions match your search"
                      : "You don't have any completed prescriptions yet"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
