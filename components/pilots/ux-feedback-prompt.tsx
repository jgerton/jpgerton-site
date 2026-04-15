"use client";

import { useState } from "react";
import { useUXFeedback } from "@/hooks/use-ux-feedback";

type UXFeedbackPromptProps = {
  projectSlug: string;
  buildSlug: string;
  onOpen: () => void;
};

export function UXFeedbackPrompt({
  projectSlug,
  buildSlug,
  onOpen,
}: UXFeedbackPromptProps) {
  const { shouldPrompt, submitted } = useUXFeedback(projectSlug, buildSlug);
  const [dismissed, setDismissed] = useState(false);

  if (!shouldPrompt || dismissed || submitted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm bg-card border border-border rounded-xl shadow-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-lg">💬</span>
        <div className="flex-1">
          <div className="text-sm font-medium mb-1">How&apos;s the site experience?</div>
          <p className="text-xs text-muted-foreground mb-3">
            You&apos;ve completed 2+ modules. Quick feedback on navigation, readability, and tools?
          </p>
          <div className="flex gap-2">
            <button
              onClick={onOpen}
              className="px-3 py-1.5 rounded-md text-xs bg-primary text-primary-foreground font-medium hover:opacity-90"
            >
              Share feedback
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 rounded-md text-xs border border-border text-muted-foreground hover:text-foreground"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
