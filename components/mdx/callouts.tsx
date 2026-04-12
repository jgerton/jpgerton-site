// components/mdx/callouts.tsx
import type { ReactNode } from "react";

type CalloutProps = {
  children: ReactNode;
  title?: string;
};

const calloutStyles = {
  "key-data": { border: "#0D9488", bg: "rgba(13,148,136,0.08)", label: "Key Data", icon: "📊", labelColor: "#0D9488" },
  insight: { border: "#F59E0B", bg: "rgba(245,158,11,0.08)", label: "Insight", icon: "💡", labelColor: "#D97706" },
  action: { border: "#22C55E", bg: "rgba(34,197,94,0.08)", label: "Action", icon: "✅", labelColor: "#16A34A" },
  exercise: { border: "#6366F1", bg: "rgba(99,102,241,0.08)", label: "Exercise", icon: "🔨", labelColor: "#6366F1" },
  "watch-out": { border: "#EF4444", bg: "rgba(239,68,68,0.08)", label: "Watch Out", icon: "⚠️", labelColor: "#EF4444" },
  "open-question": { border: "#A855F7", bg: "rgba(168,85,247,0.08)", label: "What We Don't Know Yet", icon: "🔬", labelColor: "#A855F7" },
} as const;

type CalloutType = keyof typeof calloutStyles;

function Callout({ type, title, children }: CalloutProps & { type: CalloutType }) {
  const style = calloutStyles[type];

  return (
    <div
      className="rounded-r-lg my-5 px-5 py-4"
      style={{
        borderLeft: `3px solid ${style.border}`,
        background: `linear-gradient(135deg, ${style.bg}, ${style.bg.replace("0.08", "0.03")})`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{style.icon}</span>
        <span
          className="font-semibold text-xs uppercase tracking-wider"
          style={{ color: style.labelColor }}
        >
          {title || style.label}
        </span>
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function KeyData({ title, children }: CalloutProps) {
  return <Callout type="key-data" title={title}>{children}</Callout>;
}

export function Insight({ title, children }: CalloutProps) {
  return <Callout type="insight" title={title}>{children}</Callout>;
}

export function Action({ title, children }: CalloutProps) {
  return <Callout type="action" title={title}>{children}</Callout>;
}

export function Exercise({ title, children }: CalloutProps) {
  return <Callout type="exercise" title={title}>{children}</Callout>;
}

export function WatchOut({ title, children }: CalloutProps) {
  return <Callout type="watch-out" title={title}>{children}</Callout>;
}

export function OpenQuestion({ title, children }: CalloutProps) {
  return <Callout type="open-question" title={title}>{children}</Callout>;
}
