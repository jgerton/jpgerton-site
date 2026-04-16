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
  // Build 2: Module 5 - Onboarding That Sticks
  ex13: {
    title: "Exercise 13: Write your 7-day welcome sequence",
    fields: [
      { label: "Day 1 welcome DM", placeholder: "Include personalization placeholder..." },
      { label: "Day 2 nudge (completed version)", placeholder: "What you send if they did the Start Here..." },
      { label: "Day 2 nudge (not completed version)", placeholder: "What you send if they haven't started..." },
      { label: "Day 3 community prompt", placeholder: "A specific question for your niche..." },
      { label: "Day 5 value delivery", placeholder: "A resource or insight relevant to them..." },
      { label: "Day 7 celebration / follow-up", placeholder: "Public recognition or final check-in..." },
    ],
    prompt: `I'm building a 7-day welcome sequence for my Skool community as part of a freemium playbook exercise.

Research shows: automated welcome messages alone have zero effect on retention (Wikipedia study, n=57,084). Personal touchpoints yield 30% better 90-day retention. 80% of community churn happens in the first 7 days.

The sequence structure:
- Day 1: Personal welcome DM (within 1 hour of joining)
- Day 2: Quick-win nudge (two versions: completed and not completed)
- Day 3: Community connection prompt
- Day 5: Value delivery relevant to their interests
- Day 7: Celebrate engagement or final check-in

My community niche: [fill in]
My Start Here quick win: [fill in]

Help me write each day's message. Push back if any message feels too templated, too long, or too salesy.`,
    emailBody: `Exercise 13: Write your 7-day welcome sequence

Write the actual messages for each day. Include personalization placeholders.

Day 1 welcome DM:

Day 2 nudge (if they completed Start Here):

Day 2 nudge (if they haven't):

Day 3 community prompt:

Day 5 value delivery:

Day 7 celebration / follow-up:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX13] 7-Day Welcome Sequence",
  },
  ex14: {
    title: "Exercise 14: Map your activation path",
    fields: [
      { label: "Step-by-step activation path", placeholder: "From 'member clicks join' to 'member completes first action'..." },
      { label: "Drop-off points and mitigations", placeholder: "Where could they get lost? How will you address it?" },
    ],
    prompt: `I'm mapping my Day 1 activation path for my Skool community.

Context: There's a 69% correlation between strong 7-day activation and strong 3-month retention (Amplitude). Users who perform their key action in the initial session are 3x more likely to renew. Target: 30%+ Day 1 activation rate.

For each step from "member clicks join" to "member completes first action," I need:
1. What the member sees
2. What they need to do
3. What could go wrong (drop-off point)
4. How I'll address each drop-off

My community niche: [fill in]
My activation metric: [fill in]
My Start Here quick win: [fill in]

Help me identify blind spots in my activation path.`,
    emailBody: `Exercise 14: Map your activation path

Step by step, from "member clicks join" to "member completes first action."

For each step:
- What the member sees
- What they need to do
- What could go wrong
- How you'll address it

My activation metric:

Step 1:

Step 2:

Step 3:

Step 4:

Step 5:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX14] Activation Path Map",
  },
  ex15: {
    title: "Exercise 15: Design your 90-day integration path",
    fields: [
      { label: "Phase 1: Welcome (Days 1-7)", placeholder: "What the member experiences, your actions, success metric..." },
      { label: "Phase 2: Activate (Days 8-30)", placeholder: "How you drive return visits and habit formation..." },
      { label: "Phase 3: Integrate (Days 31-90)", placeholder: "How members connect with each other, not just you..." },
    ],
    prompt: `I'm designing a 90-day integration path for my community. Members inactive in the first 90 days are 60-70% more likely to churn (i4a).

Three phases:
- Welcome (Days 1-7): First action completed, first response received
- Activate (Days 8-30): Building the return visit habit
- Integrate (Days 31-90): Connecting members to each other

For each phase I need: what the member experiences, my actions, success metric, intervention plan for quiet members.

My community niche: [fill in]
My current community size: [fill in]

Help me design Phase 2 (the hardest one). How do I drive return visits when there's not much content or activity yet?`,
    emailBody: `Exercise 15: Design your 90-day integration path

Phase 1 - Welcome (Days 1-7):
What member experiences:
My actions:
Success metric:
Intervention for quiet members:

Phase 2 - Activate (Days 8-30):
What member experiences:
My actions:
Success metric:
Intervention for quiet members:

Phase 3 - Integrate (Days 31-90):
What member experiences:
My actions:
Success metric:
Intervention for quiet members:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX15] 90-Day Integration Path",
  },
  ex16: {
    title: "Exercise 16: Write your 'going quiet' outreach message",
    fields: [
      { label: "Your outreach message", placeholder: "The DM you'd send to a member going quiet..." },
      { label: "Your trigger (days of silence before reaching out)" },
      { label: "Your process for checking who's gone quiet" },
    ],
    prompt: `I'm writing a re-engagement message for community members who've gone quiet.

Context: Churn is predictable 2-4 weeks before cancellation. A personal message to members going quiet in the first 3-5 days can recover 20-30%.

The message should:
- Acknowledge absence without guilt-tripping
- Ask an open question
- Give them an easy out ("life got busy")
- NOT mention their subscription or payment

My community niche: [fill in]
My trigger threshold: [fill in] days of silence

Help me write this message and evaluate whether it feels genuine or automated.`,
    emailBody: `Exercise 16: Write your "going quiet" outreach message

Your outreach message (the actual DM):

Your trigger (how many days of silence?):

Your process for checking who's gone quiet:

Notes or questions:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX16] Going Quiet Outreach",
  },
  // Build 2: Module 6 - Live Sessions That Justify the Price
  ex17: {
    title: "Exercise 17: Choose your live session format",
    fields: [
      { label: "Format chosen and why" },
      { label: "Day and time", placeholder: "Consider your members' time zones..." },
      { label: "First session topic" },
      { label: "Announcement paragraph" },
    ],
    prompt: `I'm choosing a live session format for my paid community.

Options: Q&A (lowest prep, depends on questions), Workshop (high value, requires prep), Office Hours (personalized, can feel unfocused), Hot Seat (intense for one member, others learn by watching), Co-working (accountability, minimal teaching).

Pick the format that: matches what members want, you can sustain weekly, produces value even at low attendance.

My community niche: [fill in]
My current paid member count: [fill in]
Format I'm leaning toward: [fill in]

Help me choose and write the announcement post.`,
    emailBody: `Exercise 17: Choose your live session format

Format chosen:

Why this format:

Day and time:

First session topic:

Announcement paragraph:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX17] Live Session Format",
  },
  ex18: {
    title: "Exercise 18: Live session debrief",
    fields: [
      { label: "How many attended?" },
      { label: "What worked?" },
      { label: "What was awkward or fell flat?" },
      { label: "Would you run the same format again?" },
    ],
    prompt: `I just ran a live session for my community and need to debrief.

My format: [fill in]
Attendance: [fill in]
What worked: [fill in]
What was awkward: [fill in]

Help me evaluate: should I stick with this format, adjust it, or try a different one? What specific changes would improve the next session?`,
    emailBody: `Exercise 18: Live session debrief

Format used:

How many attended:

What worked:

What was awkward or fell flat:

Would you run the same format again? Why/why not:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX18] Live Session Debrief",
  },
  ex19: {
    title: "Exercise 19: Design your async access system",
    fields: [
      { label: "Where recordings will live" },
      { label: "Session summary template" },
      { label: "Highlight clipping process" },
    ],
    prompt: `I'm designing an async access system for my live session recordings. 50% of registrants prefer watching replays over attending live.

I need:
1. Where recordings live (which classroom module, organized by topic not date)
2. A session summary template (2-3 takeaways, action items, recording link, discussion question)
3. A process for clipping 3-5 minute highlights

My community platform: [fill in]
My live session format: [fill in]

Help me design a system I'll actually maintain weekly.`,
    emailBody: `Exercise 19: Design your async access system

Where recordings will live:

Session summary template (what you'll post after each session):

Highlight clipping process (tools, length, where posted):

`,
    emailSubject: "[PILOT-PLAYBOOK-EX19] Async Access System",
  },
  ex20: {
    title: "Exercise 20: Design your first challenge",
    fields: [
      { label: "Challenge name and duration" },
      { label: "Price point and reasoning" },
      { label: "Daily structure (topic + deliverable per day)" },
      { label: "Upgrade offer for completers" },
    ],
    prompt: `I'm designing my first paid challenge for my community.

Context: Paid challenges see 70-80% completion (vs. 12-15% for courses). Challenge completers convert to memberships at 25-45%. Sweet spot pricing: $47-97 for first challenge.

Duration options: 5-7 days (higher completion) or 10-14 days (deeper transformation).

My community niche: [fill in]
My paid tier price: [fill in]
My target audience for the challenge: [fill in]

Help me design the daily structure and the upgrade offer. Each day should take 30-60 minutes of member time with a clear deliverable they post.`,
    emailBody: `Exercise 20: Design your first challenge

Challenge name:

Duration:

Price point and reasoning:

Daily structure:
Day 1:
Day 2:
Day 3:
Day 4:
Day 5:
Day 6:
Day 7:

Upgrade offer for completers:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX20] First Challenge Design",
  },
  // Build 2: Module 7 - Keeping Them (Churn Prevention)
  ex21: {
    title: "Exercise 21: Set up your churn dashboard",
    fields: [
      { label: "Monthly churn rate", placeholder: "(members lost / members at start) x 100" },
      { label: "Engagement rate", placeholder: "(active members / total paid) x 100" },
      { label: "Longest inactive member (days since last activity)" },
      { label: "Net member growth this month" },
    ],
    prompt: `I'm setting up a churn dashboard for my community with four metrics:
1. Monthly churn rate: (members lost / members at start) x 100. Target: under 10%.
2. Engagement rate: (members who posted/commented/reacted this week / total paid) x 100. Target: above 50%.
3. Time since last activity per member. Warning: 14+ days.
4. Net member growth: new paid minus cancelled. Target: positive every month.

My community: [fill in]
My current numbers: [fill in]

Help me interpret these numbers and identify what to focus on first.`,
    emailBody: `Exercise 21: Set up your churn dashboard

Monthly churn rate:

Engagement rate (weekly):

Longest inactive member (days):

Net member growth this month:

Where you're tracking these:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX21] Churn Dashboard",
  },
  ex22: {
    title: "Exercise 22: Content audit",
    fields: [
      { label: "Content pieces created last week (count)" },
      { label: "How many generated member-to-member conversation?" },
      { label: "How many generated only responses to you?" },
      { label: "How many generated no engagement?" },
    ],
    prompt: `I'm auditing my content output for churn risk. Research shows more than 1 new content piece per week can increase overwhelm and churn.

My content from last week: [fill in]
Member-to-member conversations generated: [fill in]
Responses only to me: [fill in]
No engagement: [fill in]

If most content generates responses to me but not member-to-member conversation, I'm creating a broadcast, not a community. Help me shift toward content that sparks peer interaction.`,
    emailBody: `Exercise 22: Content audit

Content pieces created last week:

Generated member-to-member conversation:

Generated only responses to you:

Generated no engagement:

Analysis and next steps:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX22] Content Audit",
  },
  ex23: {
    title: "Exercise 23: Re-engagement outreach message",
    fields: [
      { label: "Your outreach message template" },
      { label: "Who you'd send it to today" },
    ],
    prompt: `I'm writing a re-engagement message for paid members going quiet.

The message should reference something specific they shared, ask an open question, and NOT mention their subscription. It should feel like a genuine check-in, not a retention tactic.

My community niche: [fill in]
Member I'd send it to: [fill in]
What they last shared/discussed: [fill in]

Help me write a message that feels personal, not templated.`,
    emailBody: `Exercise 23: Re-engagement outreach message

Your outreach message template:

Who you'd send it to today (or save for later):

`,
    emailSubject: "[PILOT-PLAYBOOK-EX23] Re-engagement Outreach",
  },
  ex24: {
    title: "Exercise 24: Monthly ROI post template",
    fields: [
      { label: "Your monthly ROI post", placeholder: "Fill in with actual data from this month..." },
    ],
    prompt: `I'm creating a monthly ROI post template for my community. The goal is to remind members of the value they received, showcase wins, and create anticipation for next month.

Template structure:
- What we built (member wins)
- What we covered (weekly topics with recording links)
- Coming next month (upcoming events/content)
- Call for member wins

My community: [fill in]
This month's highlights: [fill in]

Help me fill in the template with my actual data and make it feel like a celebration, not a report.`,
    emailBody: `Exercise 24: Monthly ROI post template

This month in [your community]:

What we built:

What we covered:

Coming next month:

Call for member wins:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX24] Monthly ROI Post",
  },
  ex25: {
    title: "Exercise 25: Annual billing decision",
    fields: [
      { label: "Will you offer annual billing?", placeholder: "Yes or No" },
      { label: "Annual price and effective discount (if yes)" },
      { label: "Your reasoning" },
    ],
    prompt: `I'm deciding whether to offer annual billing for my community.

Context: Annual plans reduce churn by 9.5 percentage points (Recurly). Standard discount: 2-3 months free (17-25% off). Don't offer annual until you have 3+ months of consistent value delivery.

My monthly price: [fill in]
Months I've been running: [fill in]
My decision: [fill in]
My reasoning: [fill in]

Help me evaluate whether I'm ready for annual billing and what price makes sense.`,
    emailBody: `Exercise 25: Annual billing decision

Will you offer annual billing?

If yes, annual price and effective discount:

Your reasoning:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX25] Annual Billing Decision",
  },
  // Build 2: Module 8 - The Revenue Ladder
  ex26: {
    title: "Exercise 26: Map your revenue ladder",
    fields: [
      { label: "Layer 1: Subscription", placeholder: "What, price, when to activate, proof needed..." },
      { label: "Layer 2: Challenges", placeholder: "What, price, when to activate, proof needed..." },
      { label: "Layer 3: Digital products", placeholder: "What, price, when to activate, proof needed..." },
      { label: "Layer 4: Premium tier", placeholder: "What, price, when to activate, proof needed..." },
      { label: "Layer 5: High-ticket", placeholder: "What, price, when to activate, proof needed..." },
    ],
    prompt: `I'm mapping my revenue ladder for my community.

The layers: subscription ($19-49/mo), challenges ($47-197), digital products (bundled as perks), premium tier ($97-200+/mo), high-ticket coaching ($500-10K+).

Build bottom-up: subscription first, then challenges at 50+ free members, then products, then premium at 30+ paid, then coaching last.

My niche: [fill in]
My current community size: [fill in]
My subscription price: [fill in]

For each layer: what I'd offer, price point, activation milestone, and what proof from the layer below makes it easy to sell.`,
    emailBody: `Exercise 26: Map your revenue ladder

Layer 1 - Subscription:
Offer:
Price:
Activate when:
Proof needed:

Layer 2 - Challenges:
Offer:
Price:
Activate when:
Proof needed:

Layer 3 - Digital products:
Offer:
Price:
Activate when:
Proof needed:

Layer 4 - Premium tier:
Offer:
Price:
Activate when:
Proof needed:

Layer 5 - High-ticket:
Offer:
Price:
Activate when:
Proof needed:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX26] Revenue Ladder Map",
  },
  ex27: {
    title: "Exercise 27: Design your challenge funnel",
    fields: [
      { label: "Challenge name, duration, and price" },
      { label: "Announcement post (Proof > Context > Small Ask)" },
      { label: "Three exit-path offers with pricing" },
      { label: "When you'll run it (specific date)" },
    ],
    prompt: `I'm designing a challenge funnel that feeds my revenue ladder.

The funnel: free tier sees announcement > participants pay $47-97 > completers get upgrade offer > three exit paths (subscribe, premium, coaching).

My niche: [fill in]
My challenge idea: [fill in]
My subscription price: [fill in]

Help me write the announcement post using Proof > Context > Small Ask, and design the three exit-path offers.`,
    emailBody: `Exercise 27: Design your challenge funnel

Challenge name, duration, price:

Announcement post for free tier:

Exit path 1 - Subscribe:

Exit path 2 - Premium:

Exit path 3 - Coaching:

Target date to run:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX27] Challenge Funnel Design",
  },
  ex28: {
    title: "Exercise 28: Digital products audit",
    fields: [
      { label: "Products to bundle as subscription perks" },
      { label: "Products to sell standalone / use as lead magnets" },
      { label: "Products without clear demand (don't build yet)" },
    ],
    prompt: `I'm auditing my content and resources to decide what to bundle vs. sell standalone.

Bundle it if: the product requires community context, support, or accountability to be useful.
Sell standalone if: the product is self-contained and delivers value alone.
Don't create if: you'd build it solely to have something to sell.

My existing content/resources: [fill in]
Products I've been thinking about: [fill in]

Help me sort these into the three categories and identify what's actually worth creating.`,
    emailBody: `Exercise 28: Digital products audit

Products to bundle as subscription perks:

Products to sell standalone or use as lead magnets:

Products without clear demand (don't build yet):

`,
    emailSubject: "[PILOT-PLAYBOOK-EX28] Digital Products Audit",
  },
  ex29: {
    title: "Exercise 29: Map your upsell path",
    fields: [
      { label: "Free to Paid", placeholder: "Trigger, offer, proof point, ask..." },
      { label: "Paid to Challenge", placeholder: "Trigger, offer, proof point, ask..." },
      { label: "Challenge to Premium", placeholder: "Trigger, offer, proof point, ask..." },
      { label: "Premium to High-ticket", placeholder: "Trigger, offer, proof point, ask..." },
    ],
    prompt: `I'm mapping my upsell path from free to high-ticket using the Proof > Context > Small Ask pattern.

For each transition:
- Trigger: what the member has achieved
- Offer: what you're inviting them to
- Proof point: from your proof ledger
- Ask: how you'd present it

Natural upsells say "you've proven you're ready for more." Forced upsells say "pay more to get more." Design for natural.

My community: [fill in]
My current proof points: [fill in]

Help me design each transition to feel earned, not sold.`,
    emailBody: `Exercise 29: Map your upsell path

Free to Paid:
Trigger:
Offer:
Proof point:
Ask:

Paid to Challenge:
Trigger:
Offer:
Proof point:
Ask:

Challenge to Premium:
Trigger:
Offer:
Proof point:
Ask:

Premium to High-ticket:
Trigger:
Offer:
Proof point:
Ask:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX29] Upsell Path Map",
  },
  ex30: {
    title: "Exercise 30: 12-month revenue projection",
    fields: [
      { label: "Month 1-3 projection", placeholder: "What's realistic with your current size?" },
      { label: "Month 4-6 projection", placeholder: "After first challenge and some growth?" },
      { label: "Month 7-12 projection", placeholder: "With all layers activated?" },
    ],
    prompt: `I'm building a 12-month revenue projection for my community.

Reference scenarios:
- Subscription-heavy: 100 free, 40 paid at $29/mo, quarterly challenges, 15 premium, 2 coaching = ~$5,200/mo
- Challenge-heavy: 200 free, 60 paid at $29/mo, monthly mini-challenges, quarterly premium, 20 premium, 1 coaching = ~$8,700/mo

My current state: [fill in]
My revenue ladder from Exercise 26: [fill in]

Help me build a realistic projection. Round down, not up. I'd rather be pleasantly surprised than disappointed.`,
    emailBody: `Exercise 30: 12-month revenue projection

Month 1-3 (current reality):

Month 4-6 (after first challenge):

Month 7-12 (all layers activated):

Assumptions I'm making:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX30] Revenue Projection",
  },
  // Build 2: Module 9 - Proof-Based Communication
  ex31: {
    title: "Exercise 31: Set up your proof ledger",
    fields: [
      { label: "Proof point 1", placeholder: "Date, member, win, category, quote, source..." },
      { label: "Proof point 2", placeholder: "Date, member, win, category, quote, source..." },
    ],
    prompt: `I'm setting up a proof ledger with three tabs: Member Wins, Community Metrics, and Milestones.

I need to seed it with at least 2 proof points. These can come from my community, freelance work, content, or anywhere I've generated a real result for someone.

If I have zero proof points, my first priority is generating one, not writing better copy.

My community/work: [fill in]
My proof points so far: [fill in]

Help me evaluate whether my proof points are specific enough to be credible. Generic claims invite skepticism. Specific details invite curiosity.`,
    emailBody: `Exercise 31: Set up your proof ledger

Proof point 1:
Date:
Member/person:
Win:
Category:
Quote (if available):
Source:

Proof point 2:
Date:
Member/person:
Win:
Category:
Quote (if available):
Source:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX31] Proof Ledger Setup",
  },
  ex32: {
    title: "Exercise 32: Rewrite your welcome message with proof",
    fields: [
      { label: "Your current welcome message" },
      { label: "Your rewritten message (Proof > Context > Small Ask)" },
    ],
    prompt: `I'm rewriting my community welcome message using the Proof > Context > Small Ask pattern.

The pattern:
- Proof: a real, specific, verifiable result
- Context: one sentence connecting the proof to the reader
- Small Ask: the lowest-friction next step

The proof should be real. If I don't have member wins yet, I'll use my own result.

My current welcome message: [fill in]
My best proof point: [fill in]

Help me rewrite it. Push back if the proof feels generic or the ask feels too big.`,
    emailBody: `Exercise 32: Rewrite your welcome message with proof

Your current welcome message:

Your rewritten message (Proof > Context > Small Ask):

`,
    emailSubject: "[PILOT-PLAYBOOK-EX32] Welcome Message Rewrite",
  },
  ex33: {
    title: "Exercise 33: Map your 'want more?' moments",
    fields: [
      { label: "Moment 1 + proof-rich nudge" },
      { label: "Moment 2 + proof-rich nudge" },
      { label: "Moment 3 + proof-rich nudge" },
    ],
    prompt: `I'm mapping 3-5 "want more?" moments in my community where a free member is most likely to feel the gap between free and paid.

Five types: the "want more?" post, the win announcement, the live session preview, the welcome DM sequence, the conversation upgrade.

For each moment, I need a proof-rich nudge: real proof point, one sentence of context, one small ask.

My community niche: [fill in]
My free vs. paid split: [fill in]
My proof points: [fill in]

Help me identify the moments and write the nudges.`,
    emailBody: `Exercise 33: Map your "want more?" moments

Moment 1:
Where it happens:
Proof-rich nudge:

Moment 2:
Where it happens:
Proof-rich nudge:

Moment 3:
Where it happens:
Proof-rich nudge:

`,
    emailSubject: "[PILOT-PLAYBOOK-EX33] Want More Moments Map",
  },
  ex34: {
    title: "Exercise 34: Send your second email",
    fields: [
      { label: "Who you're reaching out to" },
      { label: "Your rewritten outreach (Proof > Context > Small Ask)" },
      { label: "Outcome (after sending)" },
    ],
    prompt: `I'm rewriting a cold outreach message using the Proof > Context > Small Ask pattern from the Janoch story.

The key difference from my first attempt: lead with a proof point I have now that I didn't have then. The ask should be smaller than the first time.

Who I'm reaching out to: [fill in]
My first message (what I sent before): [fill in]
New proof point I can lead with: [fill in]

Help me rewrite the outreach. The goal isn't to "follow up," it's to send a fundamentally different message that leads with evidence instead of promises.`,
    emailBody: `Exercise 34: Send your second email

Who you're reaching out to:

Your original message (first attempt):

Your rewritten outreach (Proof > Context > Small Ask):

Outcome (fill in after sending):

`,
    emailSubject: "[PILOT-PLAYBOOK-EX34] Second Email Outreach",
  },
};
