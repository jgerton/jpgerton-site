"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type UseFormStateOptions<T extends Record<string, unknown>> = {
  initialValues: T;
  savedValues?: T;
  onSubmit: (values: T) => Promise<void>;
};

type UseFormStateReturn<T extends Record<string, unknown>> = {
  values: T;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  isDirty: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submit: () => Promise<void>;
  reset: () => void;
  edit: () => void;
};

function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => a[key] === b[key]);
}

export function useFormState<T extends Record<string, unknown>>({
  initialValues,
  savedValues,
  onSubmit,
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  const referenceValues = savedValues ?? initialValues;
  const [values, setValues] = useState<T>(referenceValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const prevSavedRef = useRef(savedValues);
  const dirtyRef = useRef(false);
  const hasSubmittedRef = useRef(false);

  const isDirty = !shallowEqual(values, referenceValues);
  dirtyRef.current = isDirty;

  useEffect(() => {
    if (
      savedValues &&
      (!prevSavedRef.current || !shallowEqual(prevSavedRef.current, savedValues))
    ) {
      prevSavedRef.current = savedValues;
      if (!dirtyRef.current) {
        setValues(savedValues);
        if (hasSubmittedRef.current) {
          setIsSubmitted(true);
        }
      }
    }
  }, [savedValues]);

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      hasSubmittedRef.current = true;
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, values]);

  const reset = useCallback(() => {
    setValues(referenceValues);
  }, [referenceValues]);

  const edit = useCallback(() => {
    setIsSubmitted(false);
  }, []);

  return {
    values,
    setValue,
    isDirty,
    isSubmitting,
    isSubmitted,
    submit,
    reset,
    edit,
  };
}
