import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["convex/**/__tests__/**/*.test.ts"],
    environment: "edge-runtime",
    alias: {
      "@community-pulse/core": path.resolve(
        __dirname,
        "../community-pulse/packages/core/src/index.ts"
      ),
    },
  },
});
