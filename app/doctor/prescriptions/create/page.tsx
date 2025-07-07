"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import PageWrapper from "@/components/page-wrapper"

interface Patient {
  id: string
  name: string
  email: string
}

interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  instructions: string
}

export default function CreatePrescription() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [instructions, setInstructions] = useState("")
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", frequency: "", duration: "", quantity: 0, instructions: "" },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const appointmentId = searchParams.get("appointmentId")
  const patientId = searchParams.get("patientId")

  useEffect(() => {
    fetchPatients()
    if (patientId) {
      setSelectedPatient(patientId)
    }
  }, [patientId])

  const fetchPatients = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/users?role=patient", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch patients")
      }

      const data = await response.json()
      setPatients(data.users || [])
    } catch (error) {
      console.error("Error fetching patients:", error)
      toast({
        title: "Error",
        description: "Failed to load patients. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addMedication = () => {
    setMedications([
      ...medications,
      { name: "", dosage: "", frequency: "", duration: "", quantity: 0, instructions: "" },
    ])
  }

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const updateMedication = (index: number, field: keyof Medication, value: string | number) => {
    const updatedMedications = medications.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    setMedications(updatedMedications)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const prescriptionData = {
        patientId: selectedPatient,
        diagnosis,
        instructions,
        medications: medications.filter((med) => med.name.trim() !== ""),
        ...(appointmentId && { appointmentId }),
        status: "active",
      }

      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(prescriptionData),
      })

      if (!response.ok) {
        throw new Error("Failed to create prescription")
      }

      toast({
        title: "Prescription Created!",
        description: "The prescription has been successfully created and sent to the patient.",
      })

      router.push("/doctor/prescriptions")
    } catch (error) {
      console.error("Error creating prescription:", error)
      toast({
        title: "Creation Failed",
        description: "Failed to create prescription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedPatientInfo = patients.find((patient) => patient.id === selectedPatient)

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
          <Link href="/doctor/prescriptions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Prescriptions
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Prescription</h1>
            <p className="text-gray-600">Create a new prescription for your patient</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Prescription Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Patient Information</CardTitle>
                  <CardDescription>Select the patient for this prescription</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="patient">Select Patient *</Label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} - {patient.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Diagnosis and Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                  <CardDescription>Diagnosis and general instructions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Textarea
                      id="diagnosis"
                      placeholder="Enter the diagnosis..."
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">General Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Enter general instructions for the patient..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Medications */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Medications</CardTitle>
                      <CardDescription>Add medications to this prescription</CardDescription>
                    </div>
                    <Button type="button" onClick={addMedication} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Medication
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {medications.map((medication, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Medication {index + 1}</h4>
                        {medications.length > 1 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removeMedication(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Medication Name *</Label>
                          <Input
                            placeholder="e.g., Amoxicillin"
                            value={medication.name}
                            onChange={(e) => updateMedication(index, "name", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Dosage *</Label>
                          <Input
                            placeholder="e.g., 500mg"
                            value={medication.dosage}
                            onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Frequency *</Label>
                          <Select
                            value={medication.frequency}
                            onValueChange={(value) => updateMedication(index, "frequency", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="once_daily">Once daily</SelectItem>
                              <SelectItem value="twice_daily">Twice daily</SelectItem>
                              <SelectItem value="three_times_daily">Three times daily</SelectItem>
                              <SelectItem value="four_times_daily">Four times daily</SelectItem>
                              <SelectItem value="as_needed">As needed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Duration *</Label>
                          <Input
                            placeholder="e.g., 7 days"
                            value={medication.duration}
                            onChange={(e) => updateMedication(index, "duration", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 30"
                            value={medication.quantity}
                            onChange={(e) => updateMedication(index, "quantity", Number.parseInt(e.target.value) || 0)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Special Instructions</Label>
                          <Input
                            placeholder="e.g., Take with food"
                            value={medication.instructions}
                            onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Prescription...
                  </>
                ) : (
                  "Create Prescription"
                )}
              </Button>
            </form>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {/* Selected Patient Info */}
            {selectedPatientInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Patient</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{selectedPatientInfo.name}</h3>
                    <p className="text-sm text-gray-600">{selectedPatientInfo.email}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prescription Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Prescription Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient:</span>
                  <span className="font-medium">{selectedPatientInfo?.name || "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Medications:</span>
                  <span className="font-medium">{medications.filter((med) => med.name.trim() !== "").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">Draft</span>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Important Notes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Ensure all medication names are spelled correctly</p>
                <p>• Double-check dosages and frequencies</p>
                <p>• Include any relevant drug interactions</p>
                <p>• Patient will receive notification once created</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
