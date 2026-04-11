---
name: playwright-test-automation
description: 'Create, refactor, review, and stabilize Playwright UI and API tests aligned with repository standards, tagging rules, and CI quality gates.'
argument-hint: 'What to test, scope (ui|api|both), acceptance criteria, and expected tags'
user-invocable: true
disable-model-invocation: false
---

# Playwright Test Automation

Use this skill to create, refactor, and maintain Playwright tests in this repository.

This skill standardizes shared rules for both UI and API automation so behavior stays consistent across agents and prompts.

## When to Use

Use this skill when the user asks to:

- add or update smoke, auth, farm, marketplace, or e2e Playwright tests
- add or update REST API tests in `tests/api`
- reduce flaky tests or improve test stability
- refactor tests to align with Page Object and AAA conventions
- reconcile implemented tests with `TEST_PLAN.md`
- validate tagging quality before CI

## Source of Truth

Always align with these project documents first:

- `.github/copilot-instructions.md`
- `CODING_STANDARDS.md`
- `TEST_PLAN.md`
- `playwright.config.ts`

## Mandatory Inputs

Before implementation, ensure you have:

- feature flow or endpoint/module scope
- expected behavior and acceptance criteria
- required tags from `TEST_PLAN.md`
- environment assumptions (base URL, auth state, required test data)

If these are missing or ambiguous, ask focused clarification questions and pause implementation.

## Mandatory Workflow

### 0. Safety and Scope

- Never read `.env`.
- If environment values are needed for AI reasoning, use `.env.ai`.
- Confirm scope: `ui`, `api`, or `both`.

### 1. Plan First

- Create a plan file in `.ai-docs/` before coding.
- Use a descriptive name such as:
  - `.ai-docs/ui-login-flow-plan.md`
  - `.ai-docs/api-auth-endpoints-plan.md`
- Include:
  - task goal
  - assumptions and open questions
  - risks and constraints
  - numbered implementation steps

### 2. Discover Existing Patterns

- Search for existing Page Objects and spec files before creating new ones.
- Prefer extending existing abstractions over introducing duplicates.
- Reuse helper utilities when possible.

### 3. Design Tests

- Map each test to a concrete scenario from `TEST_PLAN.md`.
- Apply tags that match the selected scenario.
- Keep tests focused: one intent per test.
- Ensure test independence.

### 4. Implement

Follow the shared implementation rules below for UI and API tests.

### 5. Validate and Stabilize

- Verify assertions cover user-visible behavior or API contract behavior.
- Remove brittle waits and timing assumptions.
- Confirm selectors and test data are stable and deterministic.

### 6. Run Quality Gates

- Run targeted tests for changed areas first.
- Run full regression before completion using the repository command:
  - `npm test`
- If regressions appear, fix and re-run until green.

### 7. Final Report

Summarize:

- what changed and why
- files touched
- tests run
- residual risks or follow-ups

## UI Rules (Playwright + Page Object Pattern)

- Keep assertions in spec files only.
- Do not place `expect()` inside Page Objects.
- Page Objects should expose actions and locators, not validation logic.
- Prefer stable locators:
  - primary: `getByTestId()`
  - secondary: `getByRole()`, `getByLabel()`, `getByText()` when justified
- Avoid hard waits (`waitForTimeout`) unless there is no reliable event-based alternative.
- Keep tests in clear AAA structure:
  - Arrange
  - Act
  - Assert

## API Rules (Playwright Request Testing)

- Use `BASE_API_URL` from `src/config/env.config.ts`.
- Keep API tests under `tests/api/` using `<module>.api.spec.ts` naming.
- Reuse shared test data helpers and models where available.
- Validate:
  - HTTP status
  - response success flags
  - critical contract fields
  - error payloads for negative cases
- Use isolated test data to avoid cross-test coupling.

## Tagging Rules

- Every new test must include tags consistent with `TEST_PLAN.md`.
- Use domain tags plus behavior tags when applicable.

Examples:

```typescript
test('should display title on homepage', {
  tag: ['@smoke', '@critical'],
});

test('should reject registration with invalid email', {
  tag: ['@auth', '@registration', '@validation', '@negative'],
});

test('should block purchase with insufficient funds', {
  tag: ['@marketplace', '@purchase', '@validation', '@edge-case'],
});
```

## CI and Quality Expectations

- Keep tests deterministic and CI-friendly.
- Avoid dependencies between tests.
- Ensure new config or env requirements are reflected in workflow files when needed.
- Keep code style compatible with lint, format, and type-check steps.

## Anti-Patterns to Avoid

- adding assertions to Page Objects
- using broad or brittle selectors when stable alternatives exist
- hard-coding environment-specific URLs or credentials
- introducing shared mutable state between tests
- writing tests without mapping to `TEST_PLAN.md`
- skipping full regression before completion

## Completion Checklist

- [ ] Scope and acceptance criteria are clear
- [ ] Plan exists in `.ai-docs/`
- [ ] Tests follow AAA and Page Object conventions
- [ ] Tags align with `TEST_PLAN.md`
- [ ] Targeted tests passed
- [ ] Full regression (`npm test`) passed
- [ ] Final summary includes changes, test runs, and risks
