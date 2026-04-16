"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Stethoscope, LogOut, Bell, Activity, CalendarCheck,
  Clock, Users, RefreshCw, Calendar, Mail, Phone,
  MapPin, ChevronDown, Smile,
} from "lucide-react"
import { apiFetch } from "@/lib/api"

interface DoctorProfile {
  doctor_id: string
  name: string
  email: string
  phone: string | null
  specialization: string | null
  schedule: Record<string, { start: string; end: string }> | null
  clinic_name: string
  clinic_location: string | null
  clinic_email: string | null
  clinic_phone: string | null
}

interface Appointment {
  booking_id: string
  status: string
  service: string | null
  notes: string | null
  start_time: string
  end_time: string
  patient_name: string
  patient_email: string
  patient_phone: string | null
  patient_gender?: string | null
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  cancelled:  "bg-red-50 text-red-600",
  completed:  "bg-slate-100 text-slate-600",
  no_show:    "bg-amber-50 text-amber-700",
}

const STATUS_OPTIONS = ["confirmed", "completed", "cancelled", "no_show"]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
}

export default function DoctorDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<DoctorProfile | null>(null)
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([])
  const [allAppts, setAllAppts] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"today" | "all">("today")
  const [userName, setUserName] = useState("Doctor")
  const [clinicName, setClinicName] = useState("")

  useEffect(() => {
    setUserName(localStorage.getItem("user_name") ?? "Doctor")
    setClinicName(localStorage.getItem("clinic_name") ?? "")
  }, [])

  async function fetchData(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    await Promise.all([
      apiFetch("/doctors/me").then((r) => r.ok ? r.json() : null),
      apiFetch("/doctors/me/appointments/today").then((r) => r.ok ? r.json() : []),
      apiFetch("/doctors/me/appointments").then((r) => r.ok ? r.json() : []),
    ]).then(([prof, today, all]) => {
      if (prof) setProfile(prof)
      setTodayAppts(Array.isArray(today) ? today : [])
      setAllAppts(Array.isArray(all) ? all : [])
    }).finally(() => {
      setLoading(false)
      setRefreshing(false)
    })
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    if (!token) { router.push("/signin"); return }
    if (role !== "doctor") { router.push("/"); return }
    fetchData()
  }, [router])

  async function updateStatus(bookingId: string, status: string) {
    setUpdatingId(bookingId)
    const res = await apiFetch(`/doctors/me/appointments/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const update = (appt: Appointment) =>
        appt.booking_id === bookingId ? { ...appt, status } : appt
      setTodayAppts((prev) => prev.map(update))
      setAllAppts((prev) => prev.map(update))
    }
    setUpdatingId(null)
  }

  function handleLogout() {
    localStorage.clear()
    router.push("/signin")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const displayAppts = activeTab === "today" ? todayAppts : allAppts
  const completedCount = allAppts.filter((a) => a.status === "completed").length
  const confirmedCount = allAppts.filter((a) => a.status === "confirmed").length

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-white lg:flex overflow-y-auto">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500">
            <Smile className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">DentalAI</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {[
            { icon: Activity, label: "Overview", href: "/doctor-dashboard", active: true },
          ].map(({ icon: Icon, label, href, active }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-cyan-50 text-cyan-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Doctor info */}
        {profile && (
          <div className="border-t p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-white">
                {profile.name[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{profile.name}</p>
                <p className="truncate text-xs text-slate-400">{profile.specialization ?? "Doctor"}</p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-h-0">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6">
          <div>
            <h1 className="text-base font-semibold text-slate-900">
              Welcome, {userName} 👋
            </h1>
            <p className="text-xs text-slate-400">{clinicName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-white">
              {userName[0]?.toUpperCase() ?? "D"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: CalendarCheck, label: "Today's Appointments", value: todayAppts.length, color: "text-cyan-500", bg: "bg-cyan-50" },
              { icon: Users,         label: "Confirmed",            value: confirmedCount,     color: "text-emerald-500", bg: "bg-emerald-50" },
              { icon: Clock,         label: "Completed",            value: completedCount,     color: "text-violet-500", bg: "bg-violet-50" },
              { icon: Stethoscope,   label: "Total Bookings",       value: allAppts.length,    color: "text-amber-500", bg: "bg-amber-50" },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="mt-0.5 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Appointments table */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="mb-4 flex items-center gap-4">
                {(["today", "all"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-cyan-500 text-cyan-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab === "today" ? "Today's Schedule" : "All Appointments"}
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                {displayAppts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="mb-3 h-8 w-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">
                      {activeTab === "today" ? "No appointments today" : "No appointments yet"}
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <th className="px-5 py-3">Patient</th>
                        <th className="px-5 py-3">Service</th>
                        <th className="px-5 py-3">Date & Time</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {displayAppts.map((appt) => (
                        <tr key={appt.booking_id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3">
                            <p className="font-medium text-slate-900">{appt.patient_name}</p>
                            <p className="text-xs text-slate-400">{appt.patient_email}</p>
                          </td>
                          <td className="px-5 py-3 text-slate-600">{appt.service ?? "—"}</td>
                          <td className="px-5 py-3 text-slate-600">
                            <p>{formatDate(appt.start_time)}</p>
                            <p className="text-xs text-slate-400">{formatTime(appt.start_time)} – {formatTime(appt.end_time)}</p>
                          </td>
                          <td className="px-5 py-3">
                            <div className="relative inline-block">
                              <select
                                value={appt.status}
                                disabled={updatingId === appt.booking_id}
                                onChange={(e) => updateStatus(appt.booking_id, e.target.value)}
                                className={`appearance-none rounded-full pl-2.5 pr-6 py-1 text-xs font-medium cursor-pointer disabled:opacity-50 ${STATUS_STYLES[appt.status] ?? "bg-slate-100 text-slate-600"}`}
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s} value={s} className="bg-white text-slate-900 capitalize">
                                    {s.replace("_", " ")}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-60" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Profile card */}
            <div>
              <h2 className="mb-4 text-base font-semibold text-slate-900">My Profile</h2>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-xl font-bold text-white">
                    {profile?.name?.[0]?.toUpperCase() ?? "D"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{profile?.name ?? "—"}</p>
                    <p className="text-xs text-slate-400">{profile?.specialization ?? "Doctor"}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {[
                    { icon: Mail,        label: "Email",          value: profile?.email },
                    { icon: Phone,       label: "Phone",          value: profile?.phone ?? "Not set" },
                    { icon: Stethoscope, label: "Clinic",         value: profile?.clinic_name },
                    { icon: MapPin,      label: "Clinic Address", value: profile?.clinic_location ?? "Not set" },
                    { icon: Mail,        label: "Clinic Email",   value: profile?.clinic_email ?? "Not set" },
                    { icon: Phone,       label: "Clinic Phone",   value: profile?.clinic_phone ?? "Not set" },
                  ].map(({ icon: Icon, label, value }, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-600">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className="truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Weekly schedule */}
                {profile?.schedule && (
                  <div className="mt-4 border-t pt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Weekly Schedule</p>
                    <div className="space-y-1">
                      {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                        const slot = profile.schedule?.[day]
                        return (
                          <div key={day} className="flex items-center justify-between text-xs">
                            <span className="capitalize text-slate-500">{day.slice(0, 3)}</span>
                            {slot ? (
                              <span className="font-medium text-slate-700">{slot.start} – {slot.end}</span>
                            ) : (
                              <span className="text-slate-300">Off</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
