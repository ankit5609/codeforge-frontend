import { LayoutGrid, Globe, Server, BarChart3, Bot, Smartphone, type LucideIcon } from "lucide-react";

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** Seed prompt used to pre-fill the create dialog / first chat message. */
  prompt: string;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start from an empty workspace.",
    icon: LayoutGrid,
    prompt: "",
  },
  {
    id: "web-app",
    name: "Web app",
    description: "A responsive React web application.",
    icon: Globe,
    prompt: "Build a modern responsive web app with a landing page and a dashboard.",
  },
  {
    id: "api-service",
    name: "API service",
    description: "A backend service with REST endpoints.",
    icon: Server,
    prompt: "Create a REST API service with CRUD endpoints and validation.",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Analytics dashboard with charts.",
    icon: BarChart3,
    prompt: "Build an analytics dashboard with charts, KPIs and a data table.",
  },
  {
    id: "ai-agent",
    name: "AI agent",
    description: "A chat-driven AI assistant app.",
    icon: Bot,
    prompt: "Build an AI agent app with a chat interface and tool calling.",
  },
  {
    id: "mobile",
    name: "Mobile",
    description: "A mobile-first progressive web app.",
    icon: Smartphone,
    prompt: "Build a mobile-first PWA with bottom navigation.",
  },
];
