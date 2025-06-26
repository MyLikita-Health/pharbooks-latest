"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Users, Stethoscope, Clock, CheckCircle, AlertCircle, Star, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DoctorMatching() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null)
  const { toast } = useToast()

  const unmatchedPatients = [
    {
      id: 1,
      name: "John Smith",
      age: 45,
      gender: "Male",
      condition: "Hypertension",
      urgency: "medium",
      preferredSpecialty: "Cardiology",
      location: "Downtown",
      requestedDate: "2024-01-20",
    },
    {
      id: 2,
      name: "Emily Johnson",
      age: 32,
      gender: "Female",
      condition: "Asthma",
      urgency: "low",
      preferredSpecialty: "Pulmonology",
      location: "Midtown",
      requestedDate: "2024-01-22",
    },
    {
      id: 3,
      name: "Robert Davis",
      age: 58,
      gender: "Male",
      condition: "Chest Pain",
      urgency: "high",
      preferredSpecialty: "Cardiology",
      location: "Downtown",
      requestedDate: "2024-01-18",
    },
  ]

  const availableDoctors = [
    {
      id: 1,
      name: "Dr. Sarah Wilson",
      specialization: "Cardiology",
      experience: "15 years",
      rating: 4.9,
      location: "Downtown Medical Center",
      availability: [
        { date: "2024-01-18", slots: ["09:00 AM", "10:30 AM", "02:00 PM"] },
        { date: "2024-01-20", slots: ["11:00 AM", "03:30 PM"] },
      ],
      currentPatients: 45,
      maxPatients: 60,
    },
    {
      id: 2,
      name: "Dr. Michael Brown",
      specialization: "Pulmonology",
      experience: "12 years",
      rating: 4.8,
      location: "Midtown Clinic",
      availability: [
        { date: "2024-01-22", slots: ["09:30 AM", "11:00 AM", "01:00 PM"] },
        { date: "2024-01-23", slots: ["10:00 AM", "02:30 PM"] },
      ],
      currentPatients: 38,
      maxPatients: 50,
    },
    {
      id: 3,
      name: "Dr. Jennifer Lee",
      specialization: "Cardiology",
      experience: "18 years",
      rating: 4.9,
      location: "Downtown Medical Center",
      availability: [
        { date: "2024-01-19", slots: ["08:00 AM", "09:30 AM"] },
        { date: "2024-01-21", slots: ["10:00 AM", "11:30 AM", "03:00 PM"] },
      ],
      currentPatients: 52,
      maxPatients: 55,
    },
  ]

  const handleMatch = (patientId: number, doctorId: number, date: string, time: string) => {
    const patient = unmatchedPatients.find((p) => p.id === patientId)
    const doctor = availableDoctors.find((d) => d.id === doctorId)

    toast({
      title: "Match Successful!",
      description: `${patient?.name} has been matched with ${doctor?.name} on ${date} at ${time}`,
    })
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <AlertCircle className="w-4 h-4" />
      case "medium":
        return <Clock className="w-4 h-4" />
      case "low":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Matching</h1>
            <p className="text-gray-600">Match patients with available doctors</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Matches</p>
                  <p className="text-3xl font-bold text-orange-600">{unmatchedPatients.length}</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Doctors</p>
                  <p className="text-3xl font-bold text-green-600">{availableDoctors.length}</p>
                </div>
                <Stethoscope className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Matches Today</p>
                  <p className="text-3xl font-bold text-blue-600">12</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-purple-600">94%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Unmatched Patients */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Patients Awaiting Match</CardTitle>
                <CardDescription>Patients who need to be assigned to doctors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {unmatchedPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPatient === patient.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedPatient(patient.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{patient.name}</h3>
                      <Badge className={getUrgencyColor(patient.urgency)}>
                        {getUrgencyIcon(patient.urgency)}
                        <span className="ml-1 capitalize">{patient.urgency}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Age:</strong> {patient.age}, {patient.gender}
                      </p>
                      <p>
                        <strong>Condition:</strong> {patient.condition}
                      </p>
                      <p>
                        <strong>Specialty:</strong> {patient.preferredSpecialty}
                      </p>
                      <p>
                        <strong>Location:</strong> {patient.location}
                      </p>
                      <p>
                        <strong>Requested Date:</strong> {patient.requestedDate}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Available Doctors */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Available Doctors</CardTitle>
                <CardDescription>
                  {selectedPatient
                    ? `Doctors available for ${unmatchedPatients.find((p) => p.id === selectedPatient)?.name}`
                    : "Select a patient to see matching doctors"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPatient ? (
                  availableDoctors
                    .filter((doctor) => {
                      const patient = unmatchedPatients.find((p) => p.id === selectedPatient)
                      return (
                        patient?.preferredSpecialty === "Any" || doctor.specialization === patient?.preferredSpecialty
                      )
                    })
                    .map((doctor) => (
                      <div key={doctor.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{doctor.name}</h3>
                            <p className="text-sm text-gray-600">{doctor.specialization}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{doctor.rating}</span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <MapPin className="w-4 h-4" />
                            <span>{doctor.location}</span>
                          </div>
                          <p>
                            <strong>Experience:</strong> {doctor.experience}
                          </p>
                          <p>
                            <strong>Current Load:</strong> {doctor.currentPatients}/{doctor.maxPatients} patients
                          </p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Available Slots:</p>
                          {doctor.availability.map((slot, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{slot.date}</span>
                              <div className="flex space-x-1">
                                {slot.slots.map((time, timeIndex) => (
                                  <Button
                                    key={timeIndex}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMatch(selectedPatient!, doctor.id, slot.date, time)}
                                    className="text-xs"
                                  >
                                    {time}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a patient from the left to see available doctors</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Matches */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
            <CardDescription>Recently completed patient-doctor matches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  patient: "Alice Brown",
                  doctor: "Dr. Sarah Wilson",
                  date: "2024-01-15",
                  time: "10:00 AM",
                  status: "completed",
                },
                {
                  patient: "Mike Johnson",
                  doctor: "Dr. Michael Brown",
                  date: "2024-01-14",
                  time: "02:30 PM",
                  status: "completed",
                },
                {
                  patient: "Lisa Davis",
                  doctor: "Dr. Jennifer Lee",
                  date: "2024-01-13",
                  time: "11:00 AM",
                  status: "completed",
                },
              ].map((match, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">
                        {match.patient} → {match.doctor}
                      </p>
                      <p className="text-sm text-gray-600">
                        {match.date} at {match.time}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
