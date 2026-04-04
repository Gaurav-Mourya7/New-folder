"use client"

import { useEffect, useMemo, useState } from "react"
import { User, Mail, Phone, MapPin, Calendar, Shield, Save } from "lucide-react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { decodeJwtToken, getProfileIdFromToken, getToken } from "@/lib/api/auth"
import { getFile, getPatientById, patientExists, updatePatient, uploadFile } from "@/lib/api/services"
import type { PatientDto } from "@/lib/api/types"

export default function PatientProfile() {
  const [patientId, setPatientId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyContact: "",
    emergencyPhone: "",
    bloodType: "",
    allergies: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [photoMediaId, setPhotoMediaId] = useState<number | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string>("")
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const initials = useMemo(() => {
    const first = formData.firstName?.[0] ?? ""
    const last = formData.lastName?.[0] ?? ""
    return (first + last).toUpperCase() || "PT"
  }, [formData.firstName, formData.lastName])

  function mapBloodGroup(bg?: string | null): string {
    if (!bg) return formData.bloodType
    const match = bg.match(/^([A-Z]{1,2})_(POSITIVE|NEGATIVE)$/)
    if (!match) return formData.bloodType
    const group = match[1]
    const sign = match[2] === "POSITIVE" ? "+" : "-"
    return `${group}${sign}`
  }

  function toBloodGroupEnum(value: string): string | null {
    const v = value.trim().toUpperCase()
    if (!v) return null
    const sign = v.endsWith("+") ? "POSITIVE" : v.endsWith("-") ? "NEGATIVE" : ""
    const group = v.replace(/[+-]/g, "")
    if (!sign || !group) return null
    return `${group}_${sign}`
  }

  useEffect(() => {
    let cancelled = false

    async function loadPatient() {
      const token = getToken()
      const profileId = getProfileIdFromToken(token)
      if (!token) return
      if (!profileId) return

      try {
        const exists = await patientExists(profileId)
        if (!exists || cancelled) return

        const patient = await getPatientById(profileId)
        if (cancelled) return

        setPatientId(profileId)
        setPhotoMediaId(patient.photoMediaId ?? null)

        const fullName = patient.name ?? ""
        const parts = fullName.trim().split(/\s+/).filter(Boolean)
        const firstName = parts[0] ?? ""
        const lastName = parts.slice(1).join(" ")

        setFormData({
          firstName,
          lastName,
          email: patient.email ?? "",
          phone: patient.phone ?? "",
          dateOfBirth: patient.dob ?? "",
          gender: patient.gender ?? "",
          address: patient.address ?? "",
          city: patient.city ?? "",
          state: patient.state ?? "",
          zipCode: patient.zipCode ?? "",
          emergencyContact: patient.emergencyContact ?? "",
          emergencyPhone: patient.emergencyPhone ?? "",
          bloodType: mapBloodGroup(patient.bloodGroup),
          allergies: patient.allergies ?? "",
        })
      } catch {
        // Keep blank state on failure
      }
    }

    loadPatient()
    return () => {
      cancelled = true
    }
    // Intentionally omit formData from deps (we just use it for fallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadPhoto() {
      if (!photoMediaId) {
        setPhotoUrl("")
        return
      }
      try {
        const blob = await getFile(photoMediaId)
        if (cancelled) return
        const url = URL.createObjectURL(blob)
        setPhotoUrl(url)
      } catch {
        if (!cancelled) setPhotoUrl("")
      }
    }

    loadPhoto()
    return () => {
      cancelled = true
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoMediaId])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      if (!patientId) return

      const payload: PatientDto = {
        id: patientId,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        dob: formData.dateOfBirth || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zipCode: formData.zipCode || null,
        gender: formData.gender || null,
        emergencyContact: formData.emergencyContact || null,
        emergencyPhone: formData.emergencyPhone || null,
        allergies: formData.allergies || null,
        bloodGroup: toBloodGroupEnum(formData.bloodType),
        photoMediaId,
      }

      await updatePatient(payload)
    } catch {
      // keep UI state; surface errors later if needed
    } finally {
      setIsSaving(false)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and preferences
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Profile Photo Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="size-24">
                <AvatarImage src={photoUrl} alt="Profile" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-muted-foreground">{formData.email}</p>
                {isEditing && (
                  <>
                    <Input
                      id="patientPhotoInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingPhoto}
                      onChange={(e) => {
                        const inputEl = e.currentTarget
                        const file = inputEl.files?.[0] ?? null
                        if (!file || !patientId) return
                        ;(async () => {
                          setIsUploadingPhoto(true)
                          try {
                            const uploaded = await uploadFile(file)
                            const newId = uploaded.id != null ? Number(uploaded.id) : null
                            if (!newId) throw new Error("UPLOAD_MISSING_ID")

                            setPhotoMediaId(newId)
                            await updatePatient({ id: patientId, photoMediaId: newId } as any)
                          } finally {
                            setIsUploadingPhoto(false)
                            inputEl.value = ""
                          }
                        })()
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      disabled={isUploadingPhoto}
                      onClick={() => {
                        const el = document.getElementById("patientPhotoInput") as HTMLInputElement | null
                        el?.click()
                      }}
                    >
                      {isUploadingPhoto ? "Uploading..." : "Change Photo"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your basic personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5 text-primary" />
              Contact Information
            </CardTitle>
            <CardDescription>
              How we can reach you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              Medical Information
            </CardTitle>
            <CardDescription>
              Important health details for your care providers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select
                  value={formData.bloodType}
                  onValueChange={(value) => handleInputChange("bloodType", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="bloodType">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Known Allergies</Label>
                <Input
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange("allergies", e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., Penicillin, Peanuts"
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
