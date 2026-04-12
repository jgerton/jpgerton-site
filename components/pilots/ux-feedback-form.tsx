"use client";

import { useState } from "react";
import { useUXFeedback } from "@/hooks/use-ux-feedback";

type UXFeedbackFormProps = {
  projectSlug: string;
  buildSlug: string;
  onClose: () => void;
};

export function UXFeedbackForm({
  projectSlug,
  buildSlug,
  onClose,
}: UXFeedbackFormProps) {
  const { submit } = useUXFeedback(projectSlug, buildSlug);
  const [navigation, setNavigation] = useState<number | undefined>();
  const [readability, setReadability] = useState<number | undefined>();
  const [exerciseTools, setExerciseTools] = useState<number | undefined>();
  const [openText, setOpenText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    await submit({
      navigation,
      readability,
      exerciseTools,
      openText: openText || undefined,
    });
    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-card border border-border rounded-xl max-w-md w-full mx-4 p-8 text-center">
          <div className="text-3xl mb-3">🙌</div>
          <h2 className="text-xl font-heading font-bold mb-2">Thanks!</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your feedback helps us make the pilot experience better for everyone.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  function RatingScale({ value, onChange, label }: { value: number | undefined; onChange: (n: number) => void; label: string }) {
    return (
      <div className="mb-5">
        <label className="text-sm font-medium block mb-2">{label}</label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                value === n
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-heading font-bold mb-1">Site experience feedback</h2>
        <p className="text-sm text-muted-foreground mb-6">
          All fields optional. Rate 1 (poor) to 5 (great).
        </p>

        <RatingScale
          value={navigation}
          onChange={setNavigation}
          label="How easy is it to find your way around?"
        />
        <RatingScale
          value={readability}
          onChange={setReadability}
          label="How readable is the content?"
        />
        <RatingScale
          value={exerciseTools}
          onChange={setExerciseTools}
          label="How useful are the exercise tools?"
        />

        <div className="mb-6">
          <label className="text-sm font-medium block mb-1">Anything else?</label>
          <textarea
            value={openText}
            onChange={(e) => setOpenText(e.target.value)}
            placeholder="What's working well? What's frustrating?"
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[80px] resize-y"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
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
