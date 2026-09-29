# Orbbion Inspect

> **Enterprise Automotive Inspection & Real-Time Diagnostic Reporting Platform**

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.3-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.8-blue?logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Serwist-5c3bfe?logo=pwa)](https://serwist.pages.dev/)
[![Puppeteer](https://img.shields.io/badge/PDF_Engine-Puppeteer-green?logo=puppeteer)](https://pptr.dev/)

---

## 📋 Overview

**Orbbion Inspect** is a modern, enterprise-grade automotive vehicle inspection platform and quality assurance hub. Tailored for certified inspection centers (e.g. Dubai Operations Hub), fleet operators, dealerships, and field technicians, Orbbion Inspect digitizes the full multi-point vehicle diagnostic workflow from visual intake to executive A4 PDF delivery.

The platform eliminates physical paperwork, accelerates multi-point checks, verifies odometer tampering, tracks component wear, and provides an offline-first Progressive Web App (PWA) experience for remote workshops and field bays.

---

## ✨ Key Features

### 🔍 Comprehensive Multi-Point Inspection
- **Inspection & Vehicle Summary**: Detailed recording of VIN, regional specs (GCC, US, Euro, Japanese), engine displacement, transmission type, fuel type, and odometer tampering detection.
- **Wheel & Brake Subsystems**: Dedicated cards for front/rear tires, rims, brake pads, and spare wheel condition, tracking tread wear and ratings.
- **Interactive Chassis Visualizer**: Dynamic SVG subframe and body visualizer allowing inspectors to mark components as *Unchecked*, *Checked*, *Repaired*, or *Damaged* with instant visual feedback.
- **Body & Paint Diagnostics**: Panel-by-panel assessment with paint depth measurement notes and defect tracking.
- **Engine, Transmission & Electrical Diagnostics**: Subsystem checklists (fluid leaks, vibrations, battery health, onboard electronics) with pass/fail/weak status badges and custom headlines.
- **360° Photo Evidence Capture**: Categorized general photos (Exterior, Interior, Engine Bay) alongside component-specific evidence.

### 📸 Media Connection Hub
- Contextual photo assignment linking captured images directly to vehicle parts (e.g., *Rear Right Brake*, *Chassis Subframe*, *Engine Bay*).
- Integrated camera capture, gallery picker modal, direct upload, and thumbnail preview.
- Intelligent canvas-based image downscaling (1400px JPEG) to maintain 300 DPI print quality without exceeding payload limits.

### 📊 Real-Time Dashboard & Dynamic KPIs
- Live KPI statistics grid tracking:
  - **Total Inspections** with historical period comparisons.
  - **Overall Pass Rate** across completed inspections.
  - **Pending Drafts** with urgent-action flags.
  - **Flagged Defects & Tampered Odometers** with alert indicators.
  - **Active Inspectors** on duty.
- Recent inspections timeline with instant status navigation.

### 📁 Interactive Reports Catalog (`/reports`)
- Comprehensive reports repository with tab filtering:
  - **All Reports**
  - **Published**
  - **Drafts**
  - **Tampered Odometers**
  - **Flagged Defects**
- Date range filtering (*Today*, *Last 7 Days*, *Last 30 Days*, *All Time*).
- Search by VIN, vehicle make/model, inspector name, or client details.
- Batch management tools: bulk status updates, bulk deletion, report duplication, and catalog reset.

### 📄 Dual-Engine PDF Generation
- **Server-Side Puppeteer Engine (`POST /api/pdf`)**:
  - Automatically locates system Google Chrome or Microsoft Edge binaries.
  - Renders true vector multi-page A4 reports complete with headers, footers, page numbering, and high-resolution diagnostic charts.
- **Client-Side jsPDF Fallback**:
  - Canvas-driven fallback using `html-to-image` and `jsPDF` for reliable offline report export when server access is unavailable.

### 📱 Progressive Web App (PWA) & Offline First
- Powered by **Serwist** (`@serwist/next`) with custom precaching and runtime cache strategies.
- Full offline fallback route (`/~offline`) ensuring inspectors never lose access in low-connectivity underground bays.
- Installable on desktop, iOS, and Android with native application manifests.

### 🔄 State Reliability & Local Storage Sync
- 30-level undo/redo state history (`useInspectionHistory`) with autosave debouncing.
- Cross-tab and multi-window catalog synchronization using custom DOM event broadcasting (`orbbion_reports_updated`) and native `storage` listeners.
- Automated storage sanitization (`cleanReportForStorage`) that strips ephemeral in-memory `blob:` URLs to safeguard local storage quotas.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16.3.3](https://nextjs.org/) (App Router, Turbopack, React Compiler) |
| **UI Library** | [React 19.2.8](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with `@theme inline` |
| **Headless Primitives** | [@base-ui/react](https://base-ui.com/) |
| **Icons & Motion** | [Lucide React](https://lucide.dev/), [@solar-icons/react](https://solar-icons.com/), [Motion v13](https://motion.dev/) |
| **PWA & Offline** | [Serwist](https://serwist.pages.dev/) (`@serwist/next`) |
| **PDF Generation** | [Puppeteer Core](https://pptr.dev/), [jsPDF](https://github.com/parallax/jsPDF), [html-to-image](https://github.com/bubkoo/html-to-image) |
| **Date & Form Utilities**| [date-fns](https://date-fns.org/), [react-day-picker](https://daypicker.dev/), [clsx](https://github.com/lukeed/clsx), [tailwind-merge](https://github.com/dcastilho/tailwind-merge) |

---

## 📂 Project Structure

```text
orbbion-inspect/
├── public/                       # Static public assets (logos, icons, manifests)
├── src/
│   ├── app/                      # Next.js 16 App Router
│   │   ├── page.tsx              # Executive Dashboard
│   │   ├── layout.tsx            # Global layout with typography & viewport
│   │   ├── globals.css           # Tailwind v4 configuration, theme variables & print CSS
│   │   ├── manifest.ts           # PWA Web App Manifest
│   │   ├── sw.ts                 # Serwist service worker & caching strategy
│   │   ├── ~offline/             # Offline fallback screen
│   │   ├── inspect/
│   │   │   └── page.tsx          # Full inspection workspace & visualizers
│   │   ├── reports/
│   │   │   └── page.tsx          # Reports directory & catalog manager
│   │   └── api/
│   │       └── pdf/
│   │           └── route.ts      # Server-side Puppeteer PDF rendering endpoint
│   ├── components/               # Modular UI components
│   │   ├── body/                 # Body panels & paint measurement
│   │   ├── chassis/              # Chassis subframe SVG visualizer
│   │   ├── dashboard/            # KPI stats grid, dashboard header & recent cards
│   │   ├── electrical/           # Electronics & wiring checklists
│   │   ├── engine/               # Engine bay diagnostics & checks
│   │   ├── general-photos/       # 360° exterior, interior, engine gallery
│   │   ├── interior-exterior/    # Seats, upholstery, and cabin inspection
│   │   ├── layout/               # AppShell, navigation sidebar & toast bus
│   │   ├── sections/             # Diagnostic cards & photo drawer
│   │   ├── transmission/         # Gearbox, drivetrain, clutch evaluation
│   │   └── ui/                   # Atoms, modals, date/time pickers, visualizers
│   ├── constants/                # Domain models, inspection checkpoints & defaults
│   │   ├── dashboard.ts          # Initial KPI seed values & sample reports
│   │   ├── default-report.ts     # Blank & default inspection data blueprints
│   │   ├── inspection-points.ts  # Standard checklists for engine/electrical/transmission
│   │   ├── options.ts            # Dropdown selections (makes, models, statuses)
│   │   ├── sections.ts           # Inspection section ordering & metadata
│   │   ├── vehicle-options.ts    # Vehicle classifications & technical specs
│   │   └── visualizers.ts        # SVG coordinates & inspection nodes
│   └── lib/                      # Core business logic & services
│       ├── inspection-types.ts   # TypeScript interfaces for inspection reports
│       ├── reports-data.ts       # Catalog storage helpers, KPI math & event notifications
│       ├── media-connection-context.tsx # Media assignment React context
│       ├── media-targets.ts      # Registry of vehicle media target slots
│       ├── pdf-export.ts         # Dual-engine PDF export pipeline
│       ├── use-inspection-history.ts # Undo/redo state management
│       ├── image-upload-utils.ts # Image resizing & compression utilities
│       └── utils.ts              # Tailwind class merging utility
├── components.json               # shadcn component configuration
├── next.config.ts                # Next.js configuration (Serwist, Turbopack, React Compiler)
├── package.json                  # Scripts & project dependencies
├── tsconfig.json                 # TypeScript compiler configuration & path aliases
├── AGENTS.md                     # Directives & engineering guide for AI agents
└── CLAUDE.md                     # Claude Code development instructions
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm` or `pnpm`
- **Browser for PDF Export**: Google Chrome or Microsoft Edge installed on the host system (required for server-side Puppeteer PDF rendering).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Aswin-Venu-M/orbbion-inspect.git
   cd orbbion-inspect
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:5173](http://localhost:5173).

> [!NOTE]
> The dev server runs on port **`5173`** as configured in `package.json` (`next dev -p 5173`).

---

## 📜 Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **`npm run dev`** | `next dev -p 5173` | Runs the development server with Turbopack and React Compiler on port 5173 |
| **`npm run build`** | `next build` | Compiles production assets and generates PWA service worker bundle |
| **`npm run start`** | `next start` | Runs the compiled production server |
| **`npm run lint`** | `eslint` | Validates codebase against ESLint rules and Next.js compiler checks |

---

## 🔄 Inspection Lifecycle & Workflow

```text
[1. Dashboard /] ──► [2. Create or Load Inspection] ──► [3. Inspection Form /inspect]
                             │                                    │
                             ▼                                    ▼
                 [Pick Template / Catalog]                [Fill Vehicle Details]
                                                                  │
                             ┌────────────────────────────────────┴────────────────────────────────────┐
                             ▼                                    ▼                                    ▼
                   [Multi-Point Checks]                 [Interactive Chassis]                [Media Hub]
                   (Engine, Brakes, Elec)               (Map Damaged/Repaired)               (Attach Photos)
                             │                                    │                                    │
                             └────────────────────────────────────┬────────────────────────────────────┘
                                                                  ▼
                                                      [Preview Mode (A4 Print)]
                                                                  │
                                      ┌───────────────────────────┴───────────────────────────┐
                                      ▼                                                       ▼
                            [Server PDF Route]                                      [Client jsPDF Fallback]
                            (Puppeteer A4 Export)                                   (Offline Canvas Export)
                                      │                                                       │
                                      └───────────────────────────┬───────────────────────────┘
                                                                  ▼
                                                      [Publish to Catalog /reports]
```

1. **Intake & Verification**: Create a new report or pick a draft from the Dashboard. Capture VIN, vehicle specifications, odometer reading, and check for odometer tampering.
2. **Subsystem Assessment**: Step through guided inspection modules:
   - Wheels, Rims, and Brakes.
   - Body panels, paint meter readings, and scratch/dent mapping.
   - Chassis subframe status mapped onto the interactive visualizer.
   - Interior upholstery and cabin electrical controls.
   - Mechanical diagnostics for engine bay, transmission, and fluid lines.
3. **Evidence Attachment**: Take or upload photos in the Media Drawer. Assign each photo to its corresponding component slot using the Media Assign modal.
4. **Validation & Preview**: Switch between **Edit Mode** and **View/Preview Mode** to inspect multi-page A4 document pagination, pass/fail scores, and layout.
5. **Export & Distribution**: Trigger PDF export. The system sends the compiled layout to the Puppeteer endpoint (`/api/pdf`) or falls back to client-side jsPDF if offline.
6. **Catalog Synchronization**: Save or publish the report to the local catalog (`/reports`), updating dashboard KPIs in real time.

---

## 🖨️ PDF Generation Architecture

The export pipeline is designed to generate publication-grade vector A4 documents:
- **Style Inlining**: `collectDocumentStyles()` gathers all active stylesheets and inline tags to ensure complete CSS preservation without external asset blocking.
- **Image Compression**: `compressAndEncodeImage()` resizes large camera uploads to max 1400px JPEG to keep JSON transfer sizes lightweight while retaining crisp print clarity.
- **Puppeteer Discovery**: Automatically identifies local browser binaries across Windows, macOS, and Linux:
  - Windows: Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`) and Edge (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`).
  - macOS: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
  - Linux: `/usr/bin/google-chrome`, `/usr/bin/chromium`.
- **Custom Environment Override**: Set `PUPPETEER_EXECUTABLE_PATH` to specify a custom Chromium path in containerized environments (Docker/Kubernetes).

---

## 📶 PWA & Offline Support

- **Service Worker (`src/app/sw.ts`)**: Built using Serwist with automatic precaching of production JavaScript, CSS, and web fonts.
- **Runtime Caching**: Handles document navigation with automatic fallback to `src/app/~offline` when disconnected.
- **Client Persistence**: Full inspection state and catalog records persist in `localStorage`, allowing technicians to work seamlessly in basements and remote lots.

---

## 🤝 Contributing & Code Guidelines

- **TypeScript Strictness**: Always use explicit types from `@/lib/inspection-types` and avoid `any`.
- **React Compiler Purity**: Ensure components and hooks follow the Rules of React without mutating props or state in place.
- **Tailwind v4**: Modify tokens inside `src/app/globals.css` using `@theme inline`. Do not introduce a `tailwind.config.js` file.
- **AI Agent Directives**: If contributing via AI tools or pair programming agents, refer to:
  - [AGENTS.md](file:///d:/Projects/Freelance/orbbion/orbbion-inspect/AGENTS.md) for agent operational guidance.
  - [CLAUDE.md](file:///d:/Projects/Freelance/orbbion/orbbion-inspect/CLAUDE.md) for Claude Code instructions.

---

## 📄 License

Proprietary — Developed for Orbbion. All rights reserved.
