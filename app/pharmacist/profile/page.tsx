"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Edit, Save, Camera, User, Pill, Award, MapPin } from "lucide-react"

export default function PharmacistProfile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    licenseNumber: "",
    yearsOfExperience: "",
    specializations: "",
    education: "",
    certifications: "",
    languages: "",
    pharmacyName: "",
    pharmacyAddress: "",
    pharmacyPhone: "",
    operatingHours: "",
    deliveryRadius: "",
    emergencyContact: "",
    emergencyPhone: "",
  })

  const [services, setServices] = useState({
    prescriptionFulfillment: true,
    medicationCounseling: true,
    homeDelivery: true,
    vaccinations: false,
    healthScreenings: false,
    compounding: false,
  })

  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowInventory: true,
    deliveryUpdates: true,
    systemAlerts: true,
  })

  const handleSave = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pharmacist Profile</h1>
            <p className="text-gray-600">Manage your professional information and pharmacy settings</p>
          </div>
          <div className="flex gap-2">
            {isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            )}
            <Button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Profile Picture & Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                  <AvatarFallback className="bg-green-100 text-green-700 text-2xl">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" disabled={!isEditing}>
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Orders Processed</span>
                  <Badge variant="secondary">2,847</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Patients</span>
                  <Badge variant="secondary">1,156</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Deliveries Made</span>
                  <Badge variant="secondary">892</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <Badge className="bg-yellow-100 text-yellow-800">4.8/5</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Joined</span>
                  <span className="text-sm">Mar 2021</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pharmacy License</span>
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">DEA Registration</span>
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Background Check</span>
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Profile Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Emergency contact name"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Pill className="w-5 h-5 mr-2" />
                  Professional Information
                </CardTitle>
                <CardDescription>Your pharmacy credentials and specializations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Pharmacy License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specializations">Specializations</Label>
                  <Input
                    id="specializations"
                    value={formData.specializations}
                    onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Clinical Pharmacy, Geriatric Pharmacy, Oncology Pharmacy"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languages">Languages Spoken</Label>
                  <Input
                    id="languages"
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    disabled={!isEditing}
                    placeholder="English, Spanish, French"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Education & Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Education & Certifications
                </CardTitle>
                <CardDescription>Your educational background and certifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Textarea
                    id="education"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    disabled={!isEditing}
                    placeholder="PharmD from University of California San Francisco (2018), Residency in Clinical Pharmacy (2019)"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Board Certified Pharmacotherapy Specialist (BCPS), Immunization Certified, MTM Certified"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pharmacy Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Pharmacy Information
                </CardTitle>
                <CardDescription>Your pharmacy location and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                    <Input
                      id="pharmacyName"
                      value={formData.pharmacyName}
                      onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                      disabled={!isEditing}
                      placeholder="MediLinka Pharmacy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pharmacyPhone">Pharmacy Phone</Label>
                    <Input
                      id="pharmacyPhone"
                      value={formData.pharmacyPhone}
                      onChange={(e) => setFormData({ ...formData, pharmacyPhone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pharmacyAddress">Pharmacy Address</Label>
                  <Textarea
                    id="pharmacyAddress"
                    value={formData.pharmacyAddress}
                    onChange={(e) => setFormData({ ...formData, pharmacyAddress: e.target.value })}
                    disabled={!isEditing}
                    placeholder="123 Pharmacy St, Suite 100, City, State 12345"
                    rows={3}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="operatingHours">Operating Hours</Label>
                    <Input
                      id="operatingHours"
                      value={formData.operatingHours}
                      onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Mon-Fri: 8:00 AM - 8:00 PM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryRadius">Delivery Radius (miles)</Label>
                    <Input
                      id="deliveryRadius"
                      type="number"
                      value={formData.deliveryRadius}
                      onChange={(e) => setFormData({ ...formData, deliveryRadius: e.target.value })}
                      disabled={!isEditing}
                      placeholder="15"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services Offered */}
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
                <CardDescription>Select the services your pharmacy provides</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(services).map(([service, isOffered]) => (
                    <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="capitalize font-medium">
                        {service.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </span>
                      <Switch
                        checked={isOffered}
                        onCheckedChange={(checked) => setServices({ ...services, [service]: checked })}
                        disabled={!isEditing}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you'd like to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">New Orders</h4>
                      <p className="text-sm text-gray-600">Get notified when new prescription orders arrive</p>
                    </div>
                    <Switch
                      checked={notifications.newOrders}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, newOrders: checked })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Low Inventory Alerts</h4>
                      <p className="text-sm text-gray-600">Get notified when medication stock is low</p>
                    </div>
                    <Switch
                      checked={notifications.lowInventory}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, lowInventory: checked })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Delivery Updates</h4>
                      <p className="text-sm text-gray-600">Get notified about delivery status changes</p>
                    </div>
                    <Switch
                      checked={notifications.deliveryUpdates}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, deliveryUpdates: checked })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">System Alerts</h4>
                      <p className="text-sm text-gray-600">Get notified about system updates and maintenance</p>
                    </div>
                    <Switch
                      checked={notifications.systemAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, systemAlerts: checked })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
