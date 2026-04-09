"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Calendar, Clock, Search, Filter, ChevronRight, Plus } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { decodeJwtToken, getProfileIdFromToken, getToken } from "@/lib/api/auth"
import { getAllAppointmentsByPatient, patientExists } from "@/lib/api/services"
import type { AppointmentDetails } from "@/lib/api/types"

type AppointmentListItem = {
  id: string
  doctor: string
  specialty: string
  date: string
  time: string
  status: "upcoming" | "completed" | "cancelled"
  type: string
  location: string
}

const statusColors = {
  upcoming: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("upcoming")
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
      setIsLoading(true)
      const token = getToken()
      const claims = token ? decodeJwtToken(token) : null
      const profileId = token ? getProfileIdFromToken(token) : null
      const tokenId = (claims as any)?.id
      const candidate = profileId ?? tokenId
      if (!candidate) return

      try {
        const exists = await patientExists(candidate)
        if (!exists || cancelled) return

        const details: AppointmentDetails[] = await getAllAppointmentsByPatient(candidate)
        if (cancelled) return

        const mapped = details.map((d) => {
          const backendStatus = d.status
          const status: "upcoming" | "completed" | "cancelled" =
            backendStatus === "SCHEDULED"
              ? "upcoming"
              : backendStatus === "COMPLETED"
                ? "completed"
                : backendStatus === "CANCELLED"
                  ? "cancelled"
                  : "upcoming"

          return {
            id: String(d.id ?? ""),
            doctor: d.doctorName,
            specialty: "",
            date: d.appointmentTime ?? "",
            time: d.appointmentTime ? formatTime(d.appointmentTime) : "",
            status,
            type: d.reason ?? "",
            location: "",
          }
        })

        setAppointments(mapped)
      } catch {
        // Keep empty list on errors
      }
      finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [formatTime])

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "upcoming" && apt.status === "upcoming") ||
      (activeTab === "past" && (apt.status === "completed" || apt.status === "cancelled"))
    return matchesSearch && matchesStatus && matchesTab
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Appointments</h1>
            <p className="text-muted-foreground">
              View and manage all your appointments
            </p>
          </div>
          <Button asChild>
            <Link href="/patient/book-appointment">
              <Plus className="size-4 mr-2" />
              Book New
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by doctor or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="size-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming
              <Badge variant="secondary" className="ml-2">
                {appointments.filter((a) => a.status === "upcoming").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Calendar className="size-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Loading appointments...</p>
                </CardContent>
              </Card>
            ) : filteredAppointments.length > 0 ? (
              <div className="space-y-3">
                {filteredAppointments.map((appointment) => (
                  <Link
                    key={appointment.id}
                    href={`/patient/appointments/${appointment.id}`}
                  >
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
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
                                {appointment.specialty} | {appointment.type}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="size-3.5" />
                                  {formatDate(appointment.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="size-3.5" />
                                  {appointment.time}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize",
                                statusColors[appointment.status as keyof typeof statusColors]
                              )}
                            >
                              {appointment.status}
                            </Badge>
                            <ChevronRight className="size-5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Calendar className="size-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No appointments found</p>
                    <p className="text-sm mt-1">
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Book your first appointment to get started"}
                    </p>
                    {!searchQuery && statusFilter === "all" && (
                      <Button variant="link" className="mt-2" asChild>
                        <Link href="/patient/book-appointment">
                          Book an appointment
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
