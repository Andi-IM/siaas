import react from "@vitejs/plugin-react";
import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react()],
  cacheDir: "./node_modules/.vite-cache",
  test: {
    environment: "happy-dom",
    globals: true,
    clearMocks: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: [...configDefaults.exclude, "services/**"],
    deps: {
      optimizer: {
        web: {
          enabled: true,
          include: ["@testing-library/react", "@testing-library/user-event", "lucide-react"],
        },
      },
    },
    reporters: ["default", "junit"],
    outputFile: "junit.xml",
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/app/**/*", "src/components/**/*"],
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
