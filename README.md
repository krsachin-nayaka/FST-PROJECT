# PhishGuard — Intelligent URL Risk Analyzer & Phishing Awareness Dashboard

> **Academic Submission Details**
> - **Student Name:** K R SACHIN
> - **USN:** 1NH23CS106
> - **Course:** Full Stack Technologies
> - **Project:** Intelligent URL Risk Analyzer & Phishing Awareness Dashboard

---

## 1. Project Overview

**PhishGuard** is a full-stack cybersecurity application designed to deconstruct, evaluate, and explain phishing indicators in web links. Instead of relying on opaque black-box models, PhishGuard implements a deterministic, multi-heuristic scoring engine (9 distinct rules) that safely inspects URL syntax without generating network traffic toward the untrusted target destination.

The application includes:
- **Real-Time URL Risk Analyzer** with immediate rule violation breakdowns and actionable safety recommendations.
- **MongoDB Persistence Layer** with Mongoose models, indexing, and an embedded persistent disk-backed storage engine.
- **Threat Analytics Dashboard** with Recharts data visualizations showing risk distributions, daily scan velocity, and indicator frequency.
- **Paginated Scan History** supporting live hostname search, risk filtering, custom sorting, JSON export, and single or bulk deletion.
- **Phishing Awareness Guide & 8-Question Interactive IQ Quiz** with instant educational feedback and scoring.

---

## 2. Technology Stack

### Frontend
- **React 19** with functional components and modern hooks
- **Vite 6** build and development tooling
- **Tailwind CSS v4** with dark navy/teal cyber aesthetic
- **Recharts** for interactive Area, Donut, and Bar charts
- **Lucide React** for cybersecurity iconography
- **Axios** for centralized REST API communication

### Backend
- **Node.js v22** (ES Modules)
- **Express.js 4** application router
- **MongoDB & Mongoose 9** schema validation and indexing
- **Helmet** for HTTP security headers
- **express-rate-limit** for API rate limiting
- **Zod 4** for request validation
- **Google Safe Browsing v4** optional provider integration

### Testing & QA
- **Vitest** test runner
- **Supertest** HTTP integration testing
- 23 automated tests (15 heuristic rules + 8 REST endpoints)

---

## 3. Project Directory Structure

```text
PhishGuard/
├── .data/                               # Embedded persistent store (when local MongoDB is absent)
│   └── scans.json
├── server/                              # Backend Architecture
│   ├── config/
│   │   ├── env.ts                       # Validated environment configuration via Zod
│   │   └── rules.config.ts              # 9-rule weights, thresholds, and keyword dictionaries
│   ├── controllers/
│   │   └── scan.controller.ts           # Scan creation, retrieval, deletion, analytics, health
│   ├── middleware/
│   │   ├── errorHandler.ts              # Centralized error handler
│   │   └── validate.ts                  # Zod request schema validator middleware
│   ├── models/
│   │   └── scan.model.ts                # Mongoose schema, TypeScript interfaces, and indexes
│   ├── routes/
│   │   └── scan.routes.ts               # Express API routes (/api/scans, /api/analytics, /api/health)
│   ├── services/
│   │   ├── analyzer.service.ts          # Deterministic 9-rule static heuristic engine & privacy redaction
│   │   ├── db.service.ts                # Dual-layer storage service (MongoDB + Embedded fallback)
│   │   └── safeBrowsing.service.ts      # Optional Google Safe Browsing API v4 client
│   ├── tests/
│   │   ├── analyzer.test.ts             # 15 unit tests covering heuristics, redaction, and boundaries
│   │   └── api.test.ts                  # 8 integration tests covering all REST endpoints with Supertest
│   └── app.ts                           # Express app factory with Helmet, CORS, and rate limiting
├── src/                                 # Frontend Tier
│   ├── api/
│   │   └── client.ts                    # Axios client instance with typed helper methods
│   ├── components/
│   │   ├── common/
│   │   │   ├── Modal.tsx                # Accessible backdrop dialog component
│   │   │   ├── RiskBadge.tsx            # Color-coded Low/Medium/High indicator badge
│   │   │   └── ScoreGauge.tsx           # Circular SVG risk score gauge (0-100)
│   │   ├── dashboard/
│   │   │   ├── QuickAnalyzer.tsx        # Inline scan submission widget
│   │   │   └── StatCard.tsx             # Metric KPI card
│   │   ├── analyzer/
│   │   │   └── IndicatorList.tsx        # Expandable heuristic findings list
│   │   ├── history/
│   │   │   └── ScanDetailModal.tsx      # Full report modal with recommendations
│   │   └── layout/
│   │       ├── Navbar.tsx               # Student badge, health pill, theme toggle
│   │       └── Sidebar.tsx              # Responsive sidebar navigation
│   ├── context/
│   │   ├── ThemeContext.tsx             # Dark/Light theme manager
│   │   └── ToastContext.tsx             # Alert notification toast system
│   ├── pages/
│   │   ├── DashboardPage.tsx            # Main overview with metrics and charts
│   │   ├── AnalyzerPage.tsx             # Dedicated URL Risk Analyzer
│   │   ├── HistoryPage.tsx              # Searchable, paginated scan history
│   │   ├── AnalyticsPage.tsx            # In-depth threat composition charts
│   │   ├── AwarenessPage.tsx            # Phishing guide and 8-question quiz
│   │   └── AboutPage.tsx                # Student details, methodology, architecture
│   ├── types/
│   │   └── index.ts                     # TypeScript shared interfaces
│   ├── App.tsx                          # Root layout container
│   ├── index.css                        # Tailwind CSS imports and cyber scrollbars
│   └── main.tsx                         # React 19 entry point
├── server.ts                            # Full-stack server entry point (Express + Vite middlewares)
├── .env.example                         # Environment variable template
├── .gitignore                           # Excludes node_modules, .env, and local database artifacts
├── metadata.json                        # AI Studio app metadata
├── package.json                         # Dependencies and lifecycle scripts
├── tsconfig.json                        # TypeScript configuration
└── vite.config.ts                       # Vite bundling configuration
```

---

## 4. Deterministic Heuristics & Scoring Methodology

The URL analyzer detects 9 key threat characteristics statically without accessing the target:

| Rule Identifier | Weight | Indicator Description | Threat Rationale |
|---|---|---|---|
| `HTTP_INSECURE` | +25 | Unencrypted HTTP Transport | Plaintext data transmission vulnerable to interception and MitM |
| `IP_ADDRESS_HOST` | +35 | Raw IP Address Hostname | Targets raw numeric IP (e.g. 192.168.1.1) instead of registered domain |
| `PUNYCODE_DOMAIN` | +25 | Punycode / Homograph (xn--) | International character substitution to spoof recognizable brand names |
| `SUSPICIOUS_AT_SYMBOL`| +25 | Embedded Userinfo / @ Symbol | Browser discards prefix text before `@`, sending user to unexpected host |
| `SUSPICIOUS_KEYWORDS` | +20 | High-Risk Security Terms | Contains keywords like `login`, `verify`, `account`, `update`, `banking` |
| `EXCESSIVE_SUBDOMAINS`| +20 | Subdomain Stacking (≥3 levels) | Prepends brand names before attacker-owned top-level domains |
| `UNUSUAL_PORT` | +20 | Non-Standard Service Port | Uses port other than 80/443 to bypass standard perimeter filters |
| `UNUSUAL_LENGTH` | +15 | Suspicious URL Length (>75 chars) | Conceals malicious query parameters or embeds obfuscated payloads |
| `ENCODED_EVASION` | +15 | Heavy Percent-Encoding | Hex evasion sequences (`%2e`, `%2f`, `%25`) used to circumvent basic filters |

### Risk Categories:
- **Low Risk (0–29):** Standard baseline hygiene; no critical indicators triggered.
- **Medium Risk (30–59):** Heuristic red flags detected; proceed with extreme caution.
- **High Risk (60–100):** Multiple compounding threat signals; potential phishing trap.

### Privacy Redaction:
All sensitive query parameters (`token`, `password`, `key`, `auth`, `secret`, `session`, `code`) are replaced with `[REDACTED]` and fragments (`#...`) are removed before database persistence.

---

## 5. Prerequisites

- **Node.js:** v18.0.0 or higher (v22 recommended)
- **npm:** v9.0.0 or higher
- **MongoDB:** (Optional) Local or Atlas MongoDB instance (e.g. `mongodb://127.0.0.1:27017/phishguard`). If not running, the embedded persistent storage automatically activates with zero downtime.

---

## 6. Installation & Setup

1. **Clone the repository and enter directory:**
   ```bash
   cd PhishGuard
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```

   Configure `.env` as required:
   ```dotenv
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/phishguard
   CLIENT_ORIGIN=http://localhost:3000
   GOOGLE_SAFE_BROWSING_API_KEY=
   ```

---

## 7. Run Commands

- **Start Full-Stack Development Server:**
  ```bash
  npm run dev
  ```
  Runs the unified Express + Vite server at `http://localhost:3000`.

- **Run Automated Tests:**
  ```bash
  npm test
  ```
  Executes all 23 Vitest unit and integration tests.

- **Run TypeScript Lint Check:**
  ```bash
  npm run lint
  ```

- **Build for Production:**
  ```bash
  npm run build
  ```

- **Start in Production Mode:**
  ```bash
  npm start
  ```

---

## 8. REST API Documentation

| Method | Endpoint | Description | Query / Body Parameters |
|---|---|---|---|
| `POST` | `/api/scans` | Analyzes a URL and stores the record | `{ "url": "https://..." }` |
| `GET` | `/api/scans` | Retrieves paginated scan history | `?page=1&limit=10&search=paypal&riskCategory=High&sortBy=createdAt&sortOrder=desc` |
| `GET` | `/api/scans/:id` | Retrieves a specific scan record | URL parameter `id` |
| `DELETE` | `/api/scans/:id`| Deletes a single scan record | URL parameter `id` |
| `DELETE` | `/api/scans` | Purges all scan records | None |
| `GET` | `/api/analytics` | Aggregated threat analytics & metrics | None |
| `GET` | `/api/health` | Service and database health check | None |

---

## 9. Troubleshooting

- **MongoDB Connection Warning:**
  If MongoDB is not running locally, PhishGuard logs `⚠️ MongoDB connection could not be established; running with embedded persistent storage`. The application remains 100% operational with file-backed persistence in `.data/scans.json`.
- **Port In Use:**
  If port 3000 is occupied, set `PORT=3001` (or desired port) in `.env`.
- **Google Safe Browsing:**
  If `GOOGLE_SAFE_BROWSING_API_KEY` is not provided, the scanner accurately marks Google Safe Browsing status as `NOT_CONFIGURED` without failing the heuristic analysis.
