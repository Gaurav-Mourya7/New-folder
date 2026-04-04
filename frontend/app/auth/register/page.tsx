"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { register } from "@/lib/api/services"

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  role?: string
}

type UserRole = "patient" | "doctor" | "admin"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole | "">("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (pwd: string): boolean => {
    // Must match backend regex:
    // 1 uppercase, 1 lowercase, 1 digit, 1 special char, min 8 chars
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/
    return re.test(pwd)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password.trim()) {
      newErrors.password = "Password is required"
    } else if (!validatePassword(password)) {
      newErrors.password =
        "Password must contain 1 uppercase, 1 lowercase, 1 digit, 1 special character and be at least 8 characters long. Example: Aa@12345"
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!role) {
      newErrors.role = "Please select a role"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setApiError(null)
    setErrors({})

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        name: fullName,
        email,
        password,
        role: role.toString().toUpperCase(),
      })
      router.push("/auth/login")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed"
      // If backend sent a field validation message, show it under field too.
      if (typeof msg === "string") {
        if (msg.toLowerCase().includes("password")) {
          setErrors((prev) => ({ ...prev, password: msg }))
          setApiError(null)
          return
        }
        if (msg.toLowerCase().includes("email")) {
          setErrors((prev) => ({ ...prev, email: msg }))
          setApiError(null)
          return
        }
        if (msg.toLowerCase().includes("name")) {
          setErrors((prev) => ({ ...prev, fullName: msg }))
          setApiError(null)
          return
        }
      }
      setApiError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center lg:text-left">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Create an account
          </h2>
          <p className="text-muted-foreground">
            Get started with your health journey today
          </p>
        </div>

        {/* Error message area */}
        {apiError && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            {apiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name field */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
            />
            {errors.fullName && (
              <p id="fullName-error" className="text-sm text-destructive">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? "confirmPassword-error" : undefined
              }
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-sm text-destructive">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Role Select */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value: UserRole) => setRole(value)}
            >
              <SelectTrigger
                id="role"
                className="w-full"
                aria-invalid={!!errors.role}
                aria-describedby={errors.role ? "role-error" : undefined}
              >
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p id="role-error" className="text-sm text-destructive">
                {errors.role}
              </p>
            )}
          </div>

          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
