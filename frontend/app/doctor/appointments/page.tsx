"use client"

import { useEffect, useMemo, useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, FileText, Calendar, Filter, CheckCircle } from "lucide-react"
import Link from "next/link"
import { decodeJwtToken, getProfileIdFromToken, getToken } from "@/lib/api/auth"
import {
  completeAppointment,
  doctorExists,
  getAllAppointmentsByDoctor,
} from "@/lib/api/services"
import type { AppointmentDetails } from "@/lib/api/types"

type DoctorAppointmentUI = {
  id: string
  date: string
  time: string
  patient: string
  reason: string
  status: "UPCOMING" | "COMPLETED" | "CANCELLED" | string
}

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

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<DoctorAppointmentUI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [completeError, setCompleteError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesSearch = apt.patient.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || apt.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [appointments, searchTerm, statusFilter])

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (reloadKey === 0) setIsLoading(true)
      try {
        const token = getToken()
        if (!token) return
        const claims = decodeJwtToken(token)
        const profileId = getProfileIdFromToken(token)
        const candidate = profileId ?? (claims as any)?.id
        if (!candidate) return

        const exists = await doctorExists(candidate)
        if (!exists || cancelled) return

        const details: AppointmentDetails[] = await getAllAppointmentsByDoctor(candidate)
        if (cancelled) return

        const mapped: DoctorAppointmentUI[] = details.map((d) => {
          const uiStatus =
            d.status === "SCHEDULED"
              ? "UPCOMING"
              : d.status === "COMPLETED"
                ? "COMPLETED"
                : d.status === "CANCELLED"
                  ? "CANCELLED"
                  : String(d.status)

          return {
            id: String(d.id ?? ""),
            date: d.appointmentTime,
            time: d.appointmentTime ? formatTime(d.appointmentTime) : "",
            patient: d.patientName,
            reason: d.reason,
            status: uiStatus,
          }
        })

        if (!cancelled) setAppointments(mapped)
      } catch {
        if (!cancelled) setAppointments([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  async function handleMarkComplete(appointmentId: string) {
    setCompleteError(null)
    setCompletingId(appointmentId)
    try {
      await completeAppointment(Number(appointmentId))
      setReloadKey((k) => k + 1)
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Could not mark appointment complete."
      setCompleteError(msg)
    } finally {
      setCompletingId(null)
    }
  }

  return (
    <AppLayout roleLabel="Doctor" title="Appointments">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">Manage your patient appointments</p>
          {completeError && (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {completeError}
            </p>
          )}
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              All Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                Loading appointments...
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-3 font-medium text-muted-foreground">
                          Date
                        </th>
                        <th className="pb-3 font-medium text-muted-foreground">
                          Time
                        </th>
                        <th className="pb-3 font-medium text-muted-foreground">
                          Patient
                        </th>
                        <th className="pb-3 font-medium text-muted-foreground">
                          Reason
                        </th>
                        <th className="pb-3 font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="pb-3 font-medium text-muted-foreground">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((appointment) => (
                        <tr
                          key={appointment.id}
                          className="border-b border-border/50 last:border-0"
                        >
                          <td className="py-4 text-foreground">
                            {formatDate(appointment.date)}
                          </td>
                          <td className="py-4 text-foreground">
                            {appointment.time}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {appointment.patient
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-foreground">
                                {appointment.patient}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-muted-foreground">
                            {appointment.reason}
                          </td>
                          <td className="py-4">
                            {getStatusBadge(appointment.status)}
                          </td>
                          <td className="py-4">
                            <div className="flex flex-wrap items-center gap-1">
                              {appointment.status === "UPCOMING" && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                  disabled={completingId === appointment.id}
                                  onClick={() => handleMarkComplete(appointment.id)}
                                >
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  {completingId === appointment.id
                                    ? "Completing…"
                                    : "Mark complete"}
                                </Button>
                              )}
                              <Link href={`/doctor/report/${appointment.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary hover:text-primary"
                                  disabled={appointment.status === "CANCELLED"}
                                >
                                  <FileText className="mr-1 h-4 w-4" />
                                  Write Report
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-4 md:hidden">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-lg border border-border/50 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {appointment.patient
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">
                              {appointment.patient}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.reason}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-muted-foreground">
                          {formatDate(appointment.date)} at {appointment.time}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {appointment.status === "UPCOMING" && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-emerald-700 border-emerald-200"
                              disabled={completingId === appointment.id}
                              onClick={() => handleMarkComplete(appointment.id)}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              {completingId === appointment.id
                                ? "Completing…"
                                : "Mark complete"}
                            </Button>
                          )}
                          <Link href={`/doctor/report/${appointment.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary"
                              disabled={appointment.status === "CANCELLED"}
                            >
                              <FileText className="mr-1 h-4 w-4" />
                              Report
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredAppointments.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    No appointments found matching your criteria.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
