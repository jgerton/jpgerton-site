import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/webhook/ycah-member",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = request.headers.get("x-webhook-secret");
    const expectedSecret = process.env.WEBHOOK_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    await ctx.runMutation(api.ycahMembers.syncFromWebhook, {
      email: body.email,
      name: body.name,
      communityUrl: body.communityUrl || undefined,
      source: body.source || undefined,
      skoolTransactionId: body.skoolTransactionId || "unknown",
    });

    return new Response("OK", { status: 200 });
  }),
});

export default http;
