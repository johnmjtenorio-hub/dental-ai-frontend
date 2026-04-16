"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Smile, Eye, EyeOff, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignInPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ email: "", password: "" })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.detail ?? "Invalid email or password.")
        return
      }

      const data = await res.json()
      localStorage.setItem("token", data.access_token)
      localStorage.setItem("tenant_id", data.tenant_id)
      localStorage.setItem("role", data.role)
      localStorage.setItem("user_id", data.user_id)
      localStorage.setItem("clinic_name", data.clinic_name ?? "Dental Clinic")
      localStorage.setItem("user_email", form.email)
      localStorage.setItem("user_name", data.name ?? form.email)
      if (data.role === "patient") {
        router.push("/dashboard")
      } else if (data.role === "doctor") {
        router.push("/doctor-dashboard")
      } else {
        router.push("/")
      }
    } catch {
      setError("Unable to connect. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500">
            <Smile className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">DentalAI</span>
        </Link>

        <div>
          <blockquote className="text-xl font-medium leading-relaxed text-white">
            "Our no-show rate dropped significantly. Patients love being able to book at midnight without calling us."
          </blockquote>
          <div className="mt-6">
            <p className="font-semibold text-white">Dr. Maria Santos</p>
            <p className="text-sm text-slate-400">General Dentist · Bright Smile Clinic</p>
          </div>
        </div>

        <div className="flex gap-6 text-sm text-slate-400">
          <span>© {new Date().getFullYear()} DentalAI</span>
          <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500">
            <Smile className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">DentalAI</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in to your clinic account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-cyan-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-cyan-500 hover:bg-cyan-600"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-cyan-500 hover:underline">
              Sign up
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Demo accounts · password: <span className="font-mono">Password123!</span></p>

            {/* Patients */}
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <User className="h-3.5 w-3.5" /> Patients
              </p>
              <div className="space-y-1">
                {([
                  { email: "juan@example.com",   name: "Juan dela Cruz",  clinic: "Bright Smile" },
                  { email: "carlos@example.com", name: "Carlos Santos",    clinic: "Pearl White" },
                  { email: "miguel@example.com", name: "Miguel Lim",       clinic: "ClearCare" },
                  { email: "andres@example.com", name: "Andres Fernandez", clinic: "Family Dental" },
                ] as const).map((u) => (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => { setForm({ email: u.email, password: "Password123!" }); setError("") }}
                    className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-medium text-slate-700">{u.name}</span>
                    <span className="ml-1.5 text-slate-400">{u.clinic}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Doctors */}
            <div className="rounded-xl border border-dashed border-cyan-200 bg-cyan-50/50 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-cyan-700">
                <Smile className="h-3.5 w-3.5" /> Doctors
              </p>
              <div className="space-y-1">
                {([
                  { email: "dr.santos@example.com",    name: "Dr. Maria Santos",    clinic: "Bright Smile" },
                  { email: "dr.mendoza@example.com",   name: "Dr. Mendoza",         clinic: "Pearl White" },
                  { email: "dr.lim@example.com",       name: "Dr. Lim",             clinic: "ClearCare" },
                  { email: "dr.fernandez@example.com", name: "Dr. Fernandez",       clinic: "Family Dental" },
                ] as const).map((u) => (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => { setForm({ email: u.email, password: "Password123!" }); setError("") }}
                    className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-cyan-100 transition-colors"
                  >
                    <span className="font-medium text-slate-700">{u.name}</span>
                    <span className="ml-1.5 text-slate-400">{u.clinic}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
