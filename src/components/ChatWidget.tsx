"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, Send, Smile, User, Trash2, Clock, Stethoscope, CalendarDays } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const WELCOME = (clinicName: string): Message => ({
  id: "welcome",
  role: "assistant",
  content: `Hi! I'm your AI assistant at ${clinicName}. I can help you check available slots, book appointments, or answer questions about our services. How can I help you today?`,
})

// Detect if AI is asking for a date
function parseDatePicker(content: string): boolean {
  return /(what date|which date|date would you like|book.*for\?|try a different date)/i.test(content)
}

// Generate date quick-picks: Today, Tomorrow, then next 5 weekdays
function getDateChips(): { label: string; value: string }[] {
  const chips: { label: string; value: string }[] = []
  const now = new Date()
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  chips.push({ label: "Today", value: "today" })
  chips.push({ label: "Tomorrow", value: "tomorrow" })
  let d = new Date(now)
  d.setDate(d.getDate() + 2)
  let added = 0
  while (added < 5) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      chips.push({ label: days[d.getDay()], value: d.toISOString().slice(0, 10) })
      added++
    }
    d.setDate(d.getDate() + 1)
  }
  return chips
}

// Detect confirmation question (yes/no)
function parseConfirmation(content: string): boolean {
  return /\(yes\/no\)/i.test(content) || /shall i confirm/i.test(content)
}

// Extract inline doctor mentions: "Dr. X (Specialty)" pattern
function parseDoctors(content: string): { intro: string; doctors: { name: string; specialty: string }[] } | null {
  const matches = [...content.matchAll(/Dr\.\s+([\w\s.]+?)\s+\(([^)]+)\)/g)]
  if (matches.length < 2) return null
  const firstMatch = content.indexOf(matches[0][0])
  const intro = content.slice(0, firstMatch).trim()
  return {
    intro,
    doctors: matches.map((m) => ({ name: `Dr. ${m[1].trim()}`, specialty: m[2].trim() })),
  }
}

// Detect and parse service rates bullet list: "- Name: PHP X.XX (Y min) — desc"
interface ServiceRate {
  name: string
  price: string
  duration: string
  description: string
}

function parseServiceRates(content: string): { intro: string; services: ServiceRate[]; outro: string } | null {
  const lines = content.split("\n")
  const serviceLines = lines.filter((l) =>
    /^-\s+.+:\s+(PHP|USD|EUR)\s+[\d,]+\.\d{2}\s+\(\d+\s+min\)/i.test(l.trim())
  )
  if (serviceLines.length < 2) return null

  const firstIdx = lines.findIndex((l) =>
    /^-\s+.+:\s+(PHP|USD|EUR)\s+[\d,]+\.\d{2}\s+\(\d+\s+min\)/i.test(l.trim())
  )
  const lastIdx = lines
    .map((l, i) => (/^-\s+.+:\s+(PHP|USD|EUR)\s+[\d,]+\.\d{2}\s+\(\d+\s+min\)/i.test(l.trim()) ? i : -1))
    .filter((i) => i >= 0)
    .pop()!

  const intro = lines.slice(0, firstIdx).join("\n").trim()
  const outro = lines.slice(lastIdx + 1).join("\n").trim()

  const services: ServiceRate[] = serviceLines.map((l) => {
    const match = l.trim().match(/^-\s+(.+?):\s+((PHP|USD|EUR)\s+[\d,]+\.\d{2})\s+\((\d+\s+min)\)(?:\s+[—-]\s+(.*))?$/i)
    if (!match) return { name: l, price: "", duration: "", description: "" }
    return {
      name: match[1].trim(),
      price: match[2].trim(),
      duration: match[4].trim(),
      description: match[5]?.trim() ?? "",
    }
  })

  return { intro, services, outro }
}

// Detect if message contains a numbered slot list like "1. 09:00 - 09:30"
function parseSlots(content: string): { intro: string; slots: string[]; outro: string } | null {
  const lines = content.split("\n")
  const slotLines = lines.filter((l) => /^\d+\.\s+\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/.test(l.trim()))
  if (slotLines.length < 2) return null

  const firstSlotIdx = lines.findIndex((l) => /^\d+\.\s+\d{2}:\d{2}/.test(l.trim()))
  const lastSlotIdx = lines.map((l, i) => /^\d+\.\s+\d{2}:\d{2}/.test(l.trim()) ? i : -1).filter(i => i >= 0).pop()!

  const intro = lines.slice(0, firstSlotIdx).join("\n").trim()
  const outro = lines.slice(lastSlotIdx + 1).join("\n").trim()
  const slots = slotLines.map((l) => l.replace(/^\d+\.\s+/, "").trim())

  return { intro, slots, outro }
}

// Detect if message contains a numbered list of names/items (not time slots)
function parseNamedList(content: string): { intro: string; items: string[]; outro: string } | null {
  const lines = content.split("\n")
  const itemLines = lines.filter((l) => /^\d+\.\s+.+/.test(l.trim()) && !/^\d+\.\s+\d{2}:\d{2}/.test(l.trim()))
  if (itemLines.length < 1) return null

  const firstIdx = lines.findIndex((l) => /^\d+\.\s+.+/.test(l.trim()) && !/^\d+\.\s+\d{2}:\d{2}/.test(l.trim()))
  const lastIdx = lines.map((l, i) => (/^\d+\.\s+.+/.test(l.trim()) && !/^\d+\.\s+\d{2}:\d{2}/.test(l.trim())) ? i : -1).filter(i => i >= 0).pop()!

  const intro = lines.slice(0, firstIdx).join("\n").trim()
  const outro = lines.slice(lastIdx + 1).join("\n").trim()
  const items = itemLines.map((l) => l.replace(/^\d+\.\s+/, "").trim())

  return { intro, items, outro }
}

function RichText({ text }: { text: string }) {
  // Render **bold** markdown
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i}>{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  )
}

function MessageContent({ content, onSlotClick }: { content: string; onSlotClick: (slot: string) => void }) {
  // 1. Confirmation (yes/no) buttons
  if (parseConfirmation(content)) {
    const question = content.replace(/\s*\(yes\/no\)\s*/i, "").trim()
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          {question.split("\n").map((line, i) =>
            line.trim() ? <p key={i} className="text-sm leading-relaxed"><RichText text={line} /></p> : <div key={i} className="h-1" />
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSlotClick("yes")}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-600 transition-colors"
          >
            ✅ Yes, confirm
          </button>
          <button
            onClick={() => onSlotClick("no")}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            ❌ No, cancel
          </button>
        </div>
      </div>
    )
  }

  // 2. Date quick-picks
  if (parseDatePicker(content)) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          {content.split("\n").map((line, i) =>
            line.trim() ? <p key={i} className="text-sm leading-relaxed"><RichText text={line} /></p> : <div key={i} className="h-1" />
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {getDateChips().map((chip) => (
            <button
              key={chip.value}
              onClick={() => onSlotClick(chip.value)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700 transition-colors"
            >
              <CalendarDays className="h-3 w-3 shrink-0 text-cyan-500" />
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // 3. Service rates cards
  const servicesParsed = parseServiceRates(content)
  if (servicesParsed) {
    return (
      <div className="flex flex-col gap-2">
        {servicesParsed.intro && (
          <p className="text-sm leading-relaxed"><RichText text={servicesParsed.intro} /></p>
        )}
        <div className="flex flex-col gap-2 my-1">
          {servicesParsed.services.map((svc, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-800">{svc.name}</span>
                </div>
                <span className="shrink-0 rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-bold text-cyan-600">
                  {svc.price}
                </span>
              </div>
              {svc.description && (
                <p className="mt-1 pl-5 text-xs text-slate-500 leading-relaxed">{svc.description}</p>
              )}
              <div className="mt-1.5 pl-5 flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                {svc.duration}
              </div>
            </div>
          ))}
        </div>
        {servicesParsed.outro && (
          <p className="text-sm leading-relaxed text-slate-500"><RichText text={servicesParsed.outro} /></p>
        )}
      </div>
    )
  }

  // 4. Slot time buttons
  const slotParsed = parseSlots(content)
  if (slotParsed) {
    return (
      <div className="flex flex-col gap-2">
        {slotParsed.intro && <p className="text-sm leading-relaxed"><RichText text={slotParsed.intro} /></p>}
        <div className="grid grid-cols-2 gap-1.5 my-1">
          {slotParsed.slots.map((slot, i) => (
            <button
              key={i}
              onClick={() => onSlotClick(`I'll take slot ${i + 1}: ${slot}`)}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-700 hover:bg-cyan-100 hover:border-cyan-400 transition-colors"
            >
              <Clock className="h-3 w-3 shrink-0" />
              {slot}
            </button>
          ))}
        </div>
        {slotParsed.outro && <p className="text-sm leading-relaxed"><RichText text={slotParsed.outro} /></p>}
      </div>
    )
  }

  // 5. Inline doctor buttons
  const doctorParsed = parseDoctors(content)
  if (doctorParsed) {
    return (
      <div className="flex flex-col gap-2">
        {doctorParsed.intro && <p className="text-sm leading-relaxed"><RichText text={doctorParsed.intro} /></p>}
        <div className="flex flex-col gap-1.5 my-1">
          {doctorParsed.doctors.map((doc, i) => (
            <button
              key={i}
              onClick={() => onSlotClick(`${doc.name}`)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700 transition-colors text-left"
            >
              <Stethoscope className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
              <span className="font-semibold">{doc.name}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{doc.specialty}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // 6. Named numbered list buttons
  const namedParsed = parseNamedList(content)
  if (namedParsed) {
    return (
      <div className="flex flex-col gap-2">
        {namedParsed.intro && (
          <div className="flex flex-col gap-1">
            {namedParsed.intro.split("\n").map((line, i) => (
              <p key={i} className="text-sm leading-relaxed"><RichText text={line} /></p>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-1.5 my-1">
          {namedParsed.items.map((item, i) => (
            <button
              key={i}
              onClick={() => onSlotClick(item)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700 transition-colors text-left"
            >
              <Stethoscope className="h-3 w-3 shrink-0 text-cyan-500" />
              {item}
            </button>
          ))}
        </div>
        {namedParsed.outro && (
          <div className="flex flex-col gap-1">
            {namedParsed.outro.split("\n").map((line, i) => (
              <p key={i} className="text-sm leading-relaxed"><RichText text={line} /></p>
            ))}
          </div>
        )}
      </div>
    )
  }

  // 7. Plain text
  return (
    <div className="flex flex-col gap-1">
      {content.split("\n").map((line, i) =>
        line.trim() ? (
          <p key={i} className="text-sm leading-relaxed"><RichText text={line} /></p>
        ) : (
          <div key={i} className="h-1" />
        )
      )}
    </div>
  )
}

export default function ChatWidget() {
  const [token, setToken] = useState<string | null>(null)
  const [clinicName, setClinicName] = useState("Dental Clinic")
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME("Dental Clinic")])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = localStorage.getItem("token")
    const c = localStorage.getItem("clinic_name") ?? "Dental Clinic"
    setToken(t)
    setClinicName(c)
    setMessages([WELCOME(c)])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? process.env.NEXT_PUBLIC_DEMO_TOKEN ?? ""}`,
        },
        body: JSON.stringify({ message: msg }),
      })

      const data = await res.json()
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: (data.response ?? "Sorry, I couldn't process that.").trim(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "Connection error. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function clearMemory() {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/memory`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      })
      setMessages([WELCOME(clinicName)])
    } catch {
      // silently ignore
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!token) return null

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col p-0 sm:max-w-md"
        >
          {/* Header */}
          <SheetHeader className="border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-white">
                <Smile className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-left text-base">{clinicName} AI Assistant</SheetTitle>
                <SheetDescription className="text-left text-xs">
                  Available 24/7 · Powered by AI
                </SheetDescription>
              </div>
            </div>
            <button
              onClick={clearMemory}
              title="Clear conversation"
              className="ml-auto rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </SheetHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="flex flex-col gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${msg.role === "user" ? "bg-cyan-500" : "bg-slate-400"}`}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Smile className="h-4 w-4" />}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-sm bg-cyan-500 text-white"
                        : "rounded-bl-sm bg-muted text-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <MessageContent content={msg.content} onSlotClick={(slot) => sendMessage(slot)} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-end gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-400 text-white">
                    <Smile className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                    <span className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t px-4 py-4">
            <div className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 focus-within:ring-2 focus-within:ring-cyan-400">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-white transition-colors hover:bg-cyan-600 disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Press Enter to send
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
