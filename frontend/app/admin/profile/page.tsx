"use client"

import { useEffect, useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, Save, Camera, Shield } from "lucide-react"
import { decodeJwtToken, getToken } from "@/lib/api/auth"
import { getUser, updateUser, uploadFile } from "@/lib/api/services"
import type { UserDto } from "@/lib/api/types"

export default function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)
  const [photoMediaId, setPhotoMediaId] = useState<number | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string>("")
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    email: "",
    password: "",
    role: "",
    profileId: null as number | null,
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const token = getToken()
      if (!token) return

      const decoded = decodeJwtToken(token)
      if (!decoded) return

      // Extract user ID from JWT (sub field contains user ID)
      const sub = decoded.sub as string
      const id = parseInt(sub)
      if (isNaN(id)) return

      setUserId(id)
      
      // Load user data from backend
      const userData = await getUser(id)
      setFormData({
        id: userData.id || 0,
        name: userData.name || "",
        email: userData.email || "",
        password: "",
        role: userData.role || "",
        profileId: userData.profileId || null,
      })
    } catch (error) {
      console.error("Failed to load user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateUser(formData.id, formData as UserDto)
      setShowSuccess(true)
      setIsEditing(false)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to update profile:", error)
      alert("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)
    try {
      // Photo upload would go here
      // const result = await uploadFile(file)
      // setPhotoMediaId(result.id)
      // setPhotoUrl(URL.createObjectURL(file))
    } catch (error) {
      console.error("Failed to upload photo:", error)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const initials = formData.name
    ? formData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "AD"

  return (
    <AppLayout roleLabel="Admin" title="Admin Profile">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings
            </p>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            Profile updated successfully!
          </div>
        )}

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center gap-6">
              <Avatar className="size-24">
                <AvatarImage src={photoUrl} alt="Profile" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">
                  {formData.name}
                </h2>
                <p className="text-muted-foreground">{formData.email}</p>
                {isEditing && (
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="adminPhotoInput"
                      disabled={isUploadingPhoto}
                      onChange={handlePhotoUpload}
                    />
                    <label htmlFor="adminPhotoInput">
                      <Button type="button" variant="outline" size="sm" disabled={isUploadingPhoto} asChild>
                        <span className="flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          {isUploadingPhoto ? "Uploading..." : "Change Photo"}
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Leave blank to keep current password"
                />
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  <Save className="size-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="p-2 bg-muted rounded">
                <span className="font-medium">Administrator</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="p-2 bg-muted rounded">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Full access to all modules</li>
                  <li>Manage patients and doctors</li>
                  <li>Manage appointments and medical records</li>
                  <li>Manage pharmacy operations</li>
                  <li>View and manage all data</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
