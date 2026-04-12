"use client";

import { useFeedback } from "@/hooks/use-feedback";
import { useFormState } from "@/hooks/use-form-state";

type FeedbackValues = {
  readiness: string;
  whatLanded: string;
  whatsMissing: string;
  situation: string;
};

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
  const feedback = useFeedback(projectSlug, buildSlug, moduleSlug);

  const form = useFormState<FeedbackValues>({
    initialValues: {
      readiness: "",
      whatLanded: "",
      whatsMissing: "",
      situation: "",
    },
    savedValues: feedback.response
      ? {
          readiness: feedback.response.readiness,
          whatLanded: feedback.response.whatLanded ?? "",
          whatsMissing: feedback.response.whatsMissing ?? "",
          situation: feedback.response.situation ?? "",
        }
      : undefined,
    onSubmit: async (values) => {
      const data = {
        readiness: values.readiness as "not-ready" | "getting-there" | "ready",
        whatLanded: values.whatLanded || undefined,
        whatsMissing: values.whatsMissing || undefined,
        situation: values.situation || undefined,
      };
      if (feedback.submitted) {
        await feedback.update(data);
      } else {
        await feedback.submit(data);
      }
    },
  });

  if (form.isSubmitted && !form.isDirty) {
    return (
      <div className="mt-12 pt-8 border-t border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">✓</span>
          <h3 className="text-lg font-heading font-semibold">Thanks for your feedback!</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Your input directly shapes the next iteration of this module.
        </p>
        <button
          onClick={form.edit}
          className="mt-3 text-sm text-primary hover:underline"
        >
          Edit your response
        </button>
      </div>
    );
  }

  const readinessOptions = [
    { value: "not-ready", label: "Not ready", sublabel: "Too many gaps" },
    { value: "getting-there", label: "Getting there", sublabel: "Need more specifics" },
    { value: "ready", label: "Ready", sublabel: "I know my next step" },
  ];

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h3 className="text-lg font-heading font-semibold mb-1">Module feedback</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Takes under 2 minutes. Your honest input shapes the next iteration.
      </p>

      <div className="mb-6">
        <label className="text-sm font-medium block mb-2">
          How ready do you feel to act on this module? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {readinessOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => form.setValue("readiness", option.value)}
              className={`flex-1 px-3 py-3 rounded-lg border text-center transition-colors ${
                form.values.readiness === option.value
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

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">What landed?</label>
          <p className="text-xs text-muted-foreground mb-1.5">
            What clicked for you? A specific data point, case study, or idea.
          </p>
          <textarea
            value={form.values.whatLanded}
            onChange={(e) => form.setValue("whatLanded", e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[60px] resize-y"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">What&apos;s missing or unclear?</label>
          <p className="text-xs text-muted-foreground mb-1.5">
            Where did you get stuck or feel like it didn&apos;t address your situation?
          </p>
          <textarea
            value={form.values.whatsMissing}
            onChange={(e) => form.setValue("whatsMissing", e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[60px] resize-y"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Your situation</label>
          <p className="text-xs text-muted-foreground mb-1.5">
            Niche, size, stage, platform. Helps us understand whose feedback we&apos;re reading.
          </p>
          <textarea
            value={form.values.situation}
            onChange={(e) => form.setValue("situation", e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[60px] resize-y"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => void form.submit()}
          disabled={!form.values.readiness || !form.isDirty || form.isSubmitting}
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {form.isSubmitting ? "Submitting..." : "Submit feedback"}
        </button>
        {form.isDirty && (
          <button
            onClick={form.reset}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
