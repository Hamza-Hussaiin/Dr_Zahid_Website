# DocPulse Backend

Node.js + Express + TypeScript backend for the DocPulse doctor appointment
platform, built to match `docpulse-frontend/src/services/api.ts` and
`types.ts` exactly.

## Stack

- **Runtime:** Node.js, Express 5, TypeScript
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM (`src/db/schema.ts`)
- **Auth:** JWT (`jsonwebtoken`) + bcrypt password hashing
- **Real-time:** Server-Sent Events (matches the frontend's `EventSource`
  usage in `services/api.ts` -> `subscribeEvents`)
- **Validation:** Zod on every request body

## 1. Prerequisites

- Node.js 18+ installed
- A PostgreSQL database (local install, or a free hosted one like
  [Neon](https://neon.tech) or [Supabase](https://supabase.com))

## 2. Setup

```bash
cd docpulse-backend
npm install
cp .env.example .env
```

Open `.env` and fill in:

- `DATABASE_URL` — your Postgres connection string
- `JWT_SECRET` — any long random string (e.g. run `openssl rand -hex 32`)
- `CORS_ORIGIN` — the URL your frontend runs on (e.g. `http://localhost:5173`
  for local dev, or your deployed frontend URL in production)
- `BOOTSTRAP_ADMIN_*` — the credentials for the very first admin doctor
  account, created automatically the first time the server starts
- `ANTHROPIC_API_KEY` — optional; only needed for the AI clinical summary
  feature. If left blank, that feature falls back to a simple non-AI summary
  instead of failing.

## 3. Create the database tables

```bash
npm run db:push
```

This reads `src/db/schema.ts` and creates all tables in your database. Run
it again any time you change the schema.

## 4. Run it

```bash
npm run dev
```

The server starts on `http://localhost:5000` (or whatever `PORT` you set).
On first run it will print:

```
[bootstrap] Created admin doctor account: <your BOOTSTRAP_ADMIN_EMAIL>
[bootstrap] Seeded default clinic info.
DocPulse backend listening on port 5000 (development)
```

Log in with the `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` from
your `.env` — that account has the `admin_doctor` role, so it can add more
doctors from the frontend's admin panel.

Visit `http://localhost:5000/health` to confirm the server is up.

## 5. Connect the frontend

In `docpulse-frontend/.env`:

```
VITE_API_URL=http://localhost:5000
```

Then run the frontend as usual (`npm run dev` inside `docpulse-frontend`).

## 6. Production build

```bash
npm run build   # compiles TypeScript to dist/
npm start       # runs dist/index.js
```

## Project structure

```
src/
├── index.ts                 # Express app entry point, route wiring
├── config/env.ts             # Centralized env var loading + validation
├── db/
│   ├── schema.ts              # Drizzle table definitions (all entities)
│   └── index.ts                # DB connection (pg Pool + drizzle instance)
├── middleware/
│   ├── auth.ts                 # JWT verification (requireAuth, optionalAuth)
│   ├── requireRole.ts          # Role-based access control
│   └── errorHandler.ts         # Central error handling + asyncHandler wrapper
├── routes/                   # One file per resource, thin - just wires paths to controllers
├── controllers/              # All business logic lives here
├── services/
│   ├── sse.service.ts           # Tracks open real-time connections, pushes events
│   ├── notification.service.ts   # Persists + live-pushes notifications together
│   └── bootstrap.service.ts       # Creates first admin account + default content
└── utils/                    # ids, hashing, jwt, param parsing, response shaping
```

## How real-time works

The frontend opens `GET /api/events?userId=...&token=...` using the
browser's native `EventSource` API and listens for these event types
(see `AppContext.tsx`):

- `notification` — a new notification for the bell icon
- `appointment_updated` — an appointment's status changed
- `new_appointment_request` — a doctor received a new booking request
- `doctor_added` / `doctor_updated` — the doctor directory changed

Whenever a controller changes something relevant (accepting an appointment,
sending a chat message, adding a doctor, etc.), it calls into
`sse.service.ts` to push that event to whichever connected user(s) need it,
live, without a page refresh.

## The appointment state machine

All status transitions go through one endpoint:
`PUT /api/appointments/:id/status` with an `action` field
(`accept`, `reject`, `propose_reschedule`, `accept_reschedule`, `cancel`,
`complete`). See `src/controllers/appointments.controller.ts` — each action:

1. Validates the current status allows that transition
2. Updates the appointment (and frees/books the relevant time slot)
3. Appends an entry to `statusHistory` (a full audit trail)
4. Notifies the other party (persisted notification + live SSE push)

## Doctor-patient chat isolation

Enforced server-side in `chat.controller.ts` (`authorizeChatParticipant`):
a user can only read or send messages on an appointment thread if they are
the patient on that appointment, the doctor on that appointment, or an
admin. A doctor can never see another doctor's patient conversations, even
by guessing an appointment ID.

## Security model (read this before modifying auth-related code)

Every mutating or data-returning endpoint derives **identity from the JWT**
(`req.user.id` / `req.user.role`), never from `req.body` or `req.query`.
This is a hard rule in this codebase, not a per-route judgment call:

- `PUT /api/appointments/:id/status` ignores any `actorId`/`actorName`/
  `actorRole` sent by the client entirely - the acting user, their name, and
  their role are looked up server-side from the authenticated session. It
  also enforces *who* may perform each action: only the assigned doctor can
  accept/reject/propose-reschedule/complete, only the patient can accept a
  proposed reschedule, and only a participant (or admin) can cancel.
- `slots.controller.ts` (`updateSlot`, `deleteSlot`, `toggleBlockSlot`) all
  route through `loadSlotAndAuthorize`, which checks the slot's owning
  doctor matches the authenticated user (or the user is an admin) before
  any write.
- `notifications.controller.ts` always scopes to `req.user.id` by default;
  a `?userId=` override is honored only for admin roles.
- `patient-profile.controller.ts`'s `getPatientProfile` only allows the
  patient themself or an admin to read it - medical data is never
  world-readable by user ID.
- `reviews.controller.ts` requires a real, completed `appointmentId`
  belonging to the reviewing patient - a review can never be posted without
  a verified appointment behind it.
- `/uploads/*` (attachments, medical documents) requires a valid JWT,
  passed either as `Authorization: Bearer <token>` or `?token=<token>` in
  the URL (needed because `<img>`/`<a>` tags can't set headers). **The
  frontend must append `?token=<the current user's JWT>` whenever it links
  directly to an uploaded file**, or the file will 401.

If you add a new endpoint, follow the same pattern: pull the acting user
from `req.user` (set by `requireAuth`), and explicitly check ownership/role
before touching data - never trust an ID the client could have typed into
the request themselves.

## Notes for going to production

- Move file uploads from local disk (`uploads/`) to a cloud store (S3,
  Cloudinary, Supabase Storage) if you deploy to a platform with an
  ephemeral filesystem (most PaaS backends wipe local files on redeploy).
- Set a real `ANTHROPIC_API_KEY` if you want AI-generated clinical summaries
  instead of the local fallback.
- Consider adding `express-rate-limit` on `/api/auth/login` before going
  live, to slow down brute-force attempts.
- Rotate `JWT_SECRET` to something you generate once and keep secret — never
  reuse the placeholder from `.env.example`.
