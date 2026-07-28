# 🖥️ CodeForge Frontend

<div align="center">

[![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-06B6D4.svg?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Radix UI](https://img.shields.io/badge/Radix_UI-Headless-8B5CF6.svg?style=for-the-badge&logo=radixui&logoColor=white)](https://www.radix-ui.com/)
[![CodeMirror](https://img.shields.io/badge/CodeMirror-6-F0DB4F.svg?style=for-the-badge&logo=codemirror&logoColor=black)](https://codemirror.net/)
[![React Router](https://img.shields.io/badge/React_Router-6-CA4245.svg?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Docker](https://img.shields.io/badge/Docker-Nginx-2496ED.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-F59E0B.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> The React frontend for **Distributed CodeForge** — a cloud-native AI-powered full-stack application development platform.  
> For full system architecture, backend services, and deployment docs, see the  
> **[📖 Distributed CodeForge main repository →](https://github.com/ankit5609/Distributed-CodeForge)**

**🌐 Live:** [codeforge.arclite.site](https://codeforge.arclite.site)

</div>

---

## ✨ Features

- 🧠 **AI Chat Panel** — streaming LLM responses with thought indicators, file edit events, image attachment support, and token usage metering
- 📂 **File Tree + Code Editor** — CodeMirror 6 editor with syntax highlighting, file tabs, diff viewer, and real-time file switching
- 🚀 **Sandbox Preview Panel** — embedded live preview of deployed runner pods via subdomain proxy
- 💳 **Billing & Subscriptions** — Stripe checkout redirect, billing portal, and subscription status display
- 🔐 **Auth Flows** — login modal, signup, forgot password, and reset password pages with demo account support
- 👥 **Collaboration** — project sharing dialog with member management and role badges
- 📊 **Usage Meter** — real-time token consumption bar with plan-based limits
- 🏠 **Landing Page** — animated hero, features, pricing, workflow, and architecture sections

---

## 🚀 Demo Account

You can try CodeForge instantly without registering:

| Field | Value |
| :--- | :--- |
| **Email** | `demo@codeforge.com` |
| **Password** | `password123` |

Click **"Use the demo account"** on the login page to auto-fill and sign in.

---

## 🗂️ Project Structure

```
src/
├── pages/                      # Route-level page components
│   ├── Index.jsx               # Landing page
│   ├── ProjectView.jsx         # Main workspace (Chat + Editor + Preview)
│   ├── ProjectsDashboard.jsx   # Project list and creation
│   ├── Settings.jsx            # User settings and billing
│   ├── Signup.jsx              # Registration page
│   ├── ForgotPassword.jsx      # Password reset request
│   ├── ResetPassword.jsx       # Password reset form
│   ├── Success.jsx             # Post-checkout success page
│   ├── Cancel.jsx              # Post-checkout cancellation page
│   └── NotFound.jsx            # 404 page
│
├── components/
│   ├── ChatPanel.jsx           # AI chat with streaming event renderer
│   ├── ChatEventRenderer.jsx   # Renders THOUGHT / MESSAGE / FILE_EDIT events
│   ├── CodePanel.jsx           # File tree + editor panel
│   ├── CodeEditor.jsx          # CodeMirror 6 wrapper
│   ├── PreviewPanel.jsx        # Sandbox iframe preview
│   ├── FileTree.jsx            # Hierarchical file navigator
│   ├── FileTypeIcon.jsx        # Language-aware file icons
│   ├── LoginModal.jsx          # Auth modal (login + demo account)
│   ├── ShareDialog.jsx         # Project sharing and member management
│   ├── UsageMeter.jsx          # Token usage progress bar
│   ├── RuntimeErrorAlert.jsx   # Runtime error display
│   ├── KeyboardShortcuts.jsx   # Keyboard shortcut reference panel
│   ├── Logo.jsx                # Brand logo component
│   ├── RoleBadge.jsx           # Member role indicator
│   ├── StateView.jsx           # Loading / empty / error states
│   ├── auth/
│   │   └── AuthLayout.jsx      # Shared auth page layout
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── CreateProjectDialog.jsx
│   │   ├── DashboardToolbar.jsx
│   │   ├── DashboardTopBar.jsx
│   │   ├── EmptyProjectsState.jsx
│   │   ├── PlanDialog.jsx
│   │   ├── PrimaryActionsRow.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── ProjectCardSkeleton.jsx
│   │   ├── QuickStatsRow.jsx
│   │   ├── RenameProjectDialog.jsx
│   │   ├── StatCard.jsx
│   │   ├── SubscriptionBanner.jsx
│   │   └── WorkspaceHero.jsx
│   ├── landing/                # Marketing landing page sections
│   │   ├── AnimatedDemo.jsx
│   │   ├── ArchitectureSection.jsx
│   │   ├── FeaturesSection.jsx
│   │   ├── FinalCTA.jsx
│   │   ├── Hero.jsx
│   │   ├── LandingFooter.jsx
│   │   ├── LandingNav.jsx
│   │   ├── PricingSection.jsx
│   │   ├── SectionHeader.jsx
│   │   ├── TechnologySection.jsx
│   │   ├── WhyCodeForge.jsx
│   │   └── WorkflowSection.jsx
│   └── ui/                     # shadcn/ui base component library (40+ primitives)
│
├── hooks/
│   ├── use-stream-parser.js    # Parses SSE XML stream into typed ChatEvent[]
│   ├── use-mobile.jsx          # Responsive mobile breakpoint hook
│   └── use-toast.js            # Toast notification hook
│
└── lib/
    ├── api.js                  # API client (all backend REST calls + auth token helpers)
    ├── types.js                # Shared JS constants and enums (ChatEventType, etc.)
    ├── usage.js                # Token usage derivation utilities
    ├── plans.js                # Subscription plan definitions
    ├── permissions.js          # Role-based access control helpers
    ├── templates.js            # Project template definitions
    ├── formatter.js            # Output formatting utilities
    └── utils.js                # General utility functions (cn, etc.)
```

---

## 🛠️ Tech Stack

| Library | Purpose |
| :--- | :--- |
| React 18 (JSX) | Core UI framework |
| Vite 5 | Dev server and production bundler |
| Tailwind CSS v3 + shadcn/ui | Design system and component library |
| Radix UI | Accessible headless primitives |
| CodeMirror 6 | Syntax-highlighted code editor |
| React Router 6 | Client-side routing |
| Framer Motion | Animations and page transitions |
| React Hook Form + Zod | Form handling and validation |
| react-markdown + remark-gfm | Markdown rendering in chat |
| Lucide React | Icon library |
| date-fns | Date formatting |
| Vitest + Testing Library | Unit and component tests |

---

## 🚀 Running Locally

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone and install
git clone https://github.com/ankit5609/codeforge-frontend.git
cd codeforge-frontend
npm install
```

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:8080
```

```bash
# Start dev server at http://localhost:5173
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Watch mode tests
npm run test:watch
```

---

## 🐳 Docker

The frontend is containerized with a multi-stage Nginx build:

```bash
# Build image
docker build --platform linux/amd64 -t ankit5609/codeforge-frontend:v2 .

# Run locally
docker run -p 8080:80 ankit5609/codeforge-frontend:v2
```

---

## ☸️ Kubernetes Deployment

The frontend is deployed on GKE in the `codeforge-core` namespace:

```bash
# Apply deployment and service
kubectl apply -f k8s/services/frontend.yaml

# Check rollout status
kubectl rollout status deployment/codeforge-frontend -n codeforge-core

# Force a fresh rollout (e.g. after pushing a new image)
kubectl rollout restart deployment/codeforge-frontend -n codeforge-core
```

The ingress at `codeforge.arclite.site` routes `/api/*` to the `api-gateway` service and `/` to the frontend.

---

## 🔑 Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend API base URL | `""` (same origin in production) |

In production the frontend is served by Nginx on the same origin as the API gateway, so `VITE_API_URL` is left unset and all `/api` calls hit the ingress automatically.

---

## 🔗 Related

> 📖 **[Distributed CodeForge](https://github.com/ankit5609/Distributed-CodeForge)** — Full system docs, backend services, Kubernetes manifests, CI/CD pipeline, database schemas, API reference, and local Kind + GKE deployment guides.

---

## 📜 License

MIT — see [LICENSE](LICENSE) for details.
