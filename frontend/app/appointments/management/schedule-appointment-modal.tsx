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
import { scheduleAppointment } from "@/lib/api/services"
import { getDoctorDropDowns, getAllPatients } from "@/lib/api/services"
import type { DoctorDropDown } from "@/lib/api/types"
import type { PatientDto } from "@/lib/api/types"

interface ScheduleAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onAppointmentScheduled: () => void
}

interface AppointmentFormData {
  patientId: string
  doctorId: string
  appointmentTime: string
  reason: string
  notes: string
}

interface FormErrors {
  patientId?: string
  doctorId?: string
  appointmentTime?: string
}

export function ScheduleAppointmentModal({ isOpen, onClose, onAppointmentScheduled }: ScheduleAppointmentModalProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: "",
    doctorId: "",
    appointmentTime: "",
    reason: "",
    notes: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState<PatientDto[]>([])
  const [doctors, setDoctors] = useState<DoctorDropDown[]>([])

  useEffect(() => {
    if (isOpen) {
      loadPatients()
      loadDoctors()
    }
  }, [isOpen])

  const loadPatients = async () => {
    try {
      const data = await getAllPatients()
      setPatients(data ?? [])
    } catch (error) {
      console.error("Failed to load patients:", error)
    }
  }

  const loadDoctors = async () => {
    try {
      const data = await getDoctorDropDowns()
      setDoctors(data ?? [])
    } catch (error) {
      console.error("Failed to load doctors:", error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.patientId) {
      newErrors.patientId = "Please select a patient"
    }

    if (!formData.doctorId) {
      newErrors.doctorId = "Please select a doctor"
    }

    if (!formData.appointmentTime) {
      newErrors.appointmentTime = "Appointment date and time is required"
    } else {
      const appointmentDate = new Date(formData.appointmentTime)
      const now = new Date()
      if (appointmentDate <= now) {
        newErrors.appointmentTime = "Appointment time must be in the future"
      }
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
      await scheduleAppointment({
        patientId: Number(formData.patientId),
        doctorId: Number(formData.doctorId),
        appointmentTime: formData.appointmentTime,
        reason: formData.reason || undefined,
        notes: formData.notes || undefined,
      } as any)

      onAppointmentScheduled()
      onClose()

      // Reset form
      setFormData({
        patientId: "",
        doctorId: "",
        appointmentTime: "",
        reason: "",
        notes: "",
      })
      setErrors({})
    } catch (error) {
      console.error("Failed to schedule appointment:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to schedule appointment"
      setApiError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
        </DialogHeader>

        {apiError && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient *</Label>
              <Select value={formData.patientId} onValueChange={(value) => {
                setFormData(prev => ({ ...prev, patientId: value }))
                setErrors(prev => ({ ...prev, patientId: undefined }))
              }}>
                <SelectTrigger className={errors.patientId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={String(patient.id)}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.patientId && <p className="text-sm text-destructive">{errors.patientId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctorId">Doctor *</Label>
              <Select value={formData.doctorId} onValueChange={(value) => {
                setFormData(prev => ({ ...prev, doctorId: value }))
                setErrors(prev => ({ ...prev, doctorId: undefined }))
              }}>
                <SelectTrigger className={errors.doctorId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={String(doctor.id)}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.doctorId && <p className="text-sm text-destructive">{errors.doctorId}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentTime">Appointment Date & Time *</Label>
            <Input
              id="appointmentTime"
              type="datetime-local"
              value={formData.appointmentTime}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))
                setErrors(prev => ({ ...prev, appointmentTime: undefined }))
              }}
              className={errors.appointmentTime ? "border-destructive" : ""}
            />
            {errors.appointmentTime && <p className="text-sm text-destructive">{errors.appointmentTime}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g., Regular checkup, Fever, Headache"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
