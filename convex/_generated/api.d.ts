/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as communityPulse_aggregation from "../communityPulse/aggregation.js";
import type * as communityPulse_authActions from "../communityPulse/authActions.js";
import type * as communityPulse_backfill from "../communityPulse/backfill.js";
import type * as communityPulse_followups from "../communityPulse/followups.js";
import type * as communityPulse_posts from "../communityPulse/posts.js";
import type * as communityPulse_queries from "../communityPulse/queries.js";
import type * as communityPulse_scoring from "../communityPulse/scoring.js";
import type * as communityPulse_sessions from "../communityPulse/sessions.js";
import type * as communityPulse_sync from "../communityPulse/sync.js";
import type * as http from "../http.js";
import type * as pilotExercises from "../pilotExercises.js";
import type * as pilotFeedback from "../pilotFeedback.js";
import type * as pilotOnboarding from "../pilotOnboarding.js";
import type * as pilotProfiles from "../pilotProfiles.js";
import type * as pilotProgress from "../pilotProgress.js";
import type * as projects from "../projects.js";
import type * as seed from "../seed.js";
import type * as ycahMembers from "../ycahMembers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "communityPulse/aggregation": typeof communityPulse_aggregation;
  "communityPulse/authActions": typeof communityPulse_authActions;
  "communityPulse/backfill": typeof communityPulse_backfill;
  "communityPulse/followups": typeof communityPulse_followups;
  "communityPulse/posts": typeof communityPulse_posts;
  "communityPulse/queries": typeof communityPulse_queries;
  "communityPulse/scoring": typeof communityPulse_scoring;
  "communityPulse/sessions": typeof communityPulse_sessions;
  "communityPulse/sync": typeof communityPulse_sync;
  http: typeof http;
  pilotExercises: typeof pilotExercises;
  pilotFeedback: typeof pilotFeedback;
  pilotOnboarding: typeof pilotOnboarding;
  pilotProfiles: typeof pilotProfiles;
  pilotProgress: typeof pilotProgress;
  projects: typeof projects;
  seed: typeof seed;
  ycahMembers: typeof ycahMembers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
