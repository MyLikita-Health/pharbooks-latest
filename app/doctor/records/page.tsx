"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Search, Plus, Calendar, Eye } from "lucide-react"

export default function DoctorRecords() {
  const records = [
    {
      id: 1,
      patient: "Jane Patient",
      title: "Annual Physical Exam",
      date: "2024-01-10",
      type: "examination",
      status: "completed",
    },
    {
      id: 2,
      patient: "John Smith",
      title: "Diabetes Follow-up",
      date: "2024-01-08",
      type: "consultation",
      status: "pending_review",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Medical Records</h1>
            <p className="text-gray-600">Patient medical records and documentation</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Record
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Search records..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {records.map((record) => (
            <Card key={record.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{record.title}</h3>
                      <p className="text-gray-600">Patient: {record.patient}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {record.date}
                        </div>
                        <span className="capitalize">{record.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={record.status === "completed" ? "default" : "secondary"}>
                      {record.status.replace("_", " ")}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
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
