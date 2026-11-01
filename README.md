# Rolnopol ATF

Playwright and TypeScript tests for the Rolnopol agricultural management
application. This repository is a learning framework: scenarios, data isolation,
and useful assertions matter more than test counts.

## Quick Start

Use Node.js 22 (the CI version), npm, and a reachable Rolnopol instance.

```bash
npm ci
npm run install:drivers
```

Configure `BASE_URL` and the account variables documented in
[.env.example](.env.example). Keep real credentials in your local environment
or ignored `.env`. Shared demo credentials are needed only by tests that use
that account. State-changing scenarios should create their own users.

## Scenario Coverage Report

Open `coverage-report/index.html` for scenario metrics, filters, and per-case
execution details. **Implemented** means a catalog scenario has a collected test;
**Confirmed** requires passing evidence matching the current source in every
required project. This measures scenarios, not application code coverage.

Use **History** to open the archived-run summary and **Latest scenario coverage**
to return. **Run details** keeps timing and setup results; full data is in JSON.
**Source metadata missing** means the saved run cannot confirm the current source,
even if its observed tests passed. Use `coverage:run` for new evidence.

Run these commands separately, including after test failures:

```bash
npm run coverage:run
npm run coverage:archive
npm run coverage:summary
```

| Output                                               | Purpose                                                         |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| `coverage-report/index.html`                         | Latest scenario report and embedded project documentation       |
| `playwright-report/index.html`                       | Playwright execution details and traces                         |
| `playwright-report-ci/learning-history/summary.html` | Archived runs, changes in scope/source, and case outcome labels |
| `playwright-report-ci/learning-history/summary.json` | Compact data for the same history                               |

In the history list, unsuccessful cases have `-fail`, `-flaky`, or `-skip`
labels. Fail counts unsuccessful tests; global errors concern the run itself.
Counts include repetitions; setup and excluded cases are omitted.

### How report updates work

`coverage:run` runs the full suite, or filters passed after `--`, with one worker
and zero retries by default. It replaces the latest results and generates the
report even after test failures. `npm test` and editor runs do not provide the
complete reporting/archiving workflow. Archive before the next execution.

`coverage:summary` refreshes JSON, HTML, and the terminal table from existing
archives; it does not run or archive tests. `coverage:history` exposes detailed
comparison groups. Archives are local, Git-ignored, and have no automatic expiry.

To refresh documentation without running tests, use `npm run coverage:collect`
then `npm run coverage:report`. Source or documentation edits can make saved
results stale; regeneration does not turn them into new passing evidence.
See [metric definitions](TEST_PLAN.md#metric-definitions) for the reporting contract.

## Application Code Coverage

An optional backend pilot is separate from scenario coverage:

```bash
npm run coverage:app-code
```

Requires Node.js 22+ and an adjacent `../rolnopol` checkout with dependencies
(or `-- --app path/to/rolnopol`). Runs farm/financial API specs against a temporary
application copy and writes `coverage-report/app-code/index.html`,
`summary.json`, and `lcov.info`. Its scope is 14 backend files, excluding the
frontend; it also replaces the latest scenario results.

## Code Quality and CI

`npm run check:ci` checks formatting, ESLint, and TypeScript without editing files.
`npm run coverage:test` tests the report tooling; `npm run coverage:validate`
checks scenario IDs and the README index. `npm run check` applies formatting.
`npm run test:unit` runs the offline helper and schema tests in `tests/unity`.
The quality job runs these separately from the reporting-tool tests.

[GitHub Actions](.github/workflows/playwright-e2e-tests.yml) is deliberately manual
(`workflow_dispatch`). It runs quality checks and tests, retaining available
Playwright/coverage artifacts after success or failure for 30 days.

## Documentation

- [TEST_PLAN.md](TEST_PLAN.md): strategy, scenario catalog and
  the reporting contract.
- [CODING_STANDARDS.md](CODING_STANDARDS.md): AAA, Page Objects and locator rules.
- [.agents/skills/CONTEXT.md](.agents/skills/CONTEXT.md): shared agent workflow.

## Scenario Index

Generated from TEST_PLAN. Edit the source catalog, then run `coverage:readme`.
Implementation and execution states are computed in the report, not edited here.

<!-- coverage-index:start -->

| ID             | Area        | Scenario                                                               | Layer  | Priority | Risk     | Scope    |
| -------------- | ----------- | ---------------------------------------------------------------------- | ------ | -------- | -------- | -------- |
| TC-ASSIGN-001  | Farm        | should assignment for new staff and field                              | UI     | P1       | high     | included |
| TC-ASSIGN-002  | Farm        | should not show assigned staff in select dropdown                      | UI     | P1       | medium   | included |
| TC-ASSIGN-003  | Farm        | should unassigned works correctly                                      | UI     | P1       | high     | included |
| TC-ASSIGN-004  | Farm        | should show 2 staff assigned to field in tree view                     | UI     | P1       | medium   | included |
| TC-ASSIGN-005  | Farm        | A user can assign their staff member to their field through API        | API    | P1       | high     | included |
| TC-ASSIGN-006  | Farm        | Removing a staff assignment leaves it absent from the assignment list  | API    | P1       | high     | included |
| TC-AUTH-001    | Auth        | should register new user successfully with valid data                  | API    | P0       | high     | included |
| TC-AUTH-002    | Auth        | should reject registration with invalid email format                   | API    | P0       | medium   | included |
| TC-AUTH-003    | Auth        | should reject registration with duplicate email                        | API    | P0       | medium   | included |
| TC-AUTH-004    | Auth        | should login successfully with valid credentials                       | API    | P0       | high     | included |
| TC-AUTH-005    | Auth        | should reject login with non-existent email                            | API    | P0       | medium   | included |
| TC-AUTH-006    | Auth        | should reject login with wrong password                                | API    | P0       | high     | included |
| TC-AUTH-007    | Auth        | should validate valid token via GET request                            | API    | P0       | high     | included |
| TC-AUTH-008    | Auth        | should reject invalid token via GET request                            | API    | P0       | critical | included |
| TC-AUTH-009    | Auth        | should validate valid token via POST request                           | API    | P0       | high     | included |
| TC-AUTH-010    | Auth        | should reject invalid token via POST request                           | API    | P0       | critical | included |
| TC-AUTH-011    | Auth        | should logout successfully                                             | API    | P0       | high     | included |
| TC-AUTH-012    | Auth        | Anonymous fields request returns 401 without field data                | API    | P0       | critical | included |
| TC-CHART-001   | Charts      | Chart type switches without JavaScript errors                          | UI     | P2       | low      | included |
| TC-FARM-001    | Farm        | should create a new field in Staff & Fields view                       | UI     | P1       | high     | included |
| TC-FARM-002    | Farm        | should create a new animal herd in Staff & Fields view                 | UI     | P1       | medium   | included |
| TC-FARM-003    | Farm        | should create a new staff in Staff & Fields view                       | UI     | P1       | high     | included |
| TC-FARM-004    | Farm        | should edit a field name                                               | UI     | P1       | medium   | included |
| TC-FARM-005    | Farm        | should delete a field                                                  | UI     | P1       | high     | included |
| TC-FARM-006    | Farm        | should update a staff                                                  | UI     | P1       | medium   | included |
| TC-FARM-007    | Farm        | should delete a staff                                                  | UI     | P1       | high     | included |
| TC-FARM-008    | Farm        | should edit a animal                                                   | UI     | P1       | medium   | included |
| TC-FARM-009    | Farm        | should delete a animal                                                 | UI     | P1       | high     | included |
| TC-FARM-010    | Farm        | A newly created field can be retrieved with its name and area          | API    | P0       | medium   | included |
| TC-FARM-012    | Farm        | Deleting an assigned field removes its field and assignment            | API    | P1       | high     | included |
| TC-FARM-013    | Farm        | Fields search and pagination show the requested subset                 | UI     | P1       | medium   | included |
| TC-FARM-014    | Farm        | Updating a field persists its new name and area                        | API    | P1       | medium   | included |
| TC-FARM-015    | Farm        | A newly created staff member appears with their name, surname, and age | API    | P1       | high     | included |
| TC-FARM-016    | Farm        | A newly created animal herd appears with its type and amount           | API    | P1       | medium   | included |
| TC-FARM-017    | Farm        | Updating a staff member persists the changed name, surname, and age    | API    | P1       | medium   | included |
| TC-FARM-018    | Farm        | Updating an animal herd persists the changed type and amount           | API    | P1       | medium   | included |
| TC-FARM-019    | Farm        | Deleting a staff member removes that member from the staff list        | API    | P1       | high     | included |
| TC-FARM-020    | Farm        | Deleting an animal herd removes that herd from the animal list         | API    | P1       | medium   | included |
| TC-FARM-021    | Farm        | Deleting assigned staff removes the assignment and preserves the field | API    | P1       | high     | included |
| TC-FARM-022    | Farm        | An unsupported animal type is rejected without creating a herd         | API    | P1       | medium   | included |
| TC-FIN-001     | Finance     | verify account balance and transaction history                         | UI     | P1       | medium   | included |
| TC-FIN-002     | Finance     | verify funds transfer between users                                    | UI     | P1       | critical | included |
| TC-FIN-003     | Finance     | verify prevent overdraft                                               | UI     | P1       | critical | included |
| TC-FIN-004     | Finance     | Transaction history respects limit and offset and exposes hasMore      | API    | P1       | medium   | included |
| TC-FIN-005     | Finance     | Income and expense update the API account balance                      | API    | P1       | critical | included |
| TC-FIN-006     | Finance     | Transfer accepts the minimum amount 0.01                               | API    | P1       | high     | included |
| TC-FIN-007     | Finance     | Transfer accepts the maximum amount 999.99                             | API    | P1       | high     | included |
| TC-FIN-008     | Finance     | Transfer of the full available balance leaves zero                     | API    | P1       | high     | included |
| TC-FIN-009     | Finance     | Transfer above available balance leaves both accounts unchanged        | API    | P1       | critical | included |
| TC-FIN-010     | Finance     | Transfer to a nonexistent recipient is rejected                        | API    | P1       | high     | included |
| TC-FIN-011     | Finance     | A fresh user can read their financial account and balance              | API    | P1       | high     | included |
| TC-FIN-012     | Finance     | Transaction history filters by type                                    | API    | P1       | medium   | included |
| TC-FIN-013     | Finance     | Transaction history filters by category                                | API    | P1       | medium   | included |
| TC-FIN-014     | Finance     | Transaction history filters by date range                              | API    | P1       | medium   | included |
| TC-FIN-015     | Finance     | Transfer above 999.99 ROL is rejected without changing either balance  | API    | P1       | high     | included |
| TC-GUARD-001   | Auth        | should redirect anonymous user from /profile.html to login             | UI     | P0       | high     | included |
| TC-GUARD-002   | Auth        | should redirect anonymous user from /marketplace.html to login         | UI     | P0       | high     | included |
| TC-GUARD-003   | Auth        | should redirect anonymous user from /financial.html to login           | UI     | P0       | high     | included |
| TC-GUARD-004   | Auth        | Anonymous Staff and Fields main page redirects to login                | UI     | P0       | high     | excluded |
| TC-GUARD-005   | Auth        | Anonymous assignments page redirects to login                          | UI     | P0       | high     | excluded |
| TC-GUARD-006   | Auth        | Anonymous charts page redirects to login                               | UI     | P0       | low      | excluded |
| TC-JOURNEY-001 | Journeys    | should create assignment for new farmer                                | E2E    | P0       | high     | included |
| TC-JOURNEY-002 | Journeys    | marketplace e2e test                                                   | E2E    | P0       | high     | included |
| TC-JOURNEY-003 | Journeys    | verify blocked transaction                                             | E2E    | P0       | critical | included |
| TC-LOGIN-001   | Auth        | should display correct user data after login                           | UI     | P0       | medium   | included |
| TC-LOGIN-002   | Auth        | session management should work correctly                               | UI     | P0       | high     | included |
| TC-MARKET-001  | Marketplace | should buy an owned test field offer and verify transaction history    | UI     | P1       | high     | included |
| TC-MARKET-002  | Marketplace | should return error when offer is to expensive                         | UI     | P1       | high     | included |
| TC-MARKET-003  | Marketplace | create offer and verify in My Offers page                              | UI     | P1       | medium   | included |
| TC-MARKET-004  | Marketplace | An owner can cancel an offer through API                               | API    | P1       | high     | included |
| TC-MARKET-005  | Marketplace | A different user cannot cancel another owner offer                     | API    | P1       | critical | included |
| TC-MARKET-006  | Marketplace | An owner can cancel an offer through UI                                | UI     | P1       | high     | included |
| TC-MARKET-007  | Marketplace | An owner cannot buy their own offer                                    | API    | P1       | high     | included |
| TC-PROFILE-001 | Profile     | should display correct user information in profile sections            | UI     | P1       | medium   | included |
| TC-PROFILE-002 | Profile     | A fresh user can update the display name                               | UI     | P1       | medium   | included |
| TC-PROFILE-003 | Profile     | A fresh user can delete their own account after confirmation           | UI     | P1       | high     | included |
| TC-PUBLIC-001  | Public      | Alerts page opens and displays its main controls                       | UI     | P2       | low      | included |
| TC-PUBLIC-002  | Public      | Contact rejects missing required fields                                | UI     | P2       | medium   | included |
| TC-PUBLIC-003  | Public      | Contact accepts a valid submission                                     | UI     | P2       | medium   | included |
| TC-PUBLIC-004  | Public      | Alerts search with no matches empties all lists and counters           | UI     | P2       | low      | included |
| TC-PUBLIC-005  | Public      | Clearing Alerts search restores the initial card counts                | UI     | P2       | low      | included |
| TC-PUBLIC-006  | Public      | Alerts search returns cards containing the selected title              | UI     | P2       | low      | included |
| TC-REG-001     | Auth        | should register new user successfully                                  | UI     | P0       | high     | included |
| TC-REG-002     | Auth        | should display validation errors for invalid email and short password  | UI     | P0       | medium   | included |
| TC-REG-003     | Auth        | should prevent registration with empty required fields                 | UI     | P0       | medium   | included |
| TC-REG-004     | Auth        | should reject password with 1 characters                               | UI     | P0       | high     | included |
| TC-REG-005     | Auth        | should reject password with 2 characters                               | UI     | P0       | high     | included |
| TC-REG-006     | Auth        | should reject registration for empty password                          | UI     | P0       | high     | included |
| TC-REG-007     | Auth        | should reject registration with duplicate email                        | UI     | P0       | medium   | included |
| TC-REG-008     | Auth        | should reject invalid email: "plaintext"                               | UI     | P0       | medium   | included |
| TC-REG-009     | Auth        | should reject invalid email: "@example.com"                            | UI     | P0       | medium   | included |
| TC-REG-010     | Auth        | should reject invalid email: "user@"                                   | UI     | P0       | medium   | included |
| TC-REG-011     | Auth        | should reject invalid email: "user @example.com"                       | UI     | P0       | medium   | included |
| TC-SMOKE-001   | Public      | should display the correct page title 'Rolnopol' on homepage           | UI     | P0       | low      | included |
| TC-SMOKE-002   | Public      | should load login page successfully                                    | UI     | P0       | medium   | included |
| TC-SMOKE-003   | Public      | should load API documentation page successfully                        | UI     | P0       | low      | included |
| TC-SMOKE-004   | Public      | should load documentation page successfully                            | UI     | P0       | low      | included |
| TC-SMOKE-005   | Public      | should not display marketplace for non-logged user                     | UI     | P0       | high     | included |
| TC-SMOKE-006   | Public      | should load register page successfully                                 | UI     | P0       | medium   | included |
| TC-SMOKE-007   | Public      | api app health check                                                   | API    | P0       | high     | included |
| TC-VIS-001     | Visual      | should match homepage visual snapshot                                  | Visual | P2       | low      | included |

<!-- coverage-index:end -->

## Agent Skills

All project skills are maintained in [.agents/skills](.agents/skills).
The [shared context](.agents/skills/CONTEXT.md) defines mentoring mode,
repository sources, and verification scope. TEST_PLAN.md owns strategy, scope
and the scenario catalog. Personal learning notes are maintained locally.

| Skill                                                                                      | Purpose                                                                      |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| [code-review](.agents/skills/code-review/SKILL.md)                                         | Review a single exercise or small diff                                       |
| [code-review-advanced](.agents/skills/code-review-advanced/SKILL.md)                       | Review dependencies, fixtures, sessions, and multiple files                  |
| [challenging-assumptions](.agents/skills/challenging-assumptions/SKILL.md)                 | Challenge assumptions, offer counterarguments, and propose small experiments |
| [refining-implementation](.agents/skills/refining-implementation/SKILL.md)                 | Propose a clearer implementation without unnecessary abstractions            |
| [playwright-test-automation](.agents/skills/playwright-test-automation/SKILL.md)           | Design and implement UI/API tests                                            |
| [playwright-cli](.agents/skills/playwright-cli/SKILL.md)                                   | Optional browser exploration                                                 |
| [static-code-analysis-typescript](.agents/skills/static-code-analysis-typescript/SKILL.md) | Maintain existing TypeScript, ESLint, Prettier, and CI checks                |
| [tech-debt-analysis](.agents/skills/tech-debt-analysis/SKILL.md)                           | Prioritize small framework improvements                                      |
| [analyzing-quality-metrics](.agents/skills/analyzing-quality-metrics/SKILL.md)             | Interpret outcomes, duration, and repeatability                              |
| [unslop-answers](.agents/skills/unslop-answers/SKILL.md)                                   | Report work using actual evidence                                            |
| [creating-skills](.agents/skills/creating-skills/SKILL.md)                                 | Maintain and validate skill packages                                         |
| [grilling](.agents/skills/grilling/SKILL.md)                                               | Interview in Polish through dependent rounds of decisions                    |
| [teach](.agents/skills/teach/SKILL.md)                                                     | Explicit teaching sessions with practice, feedback, and durable insights     |

Example requests:

- "Użyj teach: chcę nauczyć się walidacji odpowiedzi API."
- "Zrób serię grillowania mojego planu z użyciem grilling."
- "Review the overdraft test."
- "Use challenging-assumptions: challenge my idea of sharing an account across tests."
- "Use refining-implementation: analyze this helper and show a clearer alternative."
- "Choose the next exercise from the plan."
- "Interpret the test results."

Requests for learning, review, assumption challenges, or solution proposals use
mentoring mode. A direct implementation request authorizes the change.
Select refining-implementation for requests for alternatives, without adding
a refactor to an ordinary review.

The AGENTS.md and .github/copilot-instructions.md entry points and the UI/API
agents link to shared workflows. Agents and prompts in .github are not copies
of skill packages and remain in their client-specific locations.

[VS Code supports this skills directory](https://code.visualstudio.com/docs/agent-customization/agent-skills).
No second skill copies or symlinks are maintained.
Check package discovery in your client's skill catalog; valid file structure
does not replace that check.

## Links

- [Repository](https://github.com/aiprzemo/rolnopol-atf)
- [Issues](https://github.com/aiprzemo/rolnopol-atf/issues)
- [Playwright Docs](https://playwright.dev/)
