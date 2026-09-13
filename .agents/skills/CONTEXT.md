# Rolnopol: shared skill context

## Collaboration

This repository is for learning. For explanations, exercises, plans, or reviews,
act as a mentor: code observation → explanation → small implementation step
→ verification method → review of the result. The user makes the test changes.
A direct implementation request authorizes the specified change;
do not ask again for permission to carry out the agreed scope.

Use English for project documentation, instructions, comments, and examples.
Use English for explanations unless the user requests another conversation language.
Examples should explain the mechanism; do not add obvious code comments for a lesson.
Make routine decisions from repository context. Ask only for missing information
that materially changes the scope or expected behavior.

## Sources and freshness

- [TEST_PLAN.md](../../TEST_PLAN.md): learning goals, scope, exclusions, upcoming
  exercises, and the single active test backlog.
- [CODING_STANDARDS.md](../../CODING_STANDARDS.md): AAA, Page Objects, and locators.
- [playwright.config.ts](../../playwright.config.ts): actual projects, filename
  patterns, dependencies, parallelism, and reporting.
- [package.json](../../package.json), [tsconfig.json](../../tsconfig.json),
  [eslint.config.mjs](../../eslint.config.mjs): current commands and tooling rules.
- [Workflow](../../.github/workflows/playwright-e2e-tests.yml): actual CI scope.

Read the sources needed for the task. Compare historical results and plan checkboxes
with current code; the presence of a file does not prove that its tests pass.
Plan small tasks in the conversation. Create a separate document when it is a
needed deliverable; do not duplicate the roadmap in mandatory `.ai-docs/` plans.
When code and standards disagree, describe the discrepancy instead of copying an antipattern.

## Implementation map

- [test.fixture.ts](../../src/fixtures/test.fixture.ts) provides Page Objects.
- [auth.fixture.ts](../../src/fixtures/auth.fixture.ts) extends it
  with `registeredUser` and `freshUser`.
- [data.fixture.ts](../../src/fixtures/data.fixture.ts) adds farm resources
  and cleanup. Choose the smallest fixture required by the scenario.
- [auth.api.ts](../../src/api/auth.api.ts) separates raw HTTP responses
  from user and session setup.
- [httpClient.ts](../../src/api/httpClient.ts) throws for unsuccessful responses;
  do not automatically substitute it into tests that assert 4xx statuses.

Maintain the test creation workflow in
[playwright-test-automation](playwright-test-automation/SKILL.md).
Swagger and application observations help discover the contract, but do not replace
expected behavior. Resolve discrepancies before encoding them in assertions.

## Data and environment

Do not read or disclose `.env`, tokens, or saved sessions. Discover variable names
through [env.config.ts](../../src/config/env.config.ts) and
[.env.example](../../.env.example). `.env.ai` is an option only if it exists
and contains information intended for the conversation. Do not paste raw login
responses, cookies, or traces containing credentials.

Respect the exclusions and environment constraints in TEST_PLAN.md. Operate on
your own test users and resources; do not delete demo data or another test's data.
Destructive administrative operations require an agreed disposable environment.
CLI and MCP are optional exploration tools.

## Verification proportional to the change

Run commands from the repository root after checking the required environment.
Environment values are validated when accessed. Ordinary Playwright collection
still needs BASE_URL; `npm run coverage:collect` supplies a local URL and bypasses
dotenv loading, without requiring account credentials or running fixtures.

- Documentation/skills: names, YAML, links, instruction consistency, and formatting.
- Scenario catalog or ID changes: `npm run coverage:readme`, then
  `npm run coverage:validate`. TEST_PLAN owns manually edited rows; README
  contains the generated index. Neither stores live pass counts.
- Coverage tooling: `npm run coverage:test`, `npm run coverage:validate`, and
  `npm run check:ci`; inspect generated HTML, including both parsed documents.
- Test code: the targeted test, then its project, plus `npm run check:ci`.
- Filename or project changes: also run `npx playwright test --list`.
- Flakiness fixes: reproduce the issue and repeat runs as specified in the plan;
  start with `--workers=1 --retries=0`. Do not hide 429 responses with retries.
- Shared fixtures, sessions, or configuration: extend verification to dependent
  projects; run the full suite when needed to assess impact or explicitly requested.

`npm run check:ci` does not modify files; `npm run check` runs formatting
with writes. Do not use the latter as a read-only check.
Do not fix a known unrelated failure incidentally; explain its effect on the result.
If the environment blocks tests, complete the available checks and identify the missing evidence.

Report results using [unslop-answers](unslop-answers/SKILL.md). Do not declare
release readiness based on a single passing test. Do not repeat checks without
a new change, failure, or specific unresolved concern.
