# BrandGuard

**AI-Powered Brand Governance Platform** — CodeNexus India Round 2

BrandGuard is a full-stack Next.js application that automates brand compliance analysis using a dual-layer engine: a deterministic rule checker and an AI engine powered by Google Gemini.

## 🚀 Judge Demo (No Registration Required)

Visit the deployed URL and click **"Try Demo"** on the landing page. Select a role:

- **Creator** — Submit marketing content, run analysis, apply/dismiss corrections
- **Manager** — View brand guidelines and submission overview  
- **Reviewer** — Review submissions, comment, approve or reject

## ✨ Features

### Brand Intelligence Engine
- **Layer A (Deterministic)**: Exact prohibited term checks, required terminology, numerical fact verification, date checks, accessibility checks
- **Layer B (AI)**: Tone analysis, unsupported claim detection, semantic guideline comparison via Google Gemini

### ProofTrace™ Evidence
Every finding includes:
- Source guideline reference
- Approved fact citation
- Affected text with offsets
- Confidence score
- Suggested correction

### HumanGate™ Approval
Complete human review workflow — AI never auto-approves:
- Creator submission
- Manager/Reviewer comments
- Revision requests
- Approval/Rejection with timestamps

### ClarityRadar Analytics
Real database aggregations for:
- Issue frequency heatmap
- Severity distribution
- Approval/revision rates
- Most violated guidelines

## 🏗️ Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 App Router, React 19, Tailwind CSS 4 |
| Backend | Next.js Route Handlers, Server Actions |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | Better Auth with RBAC |
| AI | Vercel AI SDK + Google Gemini 2.0 Flash |
| Validation | Zod (all inputs + AI outputs) |

## 🛠️ Local Development

### Prerequisites
- Node.js 20+
- A Neon PostgreSQL database URL
- A Google Gemini API key

### Setup

```bash
# Clone and install
git clone <repo-url>
cd brandguard
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
npm run db:push

# Seed demo data
npm run db:seed:demo

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:push` | Push schema to database |
| `npm run db:seed:demo` | Seed demo organization |
| `npm run db:reset-demo` | Reset demo data |
| `npm test` | Run test suite |
| `npm run type-check` | TypeScript type checking |

## 🔐 Environment Variables

See `.env.example` for all required variables.

Key variables:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Cryptographically secure random string (32+ chars)
- `GOOGLE_GENERATIVE_AI_API_KEY` — Google Gemini API key
- `DEMO_JWT_SECRET` — Secret for signing demo session JWTs

## 🧪 Testing

```bash
npm test
```

Includes:
- 20+ deterministic engine test cases
- API route integration tests
- Role permission tests

## 🚀 Deployment

Deployed on Vercel with Neon PostgreSQL integration.

Environment variables are set in the Vercel dashboard.

After deployment, run:
```
npm run db:push  # via Vercel CLI or locally
npm run db:seed:demo  # seed demo data
```

## ⚠️ AI Disclosure

Submitted content is processed by Google Gemini (via Google AI API) for brand compliance analysis. Content is not permanently stored by Google. Demo submissions use fictional data only.

## 📝 License

Built for CodeNexus India Round 2 Hackathon.
