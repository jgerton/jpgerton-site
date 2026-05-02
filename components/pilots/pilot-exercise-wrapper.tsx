"use client";

import { useParams } from "next/navigation";
import { ExerciseCallout } from "./exercise-callout";
import {
  exerciseConfigs as freemiumConfigs,
  type ExerciseConfig,
} from "@/content/pilots/freemium-playbook/exercise-configs";
import { exerciseConfigs as agentOsConfigs } from "@/content/pilots/agent-os/exercise-configs";

const configsByProject: Record<string, Record<string, ExerciseConfig>> = {
  "freemium-playbook": freemiumConfigs,
  "agent-os": agentOsConfigs,
};

export function PilotExerciseWrapper({
  exerciseId,
  children,
}: {
  exerciseId: string;
  children: React.ReactNode;
}) {
  const params = useParams<{ slug?: string[] }>();
  const slugParts = params.slug ?? [];

  // URL: /pilots/docs/freemium-playbook/build-1/module-1
  // slugParts: ["freemium-playbook", "build-1", "module-1"]
  const projectSlug = slugParts[0] ?? "";
  const buildSlug = slugParts[1] ?? "";

  const projectConfigs = configsByProject[projectSlug] ?? {};
  const config = projectConfigs[exerciseId];
  if (!config) {
    console.error(`[PilotExerciseWrapper] Unknown exercise "${exerciseId}" for project "${projectSlug}"`);
    return <div>Unknown exercise: {exerciseId}</div>;
  }

  return (
    <ExerciseCallout
      exerciseId={exerciseId}
      title={config.title}
      fields={config.fields}
      prompt={config.prompt}
      emailBody={config.emailBody}
      emailSubject={config.emailSubject}
      projectSlug={projectSlug}
      buildSlug={buildSlug}
    >
      {children}
    </ExerciseCallout>
  );
}
