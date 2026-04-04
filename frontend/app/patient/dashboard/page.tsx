"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Calendar,
  Clock,
  CalendarPlus,
  Activity,
  FileText,
  ArrowRight,
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
import { decodeJwtToken, getProfileIdFromToken, getToken } from "@/lib/api/auth"
import {
  getAllAppointmentsByPatient,
  getApRecordByAppointmentId,
  getApRecordsByPatientId,
  patientExists,
} from "@/lib/api/services"
import type { AppointmentDetails } from "@/lib/api/types"

type UpcomingAppointmentUI = {
  id: string
  doctor: string
  specialty: string
  date: string
  time: string
  status: "confirmed" | "pending"
}

const loadingHealthMetrics = [
  { label: "Last Checkup", value: "Loading...", icon: Calendar },
  { label: "Upcoming", value: "Loading...", icon: Clock },
  { label: "Reports", value: "Loading...", icon: FileText },
]

export default function PatientDashboard() {
  const [welcomeName, setWelcomeName] = useState("John")
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointmentUI[]>([])
  const [healthMetrics, setHealthMetrics] = useState(loadingHealthMetrics)
  const [isLoading, setIsLoading] = useState(true)

  const formatDate = useMemo(
    () => (dateStr: string) =>
      new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [],
  )

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

    async function resolvePatientId(): Promise<number | null> {
      const token = getToken()
      if (!token) return null
      const claims = decodeJwtToken(token)
      const profileId = getProfileIdFromToken(token)
      const tokenId = (claims as any)?.id
      const candidate = profileId ?? tokenId
      if (!candidate) return null
      const exists = await patientExists(candidate)
      return exists ? candidate : null
    }

    async function load() {
        const token = getToken()
        if (token) {
          const claims = decodeJwtToken(token)
          const name = claims?.name?.toString()
          if (name) setWelcomeName(name.split(" ")[0] || name)
        }

      try {
        const patientId = await resolvePatientId()
        if (!patientId || cancelled) return

        const details = await getAllAppointmentsByPatient(patientId)
        if (cancelled) return

        const scheduled = details.filter((d: AppointmentDetails) => d.status === "SCHEDULED")
        const completed = details.filter((d: AppointmentDetails) => d.status === "COMPLETED")
        let reportsCount = 0
        try {
          const records = await getApRecordsByPatientId(patientId)
          if (!cancelled) reportsCount = records.length
        } catch {
          // Route missing or server error — fall back below.
        }
        if (cancelled) return

        // If patient-scoped query failed or returned nothing, count by appointment (same as detail page).
        if (reportsCount === 0) {
          const ids = details
            .filter((d) => d.id != null && d.status !== "CANCELLED")
            .map((d) => Number(d.id))
          const reportChecks = await Promise.allSettled(
            ids.map((id) => getApRecordByAppointmentId(id)),
          )
          reportsCount = reportChecks.filter((r) => r.status === "fulfilled").length
        }
        if (cancelled) return

        const upcomingUI: UpcomingAppointmentUI[] = scheduled.map((d) => ({
          id: String(d.id ?? ""),
          doctor: d.doctorName,
          specialty: "Appointment",
          date: d.appointmentTime ? formatDate(d.appointmentTime) : "",
          time: d.appointmentTime ? formatTime(d.appointmentTime) : "",
          status: "confirmed",
        }))

        const lastCheckup =
          completed.length > 0 && completed[0].appointmentTime
            ? formatDate(completed[0].appointmentTime)
            : "N/A"

        setUpcomingAppointments(upcomingUI)
        setHealthMetrics([
          { label: "Last Checkup", value: lastCheckup, icon: Calendar },
          { label: "Upcoming", value: `${scheduled.length} appointments`, icon: Clock },
          { label: "Reports", value: `${reportsCount} reports`, icon: FileText },
        ])
      } catch {
        // Keep loading values; user can retry via refresh for now.
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [formatDate, formatTime])

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {welcomeName}</h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your health journey
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-foreground/80">
                    Book Appointment
                  </p>
                  <p className="text-2xl font-bold mt-1">Schedule Now</p>
                </div>
                <CalendarPlus className="size-10 opacity-80" />
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4 w-full"
                asChild
              >
                <Link href="/patient/book-appointment">
                  Book Now
                  <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {healthMetrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <metric.icon className="size-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>
                  Your scheduled appointments for the coming days
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/patient/appointments">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="size-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Loading appointments...</p>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="size-12">
                        <AvatarImage src="" alt={appointment.doctor} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {appointment.doctor
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{appointment.doctor}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-sm font-medium">{appointment.date}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.time}
                        </p>
                      </div>
                      <Badge
                        variant={
                          appointment.status === "confirmed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="size-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming appointments</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/patient/book-appointment">Book your first appointment</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-6 text-sm text-muted-foreground">
              No recent activity to show yet.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
