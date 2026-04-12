"use client";

import { useState, useEffect, useCallback } from "react";
import { useExercise } from "@/hooks/use-exercise";

type Field = { label: string; placeholder?: string };

type ExerciseFormProps = {
  exerciseId: string;
  projectSlug: string;
  buildSlug: string;
  fields: Field[];
};

export function ExerciseForm({
  exerciseId,
  projectSlug,
  buildSlug,
  fields,
}: ExerciseFormProps) {
  const { response, status, save, submit } = useExercise(
    exerciseId,
    projectSlug,
    buildSlug
  );
  const [values, setValues] = useState<string[]>(
    fields.map(() => "")
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (response) {
      try {
        const parsed = JSON.parse(response);
        if (Array.isArray(parsed)) setValues(parsed);
      } catch {
        if (fields.length === 1) setValues([response]);
      }
    }
  }, [response, fields.length]);

  const autoSave = useCallback(
    async (vals: string[]) => {
      const combined = JSON.stringify(vals);
      if (combined === "[]" || vals.every((v) => !v.trim())) return;
      await save(combined);
    },
    [save]
  );

  useEffect(() => {
    const timer = setTimeout(() => autoSave(values), 2000);
    return () => clearTimeout(timer);
  }, [values, autoSave]);

  async function handleSubmit() {
    setSaving(true);
    await submit(JSON.stringify(values));
    setSaving(false);
  }

  if (status === "submitted") {
    return (
      <div className="mt-4 pt-4 border-t border-indigo-500/15">
        <div className="text-xs text-muted-foreground mb-2">Your response (submitted):</div>
        {fields.map((field, i) => (
          <div key={i} className="mb-2">
            <div className="text-xs font-medium mb-1">{field.label}</div>
            <div className="text-sm text-muted-foreground bg-card rounded-md px-3 py-2 border border-border">
              {values[i] || "(empty)"}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-indigo-500/15">
      {fields.map((field, i) => (
        <div key={i} className="mb-3">
          <label className="text-xs font-medium block mb-1">{field.label}</label>
          <textarea
            value={values[i]}
            onChange={(e) => {
              const next = [...values];
              next[i] = e.target.value;
              setValues(next);
            }}
            placeholder={field.placeholder || "Type your answer here..."}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[60px] resize-y"
          />
        </div>
      ))}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSubmit}
          disabled={saving || values.every((v) => !v.trim())}
          className="px-5 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "#6366F1" }}
        >
          {saving ? "Saving..." : "Save response"}
        </button>
        <span className="text-[10px] text-muted-foreground">Auto-saves as you type</span>
      </div>
    </div>
  );
}
