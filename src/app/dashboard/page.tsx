"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Stethoscope, CalendarCheck, Clock, ClipboardList,
  LogOut, Bell, ChevronRight, Calendar,
  MapPin, Phone, Mail, Activity, RefreshCw, Smile,
} from "lucide-react"
import { apiFetch } from "@/lib/api"
import ChatWidget from "@/components/ChatWidget"

interface Profile {
  name: string
  email: string
  phone: string | null
  location: string | null
  date_of_birth: string | null
  gender: string | null
  clinic_name: string
  clinic_location: string | null
  clinic_email: string | null
  clinic_phone: string | null
}

interface Booking {
  booking_id: string
  status: string
  service: string | null
  start_time: string
  end_time: string
  doctor_name: string
  specialization: string
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-600",
  completed: "bg-slate-100 text-slate-600",
  no_show:   "bg-amber-50 text-amber-700",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
}

export default function PatientDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [upcoming, setUpcoming] = useState<Booking[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userName, setUserName] = useState("Patient")
  const [clinicName, setClinicName] = useState("")

  useEffect(() => {
    setUserName(localStorage.getItem("user_name") ?? "Patient")
    setClinicName(localStorage.getItem("clinic_name") ?? "")
  }, [])

  async function fetchData(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    await Promise.all([
      apiFetch("/patients/me").then((r) => r.ok ? r.json() : null),
      apiFetch("/patients/me/upcoming").then((r) => r.ok ? r.json() : []),
      apiFetch("/patients/me/bookings").then((r) => r.ok ? r.json() : []),
    ]).then(([prof, up, hist]) => {
      if (prof) setProfile(prof)
      setUpcoming(Array.isArray(up) ? up : [])
      setBookings(Array.isArray(hist) ? hist : [])
    }).finally(() => {
      setLoading(false)
      setRefreshing(false)
    })
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    if (!token) { router.push("/signin"); return }
    if (role !== "patient") { router.push("/"); return }

    const cachedName = localStorage.getItem("user_name")
    const cachedClinic = localStorage.getItem("clinic_name")
    if (cachedName || cachedClinic) {
      setProfile((prev) => ({
        name: cachedName ?? "",
        email: "",
        phone: null,
        location: null,
        date_of_birth: null,
        gender: null,
        clinic_name: cachedClinic ?? "",
        clinic_location: null,
        clinic_email: null,
        clinic_phone: null,
        ...prev,
      }))
    }

    fetchData()
  }, [router])

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
            { icon: Activity, label: "Overview", href: "/dashboard", active: true },
          ].map(({ icon: Icon, label, href, active }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-cyan-50 text-cyan-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

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
              Welcome back, {userName} 👋
            </h1>
            <p className="text-xs text-slate-400">{clinicName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-white">
              {userName[0]?.toUpperCase() ?? "P"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: CalendarCheck,
                label: "Upcoming",
                value: upcoming.length,
                color: "text-cyan-500",
                bg: "bg-cyan-50",
              },
              {
                icon: ClipboardList,
                label: "Total Bookings",
                value: bookings.length,
                color: "text-violet-500",
                bg: "bg-violet-50",
              },
              {
                icon: Clock,
                label: "Completed",
                value: bookings.filter((b) => b.status === "completed").length,
                color: "text-emerald-500",
                bg: "bg-emerald-50",
              },
              {
                icon: Stethoscope,
                label: "Clinic",
                value: profile?.clinic_name?.split(" ")[0] ?? "—",
                color: "text-amber-500",
                bg: "bg-amber-50",
              },
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
            {/* Upcoming appointments */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">My Appointments</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="text-slate-400 hover:text-cyan-500 transition-colors disabled:opacity-40"
                    title="Refresh"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                {upcoming.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="mb-3 h-8 w-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">No appointments yet</p>
                    <p className="mt-1 text-xs text-slate-400">Use the chat assistant to book one</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <th className="px-5 py-3">Service</th>
                        <th className="px-5 py-3">Doctor</th>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Time</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {upcoming.map((b) => (
                        <tr key={b.booking_id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3 font-medium text-slate-900">{b.service ?? "—"}</td>
                          <td className="px-5 py-3 text-slate-600">{b.doctor_name}</td>
                          <td className="px-5 py-3 text-slate-600">{formatDate(b.start_time)}</td>
                          <td className="px-5 py-3 text-slate-600">{formatTime(b.start_time)} – {formatTime(b.end_time)}</td>
                          <td className="px-5 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[b.status] ?? "bg-slate-100 text-slate-600"}`}>
                              {b.status}
                            </span>
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
                    {profile?.name?.[0]?.toUpperCase() ?? "P"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{profile?.name ?? "—"}</p>
                    <p className="text-xs capitalize text-slate-400">{profile?.gender ?? "Patient"}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {[
                    { icon: Mail,        label: "Email",           value: profile?.email },
                    { icon: Phone,       label: "Phone",           value: profile?.phone ?? "Not set" },
                    { icon: MapPin,      label: "Location",        value: profile?.location ?? "Not set" },
                    { icon: Stethoscope, label: "Clinic",          value: profile?.clinic_name },
                    { icon: MapPin,      label: "Clinic Address",  value: profile?.clinic_location ?? "Not set" },
                    { icon: Mail,        label: "Clinic Email",    value: profile?.clinic_email ?? "Not set" },
                    { icon: Phone,       label: "Clinic Phone",    value: profile?.clinic_phone ?? "Not set" },
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
              </div>
            </div>
          </div>


        </main>
      </div>

      <ChatWidget />
    </div>
  )
}
