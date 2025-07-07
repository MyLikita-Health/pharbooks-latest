"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Clock, User, ArrowLeft, CheckCircle, Stethoscope } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usersApi, appointmentsApi } from "@/lib/api"
import PageWrapper from "@/components/page-wrapper"
import PageHeader from "@/components/page-header"

interface Patient {
  id: string
  name: string
  email: string
  phone?: string
}

export default function CreateAppointmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [formData, setFormData] = useState({
    patientId: "",
    date: "",
    time: "",
    type: "consultation",
    notes: "",
    duration: "30",
  })

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoadingPatients(true)
      const response = await usersApi.getPatients()
      setPatients(response.users || [])
    } catch (error) {
      console.error("Error loading patients:", error)
      toast({
        title: "Error",
        description: "Failed to load patients. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingPatients(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.patientId || !formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const selectedPatient = patients.find((p) => p.id === formData.patientId)

      const appointmentData = {
        patientId: formData.patientId,
        patientName: selectedPatient?.name || "Unknown Patient",
        doctorName: "Current Doctor", // This would come from auth context
        date: formData.date,
        time: formData.time,
        type: formData.type,
        notes: formData.notes,
        duration: Number.parseInt(formData.duration),
      }

      await appointmentsApi.bookAppointment(appointmentData)

      toast({
        title: "Success",
        description: "Appointment created successfully!",
        variant: "default",
      })

      // Reset form
      setFormData({
        patientId: "",
        date: "",
        time: "",
        type: "consultation",
        notes: "",
        duration: "30",
      })

      // Navigate back to appointments
      setTimeout(() => {
        router.push("/doctor/appointments")
      }, 1500)
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to create appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Generate time slots
  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
  ]

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0]

  return (
    <PageWrapper>
      <div className="space-y-6">
        <PageHeader title="Create Appointment" description="Schedule a new appointment with a patient" />

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                New Appointment
              </CardTitle>
              <CardDescription>Create a new appointment for one of your patients</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Selection */}
                <div className="space-y-2">
                  <Label htmlFor="patient">Select Patient *</Label>
                  <Select
                    value={formData.patientId}
                    onValueChange={(value) => handleInputChange("patientId", value)}
                    disabled={loadingPatients}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Choose a patient"} />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{patient.name}</div>
                              <div className="text-sm text-gray-500">{patient.email}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label htmlFor="date">Appointment Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    min={today}
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                  />
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                  <Label htmlFor="time">Appointment Time *</Label>
                  <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {time}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Appointment Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Appointment Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">General Consultation</SelectItem>
                      <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                      <SelectItem value="routine-checkup">Routine Checkup</SelectItem>
                      <SelectItem value="specialist-referral">Specialist Referral</SelectItem>
                      <SelectItem value="procedure">Medical Procedure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Appointment Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any relevant notes about this appointment..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || loadingPatients} className="flex-1">
                    {loading ? (
                      "Creating..."
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Create Appointment
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  )
}
