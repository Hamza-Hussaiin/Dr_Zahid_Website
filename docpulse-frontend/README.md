# DocPulse — Frontend Only

This is the frontend portion of the DocPulse platform. Same components, same design,
same behavior as before — the only changes are the two small additions below, made
so this folder can be wired up to a separate backend folder with no code edits.

## What's included
- `src/` — all React components, contexts, types, and the `api.ts` service layer
- `index.html`, `vite.config.ts`, `tsconfig.json` — standard Vite/React/TypeScript setup
- `public/` — static assets
- No backend code, mock server, or seed data lives in this folder.

## How it talks to a backend
`src/services/api.ts` calls paths like `fetch(\`${API_BASE}/api/doctors\`)`.
`API_BASE` is empty by default, so nothing changes out of the box — it still hits
relative `/api/...` paths exactly as before. Two ways to connect a real backend,
pick whichever fits how you're running things:

1. **Dev proxy (default, no `.env` needed)** — `vite.config.ts` already proxies
   `/api/*` to `http://localhost:5000` during `npm run dev`. Change that port in
   `vite.config.ts` to match wherever your backend runs.
2. **Explicit base URL** — copy `.env.example` to `.env` and set `VITE_API_URL`
   (e.g. `http://localhost:5000`) if your backend lives on a different origin,
   including in production. This takes priority over the dev proxy.

Either way, your backend needs to implement the routes `api.ts` already calls
(`/api/auth/login`, `/api/doctors`, `/api/appointments`, `/api/slots`, `/api/chat`,
`/api/notifications`, `/api/patient-profile/:id`, `/api/reviews`,
`/api/content/clinic-info`, `/api/services`, `/api/admin/analytics`,
`/api/ai/clinical-summary`, plus `/api/upload` and the `/api/events` SSE stream)
with the request/response shapes already defined in that file.

## Run locally
```
npm install
npm run dev
```
The app will load and render immediately; screens that fetch data (doctors,
appointments, etc.) will show empty/error states until a backend is running and
reachable via the proxy or `VITE_API_URL` above.

## Build for production
```
npm run build
```
Outputs static files to `dist/`, which your backend (or any static host) can serve.
