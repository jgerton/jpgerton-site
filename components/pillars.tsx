import { siteConfig } from "@/lib/site-config";

interface Pillar {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  cta: { text: string; href: string };
  highlighted?: boolean;
  badge?: string;
}

const pillars: Pillar[] = [
  {
    title: "Watch & Learn",
    subtitle: "Free on YouTube",
    description:
      "Tutorials, build logs, and real-world walkthroughs. From your first Claude Code session to building multi-agent orchestration systems.",
    features: [
      "Step-by-step tutorials for all levels",
      "Build logs showing real projects, rough edges included",
      "Tool reviews and workflow breakdowns",
      "New content weekly",
    ],
    cta: { text: "Subscribe on YouTube", href: siteConfig.author.youtube },
  },
  {
    title: "Install & Build",
    subtitle: "Open Source",
    description:
      "Plugins, skills, and agents you can install in Claude Code today. Built from real projects, tested in production workflows.",
    features: [
      "Ready-to-install Claude Code plugins",
      "Custom skills for common workflows",
      "Agent orchestration templates",
      "Full source code on GitHub",
    ],
    cta: { text: "Browse on GitHub", href: siteConfig.author.github },
    highlighted: true,
    badge: "Free & Open Source",
  },
  {
    title: "Join & Level Up",
    subtitle: "Skool Community",
    description:
      "Connect with practitioners who extend Claude Code for their own workflows. Free tier for community access, paid tier for depth.",
    features: [
      "Community of Claude Code builders",
      "Free tier: discussions and public content",
      "Paid tier: exclusive tutorials and early access",
      "Direct Q&A and feedback on your builds",
    ],
    cta: { text: "Join the Community", href: siteConfig.author.skool },
  },
];

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13.25 4.75L6 12 2.75 8.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Pillars() {
  return (
    <div className="grid gap-lg md:grid-cols-3">
      {pillars.map((pillar) => (
        <div
          key={pillar.title}
          className={`relative flex flex-col rounded-lg border p-xl shadow-sm transition-shadow duration-base hover:shadow-md ${
            pillar.highlighted
              ? "border-primary bg-accent/30 shadow-md"
              : "border-border bg-card"
          }`}
        >
          {/* Badge */}
          {pillar.badge && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
              {pillar.badge}
            </span>
          )}

          {/* Subtitle */}
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {pillar.subtitle}
          </span>

          {/* Title */}
          <h3 className="mt-sm font-heading text-h5 font-bold text-card-foreground">
            {pillar.title}
          </h3>

          {/* Description */}
          <p className="mt-sm text-sm leading-relaxed text-muted-foreground">
            {pillar.description}
          </p>

          {/* Features */}
          <ul className="mt-lg flex flex-1 flex-col gap-2.5">
            {pillar.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-card-foreground"
              >
                <CheckIcon />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            href={pillar.cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-xl inline-flex w-full items-center justify-center rounded-lg px-lg py-2.5 text-sm font-semibold transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              pillar.highlighted
                ? "bg-accent-warm text-accent-warm-foreground shadow-sm hover:brightness-110"
                : "bg-primary text-primary-foreground hover:brightness-110"
            }`}
          >
            {pillar.cta.text}
          </a>
        </div>
      ))}
    </div>
  );
}
