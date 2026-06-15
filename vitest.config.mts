import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    clearMocks: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html"],
      include: ["src/**/*"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/types.ts",
        "src/components/logo.tsx",
        "src/**/*.test.tsx",
        "src/**/*.test.ts"
      ],
    },
  },
});
