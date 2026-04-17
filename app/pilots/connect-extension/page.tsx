"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePilotProfile } from "@/hooks/use-pilot-profile";

// Narrow ambient declaration for the Chrome extension API we use on this page.
// The site does not depend on @types/chrome; runtime is guarded with
// `typeof chrome !== "undefined"`.
declare const chrome:
  | {
      runtime?: {
        sendMessage: (
          extensionId: string,
          message: unknown,
          callback: (response: unknown) => void
        ) => void;
        lastError?: { message?: string };
      };
    }
  | undefined;

export default function ConnectExtensionPage() {
  const searchParams = useSearchParams();
  const extensionId = searchParams.get("extId");
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { profile, isLoading: profileLoading, approvalStatus } =
    usePilotProfile();
  const createSession = useMutation(
    api.communityPulse.authActions.createWebSession
  );

  const [status, setStatus] = useState<
    "idle" | "connecting" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  // Auto-connect when page loads and user is ready
  const isReady =
    !authLoading &&
    !profileLoading &&
    isAuthenticated &&
    profile &&
    (approvalStatus === "approved" || approvalStatus === "auto-approved") &&
    extensionId;

  const handleConnect = async () => {
    if (!extensionId) {
      setError("Missing extension ID. Open this page from the extension.");
      return;
    }

    setStatus("connecting");
    setError(null);

    try {
      const session = await createSession();

      // Send token to extension via externally_connectable
      const runtime =
        typeof chrome !== "undefined" ? chrome?.runtime : undefined;
      if (runtime?.sendMessage) {
        runtime.sendMessage(
          extensionId,
          {
            type: "CP_AUTH",
            sessionToken: session.sessionToken,
            profile: session.profile,
          },
          (_response: unknown) => {
            if (runtime.lastError) {
              setError(
                "Could not reach the extension. Is Community Pulse installed and enabled?"
              );
              setStatus("error");
            } else {
              setStatus("success");
            }
          }
        );
      } else {
        setError(
          "Chrome extension API not available. Make sure you are using Chrome with Community Pulse installed."
        );
        setStatus("error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
      setStatus("error");
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <p className="text-fd-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Connect Extension</h1>
        <p className="text-fd-muted-foreground mb-6">
          Sign in to your jpgerton.com account to connect the Community Pulse
          extension.
        </p>
        <a
          href={`/pilots/signin?redirect=/pilots/connect-extension${extensionId ? `?extId=${extensionId}` : ""}`}
          className="inline-block px-6 py-2 bg-fd-primary text-fd-primary-foreground rounded-lg font-medium"
        >
          Sign in
        </a>
      </div>
    );
  }

  if (
    !profile ||
    (approvalStatus !== "approved" && approvalStatus !== "auto-approved")
  ) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Connect Extension</h1>
        <p className="text-fd-muted-foreground mb-6">
          You need an approved pilot profile to use Community Pulse.
        </p>
        <a
          href="/pilots/signup"
          className="inline-block px-6 py-2 bg-fd-primary text-fd-primary-foreground rounded-lg font-medium"
        >
          Create Profile
        </a>
      </div>
    );
  }

  if (!extensionId) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Connect Extension</h1>
        <p className="text-fd-muted-foreground mb-6">
          Open this page from the Community Pulse extension popup to connect
          your account.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Connect Extension</h1>

      {status === "idle" && (
        <>
          <p className="text-fd-muted-foreground mb-6">
            Connect the Community Pulse extension to your account.
          </p>
          <button
            onClick={handleConnect}
            className="inline-block px-6 py-2 bg-fd-primary text-fd-primary-foreground rounded-lg font-medium"
          >
            Connect as {profile.preferredName}
          </button>
        </>
      )}

      {status === "connecting" && (
        <p className="text-fd-muted-foreground">Connecting...</p>
      )}

      {status === "success" && (
        <div>
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">Extension Connected</p>
          <p className="text-fd-muted-foreground text-sm">
            You can close this tab. Open the extension side panel to see your
            community data.
          </p>
        </div>
      )}

      {status === "error" && (
        <>
          <p className="text-red-600 dark:text-red-400 text-sm mb-4">
            {error}
          </p>
          <button
            onClick={handleConnect}
            className="inline-block px-6 py-2 bg-fd-primary text-fd-primary-foreground rounded-lg font-medium"
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}
