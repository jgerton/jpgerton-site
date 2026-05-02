import type { ExerciseConfig } from "@/content/pilots/freemium-playbook/exercise-configs";

export type { ExerciseConfig };

export const exerciseConfigs: Record<string, ExerciseConfig> = {
  ex1: {
    title: "Install and Verify vault-intake",
    fields: [
      {
        label: "Installation method",
        placeholder: "Claude Code skill path (git clone + install_skill.py) or standalone CLI only",
      },
      {
        label: "Where you invoked /vault-intake",
        placeholder: "CLI terminal / Code tab in Claude Desktop / Cowork tab in Claude Desktop",
      },
      {
        label: "Operating system",
        placeholder: "Mac / Windows / Linux",
      },
      {
        label: "Verification output",
        placeholder: "What happened when you typed /vault-intake -- describe what you saw or paste the response...",
      },
    ],
    prompt: `I'm installing vault-intake as a Claude Code skill for the Agent OS pilot.

Install steps I ran: git clone, uv sync, uv run scripts/install_skill.py, then opened a new Claude Code session and typed /vault-intake.

My installation method: [Claude Code skill path / standalone CLI only]
Where I invoked /vault-intake: [CLI terminal / Code tab in Claude Desktop / Cowork tab in Claude Desktop]
My operating system: [Mac / Windows / Linux]
What I saw when I verified: [fill in]

Help me assess whether the install succeeded. Did the skill load correctly? If something went wrong, help me diagnose it.`,
    emailBody: `Install and Verify vault-intake

Installation method (Claude Code skill path or standalone CLI):

Where you invoked /vault-intake (CLI terminal / Code tab / Cowork tab):

Operating system (Mac / Windows / Linux):

What you saw when you verified:

Any errors or issues encountered:

`,
    emailSubject: "[PILOT-AGENT-OS-EX1] Install Verification",
  },
  ex2: {
    title: "Write Your Vault Config Block",
    fields: [
      {
        label: "Vault Config block",
        placeholder: "Paste the full ## Vault Config YAML block from your vault's CLAUDE.md...",
      },
      {
        label: "Domain slugs and descriptions",
        placeholder: "List each domain slug and its description, one per line...",
      },
    ],
    prompt: `I'm writing the Vault Config block for my vault's CLAUDE.md as part of the Agent OS pilot.

The required fields are: vault_path, classification_mode, routing_mode, and domains (with slug + description per domain).

My Vault Config block:
\`\`\`yaml
[fill in]
\`\`\`

My domains (slug: description):
[fill in]

Help me assess this config:
1. Are all required fields present and correctly formatted?
2. Are my domain descriptions specific enough to classify content accurately?
3. Is there anything that would cause the config validator to fail?`,
    emailBody: `Write Your Vault Config Block

Your full Vault Config block (paste the YAML):

Your domain slugs and descriptions:

Validator output (from uv run scripts/resolve_config.py):

Any questions or things you weren't sure about:

`,
    emailSubject: "[PILOT-AGENT-OS-EX2] Vault Config Block",
  },
  ex3: {
    title: "Your First Capture",
    fields: [
      {
        label: "What you captured",
        placeholder: "Content type (transcript, article, notes...) and topic...",
      },
      {
        label: "What landed well",
        placeholder: "Domain assignment, confidence score, frontmatter accuracy, output structure...",
      },
      {
        label: "What surprised you",
        placeholder: "Anything unexpected, good or bad...",
      },
    ],
    prompt: `I'm running my first real vault-intake capture for the Agent OS pilot.

I prepared the content as plain text first (vault-intake doesn't fetch URLs directly), then ran it through the skill or CLI.

What I captured (content type and topic): [fill in]
How I ran it (Claude Code skill or uv run scripts/intake.py): [fill in]
Domain it was assigned to: [fill in]
Confidence score from frontmatter: [fill in]
What landed well: [fill in]
What surprised me: [fill in]

Help me assess this first capture. Did the domain assignment make sense? Is the confidence score reasonable for this content? What would I need to adjust for this to be consistently useful?`,
    emailBody: `Your First Capture

Content type and topic:

How you ran it (Claude Code skill or CLI):

Domain assigned and confidence score:

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
        placeholder: "One item per line: what felt slow, confusing, broken, or annoying...",
      },
    ],
    prompt: `I'm cataloging friction points from my first week with vault-intake.

My friction items (one per line):
[fill in]

Help me assess this report. Are the items specific enough to act on? Do any cluster around a single root cause? Which would you prioritize if you were fixing them?`,
    emailBody: `Friction Report

Friction items (one per line):

`,
    emailSubject: "[PILOT-AGENT-OS-EX4] Friction Report",
  },
  ex5: {
    title: "Wishes, Edge Cases, and Surprises",
    fields: [
      {
        label: "Wishes",
        placeholder: "Features or behaviors you wish existed or worked differently...",
      },
      {
        label: "Edge cases",
        placeholder: "Situations vault-intake didn't handle well, or where you weren't sure what to do...",
      },
      {
        label: "Surprises",
        placeholder: "Anything that worked better than expected, or differently than you assumed...",
      },
    ],
    prompt: `I'm doing a forward-looking feedback pass on vault-intake after using it for the Agent OS pilot.

Wishes (grounded in real workflow gaps, not hypotheticals):
[fill in]

Edge cases I hit (specific situations the tool didn't handle well):
[fill in]

Surprises (better or different than expected):
[fill in]

Help me articulate these clearly as product feedback. For each wish, push back if it sounds like a workaround rather than a genuine product gap. For edge cases, help me identify whether it's a config issue or a real product limitation.`,
    emailBody: `Wishes, Edge Cases, and Surprises

Wishes:

Edge cases:

Surprises:

`,
    emailSubject: "[PILOT-AGENT-OS-EX5] Wishes + Edge Cases + Surprises",
  },
};
