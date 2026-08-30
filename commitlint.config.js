// commitlint.config.js
// ADR-0017: Standard Commit Message — Conventional Commits enforcement
// Rules: mandatory scope, English language, imperative mood

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Scope is mandatory for all commits
    'scope-empty': [2, 'never'],

    // Enforce valid scopes for this project
    'scope-enum': [
      2,
      'always',
      [
        'ci',       // CI/CD pipeline changes
        'ui',       // Frontend UI components
        'core',     // Core business logic (Rust)
        'db',       // Database schema, migrations, entities
        'api',      // Tauri commands / API layer
        'test',     // Test files only
        'config',   // Configuration files (eslint, tsconfig, etc.)
        'docs',     // Documentation and ADRs
        'release',  // Release and versioning
        'deps',     // Dependency updates
        'seed',     // Database seed files
        'e2e',      // End-to-end tests
      ],
    ],

    // Subject must not be empty
    'subject-empty': [2, 'never'],

    // Subject must not end with a period
    'subject-full-stop': [2, 'never', '.'],

    // Subject must start with lowercase
    'subject-case': [2, 'always', 'lower-case'],

    // Body lines max length
    'body-max-line-length': [1, 'always', 100],
  },
};

export default config;
