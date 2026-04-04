"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { decodeJwtToken, getProfileIdFromToken, getToken } from "@/lib/api/auth"
import {
  cancelAppointment,
  getApRecordDetailsByAppointmentId,
  getAppointmentDetailsWithName,
  getFile,
} from "@/lib/api/services"

type ReportDetails = {
  diagnosis: string
  tests: string[]
  referral: string
  followUpDate: string
  notes: string
}

type AppointmentStatusUi = "upcoming" | "completed" | "cancelled"

type AppointmentUi = {
  id: string
  doctor: string
  specialty: string
  date: string
  time: string
  status: AppointmentStatusUi
  type: string
  location: string
  phone: string
  email: string
  notes: string
  instructions: string[]
}

const statusConfig = {
  upcoming: {
    color: "bg-primary/10 text-primary border-primary/20",
    icon: AlertCircle,
  },
  completed: {
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: CheckCircle,
  },
  cancelled: {
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: XCircle,
  },
}

export default function AppointmentDetail() {
  const params = useParams()
  const router = useRouter()
  const [isCancelling, setIsCancelling] = useState(false)

  const appointmentId = params.id as string
  const [appointment, setAppointment] = useState<AppointmentUi | undefined>(undefined)
  const [attachments, setAttachments] = useState<Array<{ id: number }>>([])
  const [report, setReport] = useState<ReportDetails | null>(null)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const formatTime = useMemo(
    () => (dateStr: string) =>
      new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    [],
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const token = getToken()
        const claims = token ? decodeJwtToken(token) : null
        const profileId = token ? getProfileIdFromToken(token) : null
        // Keep auth errors consistent (JWT-protected endpoints)
        if (!(profileId ?? (claims as any)?.id)) return

        const apptIdNum = Number(appointmentId)
        const details = await getAppointmentDetailsWithName(apptIdNum)
        if (cancelled) return

        const backendStatus = details.status
        const status =
          backendStatus === "SCHEDULED"
            ? "upcoming"
            : backendStatus === "COMPLETED"
              ? "completed"
              : backendStatus === "CANCELLED"
                ? "cancelled"
                : "upcoming"

        setAppointment({
          id: String(details.id),
          doctor: details.doctorName,
          specialty: "",
          date: details.appointmentTime,
          time: details.appointmentTime ? formatTime(details.appointmentTime) : "",
          status,
          type: details.reason ?? "",
          location: "",
          phone: details.patientPhone,
          email: details.patientEmail,
          notes: details.notes,
          instructions: [],
        })

        try {
          const record = await getApRecordDetailsByAppointmentId(apptIdNum)
          if (!cancelled) {
            setReport({
              diagnosis: record.diagnosis ?? "",
              tests: record.tests ?? [],
              referral: record.referral ?? "",
              followUpDate: record.followUpDate ?? "",
              notes: record.notes ?? "",
            })
            setAttachments(
              (record.mediaFileIds ?? []).map((id) => ({ id: Number(id) })),
            )
          }
        } catch {
          // no record/attachments; keep empty
          if (!cancelled) {
            setReport(null)
            setAttachments([])
          }
        }
      } catch {
        // If API fails, avoid showing mock/stub appointment details.
        setAppointment(undefined)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [appointmentId, formatTime])

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-4xl">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Calendar className="size-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Loading appointment...</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  // If appointment not found, show error state
  if (!appointment && !isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Button variant="ghost" asChild>
            <Link href="/patient/appointments">
              <ArrowLeft className="size-4 mr-2" />
              Back to Appointments
            </Link>
          </Button>
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <AlertCircle className="size-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Appointment not found</p>
                <p className="text-sm mt-1">
                  The appointment you&apos;re looking for doesn&apos;t exist.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  if (!appointment) {
    return null
  }

  const StatusIcon = statusConfig[appointment.status].icon

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleCancelAppointment = async () => {
    setIsCancelling(true)
    try {
      await cancelAppointment(Number(appointmentId))
      router.push("/patient/appointments")
    } catch (err) {
      console.error("Cancelling appointment failed:", err)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleReschedule = () => {
    // In a real app, this would navigate to reschedule flow
    router.push("/patient/book-appointment")
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" asChild>
          <Link href="/patient/appointments">
            <ArrowLeft className="size-4 mr-2" />
            Back to Appointments
          </Link>
        </Button>

        {/* Appointment Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarImage src="" alt={appointment.doctor} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {appointment.doctor
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold">{appointment.doctor}</h1>
                  <p className="text-muted-foreground">{appointment.specialty}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize mt-2",
                      statusConfig[appointment.status].color
                    )}
                  >
                    <StatusIcon className="size-3.5 mr-1" />
                    {appointment.status}
                  </Badge>
                </div>
              </div>
              {appointment.status === "upcoming" && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleReschedule}>
                    Reschedule
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Cancel</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel your appointment with{" "}
                          {appointment.doctor} on {formatDate(appointment.date)}?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancelAppointment}
                          className="bg-destructive text-white hover:bg-destructive/90"
                          disabled={isCancelling}
                        >
                          {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Date, Time & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(appointment.date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{appointment.time}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{appointment.location}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Visit Type</p>
                  <p className="font-medium">{appointment.type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Doctor Contact</CardTitle>
              <CardDescription>
                Contact information for your healthcare provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Phone className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a
                    href={`tel:${appointment.phone}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {appointment.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${appointment.email}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {appointment.email}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {appointment.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{appointment.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Doctor Report */}
        {report && (
          <Card>
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <FileText className="size-5 shrink-0 text-primary" />
                Doctor Report
              </CardTitle>
              <CardDescription className="text-sm leading-snug">
                Clinical notes and treatment plan for this appointment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-2">
              {report.diagnosis && (
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">Diagnosis</p>
                  <p className="text-sm font-normal leading-relaxed text-foreground/90">
                    {report.diagnosis}
                  </p>
                </div>
              )}

              {report.tests.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Treatment / Tests</p>
                  <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/90">
                    {report.tests.map((item, idx) => (
                      <li key={`${item}-${idx}`} className="font-medium">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.referral && (
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">Prescription / Referral</p>
                  <p className="text-sm font-normal leading-relaxed text-foreground/90">
                    {report.referral}
                  </p>
                </div>
              )}

              {report.followUpDate && (
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">Follow-up Date</p>
                  <p className="text-sm font-normal leading-relaxed text-foreground/90">
                    {formatDate(report.followUpDate)}
                  </p>
                </div>
              )}

              {report.notes && (
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">Doctor Notes</p>
                  <p className="text-sm font-normal leading-relaxed text-foreground/90">
                    {report.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pre-appointment Instructions */}
        {appointment.status === "upcoming" && appointment.instructions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="size-4 text-primary" />
                Pre-appointment Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {appointment.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="size-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-muted-foreground">{instruction}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Attachments
              </CardTitle>
              <CardDescription>
                Files uploaded by your doctor for this appointment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {attachmentError && (
                <div className="text-sm text-red-600">{attachmentError}</div>
              )}
              <ul className="space-y-2">
                {attachments.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border border-dashed border-border/70 px-3 py-2"
                  >
                    <span className="text-sm text-muted-foreground">
                      File #{m.id}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          setAttachmentError(null)
                          const blob = await getFile(m.id)
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = `attachment_${m.id}`
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          URL.revokeObjectURL(url)
                        } catch {
                          setAttachmentError("Failed to download attachment.")
                          setTimeout(() => setAttachmentError(null), 3000)
                        }
                      }}
                    >
                      Download
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
