import { Heart, Activity, Shield } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Branding */}
      <div className="bg-primary px-6 py-12 lg:w-1/2 lg:min-h-screen flex flex-col justify-center items-center text-primary-foreground">
        <div className="max-w-md text-center lg:text-left">
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
            <div className="p-3 bg-white/10 rounded-xl">
              <Heart className="size-8" />
            </div>
            <h1 className="text-3xl font-bold">HealthTrack</h1>
          </div>

          {/* Tagline */}
          <p className="text-xl lg:text-2xl font-medium mb-6 text-balance">
            Your complete health management solution
          </p>
          <p className="text-primary-foreground/80 mb-10 text-pretty">
            Track your health metrics, manage appointments, and stay connected with your healthcare providers—all in one secure platform.
          </p>

          {/* Features */}
          <div className="hidden lg:flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Activity className="size-5" />
              </div>
              <span>Real-time health monitoring</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Shield className="size-5" />
              </div>
              <span>Secure & HIPAA compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form area */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
