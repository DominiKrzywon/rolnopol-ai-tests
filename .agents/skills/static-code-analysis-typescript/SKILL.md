---
name: static-code-analysis-typescript
description: 'Inspect or adjust the existing Rolnopol TypeScript, ESLint, Prettier, Husky, lint-staged, and CI checks. Use for quality-command failures or a concrete tooling change; preserve the working setup and avoid rebuilding the toolchain during test exercises.'
---

# Static analysis of the existing repository

Apply the [shared context](../CONTEXT.md).

## Workflow

1. Read package.json, the lockfile, ESLint/Prettier/TypeScript configuration,
   the hook, and the existing workflow. Distinguish declared and installed versions.
2. Reproduce the reported issue with the smallest non-mutating command.
   Distinguish missing dependencies or incompatible Node from configuration and code errors.
3. Preserve the responsibilities visible in the current files:
   - `format:check` checks non-TS files;
   - TS formatting is checked through the Prettier integration in ESLint;
   - `eslint-plugin-simple-import-sort` sorts imports;
   - `tsc:check` checks types without emitting output;
   - `check:ci` combines non-mutating checks.
     Confirm this split in code before changing it; the description may become outdated.
4. Match the smallest correction to the cause. Do not automatically migrate
   formatters, modules, API clients, or dependency versions.
   Check Node requirements in the metadata of packages actually used;
   do not copy versions from a generic example.
5. Maintain CI checks in the existing
   [workflow](../../../.github/workflows/playwright-e2e-tests.yml).
   Do not create another quality.yml when the quality job already serves the need.
6. When changing hooks, account for lint-staged formatting and fixing staged files.
   Do not run it as a supposedly read-only check.
7. After changes, run the relevant checks; for tooling configuration,
   run `npm run check:ci`. Changes limited to skill documentation need
   documentation checks, not application tests.
8. Update README if commands or tooling behavior changed.

## Done

The cause and correction scope are explained, existing tools have consistent
responsibilities, and the report separates check results from unexecuted tests.
