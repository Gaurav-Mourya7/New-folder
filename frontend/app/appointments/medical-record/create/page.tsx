"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Save,
  ArrowLeft,
  Plus,
  X,
  Upload,
  File,
} from "lucide-react"
import { createApRecord, getAppointmentDetails, uploadFile } from "@/lib/api/services"
import type { ApRecordDto } from "@/lib/api/types"

export default function CreateMedicalRecord() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.id as string

  const [isLoading, setIsLoading] = useState(false)
  const [appointment, setAppointment] = useState<any>(null)

  const [symptoms, setSymptoms] = useState<string[]>([])
  const [symptomInput, setSymptomInput] = useState("")

  const [tests, setTests] = useState<string[]>([])
  const [testInput, setTestInput] = useState("")

  const [documents, setDocuments] = useState<File[]>([])
  const [isUploadingDocs, setIsUploadingDocs] = useState(false)

  const [formData, setFormData] = useState({
    diagnosis: "",
    notes: "",
    referral: "",
    followUpDate: "",
  })
  const [errors, setErrors] = useState<{ diagnosis?: string }>({})
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    loadAppointment()
  }, [appointmentId])

  const loadAppointment = async () => {
    try {
      const data = await getAppointmentDetails(Number(appointmentId))
      setAppointment(data)
    } catch (error) {
      console.error("Failed to load appointment:", error)
    }
  }

  const addSymptom = () => {
    if (symptomInput.trim()) {
      setSymptoms([...symptoms, symptomInput.trim()])
      setSymptomInput("")
    }
  }

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index))
  }

  const addTest = () => {
    if (testInput.trim()) {
      setTests([...tests, testInput.trim()])
      setTestInput("")
    }
  }

  const removeTest = (index: number) => {
    setTests(tests.filter((_, i) => i !== index))
  }

  const validateForm = (): boolean => {
    const newErrors: { diagnosis?: string } = {}

    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = "Diagnosis is required"
    } else if (formData.diagnosis.trim().length < 2) {
      newErrors.diagnosis = "Diagnosis must be at least 2 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!appointment) {
      setApiError("Appointment not found")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setIsUploadingDocs(true)
    try {
      // Upload documents first if any
      const mediaFileIds: number[] = []
      if (documents.length > 0) {
        for (const doc of documents) {
          try {
            const uploadedFile = await uploadFile(doc)
            if (uploadedFile.id) {
              mediaFileIds.push(uploadedFile.id)
            }
          } catch (error) {
            console.error("Failed to upload document:", error)
          }
        }
      }

      await createApRecord({
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        appointmentId: Number(appointmentId),
        symptoms: symptoms.length > 0 ? symptoms : undefined,
        diagnosis: formData.diagnosis || undefined,
        tests: tests.length > 0 ? tests : undefined,
        notes: formData.notes || undefined,
        referral: formData.referral || undefined,
        followUpDate: formData.followUpDate || undefined,
        mediaFileIds: mediaFileIds.length > 0 ? mediaFileIds : undefined,
      } as ApRecordDto)

      router.push(`/doctor/appointments`)
    } catch (error) {
      console.error("Failed to create medical record:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create medical record"
      setApiError(errorMessage)
    } finally {
      setIsLoading(false)
      setIsUploadingDocs(false)
    }
  }

  return (
    <AppLayout roleLabel="Doctor" title="Create Medical Record">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Medical Record</h1>
            <p className="text-muted-foreground mt-1">
              {appointment ? `For: ${appointment.patientName}` : "Loading..."}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Medical Record Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {apiError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Symptoms */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Symptoms</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add symptom"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSymptom())}
                  />
                  <Button type="button" onClick={addSymptom} variant="outline">
                    <Plus className="size-4" />
                  </Button>
                </div>
                {symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {symptoms.map((symptom, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {symptom}
                        <button
                          type="button"
                          onClick={() => removeSymptom(index)}
                          className="hover:text-destructive"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Diagnosis */}
              <div className="space-y-2">
                <Label htmlFor="diagnosis" className="text-base font-medium">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Enter diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, diagnosis: e.target.value }))
                    setErrors({})
                  }}
                  rows={3}
                  className={errors.diagnosis ? "border-destructive" : ""}
                />
                {errors.diagnosis && <p className="text-sm text-destructive">{errors.diagnosis}</p>}
              </div>

              {/* Tests */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Tests Required</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add test"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTest())}
                  />
                  <Button type="button" onClick={addTest} variant="outline">
                    <Plus className="size-4" />
                  </Button>
                </div>
                {tests.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tests.map((test, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {test}
                        <button
                          type="button"
                          onClick={() => removeTest(index)}
                          className="hover:text-destructive"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base font-medium">Doctor's Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes and observations"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Referral */}
              <div className="space-y-2">
                <Label htmlFor="referral" className="text-base font-medium">Referral (if any)</Label>
                <Input
                  id="referral"
                  placeholder="Referred to specialist/department"
                  value={formData.referral}
                  onChange={(e) => setFormData({ ...formData, referral: e.target.value })}
                />
              </div>

              {/* Follow-up Date */}
              <div className="space-y-2">
                <Label htmlFor="followUpDate" className="text-base font-medium">Follow-up Date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                />
              </div>

              {/* Documents Upload */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Attach Documents</Label>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    setDocuments(files)
                  }}
                />
                {documents.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Selected files:</div>
                    <div className="space-y-1">
                      {documents.map((doc, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                          <File className="size-4" />
                          <span className="flex-1 truncate">{doc.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2">
                  <Save className="size-4" />
                  {isLoading ? "Saving..." : "Save Medical Record"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
