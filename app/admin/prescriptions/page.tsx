"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Pill, Search, Eye, Edit, AlertTriangle } from "lucide-react"

export default function AdminPrescriptions() {
  const prescriptions = [
    {
      id: 1,
      patient: "Jane Patient",
      doctor: "Dr. Sarah Smith",
      medication: "Lisinopril 10mg",
      date: "2024-01-15",
      status: "active",
      pharmacist: "PharmD. Wilson",
    },
    {
      id: 2,
      patient: "John Smith",
      doctor: "Dr. Michael Johnson",
      medication: "Metformin 500mg",
      date: "2024-01-14",
      status: "pending_verification",
      pharmacist: "Pending Assignment",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900">Prescriptions</h1>
            <p className="text-gray-600">Monitor all platform prescriptions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                  <p className="text-3xl font-bold text-purple-600">1,234</p>
                </div>
                <Pill className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-3xl font-bold text-green-600">987</p>
                </div>
                <Pill className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-orange-600">156</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Flagged</p>
                  <p className="text-3xl font-bold text-red-600">12</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
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
                      <p className="text-gray-600">
                        Patient: {prescription.patient} • Doctor: {prescription.doctor}
                      </p>
                      <p className="text-sm text-gray-500">
                        Date: {prescription.date} • Pharmacist: {prescription.pharmacist}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={
                        prescription.status === "active"
                          ? "default"
                          : prescription.status === "pending_verification"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {prescription.status.replace("_", " ")}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
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
