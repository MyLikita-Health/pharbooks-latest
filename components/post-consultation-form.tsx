"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Trash2,
  FileText,
  Pill,
  Stethoscope,
  Save,
  Send,
  Calendar,
  CheckCircle,
  User,
  Loader2,
  Bell,
  AlertTriangle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"

interface Prescription {
  id: string
  drugName: string
  dosage: string
  frequency: string
  duration: string
  period: string
  instructions?: string
}

interface Investigation {
  id: string
  type: string
  name: string
  urgency: "routine" | "urgent" | "stat"
  instructions?: string
}

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  medicalHistory?: string
  allergies?: string
  currentMedications?: string
}

interface ExistingPrescription {
  id: string
  medicationName: string
  dosage: string
  frequency: string
  duration: string
  status: string
  prescribedDate: string
  instructions?: string
}

interface PostConsultationFormProps {
  appointmentId: string
  patientName: string
  patientId: string
  consultationDuration: number
  onSubmit: () => void
  onCancel: () => void
}

export default function PostConsultationForm({
  appointmentId,
  patientName,
  patientId,
  consultationDuration,
  onSubmit,
  onCancel,
}: PostConsultationFormProps) {
  const [consultationNotes, setConsultationNotes] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [urgency, setUrgency] = useState<"low" | "medium" | "high" | "urgent">("medium")
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [followUpRequired, setFollowUpRequired] = useState(false)
  const [followUpDays, setFollowUpDays] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Patient data from database
  const [patient, setPatient] = useState<Patient | null>(null)
  const [existingPrescriptions, setExistingPrescriptions] = useState<ExistingPrescription[]>([])

  // Notification settings
  const [notifyPatient, setNotifyPatient] = useState(true)
  const [notificationMethod, setNotificationMethod] = useState<"email" | "sms" | "both">("both")

  // Current prescription form state
  const [currentPrescription, setCurrentPrescription] = useState({
    drugName: "",
    dosage: "",
    frequency: "",
    duration: "",
    period: "days",
    instructions: "",
  })

  // Current investigation form state
  const [currentInvestigation, setCurrentInvestigation] = useState({
    type: "",
    name: "",
    urgency: "routine" as const,
    instructions: "",
  })

  const { toast } = useToast()

  // Load patient data and existing prescriptions from database
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setIsLoading(true)

        // Load patient details
        const patientResponse = await apiClient.get(`/users/${patientId}`)
        setPatient(patientResponse)

        // Load existing prescriptions
        const prescriptionsResponse = await apiClient.get(`/prescriptions?patientId=${patientId}&status=active`)
        setExistingPrescriptions(prescriptionsResponse.prescriptions || [])

        toast({
          title: "Patient Data Loaded",
          description: "Patient information and medical history loaded successfully.",
        })
      } catch (error) {
        console.error("Error loading patient data:", error)
        toast({
          title: "Loading Error",
          description: "Failed to load patient data. Some information may be unavailable.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (patientId) {
      loadPatientData()
    }
  }, [patientId, toast])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getUrgencyColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
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

  const addPrescriptionToList = () => {
    if (
      !currentPrescription.drugName ||
      !currentPrescription.dosage ||
      !currentPrescription.frequency ||
      !currentPrescription.duration
    ) {
      toast({
        title: "Incomplete Prescription",
        description: "Please fill in all required prescription fields.",
        variant: "destructive",
      })
      return
    }

    const newPrescription: Prescription = {
      id: Date.now().toString(),
      ...currentPrescription,
    }

    setPrescriptions((prev) => [...prev, newPrescription])
    setCurrentPrescription({
      drugName: "",
      dosage: "",
      frequency: "",
      duration: "",
      period: "days",
      instructions: "",
    })

    toast({
      title: "Prescription Added",
      description: `${currentPrescription.drugName} has been added to the prescription list.`,
    })
  }

  const removePrescription = (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id))
    toast({
      title: "Prescription Removed",
      description: "Prescription has been removed from the list.",
    })
  }

  const addInvestigationToList = () => {
    if (!currentInvestigation.type || !currentInvestigation.name) {
      toast({
        title: "Incomplete Investigation",
        description: "Please fill in investigation type and name.",
        variant: "destructive",
      })
      return
    }

    const newInvestigation: Investigation = {
      id: Date.now().toString(),
      ...currentInvestigation,
    }

    setInvestigations((prev) => [...prev, newInvestigation])
    setCurrentInvestigation({
      type: "",
      name: "",
      urgency: "routine",
      instructions: "",
    })

    toast({
      title: "Investigation Added",
      description: `${currentInvestigation.name} has been added to the investigation list.`,
    })
  }

  const removeInvestigation = (id: string) => {
    setInvestigations((prev) => prev.filter((i) => i.id !== id))
    toast({
      title: "Investigation Removed",
      description: "Investigation has been removed from the list.",
    })
  }

  const sendPatientNotifications = async (prescriptionId?: string, followUpDate?: string) => {
    if (!notifyPatient || !patient) return

    try {
      const notifications = []

      // Prescription notification
      if (prescriptionId && prescriptions.length > 0) {
        const prescriptionNotification = {
          userId: patientId,
          type: "prescription_ready",
          title: "New Prescription Available",
          message: `Dr. has prescribed ${prescriptions.length} medication(s) for you. Please review your prescription details and follow the instructions carefully.`,
          data: {
            prescriptionId,
            appointmentId,
            medicationCount: prescriptions.length,
            medications: prescriptions.map((p) => p.drugName).join(", "),
          },
          priority: "high",
          methods: notificationMethod === "both" ? ["email", "sms"] : [notificationMethod],
        }
        notifications.push(prescriptionNotification)
      }

      // Investigation notification
      if (investigations.length > 0) {
        const investigationNotification = {
          userId: patientId,
          type: "investigation_required",
          title: "Medical Tests Required",
          message: `Your doctor has requested ${investigations.length} medical test(s). Please schedule these investigations as soon as possible.`,
          data: {
            appointmentId,
            investigationCount: investigations.length,
            investigations: investigations.map((i) => i.name).join(", "),
            urgentTests: investigations.filter((i) => i.urgency === "urgent" || i.urgency === "stat").length,
          },
          priority: investigations.some((i) => i.urgency === "stat") ? "urgent" : "high",
          methods: notificationMethod === "both" ? ["email", "sms"] : [notificationMethod],
        }
        notifications.push(investigationNotification)
      }

      // Follow-up appointment notification
      if (followUpRequired && followUpDate) {
        const followUpNotification = {
          userId: patientId,
          type: "followup_required",
          title: "Follow-up Appointment Required",
          message: `Your doctor has recommended a follow-up appointment in ${followUpDays} days. Please schedule your appointment at your earliest convenience.`,
          data: {
            appointmentId,
            followUpDays: Number.parseInt(followUpDays),
            recommendedDate: followUpDate,
          },
          priority: "medium",
          methods: notificationMethod === "both" ? ["email", "sms"] : [notificationMethod],
        }
        notifications.push(followUpNotification)
      }

      // Consultation summary notification
      const summaryNotification = {
        userId: patientId,
        type: "consultation_completed",
        title: "Consultation Summary Available",
        message: `Your consultation has been completed. You can now view your consultation notes, prescriptions, and any recommended follow-up care in your patient portal.`,
        data: {
          appointmentId,
          consultationDate: new Date().toISOString(),
          hasPrescriptions: prescriptions.length > 0,
          hasInvestigations: investigations.length > 0,
          hasFollowUp: followUpRequired,
          urgency,
        },
        priority: urgency === "urgent" ? "urgent" : "medium",
        methods: notificationMethod === "both" ? ["email", "sms"] : [notificationMethod],
      }
      notifications.push(summaryNotification)

      // Send all notifications
      for (const notification of notifications) {
        await apiClient.post("/notifications", notification)
      }

      toast({
        title: "Notifications Sent",
        description: `Patient has been notified via ${notificationMethod === "both" ? "email and SMS" : notificationMethod}.`,
      })
    } catch (error) {
      console.error("Error sending notifications:", error)
      toast({
        title: "Notification Error",
        description: "Failed to send some notifications to the patient.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    if (!consultationNotes.trim()) {
      toast({
        title: "Missing Consultation Notes",
        description: "Please provide consultation notes before submitting.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Calculate follow-up date
      const followUpDate = followUpRequired
        ? new Date(Date.now() + Number.parseInt(followUpDays) * 24 * 60 * 60 * 1000).toISOString()
        : null

      // Complete consultation with post-consultation data
      await apiClient.patch(`/appointments/${appointmentId}/complete-consultation`, {
        consultationNotes,
        diagnosis,
        urgency,
        specialInstructions,
        additionalNotes,
        followUpRequired,
        followUpDays: followUpRequired ? Number.parseInt(followUpDays) : null,
        consultationDuration,
      })

      let prescriptionId = null

      // Create prescription if medications were prescribed
      if (prescriptions.length > 0) {
        const prescriptionData = {
          patientId,
          appointmentId,
          diagnosis,
          instructions: additionalNotes,
          medications: prescriptions.map((p) => ({
            name: p.drugName,
            dosage: p.dosage,
            frequency: p.frequency,
            duration: `${p.duration} ${p.period}`,
            quantity: Number.parseInt(p.duration) || 1,
            instructions: p.instructions,
          })),
        }

        const prescriptionResponse = await apiClient.post("/prescriptions", prescriptionData)
        prescriptionId = prescriptionResponse.prescription?.id
      }

      // Save investigations if any
      if (investigations.length > 0) {
        const investigationData = {
          appointmentId,
          patientId,
          investigations: investigations.map((i) => ({
            type: i.type,
            name: i.name,
            urgency: i.urgency,
            instructions: i.instructions,
          })),
        }

        await apiClient.post("/investigations", investigationData)
      }

      // Send patient notifications
      await sendPatientNotifications(prescriptionId, followUpDate)

      toast({
        title: "Consultation Completed",
        description: "All consultation details have been saved and patient has been notified.",
      })

      onSubmit()
    } catch (error) {
      console.error("Submit consultation error:", error)
      toast({
        title: "Submission Failed",
        description: "Failed to save consultation details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
        <Card className="bg-white p-8">
          <div className="flex items-center space-x-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Loading Patient Data</h3>
              <p className="text-gray-600">Please wait while we load the patient information...</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Post-Consultation Documentation</span>
              </CardTitle>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Call Completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Info from Database */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Patient Information</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{patient?.name || patientName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Age:</span>
                  <span className="ml-2 font-medium">
                    {patient?.dateOfBirth
                      ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Gender:</span>
                  <span className="ml-2 font-medium">{patient?.gender || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="ml-2 font-medium">{formatDuration(consultationDuration)}</span>
                </div>
              </div>

              {/* Medical History */}
              {patient?.medicalHistory && (
                <div className="mt-3 p-3 bg-blue-50 rounded border">
                  <span className="text-sm font-medium text-blue-800">Medical History:</span>
                  <p className="text-sm text-blue-700 mt-1">{patient.medicalHistory}</p>
                </div>
              )}

              {/* Allergies */}
              {patient?.allergies && (
                <div className="mt-3 p-3 bg-red-50 rounded border">
                  <span className="text-sm font-medium text-red-800">Allergies:</span>
                  <p className="text-sm text-red-700 mt-1">{patient.allergies}</p>
                </div>
              )}
            </div>

            {/* Current Medications from Database */}
            {existingPrescriptions.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg border">
                <h4 className="font-medium text-yellow-800 mb-3">Current Active Prescriptions</h4>
                <div className="space-y-2">
                  {existingPrescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{prescription.medicationName}</span>
                          <Badge variant="outline" className="text-xs">
                            {prescription.dosage}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {prescription.frequency}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Duration: {prescription.duration} | Prescribed:{" "}
                          {new Date(prescription.prescribedDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={prescription.status === "active" ? "default" : "secondary"} className="text-xs">
                        {prescription.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consultation Notes */}
            <div className="space-y-3">
              <Label htmlFor="consultation-notes" className="text-base font-semibold flex items-center space-x-2">
                <Stethoscope className="w-4 h-4" />
                <span>Consultation Notes *</span>
              </Label>
              <Textarea
                id="consultation-notes"
                placeholder="Enter detailed consultation notes, symptoms discussed, examination findings, treatment plan..."
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                className="min-h-[120px] resize-none"
                required
              />
            </div>

            {/* Diagnosis */}
            <div className="space-y-3">
              <Label htmlFor="diagnosis" className="text-base font-semibold">
                Primary Diagnosis
              </Label>
              <Input
                id="diagnosis"
                placeholder="Enter primary diagnosis or working diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>

            {/* Urgency */}
            <div className="space-y-3">
              <Label htmlFor="urgency" className="text-base font-semibold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Urgency Level</span>
              </Label>
              <Select
                value={urgency}
                onValueChange={(value: "low" | "medium" | "high" | "urgent") => setUrgency(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Routine follow-up</SelectItem>
                  <SelectItem value="medium">Medium - Standard care</SelectItem>
                  <SelectItem value="high">High - Requires attention</SelectItem>
                  <SelectItem value="urgent">Urgent - Immediate action needed</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Current urgency:</span>
                <Badge className={getUrgencyColor(urgency)}>{urgency.charAt(0).toUpperCase() + urgency.slice(1)}</Badge>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-3">
              <Label htmlFor="special-instructions" className="text-base font-semibold">
                Special Instructions
              </Label>
              <Textarea
                id="special-instructions"
                placeholder="Enter any special instructions for the patient (medication timing, activity restrictions, dietary advice, etc.)"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            <Separator />

            {/* Prescription Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Pill className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">New Prescription Details</h3>
              </div>

              {/* Current Prescription Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border">
                <div className="space-y-2">
                  <Label htmlFor="drug-name">Drug Name *</Label>
                  <Input
                    id="drug-name"
                    placeholder="e.g., Amoxicillin"
                    value={currentPrescription.drugName}
                    onChange={(e) => setCurrentPrescription((prev) => ({ ...prev, drugName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 500mg"
                    value={currentPrescription.dosage}
                    onChange={(e) => setCurrentPrescription((prev) => ({ ...prev, dosage: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select
                    value={currentPrescription.frequency}
                    onValueChange={(value) => setCurrentPrescription((prev) => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once-daily">Once daily</SelectItem>
                      <SelectItem value="twice-daily">Twice daily</SelectItem>
                      <SelectItem value="three-times-daily">Three times daily</SelectItem>
                      <SelectItem value="four-times-daily">Four times daily</SelectItem>
                      <SelectItem value="every-6-hours">Every 6 hours</SelectItem>
                      <SelectItem value="every-8-hours">Every 8 hours</SelectItem>
                      <SelectItem value="every-12-hours">Every 12 hours</SelectItem>
                      <SelectItem value="as-needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="duration"
                      placeholder="7"
                      type="number"
                      min="1"
                      value={currentPrescription.duration}
                      onChange={(e) => setCurrentPrescription((prev) => ({ ...prev, duration: e.target.value }))}
                      className="flex-1"
                    />
                    <Select
                      value={currentPrescription.period}
                      onValueChange={(value) => setCurrentPrescription((prev) => ({ ...prev, period: value }))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="instructions">Special Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="e.g., Take with food, avoid alcohol, take before meals..."
                    value={currentPrescription.instructions}
                    onChange={(e) => setCurrentPrescription((prev) => ({ ...prev, instructions: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="md:col-span-2">
                  <Button onClick={addPrescriptionToList} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Prescription List
                  </Button>
                </div>
              </div>

              {/* Prescription List */}
              {prescriptions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">New Prescribed Medications ({prescriptions.length})</h4>
                  <div className="space-y-2">
                    {prescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-lg">{prescription.drugName}</span>
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              {prescription.dosage}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>
                              <span className="font-medium">Frequency:</span> {prescription.frequency.replace("-", " ")}
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span> {prescription.duration}{" "}
                              {prescription.period}
                            </div>
                            {prescription.instructions && (
                              <div>
                                <span className="font-medium">Instructions:</span> {prescription.instructions}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => removePrescription(prescription.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Investigation Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Investigation Requirements</h3>
              </div>

              {/* Current Investigation Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg border">
                <div className="space-y-2">
                  <Label htmlFor="investigation-type">Investigation Type *</Label>
                  <Select
                    value={currentInvestigation.type}
                    onValueChange={(value) => setCurrentInvestigation((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Blood Test">Blood Test</SelectItem>
                      <SelectItem value="Urine Test">Urine Test</SelectItem>
                      <SelectItem value="X-Ray">X-Ray</SelectItem>
                      <SelectItem value="CT Scan">CT Scan</SelectItem>
                      <SelectItem value="MRI">MRI</SelectItem>
                      <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                      <SelectItem value="ECG">ECG</SelectItem>
                      <SelectItem value="Echo">Echocardiogram</SelectItem>
                      <SelectItem value="Biopsy">Biopsy</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investigation-name">Investigation Name *</Label>
                  <Input
                    id="investigation-name"
                    placeholder="e.g., Complete Blood Count, Chest X-Ray"
                    value={currentInvestigation.name}
                    onChange={(e) => setCurrentInvestigation((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select
                    value={currentInvestigation.urgency}
                    onValueChange={(value: "routine" | "urgent" | "stat") =>
                      setCurrentInvestigation((prev) => ({ ...prev, urgency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="stat">STAT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investigation-instructions">Special Instructions</Label>
                  <Input
                    id="investigation-instructions"
                    placeholder="e.g., Fasting required, specific preparation instructions..."
                    value={currentInvestigation.instructions}
                    onChange={(e) => setCurrentInvestigation((prev) => ({ ...prev, instructions: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <Button onClick={addInvestigationToList} className="w-full bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Investigation List
                  </Button>
                </div>
              </div>

              {/* Investigation List */}
              {investigations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Required Investigations ({investigations.length})</h4>
                  <div className="space-y-2">
                    {investigations.map((investigation) => (
                      <div
                        key={investigation.id}
                        className="flex items-center justify-between p-3 bg-white border border-purple-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-lg">{investigation.name}</span>
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
                              className="text-xs"
                            >
                              {investigation.urgency.toUpperCase()}
                            </Badge>
                          </div>
                          {investigation.instructions && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Instructions:</span> {investigation.instructions}
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => removeInvestigation(investigation.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Additional Notes & Instructions */}
            <div className="space-y-3">
              <Label htmlFor="additional-notes" className="text-base font-semibold">
                Additional Notes & Instructions
              </Label>
              <Textarea
                id="additional-notes"
                placeholder="Any additional instructions, follow-up care, patient education notes, lifestyle recommendations..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Follow-up */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="follow-up"
                  checked={followUpRequired}
                  onChange={(e) => setFollowUpRequired(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="follow-up" className="text-base font-semibold flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Follow-up Appointment Required</span>
                </Label>
              </div>
              {followUpRequired && (
                <div className="ml-6 flex items-center space-x-2">
                  <Label htmlFor="follow-up-days" className="text-sm">
                    Schedule follow-up in:
                  </Label>
                  <Input
                    id="follow-up-days"
                    placeholder="7"
                    type="number"
                    min="1"
                    max="365"
                    value={followUpDays}
                    onChange={(e) => setFollowUpDays(e.target.value)}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">days</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Patient Notification Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold">Patient Notifications</h3>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="notify-patient"
                      checked={notifyPatient}
                      onChange={(e) => setNotifyPatient(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="notify-patient" className="font-medium">
                      Send notifications to patient
                    </Label>
                  </div>

                  {notifyPatient && (
                    <div className="ml-6 space-y-3">
                      <div>
                        <Label htmlFor="notification-method" className="text-sm font-medium">
                          Notification Method
                        </Label>
                        <Select value={notificationMethod} onValueChange={setNotificationMethod}>
                          <SelectTrigger className="w-48 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email only</SelectItem>
                            <SelectItem value="sms">SMS only</SelectItem>
                            <SelectItem value="both">Email & SMS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium">Patient will be notified about:</p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                          <li>Consultation summary and notes</li>
                          {prescriptions.length > 0 && <li>New prescription details and instructions</li>}
                          {investigations.length > 0 && <li>Required medical tests and investigations</li>}
                          {followUpRequired && <li>Follow-up appointment recommendations</li>}
                        </ul>
                      </div>

                      {patient?.email && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Email:</span> {patient.email}
                        </div>
                      )}
                      {patient?.phone && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Phone:</span> {patient.phone}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6 border-t">
              <Button onClick={onCancel} variant="outline" className="flex-1 bg-transparent" disabled={isSubmitting}>
                Skip & End Call
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !consultationNotes.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Complete Consultation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
