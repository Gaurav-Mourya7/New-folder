"use client"

import { useEffect, useMemo, useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, CheckCircle, FileText } from "lucide-react"
import Link from "next/link"
import { decodeJwtToken, getProfileIdFromToken, getToken } from "@/lib/api/auth"
import { doctorExists, getAllAppointmentsByDoctor } from "@/lib/api/services"
import type { AppointmentDetails } from "@/lib/api/types"

function getStatusBadge(status: string) {
  switch (status) {
    case "UPCOMING":
      return <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">Upcoming</Badge>
    case "COMPLETED":
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Completed</Badge>
    case "CANCELLED":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelled</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function DoctorDashboard() {
  const [welcomeName, setWelcomeName] = useState("Doctor")
  const [stats, setStats] = useState<
    { label: string; value: number; icon: any; color: string }[]
  >([])
  const [todaySchedule, setTodaySchedule] = useState<
    {
      id: string
      time: string
      patient: string
      reason: string
      status: string
      avatar: string | null
    }[]
  >([])
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
        if (!token) return

        const claims = decodeJwtToken(token)
        const profileId = getProfileIdFromToken(token)
        const tokenId = (claims as any)?.id
        const doctorId = profileId ?? tokenId
        if (!doctorId) return

        const exists = await doctorExists(doctorId)
        if (!exists || cancelled) return

        const name = claims?.name?.toString()
        if (name) setWelcomeName(name.split(" ")[0] || name)

        const details: AppointmentDetails[] = await getAllAppointmentsByDoctor(doctorId)
        if (cancelled) return

        const now = new Date()
        const todayYMD = now.toISOString().slice(0, 10)

        const todayAppointments = details.filter((d) => {
          if (!d.appointmentTime) return false
          const dStr = d.appointmentTime.toString().slice(0, 10)
          return dStr === todayYMD
        })

        const upcoming = details.filter((d) => d.status === "SCHEDULED")
        const completed = details.filter((d) => d.status === "COMPLETED")
        const totalPatients = new Set(details.map((d) => d.patientId)).size

        setStats([
          {
            label: "Today's Appointments",
            value: todayAppointments.length,
            icon: Calendar,
            color: "bg-primary/10 text-primary",
          },
          {
            label: "Upcoming",
            value: upcoming.length,
            icon: Clock,
            color: "bg-amber-100 text-amber-700",
          },
          {
            label: "Completed",
            value: completed.length,
            icon: CheckCircle,
            color: "bg-emerald-100 text-emerald-700",
          },
          {
            label: "Unique Patients",
            value: totalPatients,
            icon: Users,
            color: "bg-sky-100 text-sky-700",
          },
        ])

        const schedule = todayAppointments
          .slice()
          .sort((a, b) =>
            a.appointmentTime && b.appointmentTime
              ? a.appointmentTime.toString().localeCompare(b.appointmentTime.toString())
              : 0,
          )
          .map((d) => ({
            id: String(d.id ?? ""),
            time: d.appointmentTime ? formatTime(d.appointmentTime) : "",
            patient: d.patientName ?? "",
            reason: d.reason ?? "",
            status: d.status?.toString() ?? "UPCOMING",
            avatar: null as string | null,
          }))

        setTodaySchedule(schedule)
      } catch {
        // keep defaults on error
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [formatTime])

  return (
    <AppLayout roleLabel="Doctor" title="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, Dr. {welcomeName}</h1>
          <p className="text-muted-foreground">Here&apos;s your schedule for today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Schedule */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Today&apos;s Schedule</CardTitle>
            <Link href="/doctor/appointments">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading today&apos;s appointments...
              </div>
            ) : todaySchedule.length > 0 ? (
              <div className="space-y-4">
                {todaySchedule.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-primary">{appointment.time}</p>
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={appointment.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {appointment.patient
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{appointment.patient}</p>
                        <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(appointment.status)}
                      <Link href={`/doctor/report/${appointment.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary"
                        >
                          <FileText className="mr-1 h-4 w-4" />
                          Write Report
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No appointments scheduled for today.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
