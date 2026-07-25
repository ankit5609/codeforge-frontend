import { motion } from "framer-motion";
import { Server, Cloud, Database, Radio, Layout, Sparkles } from "lucide-react";
import SectionHeader from "./SectionHeader";

/**
 * Platform Architecture — grouped by capability, mirrors the real
 * Spring Boot + Kubernetes stack that powers each workspace.
 */

const GROUPS = [
  {
    icon: Server,
    tone: "ember",
    title: "Backend",
    detail:
      "Spring Boot microservices powering authentication, workspace management, and AI orchestration.",
    tech: ["Java 21", "Spring Boot", "Spring Cloud", "Spring AI"],
  },
  {
    icon: Cloud,
    tone: "teal",
    title: "Infrastructure",
    detail:
      "Containerized workloads orchestrated by Kubernetes with isolated preview sandboxes per project.",
    tech: ["Kubernetes", "Docker", "NGINX", "GKE"],
  },
  {
    icon: Database,
    tone: "brass",
    title: "Storage",
    detail:
      "Relational, vector, cache, and object storage — the durable substrate behind every workspace.",
    tech: ["PostgreSQL", "pgvector", "Redis", "MinIO"],
  },
  {
    icon: Radio,
    tone: "teal",
    title: "Messaging",
    detail:
      "Apache Kafka enables asynchronous, event-driven workflows between services.",
    tech: ["Apache Kafka"],
  },
  {
    icon: Layout,
    tone: "ember",
    title: "Frontend",
    detail:
      "React and TypeScript deliver the browser-based IDE experience, styled with Tailwind.",
    tech: ["React", "TypeScript", "Tailwind CSS"],
  },
  {
    icon: Sparkles,
    tone: "brass",
    title: "AI",
    detail:
      "Spring AI integrates with OpenRouter for streaming code generation and contextual assistance.",
    tech: ["Spring AI", "OpenRouter", "OpenAI-compatible APIs"],
  },
];

const toneColor = (t: string) =>
  t === "ember" ? "var(--lp-ember)" : t === "teal" ? "var(--lp-teal)" : "var(--lp-brass)";

const TechnologySection = () => (
  <section id="stack" className="lp-section">
    <div className="lp-container">
      <SectionHeader
        center
        eyebrow="// Platform architecture"
        title={<>Built on production-grade distributed systems.</>}
        subtitle="CodeForge combines modern backend infrastructure, AI orchestration, distributed messaging, and cloud-native deployment to deliver instant, isolated AI-powered development environments — at scale."
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
        className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {GROUPS.map((g) => {
          const Icon = g.icon;
          const c = toneColor(g.tone);
          return (
            <motion.div
              key={g.title}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.35, ease: [0.16, 0.8, 0.3, 1] }}
              className="group relative rounded-2xl p-7 flex flex-col overflow-hidden"
              style={{
                background: "var(--lp-bg-raised)",
                border: "1px solid var(--lp-border)",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-px opacity-60"
                style={{
                  background: `linear-gradient(90deg, transparent, ${c}, transparent)`,
                }}
              />
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${c}18`, color: c, border: `1px solid ${c}30` }}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-[17px] tracking-tight">{g.title}</h3>
              </div>
              <p
                className="text-[14.5px] leading-relaxed mb-5"
                style={{ color: "var(--lp-ink-dim)" }}
              >
                {g.detail}
              </p>
              <div className="mt-auto flex flex-wrap gap-1.5">
                {g.tech.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px]"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--lp-border)",
                      color: "var(--lp-ink-dim)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  </section>
);

export default TechnologySection;
