import { loader } from "fumadocs-core/source";
import { pilots } from "@/.source/server";

export const pilotsSource = loader({
  baseUrl: "/pilots/docs",
  source: pilots.toFumadocsSource(),
});
