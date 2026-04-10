"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProjectPage() {
  const params = useParams<{ project: string }>();
  const project = useQuery(api.projects.getProject, { slug: params.project });
  const builds = useQuery(api.projects.getBuildsForProject, {
    projectSlug: params.project,
  });

  if (project === undefined || builds === undefined) {
    return (
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  if (project === null) {
    return (
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-heading font-bold">
            Project not found
          </h1>
          <Link
            href="/pilots"
            className="text-accent hover:underline mt-4 inline-block"
          >
            Back to Pilots
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Link
            href="/pilots"
            className="text-sm text-muted-foreground hover:text-accent"
          >
            &larr; All Projects
          </Link>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-heading font-bold">{project.title}</h1>
          <p className="text-lg text-muted-foreground">
            {project.description}
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-semibold">Builds</h2>
          {builds.length === 0 ? (
            <p className="text-muted-foreground">No builds published yet.</p>
          ) : (
            <div className="space-y-3">
              {builds
                .sort((a, b) => a.order - b.order)
                .map((build) => (
                  <Link
                    key={build._id}
                    href={`/pilots/${params.project}/${build.buildSlug}`}
                    className="block p-4 rounded-lg border border-border hover:border-accent transition-colors"
                  >
                    <h3 className="font-medium">{build.title}</h3>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
