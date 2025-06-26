"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Eye, MessageSquare, Pill } from "lucide-react"

export default function PharmacistPatients() {
  const patients = [
    {
      id: 1,
      name: "Jane Patient",
      age: 45,
      activePrescriptions: 3,
      lastOrder: "2024-01-10",
      totalOrders: 12,
      status: "active",
    },
    {
      id: 2,
      name: "John Smith",
      age: 32,
      activePrescriptions: 1,
      lastOrder: "2024-01-08",
      totalOrders: 8,
      status: "active",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">Patients</h1>
            <p className="text-gray-600">Manage patient medication profiles</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Search patients..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {patients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{patient.name}</h3>
                      <p className="text-gray-600">Age: {patient.age}</p>
                      <p className="text-sm text-gray-500">
                        Active Prescriptions: {patient.activePrescriptions} • Total Orders: {patient.totalOrders}
                      </p>
                      <p className="text-sm text-gray-500">Last Order: {patient.lastOrder}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="default">{patient.status}</Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Pill className="w-4 h-4 mr-1" />
                        Prescriptions
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
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
