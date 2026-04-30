"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function PilotsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const projects = useQuery(api.projects.listActiveProjects);

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-heading font-bold">Pilots</h1>
          <p className="text-lg text-muted-foreground">
            Projects I&apos;m building in public.{" "}
            {!isLoading &&
              (isAuthenticated
                ? "Pick one to follow along, run the exercises, and share what works."
                : "Sign in to follow along, run the exercises, and share what works.")}
          </p>
        </div>

        {projects === undefined ? (
          <p className="text-muted-foreground">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-muted-foreground">No active projects right now.</p>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <Link
                key={project._id}
                href={`/pilots/docs/${project.slug}`}
                className="block p-6 rounded-lg border border-border hover:border-accent transition-colors space-y-2"
              >
                <h2 className="text-xl font-heading font-semibold">
                  {project.title}
                </h2>
                <p className="text-muted-foreground">{project.description}</p>
                <span className="inline-block text-sm text-accent font-medium">
                  View project &rarr;
                </span>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && !isAuthenticated && (
          <div className="pt-8 border-t border-border">
            <p className="text-muted-foreground text-sm">
              Want to pilot a project?{" "}
              <Link href="/pilots/signin" className="text-accent hover:underline">
                Sign in with Google
              </Link>{" "}
              to get access.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
