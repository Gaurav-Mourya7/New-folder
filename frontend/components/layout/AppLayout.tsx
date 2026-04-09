"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useNotifications } from "@/contexts/NotificationContext"
import {
  Heart,
  LayoutDashboard,
  User,
  Calendar,
  CalendarPlus,
  LogOut,
  Menu,
  Bell,
  Pill,
  Package,
  DollarSign,
  Stethoscope,
  Users,
  FileText,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { clearAuth, decodeJwtToken, getToken, syncAuthSessionCookie } from "@/lib/api/auth"

type RoleLabel = "Patient" | "Doctor" | "Admin"

interface AppLayoutProps {
  children: React.ReactNode
  roleLabel?: RoleLabel
  title?: string
}

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

const navigationByRole: Record<RoleLabel, NavItem[]> = {
  Patient: [
    { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
    { name: "My Profile", href: "/patient/profile", icon: User },
    { name: "Book Appointment", href: "/patient/book-appointment", icon: CalendarPlus },
    { name: "My Appointments", href: "/patient/appointments", icon: Calendar },
    { name: "Medical Records", href: "/patient/medical-history", icon: FileText },
  ],
  Doctor: [
    { name: "Dashboard", href: "/doctor", icon: LayoutDashboard },
    { name: "My Patients", href: "/doctor/patients", icon: Users },
    { name: "Appointments", href: "/doctor/appointments", icon: Calendar },
    { name: "Profile", href: "/doctor/profile", icon: User },
  ],
  Admin: [
    { name: "Dashboard", href: "/pharmacy", icon: LayoutDashboard },
    { name: "Medicines", href: "/pharmacy/medicines", icon: Pill },
    { name: "Inventory", href: "/pharmacy/inventory", icon: Package },
    { name: "Sales", href: "/pharmacy/sales", icon: DollarSign },
    { name: "Patients", href: "/patient/management", icon: Users },
    { name: "Doctors", href: "/doctor/management", icon: Stethoscope },
    { name: "Appointments", href: "/appointments/management", icon: Calendar },
    { name: "Medical Records", href: "/appointments/medical-record/admin", icon: FileText },
  ],
}

const roleIcons: Record<RoleLabel, LucideIcon> = {
  Patient: User,
  Doctor: Stethoscope,
  Admin: Package,
}

function inferRoleLabelFromToken(token: string | null): RoleLabel {
  if (!token) return "Patient"
  const claims = decodeJwtToken(token)
  const raw = (claims as any)?.role?.toString()?.toUpperCase()
  if (raw === "DOCTOR") return "Doctor"
  if (raw === "ADMIN" || raw === "PHARMACY") return "Admin"
  return "Patient"
}

export default function AppLayout({ children, roleLabel, title }: AppLayoutProps) {
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [inferredRoleLabel, setInferredRoleLabel] = useState<RoleLabel>("Patient")
  const effectiveRoleLabel = roleLabel ?? inferredRoleLabel
  const navigation = navigationByRole[effectiveRoleLabel]
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const [displayName, setDisplayName] = useState<string>("")
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)

  const homeHref = useMemo(() => {
    if (effectiveRoleLabel === "Doctor") return "/doctor"
    if (effectiveRoleLabel === "Admin") return "/pharmacy"
    return "/patient/dashboard"
  }, [effectiveRoleLabel])

  const profileHref = useMemo(() => {
    if (effectiveRoleLabel === "Doctor") return "/doctor/profile"
    if (effectiveRoleLabel === "Admin") return "/admin/profile"
    return "/patient/profile"
  }, [effectiveRoleLabel])

  const initials = useMemo(() => {
    const name = displayName.trim()
    if (!name) return effectiveRoleLabel === "Doctor" ? "DR" : effectiveRoleLabel === "Admin" ? "AD" : "PT"
    const parts = name.split(/\s+/).filter(Boolean)
    const first = parts[0]?.[0] ?? ""
    const second = parts[1]?.[0] ?? parts[0]?.[1] ?? ""
    return (first + second).toUpperCase()
  }, [displayName, effectiveRoleLabel])

  useEffect(() => {
    syncAuthSessionCookie()
    const token = getToken()
    if (!token) {
      setDisplayName("")
      setInferredRoleLabel("Patient")
      router.replace("/auth/login")
      return
    }
    const claims = decodeJwtToken(token)
    const name = claims?.name?.toString() ?? ""
    setDisplayName(name)
    setInferredRoleLabel(inferRoleLabelFromToken(token))
    setAuthReady(true)
  }, [router])

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Checking session…</p>
      </div>
    )
  }

  const NavLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="size-5" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="border-b px-4 py-4">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary rounded-lg">
                      <Heart className="size-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg">HealthTrack</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <NavLinks onLinkClick={() => setMobileMenuOpen(false)} />
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground"
                    asChild
                  >
                    <Link href="/auth/login" onClick={() => clearAuth()}>
                      <LogOut className="size-5" />
                      Sign out
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href={homeHref} className="flex items-center gap-2">
              <div className="p-1.5 bg-primary rounded-lg">
                <Heart className="size-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg hidden sm:inline">HealthTrack</span>
            </Link>
          </div>

          {/* Right side - Notifications & User */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              title={unreadCount > 0 ? `${unreadCount} unread notifications` : "No notifications"}
              onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 size-2 bg-primary rounded-full" />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 size-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Notification Panel */}
            {showNotificationPanel && (
              <div className="absolute right-0 top-12 w-80 bg-background border rounded-lg shadow-lg z-50">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAllAsRead()}
                      disabled={unreadCount === 0}
                    >
                      Mark all read
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNotificationPanel(false)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b last:border-0 cursor-pointer hover:bg-muted/50 ${
                          !notification.read ? "bg-primary/5" : ""
                        }`}
                        onClick={() => {
                          markAsRead(notification.id)
                          // Handle notification click based on type
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`size-2 mt-2 rounded-full ${
                            notification.type === "appointment" ? "bg-blue-500" :
                            notification.type === "medical_record" ? "bg-green-500" :
                            notification.type === "sale" ? "bg-purple-500" :
                            "bg-gray-500"
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <Link
              href={profileHref}
              className="flex items-center gap-3 pl-2 border-l ml-2 hover:opacity-90"
            >
              <Avatar className="size-9">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium leading-tight">
                  {displayName ||
                    (effectiveRoleLabel === "Doctor"
                      ? "Doctor"
                      : effectiveRoleLabel === "Admin"
                        ? "Admin"
                        : "Patient")}
                </p>
                <p className="text-xs text-muted-foreground">{effectiveRoleLabel}</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 border-r bg-background">
          <div className="flex-1 flex flex-col gap-4 p-4 pt-6">
            <NavLinks />
          </div>
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground"
              asChild
            >
              <Link href="/auth/login" onClick={() => clearAuth()}>
                <LogOut className="size-5" />
                Sign out
              </Link>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
