"use client";

import { useState, useEffect, useCallback } from "react";
import { useExercise } from "@/hooks/use-exercise";
import { useFormState } from "@/hooks/use-form-state";

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
  const exercise = useExercise(exerciseId, projectSlug, buildSlug);

  function parseResponse(raw: string): Record<string, string> {
    const result: Record<string, string> = {};
    fields.forEach((_, i) => {
      result[`field_${i}`] = "";
    });
    if (!raw) return result;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((v, i) => {
          if (i < fields.length) result[`field_${i}`] = v;
        });
      }
    } catch {
      if (fields.length === 1) result["field_0"] = raw;
    }
    return result;
  }

  function valuesToArray(vals: Record<string, string>): string[] {
    return fields.map((_, i) => vals[`field_${i}`] ?? "");
  }

  const emptyValues: Record<string, string> = {};
  fields.forEach((_, i) => {
    emptyValues[`field_${i}`] = "";
  });

  const savedParsed = exercise.response ? parseResponse(exercise.response) : undefined;

  const form = useFormState<Record<string, string>>({
    initialValues: emptyValues,
    savedValues: savedParsed,
    onSubmit: async (values) => {
      await exercise.submit(JSON.stringify(valuesToArray(values)));
    },
  });

  const autoSave = useCallback(
    async (vals: Record<string, string>) => {
      const arr = valuesToArray(vals);
      if (arr.every((v) => !v.trim())) return;
      await exercise.save(JSON.stringify(arr));
    },
    [exercise, fields],
  );

  const [autoSaveValues, setAutoSaveValues] = useState(form.values);
  useEffect(() => {
    setAutoSaveValues(form.values);
  }, [form.values]);

  useEffect(() => {
    const timer = setTimeout(() => autoSave(autoSaveValues), 2000);
    return () => clearTimeout(timer);
  }, [autoSaveValues, autoSave]);

  if (form.isSubmitted && !form.isDirty) {
    return (
      <div className="mt-4 pt-4 border-t border-indigo-500/15">
        <div className="text-xs text-muted-foreground mb-2">Your response (submitted):</div>
        {fields.map((field, i) => (
          <div key={i} className="mb-2">
            <div className="text-xs font-medium mb-1">{field.label}</div>
            <div className="text-sm text-muted-foreground bg-card rounded-md px-3 py-2 border border-border">
              {form.values[`field_${i}`] || "(empty)"}
            </div>
          </div>
        ))}
        <button
          onClick={form.edit}
          className="mt-2 text-xs text-indigo-400 hover:text-indigo-300"
        >
          Edit response
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-indigo-500/15">
      {fields.map((field, i) => (
        <div key={i} className="mb-3">
          <label className="text-xs font-medium block mb-1">{field.label}</label>
          <textarea
            value={form.values[`field_${i}`] ?? ""}
            onChange={(e) => form.setValue(`field_${i}`, e.target.value)}
            placeholder={field.placeholder || "Type your answer here..."}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[60px] resize-y"
          />
        </div>
      ))}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => void form.submit()}
            disabled={form.isSubmitting || valuesToArray(form.values).every((v) => !v.trim())}
            className="px-5 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "#6366F1" }}
          >
            {form.isSubmitting ? "Saving..." : "Save response"}
          </button>
          {form.isDirty && (
            <button
              onClick={form.reset}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">Auto-saves as you type</span>
      </div>
    </div>
  );
}
