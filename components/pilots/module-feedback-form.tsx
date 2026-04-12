"use client";

import { useState } from "react";
import { useFeedback } from "@/hooks/use-feedback";

type ModuleFeedbackFormProps = {
  projectSlug: string;
  buildSlug: string;
  moduleSlug: string;
};

export function ModuleFeedbackForm({
  projectSlug,
  buildSlug,
  moduleSlug,
}: ModuleFeedbackFormProps) {
  const { submitted, submit } = useFeedback(projectSlug, buildSlug, moduleSlug);
  const [readiness, setReadiness] = useState<"not-ready" | "getting-there" | "ready" | null>(null);
  const [whatLanded, setWhatLanded] = useState("");
  const [whatsMissing, setWhatsMissing] = useState("");
  const [situation, setSituation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (submitted) {
    return (
      <div className="mt-12 pt-8 border-t border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">✓</span>
          <h3 className="text-lg font-heading font-semibold">Thanks for your feedback!</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Your input directly shapes the next iteration of this module.
        </p>
      </div>
    );
  }

  async function handleSubmit() {
    if (!readiness) return;
    setSubmitting(true);
    await submit({
      readiness,
      whatLanded: whatLanded || undefined,
      whatsMissing: whatsMissing || undefined,
      situation: situation || undefined,
    });
    setSubmitting(false);
  }

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h3 className="text-lg font-heading font-semibold mb-1">Module feedback</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Takes under 2 minutes. Your honest input shapes the next iteration.
      </p>

      {/* Signal question */}
      <div className="mb-6">
        <label className="text-sm font-medium block mb-2">
          How ready do you feel to act on this module? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {[
            { value: "not-ready" as const, label: "Not ready", sublabel: "Too many gaps" },
            { value: "getting-there" as const, label: "Getting there", sublabel: "Need more specifics" },
            { value: "ready" as const, label: "Ready", sublabel: "I know my next step" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setReadiness(option.value)}
              className={`flex-1 px-3 py-3 rounded-lg border text-center transition-colors ${
                readiness === option.value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-[10px] mt-0.5">{option.sublabel}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Open text fields */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">What landed?</label>
          <p className="text-xs text-muted-foreground mb-1.5">
            What clicked for you? A specific data point, case study, or idea.
          </p>
          <textarea
            value={whatLanded}
            onChange={(e) => setWhatLanded(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[60px] resize-y"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">What&apos;s missing or unclear?</label>
          <p className="text-xs text-muted-foreground mb-1.5">
            Where did you get stuck or feel like it didn&apos;t address your situation?
          </p>
          <textarea
            value={whatsMissing}
            onChange={(e) => setWhatsMissing(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[60px] resize-y"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Your situation</label>
          <p className="text-xs text-muted-foreground mb-1.5">
            Niche, size, stage, platform. Helps us understand whose feedback we&apos;re reading.
          </p>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[60px] resize-y"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!readiness || submitting}
        className="mt-6 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit feedback"}
      </button>
    </div>
  );
}
