export type ExerciseConfig = {
  title: string;
  fields: { label: string; placeholder?: string }[];
  prompt: string;
  emailBody: string;
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
    emailBody: `Exercise 1: Define your free tier value proposition

Write one sentence: "A free member of my community gets _____, which is genuinely useful on its own even if they never upgrade."

The 80/20 rule: give away ~80% of your value for free, gate 15-25% behind paid. Your free tier should deliver a real result, not just a taste.

My niche/expertise:

My value proposition sentence:

Why I think this works (or where I'm stuck):

`,
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
    emailBody: `Exercise 2: Map your free vs. gate split

Make two lists: everything in your free tier, and everything behind paid.

Check your lists against these questions:
1. Does free deliver a real result (not just a taste)?
2. Would someone pay monthly for the paid tier and feel good about it?
3. Can free members see what paid members are getting?

My community niche:

Free tier:

Paid tier:

Notes/questions:

`,
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
    emailBody: `Exercise 3: Find your baseline numbers

Document your current community numbers. If you're starting from zero, just write "starting from zero" and share what you're planning.

My community (platform, niche):

Total free members:

Total paid members:

Posting frequency (honest count, last 30 days):

Monthly churn estimate (paid members lost / paid members at start of month):

Notes/questions:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX3] Baseline Numbers",
  },
  ex4: {
    title: "Exercise 4: Configure your freemium tiers",
    fields: [
      { label: "Your niche" },
      { label: "Your price point" },
      { label: "Why you chose this price" },
    ],
    prompt: `I'm working through a freemium community playbook exercise. I need to configure my freemium tiers on Skool.

Context: The pricing framework says to research your niche (look at 5-10 comparable Skool communities), factor in your commitment level (daily interaction = higher price, weekly = lower), and account for transaction fees (Hobby plan: 10% + 30¢, Pro plan: 2.9% + 30¢). If unsure, start at $19-35/mo and add an annual option.

My niche: [fill in]
My chosen price point: [fill in]
Why I chose this price: [fill in]

Help me sanity-check this setup:
1. Is my free tier delivering real value (not just a taste)?
2. Would someone pay my price point monthly and feel good about it?
3. Am I leaving money on the table or pricing myself out of the market?`,
    emailBody: `Exercise 4: Configure your freemium tiers

Set up your free tier and one paid tier in Skool. Use the pricing framework from Module 2 to pick your price.

If you're unsure, start at $19-35/mo and add an annual option. You can always adjust.

My niche:

My price point:

Why I chose this price:

Questions or issues:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX4] Freemium Tiers Config",
  },
  ex5: {
    title: "Exercise 5: Build your Start Here module",
    fields: [
      { label: "Your quick win deliverable" },
      {
        label:
          "First result a member posted (or what you expect)",
      },
    ],
    prompt: `I'm building a Start Here module for my Skool community as part of a freemium playbook exercise.

Context: The Start Here module should have 2 lessons: a welcome lesson and a quick win lesson. The quick win must produce a specific deliverable the member can post in the community. Quick wins matter because they drive Day 1 activation and set the tone for what membership looks like.

My community niche: [fill in]
My quick win deliverable: [fill in]
What I expect (or what a member actually posted): [fill in]

Help me evaluate:
1. Is my quick win specific enough? A good quick win produces something concrete (a draft, a list, a plan, a score) not just a feeling.
2. Is it completable in under 30 minutes?
3. Does it tie directly to why someone joined the community?`,
    emailBody: `Exercise 5: Build your Start Here module

Create a "Start Here" module in your Skool Classroom with 2 lessons: welcome and quick win. Your quick win must produce a specific deliverable the member can post.

My community niche:

My quick win deliverable (what members create or produce):

First result a member posted (or what you expect if not launched yet):

Notes or questions:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX5] Start Here Module",
  },
  ex6: {
    title: "Exercise 6: Set up gamification level unlock",
    fields: [
      { label: "What you unlocked at Level 2" },
      { label: "Why this content" },
    ],
    prompt: `I'm setting up gamification level unlocks in my Skool community as part of a freemium playbook exercise.

Context: Designating one course to unlock at Level 2 creates a visible progression reward for early engagement. It should be content that's valuable enough to motivate members but not so foundational that withholding it hurts new members. The goal is a moment where members feel "I earned this."

My community niche: [fill in]
Content I unlocked at Level 2: [fill in]
Why I chose this content: [fill in]

Help me evaluate:
1. Is this content a good reward (desirable but not essential for newcomers)?
2. Does it make sense in the progression context of my community?
3. Is there a better piece of content I should consider for this slot?`,
    emailBody: `Exercise 6: Set up gamification level unlock

Designate one course that unlocks at Level 2 in your Skool community. Set the unlock level in course settings. Verify it displays as locked for new members.

My community niche:

What I unlocked at Level 2:

Why I chose this content:

Notes or questions:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX6] Level 2 Unlock",
  },
  ex7: {
    title: "Exercise 7: Choose your launch approach",
    fields: [
      { label: "Your choice: seed, co-create, or hybrid" },
      { label: "Why this approach fits your situation" },
    ],
    prompt: `I'm choosing a launch approach for my Skool community as part of a freemium playbook exercise.

Context: Three approaches exist.
- Seed: prepare 5-7 posts in draft before inviting anyone. Lower risk, higher control, but you're guessing what members want.
- Co-create: invite 5-10 founding members before you have much content. Higher engagement and ownership from those members, but messier and requires people who will actually show up.
- Hybrid: seed some posts, then invite founding members and ask for input.

My situation: [fill in - do I have an existing audience, warm relationships I can invite, or am I starting cold?]
My choice: [fill in]
My reasoning: [fill in]

Help me pressure-test this choice. What's the most likely way this approach fails for someone in my situation?`,
    emailBody: `Exercise 7: Choose your launch approach

Based on the seed vs. co-create tradeoffs from Module 3, decide which approach fits your situation.

Seed: prepare content first, then invite
Co-create: invite founding members early, build together
Hybrid: do both

My situation (existing audience, warm contacts, or starting cold):

My choice:

Why this fits my situation:

Questions or doubts:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX7] Launch Approach",
  },
  ex8: {
    title: "Exercise 8: Create your seed content or founding member invite",
    fields: [
      { label: "What you created (posts, invites, or both)" },
      { label: "How many pieces/people" },
    ],
    prompt: `I'm creating seed content or founding member invitations for my Skool community launch as part of a freemium playbook exercise.

Context:
- If seeding: write 5-7 community posts that model the kind of conversation you want (a question, a resource share, a quick tip, a win story, a challenge prompt).
- If co-creating: write a personal invitation for 5-10 founding members explaining what the community is, that you're building it together, and what you're asking them to do.
- If hybrid: do both.

My approach: [fill in - seed, co-create, or hybrid]
My community niche: [fill in]
What I created: [fill in]
How many posts or people: [fill in]

Help me evaluate what I created:
1. For seed posts: do they model the behavior I want from members? Are they diverse in format (question, tip, win, resource, challenge)?
2. For invitations: is the ask clear? Does it explain what founding membership means?`,
    emailBody: `Exercise 8: Create your seed content or founding member invite

Seed approach: write 5-7 community posts (question, tip, win, resource, challenge).
Co-create approach: write personal invitations for 5-10 founding members.
Hybrid: do both.

My approach:

My community niche:

What I created (brief description):

How many pieces/people:

Notes or questions:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX8] Seed Content or Founding Invite",
  },
  ex9: {
    title: "Exercise 9: Define your Day 1 activation metric",
    fields: [
      {
        label:
          "Your activation metric (one action that counts as activated)",
      },
    ],
    prompt: `I'm defining my Day 1 activation metric for my Skool community as part of a freemium playbook exercise.

Context: An activation metric is one specific action that means a member has gotten real value from the community. Common options: completing the Start Here quick win, posting an introduction, commenting on an existing post, completing an action post. The target is 30%+ of new members completing this action on their first day.

My community niche: [fill in]
My activation metric: [fill in]

Help me evaluate:
1. Is this a single, unambiguous action (not "engages with content" but "posts in the #intros channel")?
2. Is it something a motivated new member could realistically do on Day 1?
3. Does completing it signal genuine engagement, not just logging in?
4. Can I actually track it, or is it too manual to measure?`,
    emailBody: `Exercise 9: Define your Day 1 activation metric

Choose one action that counts as "activated" for your community. Write it down specifically. Track how many new members complete it on their first day. Target: 30%+.

My community niche:

My activation metric (one specific action):

How I'll track it:

Notes or questions:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX9] Day 1 Activation Metric",
  },
  ex10: {
    title: "Exercise 10: Set a realistic timeline",
    fields: [
      {
        label:
          "Your category (existing audience / zero + consistent / zero + limited)",
      },
      { label: "Your target date for 100 members" },
    ],
    prompt: `I'm setting a realistic growth timeline for my Skool community as part of a freemium playbook exercise.

Context: Honest benchmarks from Module 4.
- Existing audience (email list, social following): 100 members in 30-60 days is achievable.
- Starting from zero with consistent effort (3-5 posts/week + active outreach): 3-4 months to 100.
- Starting from zero with limited time: 6+ months to 100.

Most "100 in 30 days" stories involved existing audiences, not cold starts.

My situation: [fill in - which category am I in?]
My honest assessment of my time availability: [fill in]
My target date for 100 members: [fill in]

Help me gut-check this timeline. Is it too aggressive, too conservative, or realistic? What assumptions am I making that might not hold?`,
    emailBody: `Exercise 10: Set a realistic timeline

Based on the benchmarks from Module 4, choose your category and set a target date.

Categories:
- Existing audience: 100 members in 30-60 days
- Zero start + consistent effort (3-5 posts/week): 3-4 months
- Zero start + limited time: 6+ months

My category:

My target date for 100 members:

Why I chose this date:

Notes or questions:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX10] Realistic Timeline",
  },
  ex11: {
    title: "Exercise 11: Identify 3 audience spaces",
    fields: [
      { label: "Space 1 (specific name + what value you'd add)" },
      { label: "Space 2" },
      { label: "Space 3" },
    ],
    prompt: `I'm identifying 3 specific places my audience gathers online as part of a freemium community playbook exercise.

Context: Not "Reddit" but "r/specificsubreddit." Not "Facebook groups" but "the XYZ Facebook group." For each space, I need to identify what genuinely helpful value I could add there, not promotional content but real contributions that would make members glad I showed up.

My community niche: [fill in]
My target audience: [fill in]

Space 1: [fill in - specific name + what value you'd add]
Space 2: [fill in]
Space 3: [fill in]

Help me evaluate:
1. Are these spaces where my actual audience is (not where I assume they are)?
2. Is the value I'd add genuinely helpful or is it just a thin excuse to mention my community?
3. Are there higher-leverage spaces I'm missing?`,
    emailBody: `Exercise 11: Identify 3 audience spaces

List 3 specific online spaces where your target audience is active. Not "Reddit" but the specific subreddit. Not "Facebook groups" but the specific group.

For each: what genuinely helpful value could you add (not promotional)?

My community niche:

Space 1 (specific name + value you'd add):

Space 2:

Space 3:

Notes or questions:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX11] 3 Audience Spaces",
  },
  ex12: {
    title: "Exercise 12: Create your first flywheel piece",
    fields: [
      { label: "Platform you posted on" },
      { label: "Link to your public piece" },
      { label: "Results (clicks, joins, activations)" },
    ],
    prompt: `I'm creating my first content flywheel piece for my Skool community as part of a freemium playbook exercise.

Context: Take a seed post from Module 3 (or write a new one), adapt it for a public platform, and link it back to your community. The goal is to test whether public content drives community joins and activations. Track: how many people click through, how many join, how many activate.

My community niche: [fill in]
Platform I posted on: [fill in]
Link to my public piece: [fill in]
Results so far (clicks, joins, activations): [fill in]

Help me evaluate:
1. Is my CTA clear? Do readers know exactly where to go and why?
2. Does the public piece stand on its own as useful content, or does it require joining to get value?
3. Based on my results, what should I do differently in the next flywheel piece?`,
    emailBody: `Exercise 12: Create your first flywheel piece

Take a seed post from Module 3 (or write a new one), adapt it for a public platform, post it, and link back to your community. Track the results.

My community niche:

Platform I posted on:

Link to my public piece:

Results (clicks, joins, activations):

Notes or questions:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX12] First Flywheel Piece",
  },
};
