# Vibrafit Frontend

Frontend application for **Vibrafit**, built with **Next.js + TypeScript**.

Backend API repo: https://github.com/abrokinla/vibrafit

---

## Current Scope

This frontend currently includes:

- Multi-role flows: **User, Trainer, Gym, Admin**
- Auth pages (signin/signup)
- User dashboard, workouts, nutrition, profile
- Trainer dashboard, routines, subscription requests
- Gym dashboard, clients, settings, coaches (wired to live API)
- Admin navigation/dashboard structure and management sections

---

## Tech Stack

- Next.js (App Router)
- TypeScript
- next-intl (i18n)
- Tailwind CSS + shadcn/ui

---

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create `.env.local` in this repo and set:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1
```

Adjust values to your backend environment as needed.

### 3) Run the app

```bash
npm run dev
```

App runs by default at `http://localhost:3000`.

---

## Scripts

- `npm run dev`: start local dev server
- `npm run build`: production build
- `npm run start`: run production build
- `npm run typecheck`: TypeScript checks

---

## Notes

- This project is actively evolving.
- Some sections may still be under refinement as MVP hardening continues.