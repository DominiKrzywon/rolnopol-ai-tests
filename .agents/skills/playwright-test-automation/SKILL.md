---
name: playwright-test-automation
description: 'Design, explain, implement, or stabilize Rolnopol Playwright UI and API tests using existing fixtures, Page Objects, API helpers, project matching, and TEST_PLAN.md. Use for a concrete test scenario or learning exercise; use review skills when only feedback is requested.'
---

# Playwright tests in Rolnopol

Apply the [shared context](../CONTEXT.md), including mentoring mode and check selection.

## Workflow

1. Choose a concrete behavior from TEST_PLAN.md and the layer that verifies it.
   Test business rules mainly through API, visible behavior through UI,
   and reserve full E2E for a few justified journeys.
2. Inspect the existing spec, Page Object, actions, fixture, and API helper.
   Choose the smallest required `test` import. Do not create a parallel
   client architecture or duplicate scenario.
3. Establish data, session state, and the expected contract. Do not automatically
   treat Swagger or a single application response as a correct requirement.
   A missing schema does not block analysis of existing tests and helpers.
4. Separate setup, action, and assertion with blank lines. Page Objects
   expose locators and actions; behavioral assertions remain in specs.
5. Prepare data through API when the setup UI is not under test.
   Isolate state-changing accounts per test; use the demo account according
   to the plan. Cleanup covers owned resources with explicit error handling.
6. For API tests, verify status, important contract fields, and errors for 4xx.
   Use raw APIResponse for negative cases if a throwing helper would prevent
   the assertion.
7. For UI tests, start response waiting before form submission.
   Assert state after the action; for rejected changes, verify relevant absence
   of side effects. Do not base validation solely on a missing success message.
8. Match filenames to the current `testMatch` and tags to the plan.
   `*.journey.spec.ts` is a roadmap proposal until configuration collects it.
   Do not create tests that will never execute.
9. Assign exactly one static `case-id` annotation from the
   [scenario catalog](../../../TEST_PLAN.md#5-scenario-catalog-and-coverage-contract).
   Keep IDs after renames; never reuse retired IDs. Parameterized data contains
   explicit IDs per collected case. Setup uses `coverage-role: setup` instead.
   New planned rows need no placeholder test.
10. Update the source catalog when scope changes, regenerate README with
    `npm run coverage:readme`, and validate with `npm run coverage:validate`.
    Use `npm run coverage:run -- <Playwright filters>` for execution evidence.
    Verify the change according to shared context and record the actual result.

## Stability

- Use locators according to CODING_STANDARDS.md; do not add fixed sleeps.
- Do not share a mutable session between parallel tests.
- Parameterize distinct validations as separate reported cases.
- For visual tests, choose a stable component and control data and platform.
  Update baselines after inspecting the diff, not to hide a failure.
- MCP and [playwright-cli](../playwright-cli/SKILL.md) support exploration,
  but are not required to write or run tests.

## Done

The test checks agreed behavior with the correct project, data, and assertions.
In learning mode, the user receives a small step and its verification method;
for implementation, the report covers changes, runs, and their limitations.
