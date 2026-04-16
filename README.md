# Dental AI — Frontend

Next.js frontend for the Dental AI platform. Role-based dashboards for patients and doctors, with an AI-powered chat widget.

## Stack

- **Next.js 14** — React framework with App Router
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **shadcn/ui** — UI components

---

## Quick Start (Docker)

Included in the backend's `docker-compose.yml`. From `dental-ai-backend/`:

```bash
docker-compose up --build
```

Frontend available at **http://localhost:3000**

---

## Local Development

```bash
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with chat widget |
| `/signin` | Login with role-aware redirect |
| `/signup` | Register with clinic selector |
| `/dashboard` | Patient — appointments, profile, AI chat |
| `/doctor-dashboard` | Doctor — schedule, appointment status management |

---

## Chat Widget

Available on every page. Supports:
- Booking flow with inline doctor/slot/date pickers
- Yes/No confirmation buttons
- Service rate cards with pricing
- Conversation memory with clear button

---

## Demo Accounts

Password for all accounts: `Password123!`

| Role | Email | Clinic |
|------|-------|--------|
| Patient | juan@example.com | Bright Smile |
| Patient | carlos@example.com | Pearl White |
| Patient | miguel@example.com | ClearCare |
| Patient | andres@example.com | Family Dental |
| Doctor | dr.santos@example.com | Bright Smile |
| Doctor | dr.mendoza@example.com | Pearl White |
| Doctor | dr.lim@example.com | ClearCare |
| Doctor | dr.fernandez@example.com | Family Dental |
