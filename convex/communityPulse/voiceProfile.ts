import { action, internalMutation, mutation } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { v } from "convex/values";
import { extractVoiceProfile, createProvider } from "@community-pulse/core";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateVoiceProfile = action({
  args: { pilotProfileId: v.id("pilotProfiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { posts, profile } = await ctx.runQuery(
      api.communityPulse.queries.getOwnPostsForProfile,
      { pilotProfileId: args.pilotProfileId },
    );
    if (profile.userId !== userId) throw new Error("Forbidden");
    if (posts.length < 3) {
      throw new Error(`Need at least 3 authored posts to generate a profile; have ${posts.length}.`);
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY not set in Convex env");

    const provider = createProvider({
      kind: "openrouter", apiKey,
      appName: "Community Pulse", siteUrl: "https://jpgerton.com",
    });

    const extracted = await extractVoiceProfile({
      posts: posts.map(p => ({
        title: p.title,
        content: p.content ?? p.title,
        authoredAt: p.createdAt,
      })),
      provider,
      model: "anthropic/claude-haiku-4-5",
    });

    await ctx.runMutation(internal.communityPulse.voiceProfile.saveVoiceProfile, {
      pilotProfileId: args.pilotProfileId,
      markdown: extracted.markdown,
      sourceCount: extracted.sourceCount,
      generatedAt: extracted.generatedAt,
    });

    return extracted;
  },
});

export const saveVoiceProfile = internalMutation({
  args: {
    pilotProfileId: v.id("pilotProfiles"),
    markdown: v.string(),
    sourceCount: v.number(),
    generatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.pilotProfileId, {
      voiceProfile: args.markdown,
      voiceProfileGeneratedAt: args.generatedAt,
      voiceProfileSourceCount: args.sourceCount,
      voiceProfileApproved: false,
    });
  },
});

export const approveVoiceProfile = mutation({
  args: { pilotProfileId: v.id("pilotProfiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db.get(args.pilotProfileId);
    if (!profile || profile.userId !== userId) throw new Error("Forbidden");
    await ctx.db.patch(args.pilotProfileId, { voiceProfileApproved: true });
  },
});
