"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Calendar,
  Clock,
  ChevronRight,
  Stethoscope,
  Heart,
  Brain,
  Bone,
  Eye,
  Baby,
} from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getProfileIdFromToken, getToken } from "@/lib/api/auth"
import { getDoctorById, getDoctorDropDowns, patientExists, scheduleAppointment } from "@/lib/api/services"

type SpecialtyUI = {
  id: string
  name: string
  icon: any
}

type DoctorCardUI = {
  id: string
  name: string
  specialtyId: string
  specialty: string
  experience: string
  nextAvailable?: string
  image?: string
}

function getSpecialtyIcon(specialtyName: string) {
  const s = specialtyName.toLowerCase()
  if (s.includes("cardio")) return Heart
  if (s.includes("neuro")) return Brain
  if (s.includes("ortho")) return Bone
  if (s.includes("eye") || s.includes("ophthal")) return Eye
  if (s.includes("pedi")) return Baby
  return Stethoscope
}

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
]

type BookingStep = "specialty" | "doctor" | "datetime" | "confirm"

export default function BookAppointment() {
  const router = useRouter()
  const [step, setStep] = useState<BookingStep>("specialty")
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorCardUI | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)

  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true)
  const [specialties, setSpecialties] = useState<SpecialtyUI[]>([])
  const [doctors, setDoctors] = useState<DoctorCardUI[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadDoctors() {
      try {
        setPageError(null)
        const dropdowns = await getDoctorDropDowns()
        const fullDoctors = await Promise.all(
          dropdowns.map(async (d) => {
            const doc = await getDoctorById(d.id)
            return {
              id: String(doc.id ?? d.id),
              name: doc.name ?? d.name,
              specialtyId: (doc.specialization ?? doc.department ?? "General").toString(),
              specialty: (doc.specialization ?? doc.department ?? "General").toString(),
              experience:
                doc.totalExp != null && doc.totalExp !== undefined
                  ? `${doc.totalExp} years`
                  : "",
              nextAvailable: undefined,
              image: "",
            }
          }),
        )

        if (cancelled) return

        setDoctors(fullDoctors)

        const uniqueSpecialties = Array.from(
          new Map(
            fullDoctors
              .filter((d) => d.specialtyId)
              .map((d) => [d.specialtyId, d.specialty]),
          ).entries(),
        )

        const specialtyCards: SpecialtyUI[] = uniqueSpecialties.map(
          ([id, name]) => ({
            id,
            name,
            icon: getSpecialtyIcon(name),
          }),
        )

        setSpecialties(specialtyCards)
      } catch (err) {
        // If API fails, show empty lists rather than mock data.
        if (!cancelled) {
          setDoctors([])
          setSpecialties([])
          setPageError(err instanceof Error ? err.message : "Failed to load doctors.")
        }
      } finally {
        if (!cancelled) setIsLoadingDoctors(false)
      }
    }

    loadDoctors()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSpecialtySelect = (specialtyId: string) => {
    setSelectedSpecialty(specialtyId)
    setStep("doctor")
  }

  const handleDoctorSelect = (doctor: DoctorCardUI) => {
    setSelectedDoctor(doctor)
    setStep("datetime")
  }

  const handleDateTimeConfirm = () => {
    if (selectedDate && selectedTime) {
      setStep("confirm")
    }
  }

  const handleBookAppointment = async () => {
    setIsSubmitting(true)
    setPageError(null)

    try {
      if (!selectedDoctor?.id || !selectedDate || !selectedTime) {
        setIsSubmitting(false)
        return
      }

      const token = getToken()
      if (!token) throw new Error("Not logged in. Please login again.")
      const profileId = getProfileIdFromToken(token)
      if (!profileId)
        throw new Error("Missing profileId in JWT. Please logout and login again.")

      const exists = await patientExists(profileId)
      if (!exists) throw new Error("PATIENT_PROFILE_NOT_FOUND")

      const match = selectedTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
      if (!match) throw new Error("INVALID_TIME_SLOT")

      let hour = parseInt(match[1], 10)
      const minute = parseInt(match[2], 10)
      const meridiem = match[3].toUpperCase()

      if (meridiem === "PM" && hour !== 12) hour += 12
      if (meridiem === "AM" && hour === 12) hour = 0

      const hh = String(hour).padStart(2, "0")
      const mm = String(minute).padStart(2, "0")

      const appointmentTime = `${selectedDate}T${hh}:${mm}:00`
      const doctorId = Number(selectedDoctor.id)

      await scheduleAppointment({
        patientId: profileId,
        doctorId,
        appointmentTime,
        reason: reason || "",
        notes: "",
      })
      router.push("/patient/appointments")
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Booking appointment failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const goBack = () => {
    if (step === "doctor") setStep("specialty")
    else if (step === "datetime") setStep("doctor")
    else if (step === "confirm") setStep("datetime")
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {pageError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {pageError}
          </div>
        )}
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Book Appointment</h1>
          <p className="text-muted-foreground">
            Schedule a visit with one of our healthcare professionals
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          {["specialty", "doctor", "datetime", "confirm"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === s || ["specialty", "doctor", "datetime", "confirm"].indexOf(step) > i
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div
                  className={cn(
                    "w-8 h-0.5 mx-1",
                    ["specialty", "doctor", "datetime", "confirm"].indexOf(step) > i
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Specialty */}
        {step === "specialty" && (
          <Card>
            <CardHeader>
              <CardTitle>Select a Specialty</CardTitle>
              <CardDescription>
                Choose the type of care you need
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDoctors ? (
                <div className="py-10 text-center text-muted-foreground">Loading doctors...</div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {specialties.map((specialty) => (
                    <button
                      key={specialty.id}
                      onClick={() => handleSpecialtySelect(specialty.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border text-left transition-colors hover:bg-accent hover:border-primary/50",
                        selectedSpecialty === specialty.id && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <specialty.icon className="size-5 text-primary" />
                      </div>
                      <span className="font-medium">{specialty.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Doctor */}
        {step === "doctor" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Select a Doctor</CardTitle>
                  <CardDescription>
                    Choose from our available healthcare professionals
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={goBack}>
                  Back
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Search doctors..." className="pl-10" />
              </div>

              {/* Doctor List */}
              <div className="space-y-3">
                {doctors
                  .filter((doctor) => !selectedSpecialty || doctor.specialtyId === selectedSpecialty)
                  .map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => handleDoctorSelect(doctor)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-lg border text-left transition-colors hover:bg-accent hover:border-primary/50",
                      selectedDoctor?.id === doctor.id && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="size-14">
                        <AvatarImage src={doctor.image} alt={doctor.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {doctor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doctor.specialty} | {doctor.experience}
                        </p>
                        {doctor.nextAvailable ? (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Next: {doctor.nextAvailable}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Select Date & Time */}
        {step === "datetime" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Select Date & Time</CardTitle>
                  <CardDescription>
                    Booking with {selectedDoctor?.name}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={goBack}>
                  Back
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  Select Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="size-4" />
                    Available Time Slots
                  </Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "px-3 py-2 text-sm rounded-lg border transition-colors",
                          selectedTime === time
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:bg-accent hover:border-primary/50"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reason for visit */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit (Optional)</Label>
                <Input
                  id="reason"
                  placeholder="Brief description of your concern..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                disabled={!selectedDate || !selectedTime}
                onClick={handleDateTimeConfirm}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Confirm Booking */}
        {step === "confirm" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Confirm Your Appointment</CardTitle>
                  <CardDescription>
                    Review your booking details
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={goBack}>
                  Back
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Booking Summary */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="size-16">
                    <AvatarImage src={selectedDoctor?.image} alt={selectedDoctor?.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {selectedDoctor?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{selectedDoctor?.name}</p>
                    <p className="text-muted-foreground">{selectedDoctor?.specialty}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      <Calendar className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {new Date(selectedDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      <Clock className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">{selectedTime}</p>
                    </div>
                  </div>
                </div>

                {reason && (
                  <div>
                    <p className="text-sm text-muted-foreground">Reason for Visit</p>
                    <p className="font-medium">{reason}</p>
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleBookAppointment}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Booking..." : "Confirm Appointment"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
