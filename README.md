# Noiva Sem Crise — Wedding Planning SaaS

A complete wedding planning platform built with Next.js 14, designed to help Brazilian couples organize every detail of their big day — from budget tracking to guest management.

---

## Features

- **Dashboard** — Overview of countdown, budget progress, checklist completion, and guest status at a glance
- **Checklist** — Month-by-month task tracker with priorities (12 to 1 month before the wedding)
- **Budget** — Full financial control: estimated vs. actual costs, installments, and paid amounts per category
- **Guests** — Guest list management with RSVP status, sides (bride/groom/both), dietary needs, and table assignment
- **Vendors** — Supplier directory with status (prospect → hired), ratings, contacts, and contract tracking
- **Seating** — Drag-and-drop table layout builder
- **Timeline** — Day-of schedule planner with categorized events
- **Inspiration** — Mood board with image collection and tags
- **Music** — Playlist builder by moment (ceremony, cocktail, reception, party)
- **Gifts** — Gift registry with reservation tracking
- **Honeymoon** — Trip planner with destination, dates, budget, and activities
- **Bachelorette** — Party planner with guest list and activity schedule
- **Trousseau** — Enxoval checklist with categories and acquisition tracking
- **AI Assistant** — Built-in chat assistant for wedding planning advice
- **Settings** — Full profile and wedding info management with danger zone

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js v4 |
| Database | PostgreSQL + Prisma ORM |
| UI Components | Radix UI primitives |
| Drag & Drop | @hello-pangea/dnd |
| Notifications | Sonner |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted, e.g., Supabase, Neon, Railway)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/casamento.git
cd casamento
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/casamento"
NEXTAUTH_SECRET="generate-a-random-32-char-string-here"
NEXTAUTH_URL="http://localhost:3000"
```

To generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed demo data

```bash
npx prisma db seed
```

This creates a demo account with a fully populated wedding (checklist, budget, guests, vendors).

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Credentials

| Field | Value |
|---|---|
| Email | `demo@noivasemcrise.com` |
| Password | `demo1234` |

The demo account comes pre-loaded with:
- A wedding on December 14, 2025 at Espaço Villa Garden, Sao Paulo
- 35 checklist items across 7 time periods
- 8 budget items totaling ~R$ 73,000
- 8 guests with various RSVP statuses
- 6 hired vendors

---

## Project Structure

```
src/
  app/
    (auth)/           # Login and register pages
    (dashboard)/      # Protected app pages
      dashboard/
      checklist/
      budget/
      guests/
      vendors/
      seating/
      timeline/
      inspiration/
      music/
      gifts/
      honeymoon/
      bachelorette/
      trousseau/
      ai-assistant/
      settings/
    api/              # API route handlers
  lib/
    auth.ts           # NextAuth configuration
    prisma.ts         # Prisma client singleton
prisma/
  schema.prisma       # Database schema
  seed.ts             # Demo data seeder
```

---

## Deploying to Production

### Vercel (recommended)

1. Push your code to GitHub
2. Import the repository on [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your production domain, e.g. `https://yourapp.vercel.app`)
4. Deploy

After first deploy, run migrations against your production database:

```bash
npx prisma migrate deploy
```

### Other platforms (Railway, Render, Fly.io)

1. Set the same environment variables
2. Add a build command: `npx prisma generate && next build`
3. Add a start command: `next start`
4. Run `npx prisma migrate deploy` on first deploy

---

## Database Management

```bash
# Open Prisma Studio (visual DB browser)
npx prisma studio

# Reset and re-seed database
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate
```

---

## License

MIT
