"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, User, Search, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

interface Patient {
  id: string
  name: string
  email: string
  phone?: string
}

interface NewAppointmentFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function NewAppointmentForm({ onSuccess, onCancel }: NewAppointmentFormProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<string>("")
  const [formData, setFormData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    duration: "30",
    type: "video",
    symptoms: "",
    notes: "",
    fee: "75.00",
  })
  const [loading, setLoading] = useState(false)
  const [searchingPatients, setSearchingPatients] = useState(false)

  const { toast } = useToast()

  // Search for patients
  useEffect(() => {
    const searchPatients = async () => {
      if (searchTerm.length < 2) {
        setPatients([])
        return
      }

      try {
        setSearchingPatients(true)
        const response = await apiClient.get(`/users?role=patient&search=${encodeURIComponent(searchTerm)}&limit=10`)
        setPatients(response.users || [])
      } catch (error) {
        console.error("Failed to search patients:", error)
        toast({
          title: "Error",
          description: "Failed to search patients. Please try again.",
          variant: "destructive",
        })
      } finally {
        setSearchingPatients(false)
      }
    }

    const debounceTimer = setTimeout(searchPatients, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, toast])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient.",
        variant: "destructive",
      })
      return
    }

    if (!formData.appointmentDate || !formData.appointmentTime) {
      toast({
        title: "Error",
        description: "Please select appointment date and time.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Combine date and time
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`)

      const appointmentData = {
        patientId: selectedPatient,
        appointmentDate: appointmentDateTime.toISOString(),
        duration: Number.parseInt(formData.duration),
        type: formData.type,
        symptoms: formData.symptoms,
        notes: formData.notes,
        fee: Number.parseFloat(formData.fee),
      }

      await apiClient.post("/appointments/doctor-create", appointmentData)

      toast({
        title: "Success",
        description: "Appointment created successfully.",
      })

      onSuccess()
    } catch (error) {
      console.error("Failed to create appointment:", error)
      toast({
        title: "Error",
        description: "Failed to create appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0]

  // Get minimum time (current time if today is selected)
  const getMinTime = () => {
    if (formData.appointmentDate === today) {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = Math.ceil(now.getMinutes() / 15) * 15 // Round to next 15 minutes
      return `${hours}:${minutes.toString().padStart(2, "0")}`
    }
    return "08:00"
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Schedule New Appointment</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Search */}
          <div className="space-y-2">
            <Label htmlFor="patient-search">Search Patient</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="patient-search"
                placeholder="Search by patient name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchingPatients && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />}
            </div>

            {/* Patient Selection */}
            {patients.length > 0 && (
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                      selectedPatient === patient.id ? "bg-blue-50 border-blue-200" : ""
                    }`}
                    onClick={() => {
                      setSelectedPatient(patient.id)
                      setSearchTerm(patient.name)
                      setPatients([])
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-500">{patient.email}</p>
                        {patient.phone && <p className="text-sm text-gray-500">{patient.phone}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-date">Appointment Date</Label>
              <Input
                id="appointment-date"
                type="date"
                min={today}
                value={formData.appointmentDate}
                onChange={(e) => handleInputChange("appointmentDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment-time">Appointment Time</Label>
              <Input
                id="appointment-time"
                type="time"
                min={getMinTime()}
                step="900" // 15 minute intervals
                value={formData.appointmentTime}
                onChange={(e) => handleInputChange("appointmentTime", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Duration and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Appointment Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Consultation</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="initial">Initial Consultation</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fee */}
          <div className="space-y-2">
            <Label htmlFor="fee">Consultation Fee ($)</Label>
            <Input
              id="fee"
              type="number"
              min="0"
              step="0.01"
              value={formData.fee}
              onChange={(e) => handleInputChange("fee", e.target.value)}
              required
            />
          </div>

          {/* Symptoms */}
          <div className="space-y-2">
            <Label htmlFor="symptoms">Patient Symptoms (Optional)</Label>
            <Textarea
              id="symptoms"
              placeholder="Describe the patient's symptoms or reason for visit..."
              value={formData.symptoms}
              onChange={(e) => handleInputChange("symptoms", e.target.value)}
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes or instructions..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={loading || !selectedPatient}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Appointment
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
