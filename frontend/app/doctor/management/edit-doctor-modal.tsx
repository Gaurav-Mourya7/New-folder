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
import { getDoctorById, updateDoctor } from "@/lib/api/services"

interface EditDoctorModalProps {
  isOpen: boolean
  onClose: () => void
  onDoctorUpdated: () => void
  doctorId: number | null
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

export function EditDoctorModal({ isOpen, onClose, onDoctorUpdated, doctorId }: EditDoctorModalProps) {
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

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && doctorId) {
      loadDoctor()
    }
  }, [isOpen, doctorId])

  const loadDoctor = async () => {
    if (!doctorId) return
    
    try {
      const doctor = await getDoctorById(doctorId)
      setFormData({
        name: doctor.name ?? "",
        email: doctor.email ?? "",
        dob: doctor.dob ?? "",
        phone: doctor.phone ?? "",
        address: doctor.address ?? "",
        licenseNo: doctor.licenseNo ?? "",
        specialization: doctor.specialization ?? "",
        department: doctor.department ?? "",
        totalExp: doctor.totalExp ? String(doctor.totalExp) : "",
        education: doctor.education ?? "",
      })
    } catch (error) {
      console.error("Failed to load doctor:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert("Please enter doctor name")
      return
    }

    setIsLoading(true)
    try {
      await updateDoctor({
        id: doctorId,
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

      onDoctorUpdated()
      onClose()
    } catch (error) {
      console.error("Failed to update doctor:", error)
      alert("Failed to update doctor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Doctor</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. Full Name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="doctor@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
              />
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
                onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                placeholder="Medical license number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalExp">Total Experience (years)</Label>
              <Input
                id="totalExp"
                type="number"
                min="0"
                value={formData.totalExp}
                onChange={(e) => setFormData({ ...formData, totalExp: e.target.value })}
                placeholder="Years of experience"
              />
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
              {isLoading ? "Updating..." : "Update Doctor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
