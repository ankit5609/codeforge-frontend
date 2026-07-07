# 🖥️ CodeForge Frontend

<div align="center">

[![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-06B6D4.svg?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Radix UI](https://img.shields.io/badge/Radix_UI-Headless-8B5CF6.svg?style=for-the-badge&logo=radixui&logoColor=white)](https://www.radix-ui.com/)
[![CodeMirror](https://img.shields.io/badge/CodeMirror-6-F0DB4F.svg?style=for-the-badge&logo=codemirror&logoColor=black)](https://codemirror.net/)
[![React Router](https://img.shields.io/badge/React_Router-6-CA4245.svg?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Docker](https://img.shields.io/badge/Docker-Nginx-2496ED.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-F59E0B.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> The React/TypeScript frontend for **Distributed CodeForge** — a cloud-native AI-powered collaborative IDE.
> For full system architecture, backend services, and deployment docs, see the
> **[📖 Distributed CodeForge main repository →](https://github.com/ankit5609/Distributed-CodeForge)**

</div>

---

## ✨ Features

- 🧠 **AI Chat Panel** — streaming LLM responses with thought indicators, file edit events, image attachment support, and token usage metering
- 📂 **File Tree + Code Editor** — CodeMirror 6 editor with syntax highlighting, file tabs, diff viewer, and real-time file switching
- 🚀 **Sandbox Preview Panel** — embedded live preview of deployed runner pods via subdomain proxy
- 💳 **Billing & Subscriptions** — Stripe checkout redirect, billing portal, and subscription status display
- 🔐 **Auth Flows** — login modal, signup, forgot password, and reset password pages
- 👥 **Collaboration** — project sharing dialog with member management and role badges
- 📊 **Usage Meter** — real-time token consumption bar with plan-based limits

---

## 🗂️ Project Structure

```
src/
├── pages/              # Route-level page components
│   ├── Index.tsx           # Landing / redirect
│   ├── ProjectView.tsx     # Main IDE workspace (Chat + Editor + Preview)
│   ├── ProjectsDashboard.tsx  # Project list and creation
│   ├── Settings.tsx        # User settings and billing
│   ├── Signup.tsx          # Registration page
│   ├── ForgotPassword.tsx  # Password reset request
│   └── ResetPassword.tsx   # Password reset form
│
├── components/         # Reusable UI components
│   ├── ChatPanel.tsx       # AI chat with streaming event renderer
│   ├── ChatEventRenderer.tsx  # Renders THOUGHT / MESSAGE / FILE_EDIT events
│   ├── CodePanel.tsx       # File tree + editor panel
│   ├── CodeEditor.tsx      # CodeMirror 6 wrapper
│   ├── PreviewPanel.tsx    # Sandbox iframe preview
│   ├── FileTree.tsx        # Hierarchical file navigator
│   ├── LoginModal.tsx      # Auth modal (login + signup flows)
│   ├── ShareDialog.tsx     # Project sharing and member management
│   ├── UsageMeter.tsx      # Token usage progress bar
│   └── ui/                 # shadcn/ui base component library
│
├── hooks/              # Custom React hooks
│   └── use-stream-parser.ts   # Parses SSE XML stream into typed ChatEvent[]
│
└── lib/
    ├── api.ts          # Typed API client (all backend calls)
    ├── types.ts        # Shared TypeScript types and enums (ChatEventType, etc.)
    └── usage.ts        # Token usage derivation utilities
```

---

## 🛠️ Tech Stack

| Library | Purpose |
| :--- | :--- |
| React 18 + TypeScript | Core UI framework |
| Vite 5 | Dev server and production bundler |
| Tailwind CSS v3 + shadcn/ui | Design system and component library |
| Radix UI | Accessible headless primitives |
| CodeMirror 6 | Syntax-highlighted code editor |
| React Router 6 | Client-side routing |
| React Query (TanStack) | Server state management |
| React Hook Form + Zod | Form handling and validation |
| react-markdown + remark-gfm | Markdown rendering in chat |
| Lucide React | Icon library |
| date-fns | Date formatting |

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

---

## 🐳 Docker

The frontend is containerized with a multi-stage Nginx build:

```bash
# Build image
docker build --platform linux/amd64 -t ankit5609/codeforge-frontend:v1 .

# Run locally
docker run -p 8080:80 ankit5609/codeforge-frontend:v1
```

---

## 🔗 Related

> 📖 **[Distributed CodeForge](https://github.com/ankit5609/Distributed-CodeForge)** — Full system docs, backend services, Kubernetes manifests, CI/CD pipeline, database schemas, API reference, and local Kind + GKE deployment guides.

---

## 📜 License

MIT — see [LICENSE](LICENSE) for details.
