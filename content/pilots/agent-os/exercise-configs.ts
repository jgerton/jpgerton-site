import type { ExerciseConfig } from "@/content/pilots/freemium-playbook/exercise-configs";

export type { ExerciseConfig };

export const exerciseConfigs: Record<string, ExerciseConfig> = {
  ex1: {
    title: "Install and Verify vault-intake",
    fields: [
      {
        label: "Installation method",
        placeholder: "CLI / Claude Desktop / Cowork",
      },
      {
        label: "Verification output",
        placeholder: "Paste the terminal or UI confirmation here",
      },
    ],
    prompt: `I'm working through the Agent OS pilot and installing vault-intake using the method that fits my setup: CLI, Claude Desktop, or Cowork.

My installation method: [fill in]
My verification output: [fill in]

Help me assess this install. Did the installation succeed? Does the verification output confirm the right version and the right vault path?`,
    emailBody: `Install and Verify vault-intake

Installation method:

Verification output:

`,
    emailSubject: "[PILOT-AGENT-OS-EX1] Install Verification",
  },
  ex2: {
    title: "Write Your Vault Config Block",
    fields: [
      {
        label: "Vault Config block",
        placeholder: "Paste the full CLAUDE.md Vault Config block here",
      },
      {
        label: "Domain list",
        placeholder: "List the domains you included, one per line",
      },
    ],
    prompt: `I'm writing my CLAUDE.md Vault Config block for vault-intake. I need it to include my vault path, the domain list for the work I actually do, and the capture preferences that should guide what gets saved.

My Vault Config block: [fill in]
My domain list: [fill in]

Help me assess this config. Is the Vault Config block complete? Does the domain list cover my actual work without being too broad or too narrow?`,
    emailBody: `Write Your Vault Config Block

Vault Config block:

Domain list:

`,
    emailSubject: "[PILOT-AGENT-OS-EX2] Vault Config Block",
  },
  ex3: {
    title: "Your First Capture",
    fields: [
      {
        label: "What you captured",
        placeholder: "Describe the session or context you captured",
      },
      {
        label: "What landed well",
        placeholder: "What did vault-intake get right?",
      },
      {
        label: "What surprised you",
        placeholder: "Anything unexpected, good or bad",
      },
    ],
    prompt: `I'm running my first real vault-intake capture for the Agent OS pilot. This is not a test run. I want to capture something from an actual working session and judge whether the output reflects what mattered.

What I captured: [fill in]
What landed well: [fill in]
What surprised me: [fill in]

Help me assess this first capture. Did it reflect what actually mattered in the session? Did the structure feel natural for how I would want to find and reuse this later?`,
    emailBody: `Your First Capture

What you captured:

What landed well:

What surprised you:

`,
    emailSubject: "[PILOT-AGENT-OS-EX3] First Capture",
  },
  ex4: {
    title: "Friction Report",
    fields: [
      {
        label: "Friction items",
        placeholder: "One item per line",
      },
    ],
    prompt: `I'm cataloging every point of friction I've encountered so far while using vault-intake. I need one item per line, with no minimum and no maximum.

My friction items:
[fill in]

Help me assess this report. Are the friction items specific enough to act on? Do any root causes cluster around a single theme?`,
    emailBody: `Friction Report

Friction items:

`,
    emailSubject: "[PILOT-AGENT-OS-EX4] Friction Report",
  },
  ex5: {
    title: "Wishes, Edge Cases, and Surprises",
    fields: [
      {
        label: "Wishes",
        placeholder: "Features or behaviors you wish existed",
      },
      {
        label: "Edge cases",
        placeholder: "Situations vault-intake did not handle well",
      },
      {
        label: "Surprises",
        placeholder: "Anything unexpected from the pilot overall",
      },
    ],
    prompt: `I'm writing my final open reflection for the Agent OS pilot. I want to capture feature wishes, edge cases vault-intake did not handle, and anything surprising from the pilot overall.

My wishes: [fill in]
My edge cases: [fill in]
My surprises: [fill in]

Help me assess this reflection. Are my wishes grounded in real workflow gaps? Do the edge cases suggest any missing capture rules?`,
    emailBody: `Wishes, Edge Cases, and Surprises

Wishes:

Edge cases:

Surprises:

`,
    emailSubject: "[PILOT-AGENT-OS-EX5] Wishes + Edge Cases + Surprises",
  },
};
