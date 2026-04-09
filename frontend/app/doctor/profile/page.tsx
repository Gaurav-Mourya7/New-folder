"use client"

import { useEffect, useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Save, User, Camera } from "lucide-react"
import { decodeJwtToken, getProfileIdFromToken, getToken } from "@/lib/api/auth"
import { getDoctorById, getFile, updateDoctor, uploadFile } from "@/lib/api/services"

export default function DoctorProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [photoMediaId, setPhotoMediaId] = useState<number | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string>("")
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    specialty: "",
    department: "",
    phone: "",
    email: "",
    licenseNumber: "",
    yearsOfExperience: "",
    education: "",
    // fields that exist in backend but are not present in this UI
    dob: "",
    address: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const token = getToken()
        if (!token) {
          setSaveError("Not logged in. Please login again.")
          return
        }
        const profileId = getProfileIdFromToken(token)
        if (!profileId) {
          setSaveError(
            "Your account is missing profileId in JWT. Please logout and login again, or re-register."
          )
          return
        }

        const doctor = await getDoctorById(profileId)
        if (cancelled) return

        setDoctorId(profileId)
        setPhotoMediaId(doctor.photoMediaId ?? null)
        setFormData({
          id: String(doctor.id ?? profileId),
          name: doctor.name ?? "",
          specialty: doctor.specialization ?? "",
          department: doctor.department ?? "",
          phone: doctor.phone ?? "",
          email: doctor.email ?? "",
          licenseNumber: doctor.licenseNo ?? "",
          yearsOfExperience:
            doctor.totalExp != null && doctor.totalExp !== undefined
              ? String(doctor.totalExp)
              : "",
          education: (doctor as any).education ?? "",
          dob: doctor.dob ?? "",
          address: doctor.address ?? "",
        })
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Failed to load profile.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!doctorId) return
    setSaveError(null)
    const years = Number(formData.yearsOfExperience)

    const payload = {
      id: doctorId,
      name: formData.name,
      email: formData.email,
      dob: formData.dob || null,
      phone: formData.phone,
      address: formData.address || null,
      licenseNo: formData.licenseNumber,
      specialization: formData.specialty,
      department: formData.department,
      totalExp: Number.isFinite(years) ? years : null,
      photoMediaId,
      education: formData.education || null,
    }

    try {
      // Close edit mode immediately; reopen on failure.
      setIsEditing(false)
      setIsSaving(true)
      await updateDoctor(payload as any)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch {
      setIsEditing(true)
      setSaveError("Failed to save changes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout roleLabel="Doctor" title="My Profile">
        <div className="mx-auto max-w-3xl py-12 text-center text-muted-foreground">
          Loading profile...
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout roleLabel="Doctor" title="My Profile">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your professional information</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="rounded-lg bg-emerald-50 p-4 text-emerald-700 border border-emerald-200">
            Profile updated successfully!
          </div>
        )}
        {saveError && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
            {saveError}
          </div>
        )}

        {/* Profile Card */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Your medical profile and credentials</CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={photoUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg hover:bg-primary/90"
                      disabled={isUploadingPhoto}
                      onClick={() => {
                        const el = document.getElementById("doctorPhotoInput") as HTMLInputElement | null
                        el?.click()
                      }}
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{formData.name}</h3>
                  <p className="text-muted-foreground">{formData.specialty}</p>
                  <p className="text-sm text-muted-foreground">{formData.department}</p>
                </div>
              </div>

              <Input
                id="doctorPhotoInput"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={!isEditing || isUploadingPhoto}
                onChange={(e) => {
                  const inputEl = e.currentTarget
                  const file = inputEl.files?.[0] ?? null
                  if (!file || !doctorId) return
                  ;(async () => {
                    setIsUploadingPhoto(true)
                    try {
                      const uploaded = await uploadFile(file)
                      const newId = uploaded.id != null ? Number(uploaded.id) : null
                      if (!newId) throw new Error("UPLOAD_MISSING_ID")
                      setPhotoMediaId(newId)
                      await updateDoctor({ id: doctorId, photoMediaId: newId } as any)
                    } finally {
                      setIsUploadingPhoto(false)
                      inputEl.value = ""
                    }
                  })()
                }}
              />

              {/* Form Fields */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="disabled:opacity-70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="disabled:opacity-70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Clinic / Department</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="disabled:opacity-70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="disabled:opacity-70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="disabled:opacity-70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="disabled:opacity-70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="disabled:opacity-70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="disabled:opacity-70"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="gap-2" disabled={isSaving}>
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
