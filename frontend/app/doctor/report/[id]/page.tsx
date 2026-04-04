"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, FileText, User, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import {
  createApRecord,
  getApRecordByAppointmentId,
  getApRecordDetailsByAppointmentId,
  getAppointmentDetailsWithName,
  getFile,
  uploadFile,
  updateApRecord,
} from "@/lib/api/services"
import type { AppointmentDetails, ApRecordDto } from "@/lib/api/types"

type AppointmentDisplayUI = {
  patient: string
  date: string
  time: string
  reason: string
  status: string
  patientId: number
  doctorId: number
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function mapStatus(status: string) {
  if (status === "SCHEDULED") return "UPCOMING"
  return status
}

export default function WriteReport() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.id as string

  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [appointment, setAppointment] = useState<AppointmentDisplayUI | null>(null)
  const [attachedMedia, setAttachedMedia] = useState<Array<{ id: number; name?: string }>>([])
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    diagnosis: "",
    treatmentPlan: "",
    prescription: "",
    notes: "",
    followUpDate: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const appointmentNum = Number(appointmentId)
        const details = await getAppointmentDetailsWithName(appointmentNum)
        if (cancelled) return

        setAppointment({
          patient: details.patientName,
          date: details.appointmentTime ? formatDate(details.appointmentTime) : "",
          time: details.appointmentTime ? formatTime(details.appointmentTime) : "",
          reason: details.reason ?? "",
          status: mapStatus(String(details.status ?? "")),
          patientId: Number(details.patientId ?? 0),
          doctorId: Number(details.doctorId ?? 0),
        })

        try {
          const record = await getApRecordDetailsByAppointmentId(appointmentNum)
          if (cancelled) return

          const tests = record.tests ?? []

          setFormData({
            diagnosis: record.diagnosis ?? "",
            treatmentPlan: tests.join(", "),
            prescription: record.prescription?.notes ?? "",
            notes: record.notes ?? "",
            followUpDate: record.followUpDate ?? "",
          })

          setAttachedMedia(
            (record.mediaFileIds ?? []).map((id) => ({
              id,
            })),
          )
        } catch {
          // No record yet: keep form empty
        }
      } catch {
        // Keep page in empty/loading state on failure
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [appointmentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appointment) return

    const appointmentNum = Number(appointmentId)
    const tests = formData.treatmentPlan
      ? formData.treatmentPlan
          .split(/[,\n]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : []

    try {
      const existing = await getApRecordByAppointmentId(appointmentNum)
      await updateApRecord({
        id: existing.id,
        diagnosis: formData.diagnosis,
        notes: formData.notes,
        followUpDate: formData.followUpDate || null,
        symptoms: [],
        tests,
        referral: formData.prescription || "",
        mediaFileIds: attachedMedia.map((m) => m.id),
      } as any)
    } catch {
      await createApRecord({
        appointmentId: appointmentNum,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        symptoms: [],
        diagnosis: formData.diagnosis,
        tests,
        notes: formData.notes,
        referral: formData.prescription || "",
        followUpDate: formData.followUpDate || null,
        prescription: null,
        mediaFileIds: attachedMedia.map((m) => m.id),
      } as any)
    }

    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      router.push("/doctor/appointments")
    }, 2000)
  }

  if (isLoading) {
    return (
      <AppLayout roleLabel="Doctor" title="Write Report">
        <div className="mx-auto max-w-3xl py-12 text-center text-muted-foreground">
          Loading appointment & report...
        </div>
      </AppLayout>
    )
  }

  if (!appointment) {
    return (
      <AppLayout roleLabel="Doctor" title="Write Report">
        <div className="mx-auto max-w-3xl py-12 text-center text-muted-foreground">
          Appointment not found.
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout roleLabel="Doctor" title="Write Report">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Back Button */}
        <Link href="/doctor/appointments">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </Button>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Write Medical Report</h1>
          <p className="text-muted-foreground">Document diagnosis and treatment plan</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="rounded-lg bg-emerald-50 p-4 text-emerald-700 border border-emerald-200">
            Report submitted successfully! Redirecting...
          </div>
        )}

        {/* Appointment Info Card */}
        <Card className="border-border/50 bg-muted/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {appointment.patient.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">{appointment.patient}</h3>
                  <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">
                    {appointment.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{appointment.reason}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {appointment.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {appointment.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    ID: {appointmentId}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Form */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Medical Report
            </CardTitle>
            <CardDescription>
              Complete the following fields to document the patient visit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Diagnosis */}
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis *</Label>
                <Textarea
                  id="diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  placeholder="Enter primary diagnosis and any secondary conditions..."
                  className="min-h-24 resize-none"
                  required
                />
              </div>

              {/* Treatment Plan */}
              <div className="space-y-2">
                <Label htmlFor="treatmentPlan">Treatment Plan *</Label>
                <Textarea
                  id="treatmentPlan"
                  name="treatmentPlan"
                  value={formData.treatmentPlan}
                  onChange={handleChange}
                  placeholder="Outline the recommended treatment approach..."
                  className="min-h-24 resize-none"
                  required
                />
              </div>

              {/* Prescription */}
              <div className="space-y-2">
                <Label htmlFor="prescription">Prescription / Medications</Label>
                <Textarea
                  id="prescription"
                  name="prescription"
                  value={formData.prescription}
                  onChange={handleChange}
                  placeholder="List medications, dosages, and instructions..."
                  className="min-h-24 resize-none"
                />
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional observations or recommendations..."
                  className="min-h-20 resize-none"
                />
              </div>

              {/* Follow-up Date */}
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Recommended Follow-up Date</Label>
                <Input
                  id="followUpDate"
                  name="followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={handleChange}
                  className="max-w-xs"
                />
              </div>

              {/* Attachments */}
              <div className="space-y-3">
                <Label htmlFor="attachments">Attachments (PDF/Image)</Label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <Input
                    id="attachments"
                    type="file"
                    accept="application/pdf,image/*"
                    disabled={isUploadingFile}
                    onChange={(e) => {
                      const inputEl = e.currentTarget
                      const file = e.target.files?.[0] ?? null
                      if (!file) return
                      ;(async () => {
                        setUploadError(null)
                        setIsUploadingFile(true)
                        try {
                          const uploaded = await uploadFile(file)
                          if (uploaded.id == null) throw new Error("UPLOAD_MISSING_ID")
                          setAttachedMedia((prev) => [
                            ...prev,
                            { id: Number(uploaded.id), name: uploaded.name ?? undefined },
                          ])
                        } catch {
                          setUploadError("File upload failed.")
                        } finally {
                          setIsUploadingFile(false)
                          // allow selecting the same file again
                          inputEl.value = ""
                        }
                      })()
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="opacity-60"
                    title="Upload using the file picker"
                  >
                    {isUploadingFile ? "Uploading..." : "Upload"}
                  </Button>
                </div>

                {uploadError && (
                  <div className="text-sm text-red-600">{uploadError}</div>
                )}

                {attachedMedia.length > 0 && (
                  <div className="space-y-2">
                    {attachedMedia.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {m.name ?? `File #${m.id}`}
                          </p>
                          <p className="text-xs text-muted-foreground">Media ID: {m.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                const blob = await getFile(m.id)
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement("a")
                                a.href = url
                                a.download = m.name ?? `media_${m.id}`
                                document.body.appendChild(a)
                                a.click()
                                document.body.removeChild(a)
                                URL.revokeObjectURL(url)
                              } catch {
                                setUploadError("Download failed.")
                                setTimeout(() => setUploadError(null), 3000)
                              }
                            }}
                          >
                            Download
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() =>
                              setAttachedMedia((prev) =>
                                prev.filter((x) => x.id !== m.id),
                              )
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  Submit Report
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/doctor/appointments")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
