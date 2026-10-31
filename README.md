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

Open `coverage-report/index.html` directly in a browser. The standalone report
shows summary metrics first; priority, risk, and area breakdowns expand on demand.
Expand **Scenarios** to search and filter the full
catalog by ID, area, priority, risk, or result. Results use pages of 20 rows;
**Details** opens execution evidence for one scenario. Failure links open the
correct page automatically.

Filters and the current page are stored in the URL and restored after refresh.
Copy the address to return to the same view of this report. Failure counts stay
visible while the list expands on demand. The summary explains why confirmation
is unavailable for missing, unknown, stale, or globally failed run evidence and
how to obtain new evidence with `coverage:run`.

README, TEST_PLAN, and CODING_STANDARDS are collapsed by default, with expandable
chapters. Document links reveal the referenced chapter. Historical notes and
coding-debt notes are not embedded. The generated README index is omitted from
the HTML view because the report already provides the scenario table.

```bash
npm run coverage:validate
npm run coverage:collect
npm run coverage:report -- --no-results
npm run coverage:run -- --project=api-tests
npm run coverage:report
npm run coverage:verify
```

`coverage:run` defaults to one worker and zero retries and preserves a failing
exit code after generating the report. `coverage:report` rebuilds from saved
results without executing tests. Outputs are replaced on the next run; copy the
output folder before running again if you need history.

To preserve an execution and compare it with earlier runs:

```bash
npm run coverage:archive
npm run coverage:history
```

Run these after `coverage:run`, including when tests fail. Archiving is manual;
do not connect it to the test command with a success-only `&&`. The archiver
checks that raw and normalized results match and refuses to overwrite a run.
It stores JSON and available HTML in Git-ignored
`playwright-report-ci/learning-history/<time>-<runId>/`. Playwright HTML is copied
only when its embedded metadata matches the execution. Missing or mismatched
HTML is reported; JSON remains available for analysis. Interrupted archives
stop analysis and need inspection. Archives have no automatic expiry.

Open `playwright-report-ci/learning-history/history.md` for the summary, or
`history.json` for per-run outcomes and attempts. The analyzer separates recorded
source, command, environment, application and execution settings, then compares
case IDs within each project. It shows observed outcomes and duration ranges;
mixed outcomes are investigation signals, not root-cause diagnoses. A single
pass cannot establish stability. OS/browser builds and external state still
need manual control, especially when application version is `unknown`.
Historical outcomes do not replace the source-aware confirmation metric below.

For a compact JSON and a terminal table across all archived runs:

```bash
npm run coverage:run
npm run coverage:archive
npm run coverage:summary
```

Use `coverage:run` for executions intended for archiving. Raw `npm test` or editor
runs can replace Playwright JSON without refreshing the normalized report or
adding archive provenance. Do not combine those outputs or invent a run ID.

This refreshes history from the archives and saves
`playwright-report-ci/learning-history/summary.json`. It does not run tests or
archive the latest execution. After each test run, including a failed one, use
`npm run coverage:archive` before generating the summary. Run these as separate
commands so a failing test exit code does not prevent archiving.

Each summary row contains date, test-source fingerprint, observed case/project
scope, outcome counts, whole-run duration in milliseconds, and global errors.
Scope and source changes are flagged against the previous chronological row.
Counts include repetitions; health cases are included and setup/excluded cases
are omitted. Missing observations are not inferred as successes. Application
version is omitted. Cross-run differences are investigation signals.
For JSON-only stdout, use `node scripts/coverage/summary.mjs --json`.

**Implemented** measures collected cases against included catalog scenarios.
**Confirmed** requires passing results matching the current source fingerprint.
Old or unknown results are not current confirmation. These metrics measure the
scenario catalog, not application code coverage or assertion quality.

See [metric definitions](TEST_PLAN.md#metric-definitions) and
[scenario ID conventions](CODING_STANDARDS.md#scenario-ids-and-catalog-maintenance)
for reporting rules and catalog maintenance. Report commands are documented above.

### How report updates work

`scripts/coverage/` contains the report tooling: `cli.mjs` collects tests and
coordinates runs, `model.mjs` maps results to the catalog, `snapshot.mjs` checks
source fingerprints, `html.mjs` renders this page, and `history.mjs` archives
and compares saved executions. `app-code.mjs` is the separate backend coverage pilot.

- `npm test` replaces `coverage-report/playwright-results.json`, but does not
  rebuild the scenario HTML or normally record its source fingerprint.
- `npm run coverage:run` collects the inventory, runs the full configured suite
  (or the scope passed after `--`), and replaces the JSON/HTML report even after
  test failures. A focused run also replaces the previous full-suite result;
  results are not merged and the previous passing result is not retained.
- `npm run coverage:collect` followed by `npm run coverage:report` rebuilds the
  page from saved results without running tests. It checks the saved run's source
  fingerprint against current project files, not against the previous run.
  Missing provenance means `unknown`; a different fingerprint means `stale`.
  Even changes to the embedded documentation affect this check.
- Run `npm run coverage:archive` after each execution you want to keep, before
  another execution replaces it. Then `npm run coverage:history` compares archived
  observations grouped by matching recorded conditions. Neither command runs
  automatically with the suite or replaces its results with a better outcome.

The HTML is a saved snapshot: its date and freshness label describe generation
time. Reopening it does not load newer JSON or recheck source changes. For a full
suite report with new execution evidence, use `npm run coverage:run` without filters.

## Application Code Coverage

The scenario report above measures test cases. A separate backend pilot measures
the Rolnopol application code executed by the farm and financial API specs. It
uses Node’s V8 coverage and runs the application on a temporary copy, so the
application checkout’s JSON databases are not modified. Node.js 22 or newer and
an adjacent `../rolnopol` checkout with installed dependencies are required.

```bash
npm run coverage:app-code
# Or point to another application checkout:
npm run coverage:app-code -- --app path/to/rolnopol
```

Open `coverage-report/app-code/index.html` for line, function, and branch
coverage of the 14 explicitly listed backend files. The report also writes
`summary.json` and `lcov.info`. The same run refreshes the scenario report with
the selected Playwright result. It needs no demo credentials because the selected
specs create their own users. The application’s frontend JavaScript, other
backend modules, and its own Vitest suite are outside this pilot denominator.
A loaded route file can have high line coverage from registration at startup;
use the scenario assertions to judge behavior.

## Running and Debugging Tests

```bash
npm test
npm run test:headed
npm run test:debug
npm run test:report
npx playwright test --project=no-auth-tests --grep @auth
```

`npm test` also writes the raw JSON reporter output; use `coverage:run` for a
complete report with source provenance. Current projects are `health-check`,
`setup-demo-user`, `smoke-tests`, `demo-user-tests`, `no-auth-tests`,
`api-tests`, `isolated-user-tests`, and `visual-test`. See
[playwright.config.ts](playwright.config.ts) for filename matching and dependencies.

## Code Quality and CI

```bash
npm run check:ci
npm run lint
npm run tsc:check
npm run format:check
```

`check:ci` checks non-TypeScript formatting, ESLint (including TypeScript
formatting), and TypeScript types without writing files. `npm run check` also
formats files and is intended for local editing. Husky/lint-staged check staged
changes. Existing ESLint, Prettier and TypeScript configurations remain the source
of tooling rules.

The repository was also scanned locally with SonarQube in October 2026. Three
reported findings led to review of test-email randomness and numeric parsing.
The Quality Gate status has not been independently verified. This local scan
is separate from the CI checks below.

[GitHub Actions](.github/workflows/playwright-e2e-tests.yml) runs manually with
`workflow_dispatch`. Quality includes coverage-tool tests and ID validation.
The test job generates reports and retains coverage and standard Playwright
artifacts after both successful and failed runs. It is not currently a PR gate.

## Documentation

- [TEST_PLAN.md](TEST_PLAN.md): strategy, scope exclusions, scenario catalog and
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
