# DocuAI — Multi-Tenant AI Document Analysis Platform

A multi-tenant SaaS platform where organizations can upload documents and get instant AI-powered insights — summaries, sentiment analysis, entity extraction, and Q&A — powered by Google Gemini.

Each organization gets a fully isolated workspace: their own team members, documents, and AI analysis results, completely separate from every other organization on the platform.

## Features

- 🏢 **Multi-tenant architecture** — organization-scoped data isolation at the database level
- 🔐 **Clerk authentication & organizations** — sign-up/sign-in, org creation, team member management with role-based access
- 📄 **Document upload** — supports `.txt`, `.pdf`, `.docx`, `.doc`, `.md` (up to 10MB), stored via Vercel Blob
- 🤖 **AI-powered analysis** — Google Gemini integration for:
  - Document summarization
  - Sentiment analysis
  - Entity/keyword extraction
  - Q&A generation
- 👥 **Team management** — view organization members and their roles
- 📱 **Fully responsive** — mobile-friendly navigation and layouts throughout

## Tech Stack

| Layer         | Technology                                                   |
| ------------- | ------------------------------------------------------------ |
| Framework     | [Next.js 16](https://nextjs.org/) (App Router, Turbopack)    |
| Language      | TypeScript                                                   |
| Auth          | [Clerk](https://clerk.com/) (with Organizations)             |
| Database      | PostgreSQL ([Neon](https://neon.tech/))                      |
| ORM           | [Prisma](https://www.prisma.io/)                             |
| AI            | [Google Gemini](https://ai.google.dev/) (`@google/genai`)    |
| File Storage  | [Vercel Blob](https://vercel.com/storage/blob)               |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) (Base UI) + Tailwind CSS |
| Icons         | [Lucide](https://lucide.dev/)                                |

## Getting Started

### Prerequisites

- Node.js 20+
- A [Clerk](https://clerk.com/) account (for authentication)
- A [Neon](https://neon.tech/) (or any PostgreSQL) database
- A [Google AI Studio](https://aistudio.google.com/) API key (for Gemini)
- A [Vercel](https://vercel.com/) account for Blob store

### Installation

```bash
git clone https://github.com/yadaw07/Multi-tenant.git
cd Multi-tenant
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```dotenv
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Google Gemini
GEMINI_API_KEY=

BLOB_READ_WRITE_TOKEN=
```

### Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

### Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Data Model

- **User** — synced from Clerk on sign-in
- **Organization** — synced from Clerk on org creation
- **OrganizationMember** — join table (user ↔ org, with role)
- **Document** — belongs to one org and one uploader, holds AI analysis results

## License

Personal/portfolio project — not currently licensed for reuse.
