"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Stethoscope, Eye, EyeOff, Loader2, CheckCircle2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Role = "patient" | "doctor"

interface Clinic {
  tenant_id: string
  clinic_name: string
  location: string
}

const PERKS = [
  "Book appointments in under 2 minutes",
  "AI assistant available 24/7",
  "Real-time slot availability",
  "Secure, tenant-isolated data",
]

export default function SignUpPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [clinicsLoading, setClinicsLoading] = useState(true)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient" as Role,
    tenant_id: "",
  })

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/clinics`)
      .then((r) => r.json())
      .then((data) => setClinics(data))
      .catch(() => setClinics([]))
      .finally(() => setClinicsLoading(false))
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (!form.tenant_id) {
      setError("Please select a clinic.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          tenant_id: form.tenant_id,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.detail ?? "Registration failed. Please try again.")
        return
      }

      router.push("/signin?registered=1")
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
            <Stethoscope className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">DentalAI</span>
        </Link>

        <div>
          <h2 className="text-3xl font-bold text-white">Start managing your clinic smarter.</h2>
          <p className="mt-4 text-slate-400">Join dental clinics already using DentalAI to automate bookings and delight patients.</p>
          <ul className="mt-8 space-y-3">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
                {perk}
              </li>
            ))}
          </ul>
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
            <Stethoscope className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">DentalAI</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Create an account</h1>
            <p className="mt-2 text-sm text-slate-500">Get started with DentalAI today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role toggle */}
            <div className="space-y-1.5">
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["patient", "doctor"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, role: r }))}
                    className={`rounded-lg border py-2.5 text-sm font-medium capitalize transition-colors ${
                      form.role === r
                        ? "border-cyan-500 bg-cyan-50 text-cyan-600"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Juan dela Cruz"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

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

            {/* Clinic dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="tenant_id">Clinic</Label>
              <div className="relative">
                <select
                  id="tenant_id"
                  name="tenant_id"
                  value={form.tenant_id}
                  onChange={handleChange}
                  required
                  disabled={clinicsLoading}
                  className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>
                    {clinicsLoading ? "Loading clinics..." : "Select your clinic"}
                  </option>
                  {clinics.map((c) => (
                    <option key={c.tenant_id} value={c.tenant_id}>
                      {c.clinic_name} — {c.location}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
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

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading || clinicsLoading}
              className="w-full rounded-full bg-cyan-500 hover:bg-cyan-600"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-xs text-slate-400">
              By signing up you agree to our{" "}
              <Link href="#" className="text-cyan-500 hover:underline">Terms</Link>{" "}
              and{" "}
              <Link href="#" className="text-cyan-500 hover:underline">Privacy Policy</Link>.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/signin" className="font-medium text-cyan-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
