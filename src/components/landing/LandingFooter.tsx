import { Link } from "react-router-dom";

const LandingFooter = () => (
  <footer
    className="pt-14 pb-8"
    style={{ borderTop: "1px solid var(--lp-border)", background: "rgba(10,13,18,0.6)" }}
  >
    <div className="lp-container">
      <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-8 md:gap-6">

        <div className="col-span-2 md:col-span-1">
          <div
            className="flex items-center gap-2.5 font-bold text-[18px] mb-3"
            style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
          >
            <img
              src="/logo.png"
              alt="CodeForge"
              width="24"
              height="24"
              className="w-6 h-6 object-contain rounded-md"
            />
            CodeForge
          </div>
          <p className="text-[13.5px] leading-relaxed max-w-sm" style={{ color: "var(--lp-ink-dim)" }}>
            An AI-native cloud IDE for building React apps — real files, real Kubernetes sandboxes, live from the first prompt.
          </p>
        </div>


        <FooterCol
          title="Product"
          items={[
            { label: "How it works", href: "#how-it-works" },
            { label: "Workspace", href: "#workspace" },
            { label: "Infrastructure", href: "#infrastructure" },
            { label: "Pricing", href: "#pricing" },
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            { label: "Log in", to: "/login" },
            { label: "Sign up", to: "/signup" },
          ]}
          items={[{ label: "View plans", href: "#pricing" }]}
        />
        <FooterCol
          title="Company"
          items={[
            { label: "Status", href: "#" },
            { label: "Contact", href: "#" },
            { label: "Privacy", href: "#" },
            { label: "Terms", href: "#" },
          ]}
        />
      </div>

      <div
        className="mt-10 pt-5 flex flex-wrap items-center justify-between gap-3 text-[13px]"
        style={{ borderTop: "1px solid var(--lp-border)", color: "var(--lp-ink-faint)" }}
      >

        <span style={{ fontFamily: "JetBrains Mono, monospace" }}>
          © {new Date().getFullYear()} CodeForge Labs
        </span>
        <span style={{ fontFamily: "JetBrains Mono, monospace" }}>
          Built with real files, on real infrastructure.
        </span>
      </div>
    </div>
  </footer>
);

const FooterCol = ({
  title,
  items = [],
  links = [],
}: {
  title: string;
  items?: { label: string; href: string }[];
  links?: { label: string; to: string }[];
}) => (
  <div>
    <h4
      className="text-[11px] uppercase tracking-wider mb-3 font-mono"
      style={{ color: "var(--lp-ink-faint)", fontFamily: "JetBrains Mono, monospace" }}
    >
      {title}
    </h4>
    <ul className="flex flex-col gap-2">

      {links.map((l) => (
        <li key={l.label}>
          <Link
            to={l.to}
            className="text-[14px] transition-colors"
            style={{ color: "var(--lp-ink-dim)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lp-ember)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--lp-ink-dim)")}
          >
            {l.label}
          </Link>
        </li>
      ))}
      {items.map((l) => (
        <li key={l.label}>
          <a
            href={l.href}
            className="text-[14px] transition-colors"
            style={{ color: "var(--lp-ink-dim)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lp-ember)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--lp-ink-dim)")}
          >
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default LandingFooter;
