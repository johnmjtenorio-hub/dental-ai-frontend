import ChatWidget from "@/components/ChatWidget"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import {
  CalendarCheck,
  Bot,
  ShieldCheck,
  Clock,
  Building2,
  MessageSquare,
  Star,
  ChevronRight,
  Smile,
} from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI-Powered Assistant",
    description:
      "A smart conversational AI that understands patient needs, answers FAQs, and guides them through booking — available 24/7.",
  },
  {
    icon: CalendarCheck,
    title: "Instant Appointment Booking",
    description:
      "Patients can check real-time slot availability and book, reschedule, or cancel appointments without calling the clinic.",
  },
  {
    icon: Building2,
    title: "Multi-Clinic Support",
    description:
      "Manage multiple dental clinics under one platform. Each clinic gets its own isolated data, doctors, and patient records.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Tenant-Isolated",
    description:
      "Row-level security ensures each clinic's data is completely isolated. JWT-based auth keeps every session protected.",
  },
  {
    icon: Clock,
    title: "Real-Time Slot Management",
    description:
      "Doctor schedules are reflected instantly. Booked slots are locked in real time, preventing double bookings.",
  },
  {
    icon: MessageSquare,
    title: "Contextual Conversations",
    description:
      "The AI remembers context within a session — no need to repeat yourself. It routes intelligently between scheduling, booking, and FAQ agents.",
  },
]

const steps = [
  { step: "01", title: "Patient opens the chat", description: "A floating chat button is always accessible on the clinic's website." },
  { step: "02", title: "AI understands the intent", description: "The supervisor agent routes the request to the right specialist — scheduler, booker, or FAQ." },
  { step: "03", title: "Slot is confirmed", description: "The patient picks a slot, confirms details, and receives a booking confirmation instantly." },
]

const testimonials = [
  { name: "Dr. Maria Santos", role: "General Dentist · Bright Smile Clinic", quote: "Our no-show rate dropped significantly. Patients love being able to book at midnight without calling us." },
  { name: "Carlos Ramos", role: "Patient · Pearl White Dental Center", quote: "I booked my cleaning in under 2 minutes. The AI even reminded me what documents to bring." },
  { name: "Dr. Sofia Lim", role: "Pediatric Dentist · ClearCare Clinic", quote: "Managing schedules across two clinics used to be a nightmare. Now it's all in one place." },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 px-6 py-28 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-300">
            <Bot className="h-4 w-4" /> AI-Powered Dental Platform
          </span>
          <h1 className="mt-4 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
            Your Clinic, Smarter.<br />
            <span className="text-cyan-400">24/7 AI Assistant.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            DentalAI automates appointment booking, answers patient questions, and manages multi-clinic schedules — all through a conversational AI that never sleeps.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="flex items-center gap-2 rounded-full bg-cyan-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-cyan-600 transition-colors">
              Try the Demo <ChevronRight className="h-4 w-4" />
            </button>
            <button className="rounded-full border border-white/20 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors">
              View Docs
            </button>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-cyan-400" /> Tenant-isolated</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-cyan-400" /> Real-time slots</span>
            <span className="flex items-center gap-1.5"><Bot className="h-4 w-4 text-cyan-400" /> Multi-agent AI</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Everything your clinic needs</h2>
            <p className="mt-4 text-slate-500">Built for modern dental practices that want to automate without losing the personal touch.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-slate-50 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">How it works</h2>
            <p className="mt-4 text-slate-500">From first message to confirmed booking in under 3 minutes.</p>
          </div>
          <div className="relative flex flex-col gap-10 md:flex-row">
            {steps.map(({ step, title, description }, i) => (
              <div key={step} className="relative flex flex-1 flex-col items-center text-center">
                {i < steps.length - 1 && (
                  <div className="absolute left-1/2 top-6 hidden h-0.5 w-full translate-x-6 bg-cyan-200 md:block" />
                )}
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-lg font-bold text-white shadow-md">
                  {step}
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Loved by clinics & patients</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map(({ name, role, quote }) => (
              <div key={name} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-6 text-sm leading-relaxed text-slate-600">"{quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-400">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Ready to transform your clinic?</h2>
          <p className="mt-4 text-cyan-100">Try the AI assistant right now — click the chat button in the bottom right corner.</p>
          <button className="mt-8 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-cyan-600 shadow-lg hover:bg-cyan-50 transition-colors">
            Start for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-slate-400">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500">
            <Smile className="h-3 w-3 text-white" />
          </div>
          <span className="font-semibold text-slate-700">DentalAI</span>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} DentalAI. All rights reserved.</p>
      </footer>

      {/* Floating chat widget */}
      <ChatWidget />
    </div>
  )
}
