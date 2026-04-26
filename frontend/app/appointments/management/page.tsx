"use client"

import { useEffect, useMemo, useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  Search,
  Plus,
  Eye,
  XCircle,
  CheckCircle,
  Clock,
  User,
  Stethoscope,
} from "lucide-react"
import { scheduleAppointment, cancelAppointment, completeAppointment, getAllAppointments } from "@/lib/api/services"
import { ScheduleAppointmentModal } from "./schedule-appointment-modal"
import type { AppointmentDetails } from "@/lib/api/types" 

type AppointmentUI = {
  id: string
  patientId: string
  patientName: string
  patientPhone: string
  patientEmail: string
  doctorId: string
  doctorName: string
  appointmentTime: string
  status: string
  reason: string
}

export default function AppointmentManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [appointments, setAppointments] = useState<AppointmentUI[]>([])

  const loadAppointments = async () => {
    try {
      const data = await getAllAppointments()
      const mappedData: AppointmentUI[] = data.map((apt) => ({
        id: String(apt.id),
        patientId: String(apt.patientId),
        patientName: apt.patientName,
        patientPhone: apt.patientPhone,
        patientEmail: apt.patientEmail,
        doctorId: String(apt.doctorId),
        doctorName: apt.doctorName,
        appointmentTime: apt.appointmentTime,
        status: apt.status,
        reason: apt.reason || "",
      }))
      setAppointments(mappedData)
    } catch (error) {
      console.error("Failed to load appointments:", error)
      setAppointments([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return appointments
    const query = searchQuery.toLowerCase()
    return appointments.filter(
      (a) =>
        a.patientName.toLowerCase().includes(query) ||
        a.doctorName.toLowerCase().includes(query) ||
        a.reason.toLowerCase().includes(query) ||
        a.id.includes(query)
    )
  }, [appointments, searchQuery])

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return

    try {
      await cancelAppointment(Number(id))
      setSuccessMessage("Appointment cancelled successfully.")
      loadAppointments()
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Failed to cancel appointment:", error)
      alert("Failed to cancel appointment")
    }
  }

  const handleComplete = async (id: string) => {
    if (!confirm("Are you sure you want to mark this appointment as completed?")) return

    try {
      await completeAppointment(Number(id))
      setSuccessMessage("Appointment completed successfully.")
      loadAppointments()
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Failed to complete appointment:", error)
      alert("Failed to complete appointment")
    }
  }

  const handleAppointmentScheduled = () => {
    loadAppointments()
    setSuccessMessage("Appointment scheduled successfully.")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return "N/A"
    return new Date(dateTimeString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-primary/10 text-primary border-primary/20"
      case "COMPLETED":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "CANCELLED":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const totalAppointments = appointments.length
  const scheduledAppointments = appointments.filter((a) => a.status === "SCHEDULED").length
  const completedAppointments = appointments.filter((a) => a.status === "COMPLETED").length

  return (
    <AppLayout roleLabel="Admin" title="Appointment Management">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Appointment Management</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all appointments
            </p>
          </div>
          <Button onClick={() => setIsScheduleModalOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Schedule Appointment
          </Button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            {successMessage}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalAppointments}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
                <div className="size-4 rounded-full bg-gray-200" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Clock className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{scheduledAppointments}</p>
                    <p className="text-sm text-muted-foreground">Scheduled</p>
                  </div>
                </div>
                <div className="size-4 rounded-full bg-gray-200" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <CheckCircle className="size-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{completedAppointments}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
                <div className="size-4 rounded-full bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Label htmlFor="search" className="text-sm font-medium">Search Appointments</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by patient name, doctor name, reason, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              All Appointments ({filteredAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading appointments...</div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">ID</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Patient</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Doctor</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Date & Time</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Reason</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Status</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-4 font-mono text-sm text-blue-600 font-semibold">#{appointment.id}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <User className="size-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{appointment.patientName}</div>
                                <div className="text-xs text-muted-foreground">{appointment.patientPhone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Stethoscope className="size-4 text-muted-foreground" />
                              <div className="font-medium">{appointment.doctorName}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{formatDateTime(appointment.appointmentTime)}</td>
                          <td className="py-3 px-4 text-muted-foreground">{appointment.reason || "N/A"}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="size-8">
                                <Eye className="size-4" />
                              </Button>
                              {appointment.status === "SCHEDULED" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleComplete(appointment.id)}
                                    className="size-8 text-green-600"
                                  >
                                    <CheckCircle className="size-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleCancel(appointment.id)}
                                    className="size-8 text-red-600"
                                  >
                                    <XCircle className="size-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-lg">{appointment.patientName}</p>
                          <p className="text-sm text-blue-600 font-mono">#{appointment.id}</p>
                          <p className="text-xs text-muted-foreground">{appointment.patientPhone}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="size-8">
                            <Eye className="size-4" />
                          </Button>
                          {appointment.status === "SCHEDULED" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleComplete(appointment.id)}
                                className="size-8 text-green-600"
                              >
                                <CheckCircle className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCancel(appointment.id)}
                                className="size-8 text-red-600"
                              >
                                <XCircle className="size-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="size-4 text-muted-foreground" />
                          <span className="font-medium">{appointment.doctorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date & Time:</span>
                          <span className="font-medium">{formatDateTime(appointment.appointmentTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reason:</span>
                          <span className="font-medium">{appointment.reason || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant="outline" className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    </Card>
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

        {/* Schedule Appointment Modal */}
        <ScheduleAppointmentModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onAppointmentScheduled={handleAppointmentScheduled}
        />
      </div>
    </AppLayout>
  )
}
