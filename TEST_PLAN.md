# Rolnopol test development plan

> Application inventory: September 5, 2026, Rolnopol v1.79.0.
> September 7, 2026 update: code review, test collection, `check:ci`,
> and anonymous access checks at `http://localhost:3000`.

## 1. Repository purpose

This repository is primarily for learning TypeScript, Playwright, test design,
and API testing. The goal is to build a small, trustworthy framework that is
easy to debug, rather than cover every button.

The Rolnopol application itself was created for learning automated testing and
has an educational design. I choose the exercise scope deliberately; I will
not report every observed deviation as a defect. I record specific exclusions
in the plan together with the observation and rationale. The application's
educational purpose does not imply that every deviation was intentionally
designed by its author.

I change test code and configuration myself to practice. The mentor's role is
analysis, guidance, reviewing my changes, and helping interpret results.

Core development principles:

1. Restore confidence in existing tests first.
2. Check business logic mainly through fast API tests.
3. Reserve UI tests for user-visible behavior.
4. Combine UI and API in full E2E only for a few critical journeys.
5. Each test should have one clear reason to fail.
6. Each small change should belong in one commit.

## 2. Repository evidence and environment

Dated observations and completed exercises are archived in [Notes](NOTES.md).
Use the generated report for current collection and execution evidence.

### Scope decision: anonymous access to Staff & Fields

A Playwright check run from the terminal on September 7, 2026, using a separate
clean browser context for each route, confirmed:

- `/profile.html`, `/marketplace.html`, and `/financial.html` redirect
  anonymous users to `/login.html`;
- `/staff-fields-main.html`, `/staff-fields-assign.html`, and
  `/staff-fields-charts.html` remain open; the redirect assertion did not
  pass within the 5-second wait;
- observed requests from those pages to `/api/v1/fields`, `/api/v1/staff`,
  `/api/v1/fields/assign`, and `/api/v1/animals` received `401`;
- the HTML document for each of the six pages initially returned `200`.

Because this is an educational project, **I will not report the missing
redirects on those three pages as defects**. The agreed change was to remove only
the three `/staff-fields-*.html` entries from `protectedRoutes` in
`tests/auth/access-control.noauth.spec.ts`. The remaining cases cover the profile,
marketplace, and financial redirect tests. The three entries have now been removed (code inspection: September 13, 2026).

This is a deliberate limit on UI redirect testing. It does not remove application
endpoints, authenticated farm tests, or planned API authorization tests.
HTML page routes and endpoints such as `/api/v1/staff` or `/api/v1/fields`
are different elements. Opening a page does not prove access to protected data;
the observed `401` responses are not a complete authorization audit either.
I do not assume that the missing redirect is an intended application requirement.

### Scope decision: zero field area through API

On September 30, 2026, the user checked `POST /fields` with `area: 0` and
observed `201`. The UI requires a positive area, but the current API does not
enforce that rule. For this educational application, do not add a test requiring
the API to reject zero area or report this difference as a defect. The temporary
`TC-FARM-011` test was removed; no catalog row was assigned to it.

### Known environment constraints

- The server maintains one active session per user. Logging into the same account
  again invalidates the previous token, so state-changing tests cannot share accounts.
- `page` and `request` have separate cookie stores. `applySessionCookies` copies
  the session only from `request` to the browser context; later UI session changes
  do not automatically update `request`.
- Rate limiting is per IP. Registering and logging in a fresh account adds requests,
  so worker count should be selected through measurement rather than hiding 429
  responses with retries.
- Swagger is a guide, not a complete contract. For example, it omits
  `GET /fields/assign`, while the `/financial/transactions` response includes
  `hasMore`, which is missing from the schema.

## 3. Priorities

- **P0**: a passing baseline, healthcheck, login/session, route protection,
  and one basic farm flow.
- **P1**: farm, financial, and marketplace API contracts and key business rules.
- **P2**: alerts, contact, charts, map, accessibility, responsiveness,
  and stable visual tests.
- **Outside ordinary CI**: `/shutdown`, database restoration, feature flag changes,
  and other destructive administrative endpoints. Test these only in a disposable environment.

## 4. Learning notes

The [current learning queue](NOTES.md#current-learning-queue-october-18-2026),
[reference roadmap](NOTES.md#reference-roadmap), completed exercises and dated
verification records live in NOTES. Keep mentor plans and progress notes there;
they are not embedded in the coverage report. This document owns test strategy,
scope decisions, scenario catalog and the reporting contract.

## 5. Scenario catalog and coverage contract

This is the only manually maintained scenario registry. The initial catalog
maps all existing scenario tests and selected next exercises from the roadmap.
Broader roadmap topics have not all been decomposed into cases: percentages
apply only to included rows below, never to the entire application.

One row describes one concrete case at one test layer. UI and API checks of
related behavior may have different IDs. Existing overlapping tests remain
visible and are not evidence of additional business requirements. Technical
maintenance tasks are not scenario rows. Setup entries have no case ID.

- Add one static `case-id` annotation to each test declaration. Use
  `TC-AREA-001` identifiers, never recycle IDs, and keep them after renaming files.
- Parameterized data carries explicit IDs per case; array positions are not IDs.
- Included rows with no collected test are planned gaps, not validation errors.
- Excluded rows require a rationale. Do not silently remove gaps to improve a score.
- README contains a generated index of this catalog. Edit rows here and run
  `npm run coverage:readme`; the report parses both complete Markdown documents.
- Supported table cells are single-line text with `\|` for a literal pipe.
  The column names and start/end markers are part of the parser contract.

Risk is an initial qualitative estimate of what a regression would affect in
this learning application. It is separate from test execution priority:

- `critical`: unauthorized access or modification, or incorrect financial state;
- `high`: a core account, farm, marketplace, or ownership workflow breaks;
- `medium`: a limited workflow, validation, or data view becomes incorrect;
- `low`: an informational, auxiliary, or visual behavior changes.

Review these assignments when expected behavior becomes clearer. Excluded rows
retain a risk estimate, but remain outside coverage denominators.

<!-- coverage-catalog:start -->

| ID             | Area        | Scenario                                                               | Layer  | Priority | Risk     | Scope    | Notes                                                                                                                                                           |
| -------------- | ----------- | ---------------------------------------------------------------------- | ------ | -------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-ASSIGN-001  | Farm        | should assignment for new staff and field                              | UI     | P1       | high     | included | -                                                                                                                                                               |
| TC-ASSIGN-002  | Farm        | should not show assigned staff in select dropdown                      | UI     | P1       | medium   | included | -                                                                                                                                                               |
| TC-ASSIGN-003  | Farm        | should unassigned works correctly                                      | UI     | P1       | high     | included | -                                                                                                                                                               |
| TC-ASSIGN-004  | Farm        | should show 2 staff assigned to field in tree view                     | UI     | P1       | medium   | included | -                                                                                                                                                               |
| TC-ASSIGN-005  | Farm        | A user can assign their staff member to their field through API        | API    | P1       | high     | included | Source checks fieldId, staffId, and the stored assignment; current targeted run not recorded.                                                                   |
| TC-ASSIGN-006  | Farm        | Removing a staff assignment leaves it absent from the assignment list  | API    | P1       | high     | included | Source checks the created pair, delete response, and read-back; user reported a pass on 2026-10-04 without a recorded command.                                  |
| TC-AUTH-001    | Auth        | should register new user successfully with valid data                  | API    | P0       | high     | included | -                                                                                                                                                               |
| TC-AUTH-002    | Auth        | should reject registration with invalid email format                   | API    | P0       | medium   | included | -                                                                                                                                                               |
| TC-AUTH-003    | Auth        | should reject registration with duplicate email                        | API    | P0       | medium   | included | -                                                                                                                                                               |
| TC-AUTH-004    | Auth        | should login successfully with valid credentials                       | API    | P0       | high     | included | -                                                                                                                                                               |
| TC-AUTH-005    | Auth        | should reject login with non-existent email                            | API    | P0       | medium   | included | -                                                                                                                                                               |
| TC-AUTH-006    | Auth        | should reject login with wrong password                                | API    | P0       | high     | included | -                                                                                                                                                               |
| TC-AUTH-007    | Auth        | should validate valid token via GET request                            | API    | P0       | high     | included | -                                                                                                                                                               |
| TC-AUTH-008    | Auth        | should reject invalid token via GET request                            | API    | P0       | critical | included | -                                                                                                                                                               |
| TC-AUTH-009    | Auth        | should validate valid token via POST request                           | API    | P0       | high     | included | -                                                                                                                                                               |
| TC-AUTH-010    | Auth        | should reject invalid token via POST request                           | API    | P0       | critical | included | -                                                                                                                                                               |
| TC-AUTH-011    | Auth        | should logout successfully                                             | API    | P0       | high     | included | -                                                                                                                                                               |
| TC-AUTH-012    | Auth        | Anonymous fields request returns 401 without field data                | API    | P0       | critical | included | -                                                                                                                                                               |
| TC-CHART-001   | Charts      | Chart type switches without JavaScript errors                          | UI     | P2       | low      | included | Planned contract; review expected behavior before implementation.                                                                                               |
| TC-FARM-001    | Farm        | should create a new field in Staff & Fields view                       | UI     | P1       | high     | included | -                                                                                                                                                               |
| TC-FARM-002    | Farm        | should create a new animal herd in Staff & Fields view                 | UI     | P1       | medium   | included | -                                                                                                                                                               |
| TC-FARM-003    | Farm        | should create a new staff in Staff & Fields view                       | UI     | P1       | high     | included | -                                                                                                                                                               |
| TC-FARM-004    | Farm        | should edit a field name                                               | UI     | P1       | medium   | included | -                                                                                                                                                               |
| TC-FARM-005    | Farm        | should delete a field                                                  | UI     | P1       | high     | included | -                                                                                                                                                               |
| TC-FARM-006    | Farm        | should update a staff                                                  | UI     | P1       | medium   | included | -                                                                                                                                                               |
| TC-FARM-007    | Farm        | should delete a staff                                                  | UI     | P1       | high     | included | -                                                                                                                                                               |
| TC-FARM-008    | Farm        | should edit a animal                                                   | UI     | P1       | medium   | included | -                                                                                                                                                               |
| TC-FARM-009    | Farm        | should delete a animal                                                 | UI     | P1       | high     | included | -                                                                                                                                                               |
| TC-FARM-010    | Farm        | A newly created field can be retrieved with its name and area          | API    | P0       | medium   | included | Targeted API run passed 2026-09-27 (one worker, no retries).                                                                                                    |
| TC-FARM-012    | Farm        | Deleting an assigned field removes its field and assignment            | API    | P1       | high     | included | Source asserts status 200 and resources absent; API-project run passed on 2026-09-30 (1 worker, zero retries).                                                  |
| TC-FARM-013    | Farm        | Fields search and pagination show the requested subset                 | UI     | P1       | medium   | included | User-reported pass 2026-09-27; command/result pending.                                                                                                          |
| TC-FARM-014    | Farm        | Updating a field persists its new name and area                        | API    | P1       | medium   | included | Checks PUT response and GET read-back; targeted and API-project runs passed 2026-09-30.                                                                         |
| TC-FARM-015    | Farm        | A newly created staff member appears with their name, surname, and age | API    | P1       | high     | included | Focused run passed 2026-10-04 (2/2 including health-check); ESLint and TypeScript checks passed.                                                                |
| TC-FARM-016    | Farm        | A newly created animal herd appears with its type and amount           | API    | P1       | medium   | included | Source uses createdAnimal and getAnimals to check ID, type, and amount; focused run not recorded.                                                               |
| TC-FARM-017    | Farm        | Updating a staff member persists the changed name, surname, and age    | API    | P1       | medium   | included | Checks PUT response and updated values in a later staff list; user-reported pass 2026-10-05, command unknown.                                                   |
| TC-FARM-018    | Farm        | Updating an animal herd persists the changed type and amount           | API    | P1       | medium   | included | Checks PUT response and updated values in a later animal list; user-reported pass 2026-10-05, command unknown.                                                  |
| TC-FARM-019    | Farm        | Deleting a staff member removes that member from the staff list        | API    | P1       | high     | included | Checks DELETE status and absence from later staff list; user-reported pass 2026-10-05, command unknown.                                                         |
| TC-FARM-020    | Farm        | Deleting an animal herd removes that herd from the animal list         | API    | P1       | medium   | included | Checks DELETE response and absence from later animal list; user-reported pass 2026-10-05, command unknown.                                                      |
| TC-FARM-021    | Farm        | Deleting assigned staff removes the assignment and preserves the field | API    | P1       | high     | included | Source reviewed 2026-10-10: DELETE response, staff and assignment absence, and field preservation; no new run recorded.                                         |
| TC-FARM-022    | Farm        | An unsupported animal type is rejected without creating a herd         | API    | P1       | medium   | included | Source reviewed 2026-10-10: status 400, error, and unchanged animal list; no new run recorded.                                                                  |
| TC-FIN-001     | Finance     | verify account balance and transaction history                         | UI     | P1       | medium   | included | -                                                                                                                                                               |
| TC-FIN-002     | Finance     | verify funds transfer between users                                    | UI     | P1       | critical | included | -                                                                                                                                                               |
| TC-FIN-003     | Finance     | verify prevent overdraft                                               | UI     | P1       | critical | included | Source reviewed 2026-10-06: initial API balance and a new read after rejection; no new run recorded.                                                            |
| TC-FIN-004     | Finance     | Transaction history respects limit and offset and exposes hasMore      | API    | P1       | medium   | included | -                                                                                                                                                               |
| TC-FIN-005     | Finance     | Income and expense update the API account balance                      | API    | P1       | critical | included | Source reviewed 2026-10-15: raw POSTs, exact 201/success, income and expense data, fresh balance reads; no new execution result recorded.                       |
| TC-FIN-006     | Finance     | Transfer accepts the minimum amount 0.01                               | API    | P1       | high     | included | -                                                                                                                                                               |
| TC-FIN-007     | Finance     | Transfer accepts the maximum amount 999.99                             | API    | P1       | high     | included | -                                                                                                                                                               |
| TC-FIN-008     | Finance     | Transfer of the full available balance leaves zero                     | API    | P1       | high     | included | -                                                                                                                                                               |
| TC-FIN-009     | Finance     | Transfer above available balance leaves both accounts unchanged        | API    | P1       | critical | included | -                                                                                                                                                               |
| TC-FIN-010     | Finance     | Transfer to a nonexistent recipient is rejected                        | API    | P1       | high     | included | -                                                                                                                                                               |
| TC-FIN-011     | Finance     | A fresh user can read their financial account and balance              | API    | P1       | high     | included | Source reviewed 2026-10-15: raw account GET and typed success assertion; account userId matches the session. Historical API-project pass: 2026-09-30.           |
| TC-FIN-012     | Finance     | Transaction history filters by type                                    | API    | P1       | medium   | included | Creates income and expense, then checks that the income filter returns only the expected transaction.                                                           |
| TC-FIN-013     | Finance     | Transaction history filters by category                                | API    | P1       | medium   | included | Creates two income categories, then checks that the salary filter returns only the expected transaction.                                                        |
| TC-FIN-014     | Finance     | Transaction history filters by date range                              | API    | P1       | medium   | included | Checks matching and empty ranges; API-project run passed 2026-09-30.                                                                                            |
| TC-FIN-015     | Finance     | Transfer above 999.99 ROL is rejected without changing either balance  | API    | P1       | high     | included | API-project run passed 2026-09-30 (one worker, zero retries).                                                                                                   |
| TC-GUARD-001   | Auth        | should redirect anonymous user from /profile.html to login             | UI     | P0       | high     | included | -                                                                                                                                                               |
| TC-GUARD-002   | Auth        | should redirect anonymous user from /marketplace.html to login         | UI     | P0       | high     | included | -                                                                                                                                                               |
| TC-GUARD-003   | Auth        | should redirect anonymous user from /financial.html to login           | UI     | P0       | high     | included | -                                                                                                                                                               |
| TC-GUARD-004   | Auth        | Anonymous Staff and Fields main page redirects to login                | UI     | P0       | high     | excluded | Deliberate UI redirect exclusion recorded in section 2; API authorization remains in scope.                                                                     |
| TC-GUARD-005   | Auth        | Anonymous assignments page redirects to login                          | UI     | P0       | high     | excluded | Deliberate UI redirect exclusion recorded in section 2; authenticated features remain in scope.                                                                 |
| TC-GUARD-006   | Auth        | Anonymous charts page redirects to login                               | UI     | P0       | low      | excluded | Deliberate UI redirect exclusion recorded in section 2; chart behavior remains in scope.                                                                        |
| TC-JOURNEY-001 | Journeys    | should create assignment for new farmer                                | E2E    | P0       | high     | included | -                                                                                                                                                               |
| TC-JOURNEY-002 | Journeys    | marketplace e2e test                                                   | E2E    | P0       | high     | included | -                                                                                                                                                               |
| TC-JOURNEY-003 | Journeys    | verify blocked transaction                                             | E2E    | P0       | critical | included | -                                                                                                                                                               |
| TC-LOGIN-001   | Auth        | should display correct user data after login                           | UI     | P0       | medium   | included | -                                                                                                                                                               |
| TC-LOGIN-002   | Auth        | session management should work correctly                               | UI     | P0       | high     | included | -                                                                                                                                                               |
| TC-MARKET-001  | Marketplace | should buy an owned test field offer and verify transaction history    | UI     | P1       | high     | included | -                                                                                                                                                               |
| TC-MARKET-002  | Marketplace | should return error when offer is to expensive                         | UI     | P1       | high     | included | Source reviewed 2026-10-15: test-owned offer, POST 400, notification, and fresh balance, offer-status, and ownership checks; no exact run recorded.             |
| TC-MARKET-003  | Marketplace | create offer and verify in My Offers page                              | UI     | P1       | medium   | included | -                                                                                                                                                               |
| TC-MARKET-004  | Marketplace | An owner can cancel an offer through API                               | API    | P1       | high     | included | Source reviewed 2026-10-10: active owned offer, DELETE response, and cancelled state in a fresh my-offers read; no new run recorded.                            |
| TC-MARKET-005  | Marketplace | A different user cannot cancel another owner offer                     | API    | P1       | critical | included | Source reviewed 2026-10-10: another user receives 403 and the owner offer remains active; no new run recorded.                                                  |
| TC-MARKET-006  | Marketplace | An owner can cancel an offer through UI                                | UI     | P1       | high     | included | UI cancellation checks HTTP 200, notification and fresh owner state. Passed in isolated-user-tests on 2026-10-18.                                               |
| TC-MARKET-007  | Marketplace | An owner cannot buy their own offer                                    | API    | P1       | high     | included | Source reviewed 2026-10-10: status 400, error, unchanged balance, and active offer; no new run recorded. Corrects mistaken use of reserved UI ID TC-MARKET-006. |
| TC-PROFILE-001 | Profile     | should display correct user information in profile sections            | UI     | P1       | medium   | included | Full-run observation: redirected to login; investigate shared-session invalidation.                                                                             |
| TC-PROFILE-002 | Profile     | A fresh user can update the display name                               | UI     | P1       | medium   | included | Waiter ordering corrected. Passed in isolated-user-tests on 2026-10-18; update, reload and unchanged-email assertions reviewed.                                 |
| TC-PROFILE-003 | Profile     | A fresh user can delete their own account after confirmation           | UI     | P1       | high     | included | Source reviewed 2026-10-19: deletion response, UI redirect via ENV.BASE_URL and rejected login. Focused profile-file run passed; see NOTES for scope.           |
| TC-PUBLIC-001  | Public      | Alerts page opens and displays its main controls                       | UI     | P2       | low      | included | Planned contract; review expected behavior before implementation.                                                                                               |
| TC-PUBLIC-002  | Public      | Contact rejects missing required fields                                | UI     | P2       | medium   | included | Reviewed 2026-10-19: four custom errors, contact URL and no matching POST during validation; listener removed in finally. Focused Contact run passed.           |
| TC-PUBLIC-003  | Public      | Contact accepts a valid submission                                     | UI     | P2       | medium   | included | Reviewed 2026-10-19: POST 200, success flag, response message, UI notification and four cleared fields. Focused Contact run passed.                             |
| TC-REG-001     | Auth        | should register new user successfully                                  | UI     | P0       | high     | included | Source reviewed 2026-10-18: POST 201, login heading and final login URL; no transient success-message assertion. No new application run.                        |
| TC-REG-002     | Auth        | should display validation errors for invalid email and short password  | UI     | P0       | medium   | included | -                                                                                                                                                               |
| TC-REG-003     | Auth        | should prevent registration with empty required fields                 | UI     | P0       | medium   | included | Source reviewed 2026-10-15: native missing-value checks, email focus, and URL. Learner reported a pass; exact command and broader results not supplied.         |
| TC-REG-004     | Auth        | should reject password with 1 characters                               | UI     | P0       | high     | included | -                                                                                                                                                               |
| TC-REG-005     | Auth        | should reject password with 2 characters                               | UI     | P0       | high     | included | -                                                                                                                                                               |
| TC-REG-006     | Auth        | should reject registration for empty password                          | UI     | P0       | high     | included | -                                                                                                                                                               |
| TC-REG-007     | Auth        | should reject registration with duplicate email                        | UI     | P0       | medium   | included | -                                                                                                                                                               |
| TC-REG-008     | Auth        | should reject invalid email: "plaintext"                               | UI     | P0       | medium   | included | -                                                                                                                                                               |
| TC-REG-009     | Auth        | should reject invalid email: "@example.com"                            | UI     | P0       | medium   | included | -                                                                                                                                                               |
| TC-REG-010     | Auth        | should reject invalid email: "user@"                                   | UI     | P0       | medium   | included | -                                                                                                                                                               |
| TC-REG-011     | Auth        | should reject invalid email: "user @example.com"                       | UI     | P0       | medium   | included | -                                                                                                                                                               |
| TC-SMOKE-001   | Public      | should display the correct page title 'Rolnopol' on homepage           | UI     | P0       | low      | included | -                                                                                                                                                               |
| TC-SMOKE-002   | Public      | should load login page successfully                                    | UI     | P0       | medium   | included | -                                                                                                                                                               |
| TC-SMOKE-003   | Public      | should load API documentation page successfully                        | UI     | P0       | low      | included | -                                                                                                                                                               |
| TC-SMOKE-004   | Public      | should load documentation page successfully                            | UI     | P0       | low      | included | -                                                                                                                                                               |
| TC-SMOKE-005   | Public      | should not display marketplace for non-logged user                     | UI     | P0       | high     | included | Overlaps TC-GUARD-002; both existing cases are counted separately.                                                                                              |
| TC-SMOKE-006   | Public      | should load register page successfully                                 | UI     | P0       | medium   | included | -                                                                                                                                                               |
| TC-SMOKE-007   | Public      | api app health check                                                   | API    | P0       | high     | included | -                                                                                                                                                               |
| TC-VIS-001     | Visual      | should match homepage visual snapshot                                  | Visual | P2       | low      | included | Spec layout and import corrected; Windows baseline comparison passed 2026-10-18 without updating snapshots. Linux baseline remains unverified.                  |

<!-- coverage-catalog:end -->

### Metric definitions

Automation coverage = included IDs with a collected test / all included IDs.
Execution confirmation = included IDs passing in every collected project /
all included IDs, only for matching source fingerprints and no global run errors.
No denominator means no percentage. Missing or stale results mean no current
confirmation, not zero failures. Setup and excluded cases are shown separately.

Retries and repetitions are attempts, not new scenarios. Results retain passed,
failed, flaky, skipped, not-run, interrupted, partial, and expected-failure states.
A passing subset of required projects is partial. A mixture of pass and fail
observations is shown as flaky; this describes that run, not its root cause.
Expected failures do not confirm correct application behavior. Skips explicitly
annotated by Playwright are separated from cases not executed after setup failure.

An ID only proves a declared mapping. Review assertions before interpreting a
passing test as evidence; known weaknesses remain visible in the Notes column.

## 6. Conventions for new tests

See [Coding Standards](CODING_STANDARDS.md#test-file-conventions-and-stability) for
file naming, Arrange-Act-Assert, locators, and stability rules.

## 7. Useful verification commands

```bash
# What Playwright actually collects
npx playwright test --list

# Code quality
npm run check:ci

# Fast layers
npx playwright test --project=api-tests --workers=1
npx playwright test --project=smoke-tests --workers=1

# P0 priority after adding tags
npx playwright test --grep @p0 --workers=1

# Full baseline without parallelism
npx playwright test --workers=1 --reporter=list
```

## 8. Coverage implementation workflow

The standalone tooling lives in `scripts/coverage/` and runs with Node.js.
`coverage:collect` uses Playwright discovery with no browser or credentials.
`coverage:validate` checks mappings and the generated README index.
`coverage:run` collects the full inventory, executes the selected scope with
one worker and zero retries by default, generates the report even after failure,
and preserves a failing exit code. Pass Playwright filters after `--`.
`coverage:report` only reads saved inputs and does not contact the application.

Generated outputs live in ignored `coverage-report/`: inventory, raw Playwright
results, normalized coverage JSON, and a standalone HTML document. The HTML
renders README, this plan, and Coding Standards as collapsed chapters alongside
the metrics and a collapsed, paginated scenario table. Historical notes are not embedded.
CI retains both Playwright HTML and coverage artifacts, including failed runs.

The source fingerprint includes test and helper code, report tooling, config,
package files and the three embedded documents. A Git revision alone cannot identify local
uncommitted edits. Application version is optional run metadata supplied with
`COVERAGE_APP_VERSION`; unknown is reported honestly. No historical trend or
release threshold is inferred from one run.

## 9. Definition of Done for a single task

- The test fails for the expected reason before the application/test fix.
- Data is unique and independent of execution order.
- Cleanup does not delete demo data or another test's data.
- The test passes individually and within its project.
- `npm run check:ci` passes.
- The name, tags, and test layer match the behavior under test.
- Record execution evidence in NOTES; update the catalog when scenario metadata
  or scope changes. A test file alone does not establish a pass.
