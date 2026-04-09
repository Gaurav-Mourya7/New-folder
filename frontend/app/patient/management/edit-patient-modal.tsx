"use client"

import { useState, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getPatientById, updatePatient } from "@/lib/api/services"

interface EditPatientModalProps {
  isOpen: boolean
  onClose: () => void
  onPatientUpdated: () => void
  patientId: number | null
}

interface PatientFormData {
  name: string
  email: string
  dob: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  gender: string
  emergencyContact: string
  emergencyPhone: string
  aadhaarNo: string
  bloodGroup: string
  allergies: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  aadhaarNo?: string
}

export function EditPatientModal({ isOpen, onClose, onPatientUpdated, patientId }: EditPatientModalProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    email: "",
    dob: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    gender: "",
    emergencyContact: "",
    emergencyPhone: "",
    aadhaarNo: "",
    bloodGroup: "",
    allergies: "",
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
      newErrors.name = "Patient name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Patient name must be at least 2 characters"
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = "Phone number must be at least 10 digits"
    }

    if (formData.aadhaarNo && formData.aadhaarNo.length !== 12) {
      newErrors.aadhaarNo = "Aadhaar number must be 12 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    if (isOpen && patientId) {
      loadPatient()
    }
  }, [isOpen, patientId])

  const loadPatient = async () => {
    if (!patientId) return
    
    try {
      const patient = await getPatientById(patientId)
      setFormData({
        name: patient.name ?? "",
        email: patient.email ?? "",
        dob: patient.dob ?? "",
        phone: patient.phone ?? "",
        address: patient.address ?? "",
        city: patient.city ?? "",
        state: patient.state ?? "",
        zipCode: patient.zipCode ?? "",
        gender: patient.gender ?? "",
        emergencyContact: patient.emergencyContact ?? "",
        emergencyPhone: patient.emergencyPhone ?? "",
        aadhaarNo: patient.aadhaarNo ?? "",
        bloodGroup: patient.bloodGroup ?? "",
        allergies: patient.allergies ?? "",
      })
    } catch (error) {
      console.error("Failed to load patient:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await updatePatient({
        id: patientId,
        name: formData.name,
        email: formData.email || undefined,
        dob: formData.dob || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        gender: formData.gender || undefined,
        emergencyContact: formData.emergencyContact || undefined,
        emergencyPhone: formData.emergencyPhone || undefined,
        aadhaarNo: formData.aadhaarNo || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        allergies: formData.allergies || undefined,
      } as any)

      onPatientUpdated()
      onClose()
      setErrors({})
    } catch (error) {
      console.error("Failed to update patient:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update patient"
      setApiError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
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
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                placeholder="123456"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodGroup">Blood Group</Label>
            <Select value={formData.bloodGroup} onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
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
            <Label htmlFor="aadhaarNo">Aadhaar Number</Label>
            <Input
              id="aadhaarNo"
              value={formData.aadhaarNo}
              onChange={(e) => {
                setFormData({ ...formData, aadhaarNo: e.target.value })
                setErrors(prev => ({ ...prev, aadhaarNo: undefined }))
              }}
              placeholder="12-digit Aadhaar number"
              className={errors.aadhaarNo ? "border-destructive" : ""}
              maxLength={12}
            />
            {errors.aadhaarNo && <p className="text-sm text-destructive">{errors.aadhaarNo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Input
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="List any known allergies"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="Emergency contact name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                placeholder="Emergency contact phone"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
