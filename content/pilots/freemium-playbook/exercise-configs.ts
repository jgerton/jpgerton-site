export type ExerciseConfig = {
  title: string;
  fields: { label: string; placeholder?: string }[];
  prompt: string;
  emailSubject: string;
};

export const exerciseConfigs: Record<string, ExerciseConfig> = {
  ex1: {
    title: "Exercise 1: Define your free tier value proposition",
    fields: [
      {
        label: "Your value proposition",
        placeholder:
          "A free member of my community gets _____, which is genuinely useful on its own even if they never upgrade.",
      },
    ],
    prompt: `I'm working through a freemium community playbook exercise. I need to define my free tier value proposition in one sentence.

The format is: "A free member of my community gets _____, which is genuinely useful on its own even if they never upgrade."

Context: The 80/20 gating principle says successful freemium products give away ~80% of value for free and gate 15-25% behind paid. My free tier needs to deliver a real result, not just a taste.

Here's what I know about my community:
- My niche/expertise: [fill in]
- What I currently offer or plan to offer: [fill in]
- Who my ideal member is: [fill in]

Help me craft this sentence. Push back if it's too vague or if the free tier sounds like it would cannibalize the paid tier.`,
    emailSubject: "[PILOT-PLAYBOOK-EX1] Free Tier Value Prop",
  },
  ex2: {
    title: "Exercise 2: Map your free vs. gate split",
    fields: [
      {
        label: "Free tier (what you give away)",
        placeholder: "List everything in your free tier...",
      },
      {
        label: "Paid tier (what you gate)",
        placeholder: "List everything behind the paywall...",
      },
    ],
    prompt: `I'm mapping out my free vs. paid content split for a Skool freemium community.

The 80/20 gating principle: give away ~80% of value for free, gate 15-25% behind paid.

Free tier should include: community feed, starter lessons/101 series, gamification, access to other free members.
Paid tier should include: deep-dive courses, tools/templates, live sessions, direct access to me, early access.

My community niche: [fill in]
What I currently have or plan to create: [fill in]

Help me create two lists (free vs. paid) and check:
1. Does free deliver a real result (not just a taste)?
2. Would someone pay monthly for the paid tier and feel good about it?
3. Can free members see what paid members are getting?`,
    emailSubject: "[PILOT-PLAYBOOK-EX2] Free vs Gate Split",
  },
  ex3: {
    title: "Exercise 3: Find your baseline numbers",
    fields: [
      {
        label: "Total free members",
        placeholder: "Number or 'starting from zero'",
      },
      { label: "Total paid members", placeholder: "Number or N/A" },
      {
        label: "Posting frequency (last 30 days)",
        placeholder: "e.g. '12 posts in 30 days' or '3x/week'",
      },
      {
        label: "Monthly churn estimate",
        placeholder: "e.g. '~10%' or 'unknown'",
      },
    ],
    prompt: `I'm documenting my community baseline numbers for a freemium playbook exercise.

I need to capture:
1. Total free members
2. Total paid members (if applicable)
3. Current posting frequency (honest count, last 30 days)
4. Best guess at monthly churn (paid members lost / paid members at start of month)

My community: [fill in platform and niche]
Current state: [fill in - existing community or starting from zero]

Help me think through these numbers honestly. If I'm starting from zero, help me set realistic expectations based on the playbook benchmarks (3-10% free-to-paid conversion, 8% monthly churn target, 3-5 posts/week for growth).`,
    emailSubject: "[PILOT-PLAYBOOK-EX3] Baseline Numbers",
  },
};
