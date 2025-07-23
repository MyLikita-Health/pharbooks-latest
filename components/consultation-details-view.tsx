"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Stethoscope,
  AlertTriangle,
  Pill,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Download,
  PrinterIcon as Print,
} from "lucide-react"

interface ConsultationDetailsProps {
  appointment: {
    id: string
    appointmentDate: string
    duration: number
    consultationNotes?: string
    diagnosis?: string
    urgency?: "low" | "medium" | "high" | "urgent"
    specialInstructions?: string
    additionalNotes?: string
    followUpRequired?: boolean
    followUpDays?: number
    followUpDate?: string
    consultationCompletedAt?: string
    consultationDuration?: number
    Patient: {
      id: string
      name: string
      phone?: string
      email?: string
      dateOfBirth?: string
      gender?: string
    }
    Doctor: {
      id: string
      name: string
      specialization?: string
    }
  }
  prescriptions?: Array<{
    id: string
    medicationName: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
    status: string
  }>
  investigations?: Array<{
    id: string
    type: string
    name: string
    urgency: string
    instructions?: string
    status: string
  }>
  onClose?: () => void
}

export default function ConsultationDetailsView({
  appointment,
  prescriptions = [],
  investigations = [],
  onClose,
}: ConsultationDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A"
    return new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Create a downloadable consultation report
    const reportContent = `
CONSULTATION REPORT
==================

Patient Information:
- Name: ${appointment.Patient.name}
- Age: ${calculateAge(appointment.Patient.dateOfBirth)}
- Gender: ${appointment.Patient.gender || "N/A"}
- Phone: ${appointment.Patient.phone || "N/A"}
- Email: ${appointment.Patient.email || "N/A"}

Appointment Details:
- Date: ${formatDate(appointment.appointmentDate)}
- Time: ${formatTime(appointment.appointmentDate)}
- Duration: ${appointment.duration} minutes
- Doctor: ${appointment.Doctor.name}
- Specialization: ${appointment.Doctor.specialization || "N/A"}

Consultation Summary:
- Consultation Notes: ${appointment.consultationNotes || "N/A"}
- Diagnosis: ${appointment.diagnosis || "N/A"}
- Urgency: ${appointment.urgency || "N/A"}
- Special Instructions: ${appointment.specialInstructions || "N/A"}
- Additional Notes: ${appointment.additionalNotes || "N/A"}

Follow-up:
- Required: ${appointment.followUpRequired ? "Yes" : "No"}
${appointment.followUpRequired ? `- In ${appointment.followUpDays} days` : ""}
${appointment.followUpDate ? `- Scheduled for: ${formatDate(appointment.followUpDate)}` : ""}

Prescriptions (${prescriptions.length}):
${prescriptions.map((p) => `- ${p.medicationName} ${p.dosage} - ${p.frequency} for ${p.duration}`).join("\n")}

Investigations (${investigations.length}):
${investigations.map((i) => `- ${i.name} (${i.type}) - ${i.urgency}`).join("\n")}

Generated on: ${new Date().toLocaleString()}
    `

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `consultation-report-${appointment.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Consultation Details</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Print className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                {onClose && (
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient & Appointment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Patient Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{appointment.Patient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{calculateAge(appointment.Patient.dateOfBirth)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">{appointment.Patient.gender || "N/A"}</span>
                  </div>
                  {appointment.Patient.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        Phone:
                      </span>
                      <span className="font-medium">{appointment.Patient.phone}</span>
                    </div>
                  )}
                  {appointment.Patient.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        Email:
                      </span>
                      <span className="font-medium">{appointment.Patient.email}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Appointment Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{formatTime(appointment.appointmentDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{appointment.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-medium">{appointment.Doctor.name}</span>
                  </div>
                  {appointment.Doctor.specialization && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Specialization:</span>
                      <span className="font-medium">{appointment.Doctor.specialization}</span>
                    </div>
                  )}
                  {appointment.consultationDuration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Call Duration:</span>
                      <span className="font-medium">{formatDuration(appointment.consultationDuration)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Consultation Summary */}
            {appointment.consultationNotes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4" />
                    <span>Consultation Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Consultation Notes</h4>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{appointment.consultationNotes}</p>
                  </div>

                  {appointment.diagnosis && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Diagnosis</h4>
                      <p className="text-gray-900 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        {appointment.diagnosis}
                      </p>
                    </div>
                  )}

                  {appointment.urgency && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Urgency Level</h4>
                      <Badge className={`${getUrgencyColor(appointment.urgency)} flex items-center w-fit`}>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {appointment.urgency.charAt(0).toUpperCase() + appointment.urgency.slice(1)}
                      </Badge>
                    </div>
                  )}

                  {appointment.specialInstructions && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Special Instructions</h4>
                      <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        {appointment.specialInstructions}
                      </p>
                    </div>
                  )}

                  {appointment.additionalNotes && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Additional Notes & Instructions</h4>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{appointment.additionalNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Follow-up Information */}
            {appointment.followUpRequired && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Follow-up Required</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">
                        Follow-up appointment recommended in {appointment.followUpDays} days
                      </span>
                    </div>
                    {appointment.followUpDate && (
                      <p className="text-blue-700 text-sm">Recommended date: {formatDate(appointment.followUpDate)}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prescriptions */}
            {prescriptions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Pill className="w-4 h-4" />
                    <span>Prescriptions ({prescriptions.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prescriptions.map((prescription) => (
                      <div key={prescription.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">{prescription.medicationName}</h4>
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            {prescription.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Dosage:</span>
                            <span className="ml-2 font-medium">{prescription.dosage}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Frequency:</span>
                            <span className="ml-2 font-medium">{prescription.frequency}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <span className="ml-2 font-medium">{prescription.duration}</span>
                          </div>
                        </div>
                        {prescription.instructions && (
                          <div className="mt-2 p-2 bg-white rounded border">
                            <span className="text-sm font-medium text-gray-700">Instructions:</span>
                            <p className="text-sm text-gray-900 mt-1">{prescription.instructions}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Investigations */}
            {investigations.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Investigations ({investigations.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {investigations.map((investigation) => (
                      <div key={investigation.id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">{investigation.name}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-purple-600 border-purple-600">
                              {investigation.type}
                            </Badge>
                            <Badge
                              variant={
                                investigation.urgency === "stat"
                                  ? "destructive"
                                  : investigation.urgency === "urgent"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {investigation.urgency.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        {investigation.instructions && (
                          <div className="mt-2 p-2 bg-white rounded border">
                            <span className="text-sm font-medium text-gray-700">Instructions:</span>
                            <p className="text-sm text-gray-900 mt-1">{investigation.instructions}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completion Info */}
            {appointment.consultationCompletedAt && (
              <div className="text-center text-sm text-gray-500 pt-4 border-t">
                Consultation completed on {formatDate(appointment.consultationCompletedAt)} at{" "}
                {formatTime(appointment.consultationCompletedAt)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
