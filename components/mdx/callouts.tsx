// components/mdx/callouts.tsx
import type { ReactNode } from "react";

type CalloutProps = {
  children: ReactNode;
  title?: string;
};

const calloutStyles = {
  "key-data": {
    label: "Key Data",
    icon: "📊",
    container: "border-primary/30 bg-primary/5 dark:border-primary/20 dark:bg-primary/5",
    labelClass: "text-primary",
  },
  insight: {
    label: "Insight",
    icon: "💡",
    container: "border-accent-warm/30 bg-accent-warm/5 dark:border-accent-warm/20 dark:bg-accent-warm/5",
    labelClass: "text-accent-warm",
  },
  action: {
    label: "Action",
    icon: "✅",
    container: "border-code-accent/30 bg-code-accent/5 dark:border-code-accent/20 dark:bg-code-accent/5",
    labelClass: "text-code-accent",
  },
  exercise: {
    label: "Exercise",
    icon: "🔨",
    container: "border-callout-exercise/30 bg-callout-exercise/5 dark:border-callout-exercise/20 dark:bg-callout-exercise/5",
    labelClass: "text-callout-exercise",
  },
  "watch-out": {
    label: "Watch Out",
    icon: "⚠️",
    container: "border-destructive/30 bg-destructive/5 dark:border-destructive/20 dark:bg-destructive/5",
    labelClass: "text-destructive",
  },
  "open-question": {
    label: "What We Don't Know Yet",
    icon: "🔬",
    container: "border-callout-question/30 bg-callout-question/5 dark:border-callout-question/20 dark:bg-callout-question/5",
    labelClass: "text-callout-question",
  },
} as const;

type CalloutType = keyof typeof calloutStyles;

function Callout({ type, title, children }: CalloutProps & { type: CalloutType }) {
  const style = calloutStyles[type];

  return (
    <div className={`rounded-lg border my-5 px-5 py-4 ${style.container}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{style.icon}</span>
        <span className={`font-semibold text-xs uppercase tracking-wider ${style.labelClass}`}>
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
