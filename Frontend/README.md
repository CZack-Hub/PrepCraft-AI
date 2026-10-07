# ⚡ PrepCraft AI - Frontend Client

> **Modern React 19 SPA designed with the "Electric Aurora" aesthetic, providing an interactive, intelligent interview preparation workspace.**

---

## 📋 Overview

The frontend client serves as the user-facing command center for PrepCraft AI. It connects candidates with AI-generated interview intelligence through a streamlined, responsive, and aesthetically refined interface.

Key user capabilities:
- **Dual-Input Pipeline**: Symmetrical input panels supporting both drag-and-drop PDF uploads and pasteable text with real-time character counters.
- **Dynamic Strategy Exploration**: Accordion-based question deep-dives, sample answers, evaluation criteria, and day-by-day roadmap timelines.
- **Match Analytics**: Color-coded match gauges and prioritized skill gap chips.
- **Dossier PDF Export**: One-click generation and streaming of offline interview guides.
- **Workspace Privacy**: Instant strategy deletion and one-click permanent account removal.

---

## 🛠️ Tech Stack

- **Framework**: React 19 (`19.2.0`)
- **Build Tool**: Vite 7 (`7.3.1`)
- **Routing**: React Router 7 (`7.13.0`)
- **HTTP Client**: Axios (`1.13.5`) with `withCredentials: true`
- **Styling**: SCSS via Dart Sass (`sass 1.97.3`) with modern `@use` modular architecture
- **State Architecture**: Feature-based React Context API (`AuthContext`, `InterviewContext`)
- **Linting**: ESLint 9 (`eslint 9.39.1`) with React Hooks and Fast Refresh rules

---

## 📁 Directory Structure

```text
Frontend/
├── public/
│   ├── logo.svg              # Brand vector logo (Electric Aurora theme)
│   └── vite.svg              # Favicon mark
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── hooks/        # useAuth custom hook
│   │   │   ├── pages/        # Login.jsx, Register.jsx
│   │   │   ├── services/     # auth.api.js (Axios authentication calls)
│   │   │   ├── auth.context.js
│   │   │   ├── auth.context.jsx
│   │   │   └── auth.form.scss# Auth card styling and animations
│   │   │
│   │   └── interview/
│   │       ├── hooks/        # useInterview custom hook
│   │       ├── pages/        # Home.jsx (Dashboard/Input), Interview.jsx (Report View)
│   │       ├── services/     # interview.api.js (FormData multipart calls)
│   │       ├── interview.context.js
│   │       ├── interview.context.jsx
│   │       └── style/        # home.scss, interview.scss
│   │
│   ├── style/
│   │   └── button.scss       # Global button styles, gradients, and hover glow
│   ├── App.jsx               # Route definitions & protected route guards
│   ├── main.jsx              # Application bootstrap & Context wrappers
│   └── style.scss            # Global variables, reset, and obsidian theme
├── index.html                # HTML entrypoint & favicon link
├── package.json              # Dependencies and scripts
└── vite.config.js            # Vite build configuration
```

---

## 🎨 Design System: Electric Aurora

The UI is built on an **Electric Aurora** design philosophy:

| Token | Value | Usage |
| :--- | :--- | :--- |
| **Canvas Background** | `#080C14` | Deep obsidian slate with ambient radial gradients |
| **Card Glass** | `rgba(15, 23, 42, 0.8)` | Frosted glass with 20px backdrop blur |
| **Primary Accent** | `#6366F1` | Electric Indigo for active states and focus rings |
| **Secondary Accent** | `#06B6D4` / `#38BDF8` | Radiant Cyan for AI badges, icons, and highlights |
| **Brand Tri-Gradient** | `linear-gradient(135deg, #6366F1, #8B5CF6, #06B6D4)` | Main CTA buttons and avatar badges |
| **Match High** | `#10B981` | Score >= 80% (Strong alignment) |
| **Match Medium** | `#F59E0B` | Score >= 60% (Moderate with gaps) |
| **Match Low** | `#F43F5E` | Score < 60% (Targeted prep required) |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will launch with Hot Module Replacement (HMR) at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```
Generates an optimized production build in the `dist/` folder.

### 4. Run Linter
```bash
npm run lint
```
Runs ESLint across all `.jsx` and `.js` files.

---

## 🧭 Page Overview

### 1. Authentication (`/login`, `/register`)
- Frosted glass cards with floating brand identity.
- Clean validation, inline error banners, and loading states during credential submission.

### 2. Workspace & Dashboard (`/`)
- Symmetrical dual-column inputs:
  - **Left**: Job Description via PDF file dropzone OR textarea with character counter.
  - **Right**: Candidate Profile via Resume PDF dropzone OR self-description notes.
- Recent strategies drawer showing past generated roadmaps with match score badges and delete triggers.
- Navigation header with active user chip and permanent account deletion modal.

### 3. Strategy Dossier View (`/interview/:interviewId`)
- **Score Meter**: Match percentage gauge accompanied by contextual verdict.
- **Skill Gaps Matrix**: Prioritized tags (High/Medium/Low priority) explaining what skills require immediate brush-up.
- **Technical & Behavioral Questions**: Accordion cards featuring model responses, situational objectives, and scoring rubrics.
- **Preparation Roadmap**: Chronological timeline breaking preparation into manageable phases and milestones.
- **One-Click PDF Export**: Direct button triggering server-rendered Puppeteer PDF downloads.
- **Strategy Deletion**: Delete button with custom confirmation modal for instant strategy removal.

---

## 🔌 API Integration

All API calls are routed through Axios instances configured with credentials enabled:
- **Base URL**: `http://localhost:3000` (or configured reverse proxy)
- **Session Transport**: Cookies automatically attached via `withCredentials: true`
- **Multipart Data**: File uploads automatically serialized to `FormData` boundaries for seamless Express Multer reception.
