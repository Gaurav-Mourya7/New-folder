"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addDoctor } from "@/lib/api/services"

interface AddDoctorModalProps {
  isOpen: boolean
  onClose: () => void
  onDoctorAdded: () => void
}

interface DoctorFormData {
  name: string
  email: string
  dob: string
  phone: string
  address: string
  licenseNo: string
  specialization: string
  department: string
  totalExp: string
  education: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  licenseNo?: string
  totalExp?: string
}

export function AddDoctorModal({ isOpen, onClose, onDoctorAdded }: AddDoctorModalProps) {
  const [formData, setFormData] = useState<DoctorFormData>({
    name: "",
    email: "",
    dob: "",
    phone: "",
    address: "",
    licenseNo: "",
    specialization: "",
    department: "",
    totalExp: "",
    education: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Doctor name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Doctor name must be at least 2 characters"
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = "Phone number must be at least 10 digits"
    }

    if (formData.licenseNo && formData.licenseNo.length < 5) {
      newErrors.licenseNo = "License number must be at least 5 characters"
    }

    if (formData.totalExp && parseFloat(formData.totalExp) < 0) {
      newErrors.totalExp = "Experience cannot be negative"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await addDoctor({
        name: formData.name,
        email: formData.email || undefined,
        dob: formData.dob || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        licenseNo: formData.licenseNo || undefined,
        specialization: formData.specialization || undefined,
        department: formData.department || undefined,
        totalExp: formData.totalExp ? Number(formData.totalExp) : undefined,
        education: formData.education || undefined,
      } as any)

      onDoctorAdded()
      onClose()

      // Reset form
      setFormData({
        name: "",
        email: "",
        dob: "",
        phone: "",
        address: "",
        licenseNo: "",
        specialization: "",
        department: "",
        totalExp: "",
        education: "",
      })
      setErrors({})
    } catch (error) {
      console.error("Failed to add doctor:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to add doctor"
      setApiError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Doctor</DialogTitle>
        </DialogHeader>

        {apiError && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  setErrors(prev => ({ ...prev, name: undefined }))
                }}
                placeholder="Enter full name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  setErrors(prev => ({ ...prev, email: undefined }))
                }}
                placeholder="email@example.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value })
                  setErrors(prev => ({ ...prev, phone: undefined }))
                }}
                placeholder="+91 9876543210"
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Clinic/Hospital address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licenseNo">License Number</Label>
              <Input
                id="licenseNo"
                value={formData.licenseNo}
                onChange={(e) => {
                  setFormData({ ...formData, licenseNo: e.target.value })
                  setErrors(prev => ({ ...prev, licenseNo: undefined }))
                }}
                placeholder="Medical license number"
                className={errors.licenseNo ? "border-destructive" : ""}
              />
              {errors.licenseNo && <p className="text-sm text-destructive">{errors.licenseNo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalExp">Total Experience (years)</Label>
              <Input
                id="totalExp"
                type="number"
                min="0"
                value={formData.totalExp}
                onChange={(e) => {
                  setFormData({ ...formData, totalExp: e.target.value })
                  setErrors(prev => ({ ...prev, totalExp: undefined }))
                }}
                placeholder="Years of experience"
                className={errors.totalExp ? "border-destructive" : ""}
              />
              {errors.totalExp && <p className="text-sm text-destructive">{errors.totalExp}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g., Cardiology, Neurology"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Emergency, Surgery"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Input
              id="education"
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              placeholder="e.g., MBBS, MD, MS"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Doctor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
