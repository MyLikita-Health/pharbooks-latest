"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Pill, Search, Plus, Calendar } from "lucide-react"

export default function DoctorPrescriptions() {
  const prescriptions = [
    {
      id: 1,
      patient: "Jane Patient",
      medication: "Lisinopril 10mg",
      date: "2024-01-10",
      status: "active",
      refills: 2,
    },
    {
      id: 2,
      patient: "John Smith",
      medication: "Metformin 500mg",
      date: "2024-01-08",
      status: "pending_approval",
      refills: 1,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Prescriptions</h1>
            <p className="text-gray-600">Manage patient prescriptions</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Prescription
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Search prescriptions..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Pill className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{prescription.medication}</h3>
                      <p className="text-gray-600">Patient: {prescription.patient}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {prescription.date}
                        </div>
                        <span>{prescription.refills} refills remaining</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={prescription.status === "active" ? "default" : "secondary"}>
                      {prescription.status.replace("_", " ")}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
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
