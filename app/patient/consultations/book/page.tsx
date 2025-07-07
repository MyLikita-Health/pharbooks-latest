"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Clock, User, Stethoscope, ArrowLeft, Video, Phone, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import PageWrapper from "@/components/page-wrapper"

interface Doctor {
  id: string
  name: string
  email: string
  specialization?: string
}

export default function BookConsultation() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [consultationType, setConsultationType] = useState("video")
  const [reason, setReason] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [duration, setDuration] = useState("30")
  const [urgency, setUrgency] = useState("routine")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const { toast } = useToast()

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ]

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/users?role=doctor", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch doctors")
      }

      const data = await response.json()
      setDoctors(data.users || [])
    } catch (error) {
      console.error("Error fetching doctors:", error)
      toast({
        title: "Error",
        description: "Failed to load doctors. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const consultationDateTime = new Date(`${selectedDate}T${selectedTime}:00`)

      const consultationData = {
        doctorId: selectedDoctor,
        appointmentDate: consultationDateTime.toISOString(),
        type: consultationType,
        symptoms: `${reason}\n\nSymptoms: ${symptoms}`,
        duration: Number.parseInt(duration),
        urgency,
        status: "scheduled",
      }

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(consultationData),
      })

      if (!response.ok) {
        throw new Error("Failed to book consultation")
      }

      toast({
        title: "Consultation Booked!",
        description: "Your consultation has been successfully scheduled. You'll receive a confirmation email shortly.",
      })

      router.push("/patient/consultations")
    } catch (error) {
      console.error("Error booking consultation:", error)
      toast({
        title: "Booking Failed",
        description: "Failed to book consultation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedDoctorInfo = doctors.find((doc) => doc.id === selectedDoctor)

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/patient/consultations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Consultations
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Book Consultation</h1>
            <p className="text-gray-600">Schedule a virtual consultation with our healthcare professionals</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Consultation Details</CardTitle>
                <CardDescription>Fill in the information below to book your consultation</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Doctor Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Select Doctor *</Label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex items-center space-x-2">
                              <Stethoscope className="w-4 h-4" />
                              <span>
                                {doctor.name} {doctor.specialization && `- ${doctor.specialization}`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Consultation Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Consultation Type *</Label>
                    <Select value={consultationType} onValueChange={setConsultationType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select consultation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">
                          <div className="flex items-center space-x-2">
                            <Video className="w-4 h-4" />
                            <span>Video Consultation</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="phone">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>Phone Consultation</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="date">Preferred Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  {/* Time Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="time">Preferred Time *</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>{time}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Urgency */}
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select value={urgency} onValueChange={setUrgency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reason for Consultation */}
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Consultation *</Label>
                    <Textarea
                      id="reason"
                      placeholder="Please describe the main reason for this consultation..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  {/* Symptoms */}
                  <div className="space-y-2">
                    <Label htmlFor="symptoms">Current Symptoms</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Please describe any symptoms you're experiencing..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Booking Consultation...
                      </>
                    ) : (
                      "Book Consultation"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Doctor Info & Summary */}
          <div className="space-y-6">
            {/* Selected Doctor Info */}
            {selectedDoctorInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Doctor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedDoctorInfo.name}</h3>
                      <p className="text-sm text-gray-600">{selectedDoctorInfo.specialization || "General Practice"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Consultation Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Consultation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium">{selectedDoctorInfo?.name || "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{consultationType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{selectedDate || "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedTime || "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Urgency:</span>
                  <span className="font-medium capitalize">{urgency}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultation Fee:</span>
                    <span className="font-semibold text-green-600">$75.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Important Notes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Join the consultation 5 minutes before scheduled time</p>
                <p>• Ensure stable internet connection for video calls</p>
                <p>• Have your medical history and medications ready</p>
                <p>• You can reschedule up to 2 hours before the consultation</p>
                <p>• Emergency consultations will be prioritized</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
