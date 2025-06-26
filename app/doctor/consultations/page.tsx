"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, Clock, Calendar, Phone, Plus } from "lucide-react"

export default function DoctorConsultations() {
  const consultations = [
    {
      id: 1,
      patient: "Jane Patient",
      date: "2024-01-15",
      time: "10:00 AM",
      status: "scheduled",
      type: "video",
      condition: "Hypertension Follow-up",
    },
    {
      id: 2,
      patient: "John Smith",
      date: "2024-01-15",
      time: "11:30 AM",
      status: "in_progress",
      type: "video",
      condition: "Chest Pain",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Consultations</h1>
            <p className="text-gray-600">Manage your virtual appointments</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Consultation
          </Button>
        </div>

        <div className="grid gap-4">
          {consultations.map((consultation) => (
            <Card key={consultation.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      {consultation.type === "video" ? (
                        <Video className="w-6 h-6 text-green-600" />
                      ) : (
                        <Phone className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{consultation.patient}</h3>
                      <p className="text-gray-600">{consultation.condition}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {consultation.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {consultation.time}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={consultation.status === "in_progress" ? "default" : "secondary"}>
                      {consultation.status.replace("_", " ")}
                    </Badge>
                    {consultation.status === "scheduled" && (
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Video className="w-4 h-4 mr-1" />
                        Start Call
                      </Button>
                    )}
                    {consultation.status === "in_progress" && <Button variant="destructive">End Call</Button>}
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
