"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Smile, LogOut, LayoutDashboard, User } from "lucide-react"

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; role: string; clinic: string } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    const clinic = localStorage.getItem("clinic_name") ?? ""
    const email = localStorage.getItem("user_email") ?? ""
    if (token && role) {
      setUser({ name: email, role, clinic })
    }
  }, [])

  function handleLogout() {
    localStorage.clear()
    setUser(null)
    router.push("/signin")
  }

  return (
    <nav className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500">
            <Smile className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">DentalAI</span>
        </Link>

        {/* Links */}
        <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="hover:text-cyan-500 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-cyan-500 transition-colors">How it works</a>
          <a href="#testimonials" className="hover:text-cyan-500 transition-colors">Testimonials</a>
        </div>

        {/* Auth area */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden flex-col items-end md:flex">
              <span className="text-xs font-medium text-slate-700 truncate max-w-[140px]">{user.name}</span>
              <span className="text-xs text-slate-400 capitalize">{user.role} · {user.clinic}</span>
            </div>
            {(user.role === "patient" || user.role === "doctor") && (
              <Link
                href={user.role === "doctor" ? "/doctor-dashboard" : "/dashboard"}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-600 transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
