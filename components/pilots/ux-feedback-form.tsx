"use client";

import { useEffect, useRef } from "react";
import { useUXFeedback } from "@/hooks/use-ux-feedback";
import { useFormState } from "@/hooks/use-form-state";

type UXFeedbackValues = {
  navigation: string;
  readability: string;
  exerciseTools: string;
  openText: string;
};

type UXFeedbackFormProps = {
  projectSlug: string;
  buildSlug: string;
  onClose: () => void;
};

function RatingScale({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const labelId = `rating-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="mb-5">
      <div id={labelId} className="text-sm font-medium block mb-2">{label}</div>
      <div role="radiogroup" aria-labelledby={labelId} className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === String(n)}
            aria-label={`${n} out of 5`}
            onClick={() => onChange(String(n))}
            className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              value === String(n)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function UXFeedbackForm({
  projectSlug,
  buildSlug,
  onClose,
}: UXFeedbackFormProps) {
  const uxFeedback = useUXFeedback(projectSlug, buildSlug);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && dialog) {
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const form = useFormState<UXFeedbackValues>({
    initialValues: {
      navigation: "",
      readability: "",
      exerciseTools: "",
      openText: "",
    },
    savedValues: uxFeedback.response
      ? {
          navigation: uxFeedback.response.navigation?.toString() ?? "",
          readability: uxFeedback.response.readability?.toString() ?? "",
          exerciseTools: uxFeedback.response.exerciseTools?.toString() ?? "",
          openText: uxFeedback.response.openText ?? "",
        }
      : undefined,
    onSubmit: async (values) => {
      const data = {
        navigation: values.navigation ? Number(values.navigation) : undefined,
        readability: values.readability ? Number(values.readability) : undefined,
        exerciseTools: values.exerciseTools ? Number(values.exerciseTools) : undefined,
        openText: values.openText || undefined,
      };
      if (uxFeedback.submitted) {
        await uxFeedback.update(data);
      } else {
        await uxFeedback.submit(data);
      }
    },
  });

  if (form.isSubmitted && !form.isDirty) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="ux-feedback-title" tabIndex={-1} className="bg-card border border-border rounded-xl max-w-md w-full mx-4 p-8 text-center outline-none">
          <div className="text-3xl mb-3">🙌</div>
          <h2 id="ux-feedback-title" className="text-xl font-heading font-bold mb-2">Thanks!</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your feedback helps us make the pilot experience better for everyone.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={form.edit}
              className="text-sm text-primary hover:underline"
            >
              Edit your response
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="ux-form-title" tabIndex={-1} className="bg-card border border-border rounded-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto outline-none">
        <h2 id="ux-form-title" className="text-xl font-heading font-bold mb-1">Site experience feedback</h2>
        <p className="text-sm text-muted-foreground mb-6">
          All fields optional. Rate 1 (poor) to 5 (great).
        </p>

        <RatingScale
          value={form.values.navigation}
          onChange={(v) => form.setValue("navigation", v)}
          label="How easy is it to find your way around?"
        />
        <RatingScale
          value={form.values.readability}
          onChange={(v) => form.setValue("readability", v)}
          label="How readable is the content?"
        />
        <RatingScale
          value={form.values.exerciseTools}
          onChange={(v) => form.setValue("exerciseTools", v)}
          label="How useful are the exercise tools?"
        />

        <div className="mb-6">
          <label className="text-sm font-medium block mb-1">Anything else?</label>
          <textarea
            value={form.values.openText}
            onChange={(e) => form.setValue("openText", e.target.value)}
            placeholder="What's working well? What's frustrating?"
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[80px] resize-y"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => void form.submit()}
            disabled={!form.isDirty || form.isSubmitting}
            className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
          >
            {form.isSubmitting ? "Submitting..." : "Submit"}
          </button>
          {form.isDirty && (
            <button
              onClick={form.reset}
              className="px-4 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
