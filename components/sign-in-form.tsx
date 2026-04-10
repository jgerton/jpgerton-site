"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const formData = new FormData();
      formData.set("email", email);
      await signIn("resend", formData);
      setSent(true);
    } catch {
      setError("Something went wrong. Try again.");
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-heading font-bold">Check your email</h2>
        <p className="text-muted-foreground">
          We sent a sign-in link to <strong>{email}</strong>. Click it to access
          the pilots hub.
        </p>
        <p className="text-sm text-muted-foreground">
          Don&apos;t see it? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        className="w-full px-4 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity"
      >
        Send magic link
      </button>
    </form>
  );
}
