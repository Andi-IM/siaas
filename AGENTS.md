# SIAAS: Academic Administrative Core

## Project Context
SIAAS (Sistem Informasi Administrasi Akademik Siswa) replaces the traditional physical record book (Buku Induk) in Indonesian schools with an automated digital workflow. It is an offline-native application designed for reliability, precision, and institutional trust.

**Primary Interface**: This project is managed via the **Gemini CLI**. AI agents should prioritize using command-line tools (PowerShell/Bash) and scripts for project tasks.

## Design Context
This project uses the **Academic Administrative Core** design system.
- **Register**: `product` (Admin Dashboard)
- **Style**: Modern Corporate, functional minimalism.
- **Color Strategy**: Restrained (Deep Blue primary, Slate Gray secondary).
- **Typography**: Inter (High legibility for data-dense screens).
- **Principles**: Content-first, Minimum interaction cost, Institutional trust.
- **Schema**: 23-field comprehensive student record (Data Pribadi, Akademik, Orang Tua, Wali).

Refer to `PRODUCT.md` and `DESIGN.md` for full strategic and visual specifications.

## Expertise: Impeccable
This project is equipped with the `impeccable` design skill. AI agents should use these commands to improve the frontend:

| Command | Usage |
| :--- | :--- |
| `/impeccable craft [feature]` | Build a feature end-to-end with high-grade craft. |
| `/impeccable shape [feature]` | Plan UX/UI before writing code. |
| `/impeccable live` | Open interactive variant mode for in-browser iteration. |
| `/impeccable critique [target]` | Perform a heuristic UX review with scoring. |
| `/impeccable audit [target]` | Technical quality checks (a11y, perf, responsive). |
| `/impeccable polish [target]` | Final quality pass before shipping. |
| `/impeccable layout [target]` | Fix spacing, rhythm, and visual hierarchy. |
| `/impeccable typeset [target]` | Improve typography hierarchy and fonts. |
| `/impeccable colorize [target]` | Add strategic color to monochromatic UIs. |
| `/impeccable animate [target]` | Add purposeful animations and motion. |

To use these, invoke the `impeccable` skill or run the scripts in `.opencode/skills/impeccable/`.

## Agent Mandates

### Pre-Commit Verification
To maintain codebase integrity, all agents **MUST** execute and pass the following verification checks before proposing or performing any `git commit`:

1. **Linting**: Run `npm run lint` and ensure no errors or warnings are reported.
2. **Type-Checking**: Run `npx tsc --noEmit` and ensure no TypeScript errors are found.

Failure to verify these checks is considered a violation of the project's engineering standards.
