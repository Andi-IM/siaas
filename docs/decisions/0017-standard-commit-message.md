# Standardizing Commit Messages using Conventional Commits

* Status: accepted
* Date: 2026-06-18
* Deciders: Andi-IM, Gemini CLI

## Context and Problem Statement

The project's git history lacks consistency, making it difficult to understand the context of changes at a glance. Additionally, without a structured format, automated tools for generating changelogs or managing releases cannot be easily integrated. We need a clear, assumption-free way to communicate changes through commit messages.

## Decision Drivers

* Need for consistent git history.
* Desire for machine-readability (automated changelogs).
* Clarity for both human developers and AI agents.
* Elimination of technical assumptions in commit descriptions.

## Considered Options

1. **Conventional Commits**: A specification for adding human and machine readable meaning to commit messages.
2. **Free-form Messages**: No strict format, relying on developer discipline.

## Decision Outcome

Chosen option: **Conventional Commits**, because it is the industry standard, supports automated tooling, and enforces a structure that improves clarity.

### Specific Rules:

* **Language**: All commit messages must be in **English**.
* **Format**: Mandatory `<type>(<scope>): <description>`.
* **Scope**: The `(scope)` part is **mandatory** to provide immediate context (e.g., `ci`, `ui`, `core`, `db`, `api`).
* **Description**: Must be explicit and explain **what** was done clearly, removing assumptions. Use the imperative mood (e.g., "add", not "added").

## Pros and Cons of the Options

### Conventional Commits

* Good, because it provides a predictable structure.
* Good, because it enables automated versioning and changelog generation.
* Good, because it forces developers to think about the scope and impact of their changes.
* Bad, because it requires a learning curve for those unfamiliar with the specification.
* Bad, because it adds a small amount of overhead to each commit.

### Free-form Messages

* Good, because it allows for maximum flexibility.
* Good, because there is no overhead or learning curve.
* Bad, because history becomes messy and hard to scan.
* Bad, because automated tooling cannot reliably parse the messages.

## Implementation Plan

1. **Configure Commitlint**:
   - Install `@commitlint/cli` and `@commitlint/config-conventional`.
   - Create a `commitlint.config.js` file to enforce mandatory scopes and English language.
2. **Husky Integration**:
   - Add a `commit-msg` hook to Husky to validate commit messages before they are finalized.
3. **Documentation**:
   - Update `CONTRIBUTING.md` (if exists) or add a section in `README.md` explaining the commit standards.

## Verification

- [ ] New commits without the `<type>(<scope>):` format are rejected by the git hook.
- [ ] New commits in non-English languages are rejected.
- [ ] Automated changelog generation can successfully parse new commits.
