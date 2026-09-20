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

The report combines **parsed README**, **parsed TEST_PLAN**, a collected test
inventory, and Playwright JSON results. It runs without AI. Open
`coverage-report/index.html` directly in a browser; no report server or internet
connection is required. Search and filter by ID, area, priority, and result.

```bash
# Validate all test IDs and the generated README index; no server or login needed
npm run coverage:validate

# Generate a catalog-only report without running any tests
npm run coverage:collect
npm run coverage:report -- --no-results

# Run one project and generate a report, including when tests fail
npm run coverage:run -- --project=api-tests

# Run the full suite and generate the report
npm run coverage:run

# Rebuild HTML/normalized JSON from saved collection and current run results
npm run coverage:report

# Import a specific Playwright JSON file
npm run coverage:report -- --results path/to/results.json

# Regenerate this document's scenario index after editing TEST_PLAN
npm run coverage:readme

# Verify the reporting mechanism with deterministic local tests
npm run coverage:test
```

`coverage:run` defaults to one worker and zero retries. Additional Playwright
filters and repetition options follow `--`. Missing image baselines are never
created automatically (`--update-snapshots=none`). Review and update visual
baselines separately with Playwright. It preserves the test process exit
code after generating the report. It uses the repository configuration and does
not accept reporter/config/snapshot-update overrides, list mode, or interactive UI mode.
Collection is always complete even when the execution is filtered.

| Artifact                                  | Purpose                                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `coverage-report/inventory.json`          | Full collection, stable IDs, projects, source locations and fingerprint |
| `coverage-report/playwright-results.json` | Raw Playwright output from the latest run                               |
| `coverage-report/coverage.json`           | Joined scenarios, metrics, attempts, metadata and source documents      |
| `coverage-report/index.html`              | Standalone report with parsed README and TEST_PLAN                      |
| `playwright-report/index.html`            | Standard Playwright diagnostics, including available attachments        |

Outputs are ignored by Git and replaced on the next run. Copy the output folder
before another run if you need history. Raw Playwright diagnostics may contain
application data; the coverage HTML/normalized JSON omit logs and attachments.

### Reading the numbers

- **Implemented**: included catalog IDs with a collected test / all included IDs.
- **Confirmed**: included IDs passing in every collected project / all included
  IDs, provided results match the current source fingerprint and have no global errors.
- **Planned**: a catalog scenario without a collected implementation.
- **Not-run/partial**: no execution or incomplete project execution; never a pass.
- **Skipped, failed, flaky, interrupted, expected-failure**: separate observed states.
- **Excluded**: a documented scope decision, outside the denominator.

These are percentages of the explicit scenario catalog, **not code coverage or
application completeness**. The initial catalog covers existing tests and selected
upcoming exercises; broader roadmap topics still need decomposition. Setup,
retries, repetitions, and additional browsers do not create new unique scenarios.
An ID and a green run do not prove that the assertions are sufficient.

The report shows the run date, command, projects, retries, attempts, revision,
and a content fingerprint that also detects uncommitted source changes.
Results with a different fingerprint are stale; plain Playwright JSON without
coverage metadata has unknown freshness. Neither counts as current confirmation.
An outdated inventory is rejected: rerun `coverage:collect` after editing sources.
Set optional `COVERAGE_APP_VERSION` before `coverage:run` to record the tested
application version; otherwise it is reported as unknown.

### Maintaining IDs

[TEST_PLAN.md](TEST_PLAN.md#5-scenario-catalog-and-coverage-contract) owns the
manual catalog. Every scenario test declares exactly one annotation:

```ts
annotation: { type: 'case-id', description: 'TC-AUTH-001' }
```

Keep the ID when renaming a test or moving its file. Never reuse retired IDs.
Each parameterized input has an explicit ID in its data. Tags describe categories;
they do not replace IDs. Multiple projects may execute the same test definition.
The setup project is explicitly marked as infrastructure and has no scenario ID.

After changing the catalog, run `coverage:readme` and `coverage:validate`.
Unknown IDs, duplicate definitions, missing annotations, excluded collected cases,
and an outdated generated index fail validation. Planned rows without tests are
valid gaps. The catalog parser requires its exact headers and markers.

The HTML renderer supports headings, paragraphs, lists, blockquotes, tables,
fenced code, inline code, bold text, and safe HTTP/HTTPS or embedded-document links.
Raw HTML is displayed as text. Other repository links are shown as labels so the
export does not depend on the repository filesystem.

### Failure details and Playwright links

The scenario table uses `ID | Area | Scenario | Priority | Status | Failure | Details`.
Click a failing status or **Details** to expand project executions, retries,
duration, failure step, expected/received values and the reported source location.
The failure summary lists failed or interrupted scenarios from the selected run;
stale results are labelled as a saved run. Flaky attempts remain visible under
their scenario's details. Global errors are reported separately as a count.

Failure text is deliberately restricted to the reviewed public messages and step
names in `scripts/coverage/failures.mjs`. Unknown values and locations outside
collected test files display as unavailable. Raw errors, stacks, source snippets,
stdout/stderr and attachments are never copied into failure summaries. Adding a
new public message requires reviewing that allowlist; arbitrary runtime strings
are not made safe by HTML escaping.

**Open in Playwright report** links directly to the matching test using
`../playwright-report/index.html#?testId=...`. Keep both output folders side by
side, including when extracting CI artifacts. The generator checks the HTML
report's run timestamp, duration and available provenance, then resolves the ID
by case ID and project. Missing, mismatched or unsupported reports disable links.
The embedded HTML index reader supports the installed Playwright 1.58 format.
The Playwright report retains its own full diagnostics and is not sanitized by
the coverage exporter. Regenerate coverage after replacing either report.

Normalized `coverage.json` uses **schemaVersion 2**. Each case has a `scenario`
object (`title`, `area`, `priority`, `layer`) and an `execution` object (`status`,
`durationMs`, `runs`). Each run represents one project execution/repetition, with
its own status, duration, `playwrightTestId`, failure summary and `attempts`.
Each attempt retains its retry number, status, duration and failure. Durations
sum attempts; a run's failure is its last failed attempt, even if a retry passed.
Missing failure fields are `null`, never guessed from the test declaration.

## Running and Debugging Tests

```bash
npm test
npm run test:headed
npm run test:debug
npm run test:report
npx playwright test --project=no-auth-tests --grep @auth
```

`npm test` also writes the raw JSON reporter output; use `coverage:run` for a
complete report with source provenance. Current projects are `setup-demo-user`,
`smoke-tests`, `demo-user-tests`, `no-auth-tests`, `api-tests`,
`isolated-user-tests`, and `visual-test`. See
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

[GitHub Actions](.github/workflows/playwright-e2e-tests.yml) runs manually with
`workflow_dispatch`. Quality includes coverage-tool tests and ID validation.
The test job generates reports and retains coverage and standard Playwright
artifacts after both successful and failed runs. It is not currently a PR gate.

## Documentation

- [TEST_PLAN.md](TEST_PLAN.md): strategy, scope exclusions, scenario catalog and
  the single active learning backlog.
- [CODING_STANDARDS.md](CODING_STANDARDS.md): AAA, Page Objects and locator rules.
- [.agents/skills/CONTEXT.md](.agents/skills/CONTEXT.md): shared agent workflow.

## Scenario Index

Generated from TEST_PLAN. Edit the source catalog, then run `coverage:readme`.
Implementation and execution states are computed in the report, not edited here.

<!-- coverage-index:start -->

| ID             | Area        | Scenario                                                              | Layer  | Priority | Scope    |
| -------------- | ----------- | --------------------------------------------------------------------- | ------ | -------- | -------- |
| TC-ASSIGN-001  | Farm        | should assignment for new staff and field                             | UI     | P1       | included |
| TC-ASSIGN-002  | Farm        | should not show assigned staff in select dropdown                     | UI     | P1       | included |
| TC-ASSIGN-003  | Farm        | should unassigned works correctly                                     | UI     | P1       | included |
| TC-ASSIGN-004  | Farm        | should show 2 staff assigned to field in tree view                    | UI     | P1       | included |
| TC-AUTH-001    | Auth        | should register new user successfully with valid data                 | API    | P0       | included |
| TC-AUTH-002    | Auth        | should reject registration with invalid email format                  | API    | P0       | included |
| TC-AUTH-003    | Auth        | should reject registration with duplicate email                       | API    | P0       | included |
| TC-AUTH-004    | Auth        | should login successfully with valid credentials                      | API    | P0       | included |
| TC-AUTH-005    | Auth        | should reject login with non-existent email                           | API    | P0       | included |
| TC-AUTH-006    | Auth        | should reject login with wrong password                               | API    | P0       | included |
| TC-AUTH-007    | Auth        | should validate valid token via GET request                           | API    | P0       | included |
| TC-AUTH-008    | Auth        | should reject invalid token via GET request                           | API    | P0       | included |
| TC-AUTH-009    | Auth        | should validate valid token via POST request                          | API    | P0       | included |
| TC-AUTH-010    | Auth        | should reject invalid token via POST request                          | API    | P0       | included |
| TC-AUTH-011    | Auth        | should logout successfully                                            | API    | P0       | included |
| TC-AUTH-012    | Auth        | Anonymous fields request returns 401 without field data               | API    | P0       | included |
| TC-CHART-001   | Charts      | Chart type switches without JavaScript errors                         | UI     | P2       | included |
| TC-FARM-001    | Farm        | should create a new field in Staff & Fields view                      | UI     | P1       | included |
| TC-FARM-002    | Farm        | should create a new animal herd in Staff & Fields view                | UI     | P1       | included |
| TC-FARM-003    | Farm        | should create a new staff in Staff & Fields view                      | UI     | P1       | included |
| TC-FARM-004    | Farm        | should edit a field name                                              | UI     | P1       | included |
| TC-FARM-005    | Farm        | should delete a field                                                 | UI     | P1       | included |
| TC-FARM-006    | Farm        | should update a staff                                                 | UI     | P1       | included |
| TC-FARM-007    | Farm        | should delete a staff                                                 | UI     | P1       | included |
| TC-FARM-008    | Farm        | should edit a animal                                                  | UI     | P1       | included |
| TC-FARM-009    | Farm        | should delete a animal                                                | UI     | P1       | included |
| TC-FARM-010    | Farm        | A newly created field can be retrieved with its name and area         | API    | P0       | included |
| TC-FARM-011    | Farm        | Invalid field area is rejected without creating a field               | API    | P1       | included |
| TC-FARM-012    | Farm        | Deleting an assigned field follows the agreed deletion contract       | API    | P1       | included |
| TC-FARM-013    | Farm        | Fields search and pagination show the requested subset                | UI     | P1       | included |
| TC-FIN-001     | Finance     | verify account balance and transaction history                        | UI     | P1       | included |
| TC-FIN-002     | Finance     | verify funds transfer between users                                   | UI     | P1       | included |
| TC-FIN-003     | Finance     | verify prevent overdraft                                              | UI     | P1       | included |
| TC-FIN-004     | Finance     | Transaction history respects limit and offset and exposes hasMore     | API    | P1       | included |
| TC-FIN-005     | Finance     | Income and expense update the API account balance                     | API    | P1       | included |
| TC-FIN-006     | Finance     | Transfer accepts the minimum amount 0.01                              | API    | P1       | included |
| TC-FIN-007     | Finance     | Transfer accepts the maximum amount 999.99                            | API    | P1       | included |
| TC-FIN-008     | Finance     | Transfer of the full available balance leaves zero                    | API    | P1       | included |
| TC-FIN-009     | Finance     | Transfer above available balance leaves both accounts unchanged       | API    | P1       | included |
| TC-FIN-010     | Finance     | Transfer to a nonexistent recipient is rejected                       | API    | P1       | included |
| TC-FIN-011     | Finance     | A fresh user can read their financial account and balance             | API    | P1       | included |
| TC-GUARD-001   | Auth        | should redirect anonymous user from /profile.html to login            | UI     | P0       | included |
| TC-GUARD-002   | Auth        | should redirect anonymous user from /marketplace.html to login        | UI     | P0       | included |
| TC-GUARD-003   | Auth        | should redirect anonymous user from /financial.html to login          | UI     | P0       | included |
| TC-GUARD-004   | Auth        | Anonymous Staff and Fields main page redirects to login               | UI     | P0       | excluded |
| TC-GUARD-005   | Auth        | Anonymous assignments page redirects to login                         | UI     | P0       | excluded |
| TC-GUARD-006   | Auth        | Anonymous charts page redirects to login                              | UI     | P0       | excluded |
| TC-JOURNEY-001 | Journeys    | should create assignment for new farmer                               | E2E    | P0       | included |
| TC-JOURNEY-002 | Journeys    | marketplace e2e test                                                  | E2E    | P0       | included |
| TC-JOURNEY-003 | Journeys    | verify blocked transaction                                            | E2E    | P0       | included |
| TC-LOGIN-001   | Auth        | should display correct user data after login                          | UI     | P0       | included |
| TC-LOGIN-002   | Auth        | session management should work correctly                              | UI     | P0       | included |
| TC-MARKET-001  | Marketplace | should buy random offer and verify transaction history                | UI     | P1       | included |
| TC-MARKET-002  | Marketplace | should return error when offer is to expensive                        | UI     | P1       | included |
| TC-MARKET-003  | Marketplace | create offer and verify in My Offers page                             | UI     | P1       | included |
| TC-MARKET-004  | Marketplace | An owner can cancel an offer through API                              | API    | P1       | included |
| TC-MARKET-005  | Marketplace | A different user cannot cancel another owner offer                    | API    | P1       | included |
| TC-MARKET-006  | Marketplace | An owner can cancel an offer through UI                               | UI     | P1       | included |
| TC-PROFILE-001 | Profile     | should display correct user information in profile sections           | UI     | P1       | included |
| TC-PROFILE-002 | Profile     | A fresh user can update the display name                              | UI     | P1       | included |
| TC-PROFILE-003 | Profile     | A fresh user can delete their own account after confirmation          | UI     | P1       | included |
| TC-PUBLIC-001  | Public      | Alerts page opens and displays its main controls                      | UI     | P2       | included |
| TC-PUBLIC-002  | Public      | Contact rejects missing required fields                               | UI     | P2       | included |
| TC-PUBLIC-003  | Public      | Contact accepts a valid submission                                    | UI     | P2       | included |
| TC-REG-001     | Auth        | should register new user successfully                                 | UI     | P0       | included |
| TC-REG-002     | Auth        | should display validation errors for invalid email and short password | UI     | P0       | included |
| TC-REG-003     | Auth        | should prevent registration with empty required fields                | UI     | P0       | included |
| TC-REG-004     | Auth        | should reject password with 1 characters                              | UI     | P0       | included |
| TC-REG-005     | Auth        | should reject password with 2 characters                              | UI     | P0       | included |
| TC-REG-006     | Auth        | should reject registration for empty password                         | UI     | P0       | included |
| TC-REG-007     | Auth        | should reject registration with duplicate email                       | UI     | P0       | included |
| TC-REG-008     | Auth        | should reject invalid email: "plaintext"                              | UI     | P0       | included |
| TC-REG-009     | Auth        | should reject invalid email: "@example.com"                           | UI     | P0       | included |
| TC-REG-010     | Auth        | should reject invalid email: "user@"                                  | UI     | P0       | included |
| TC-REG-011     | Auth        | should reject invalid email: "user @example.com"                      | UI     | P0       | included |
| TC-SMOKE-001   | Public      | should display the correct page title 'Rolnopol' on homepage          | UI     | P0       | included |
| TC-SMOKE-002   | Public      | should load login page successfully                                   | UI     | P0       | included |
| TC-SMOKE-003   | Public      | should load API documentation page successfully                       | UI     | P0       | included |
| TC-SMOKE-004   | Public      | should load documentation page successfully                           | UI     | P0       | included |
| TC-SMOKE-005   | Public      | should not display marketplace for non-logged user                    | UI     | P0       | included |
| TC-SMOKE-006   | Public      | should load register page successfully                                | UI     | P0       | included |
| TC-SMOKE-007   | Public      | api app health check                                                  | API    | P0       | included |
| TC-VIS-001     | Visual      | should match homepage visual snapshot                                 | Visual | P2       | included |

<!-- coverage-index:end -->

## Agent Skills

All project skills are maintained in [.agents/skills](.agents/skills).
The [shared context](.agents/skills/CONTEXT.md) defines mentoring mode,
repository sources, and verification scope. TEST_PLAN.md remains the single test roadmap.

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

Example requests:

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
