# Rolnopol test development plan

> Application inventory: September 5, 2026, Rolnopol v1.79.0.
> September 7, 2026 update: code review, test collection, `check:ci`,
> and anonymous access checks at `http://localhost:3000`.
> Neither the full regression suite nor the complete API inventory was rerun.

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

### Historical code and collection evidence: September 13, 2026

Playwright collection before adding IDs returned **59 entries in 13 files**:
58 scenario tests and one demo-session setup, across seven projects. Collection
is not evidence that those tests pass. Generated inventory is the current source
for counts; do not maintain a second live test counter here.

- Anonymous redirects now cover Profile, Marketplace, and Financial only.
- Short-password and invalid-email inputs are separate collected test cases.
- Staff management and assignment suites already use the isolated-user project.
- Login tests use a registered user and reopen the profile after logout.
- Financial transfer recipients are created independently without shared login.
- The positive registration test still asserts a transient success message.
- The overdraft test still hardcodes its drain amount and checks a balance read
  before the rejected action; its ID does not establish assertion quality.
- CI remains manually triggered through `workflow_dispatch`.
- `trace: 'on'` remains an existing debugging setting.

### API source review: September 27, 2026

`tests/api/farm.api.spec.ts` declares `TC-AUTH-012`, `TC-FARM-010`, and
`TC-FARM-012`. The authorization and create-and-read
contracts have source assertions; a targeted run of `TC-AUTH-012` and
`TC-FARM-010` passed on September 27, 2026.

`TC-FARM-013` is in the isolated UI suite. The user reported that its current
run passes; record its command and outcome with the next comparable baseline.

### API-project execution: September 30, 2026

`npx playwright test --project=api-tests --workers=1 --retries=0` passed
**28/28 collected entries**, including the health-check dependency. A targeted
`TC-FARM-014` run passed **2/2 entries**, including health-check. These commands
do not create a current scenario coverage report; the `coverage:run` baseline
remains to be recorded separately.

### Farm API progress: October 5, 2026

`TC-FARM-017` through `TC-FARM-020` are implemented in
`tests/api/farm.api.spec.ts`. The user reported that all tests pass after the
animal deletion response assertion was corrected. The command, collected entry
count, and report for that run were not provided, so this is not a recorded
suite baseline. Earlier on October 5, a focused `TC-FARM-020` run with one
worker and zero retries passed **2/2 entries**, including health-check, before
the final deletion-message assertion was added.

### Source review and next exercises: October 6, 2026

This update comes from source inspection; no tests were executed for it.

- `TC-FARM-020` checks that the herd exists before deletion, the DELETE status
  and success envelope, `data.message`, and absence of the herd ID afterwards.
  The user again reported that the test passes; its implementation is complete.
- `TC-FARM-013` already lives in `staff-management.isolated.spec.ts`, creates six
  uniquely named fields, searches by their shared prefix, checks `1/2` then `2/2`,
  and deletes its fields in `finally`. The old implementation task is complete.
- `TC-FIN-003` obtains the starting balance through API and reads it again after
  the rejected transfer. The historical hardcoded-balance and stale-read tasks
  are complete in source; this review does not establish a new passing run.
- `TC-REG-001` already checks status `201`, the login header, and `/login.html`.
  Its remaining correction is to remove the transient success-message assertion.
- `TC-FIN-014` already uses `getTransactions`, whose `getJson` reader rejects
  unsuccessful responses. Do not repeat the old reader-replacement exercise.

The next small exercises are detailed in section 10. Unresolved validation and
resource-deletion contracts need agreement before adding new scenario IDs.

### Full-run observation: September 13, 2026

The first `npm run coverage:run` verification (one worker, zero retries)
recorded **57 passed and 2 failed out of 59 entries**, including one passed setup.
The scenario-only result was 56 passed and 2 failed out of 58 implemented cases.
The visual failure reported a missing baseline in the visual project's current
snapshot path. The demo profile test navigated to login; shared-session
invalidation is a hypothesis consistent with the known environment constraint,
not a separately reproduced diagnosis. Neither failure was fixed in this task.
The reporting runner now disables automatic snapshot creation so a missing
baseline cannot change the source fingerprint during measurement.

### Historical quality evidence

`npm run check:ci` passed on September 7, 2026. This is a dated observation,
not a claim about subsequent changes. Current command results belong in the
run report or the implementation report.

### Historical check results from September 5, 2026

- `setup-demo-user`: **1/1 passed**.
- `tests/api/auth.api.spec.ts`: **11/11 passed** with `--workers=1`.
- Before the project reorganization at that time, `smoke-tests` achieved
  **14/18** with `--workers=1`; after moving tests, it collects 7 cases
  and needs a newly recorded baseline.
- The full suite is not yet a trustworthy baseline. Known test defects
  and shared-session conflicts need to be resolved first.

### Causes of the four historical smoke failures

1. The homepage snapshot comes from application v1.0.120, while the inspected
   application is v1.79.0. The header, icons, and footer differ. Icons also
   depend on the external Font Awesome CDN, making the result network-dependent.
2. Two successful-registration tests exercise the same journey.
   `RegisterPage.register()` waits for navigation to `/login.html`, after which
   the test tries to find a success message from the old registration page.
3. The duplicate-registration test calls the same `RegisterPage` again after
   navigation to the login page. It therefore does not correctly reproduce
   the duplicate-registration scenario.

September 7 code review update: one positive registration test remains,
`RegisterPage.register()` only fills and submits the form, and the duplicate
case prepares the account through API. The points above describe historical
causes. The disappearing success-message assertion in the positive test and
the short-password loop within a single case still remain. Current registration
test results have not been confirmed by rerunning them.

### Application explored on localhost

Public screens: Home, Login, Register, Documentation, API Explorer, Alerts,
and Contact.

After login, the application also provides:

- profile editing and account deletion;
- fields, staff, and animals with search and pagination;
- assignments in Grid, List, Cards, Table, Timeline, Tree, and Chart views;
- Bar, Pie, and Doughnut charts;
- a marketplace with filtering, pagination, owned offers, and history;
- finances with income, expenses, transfers, and date filters.

OpenAPI v1.79.0 describes **71 operations across 57 paths**. Current API tests
cover almost exclusively authentication.

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

## 4. Roadmap

### Stage 0 — restore confidence in existing tests

- [x] Add `.playwright-cli/` to `.gitignore` and `.prettierignore`.
- [ ] Stop tracking the four old `.playwright-cli/*.yml` files committed
      before ignore rules were added.
- [x] Remove `tests/api/probe.spec.ts` after recording findings, or turn the
      probe into a named contract test without `console.log`.
- [x] Keep one successful-registration UI test. The duplicate adds no learning value.
- [ ] Remove the transient success-message assertion from `TC-REG-001`.
      Status `201`, the login header, and the final `/login.html` URL are already
      asserted; retain those checks and record a focused run.
- [x] Prepare the duplicate case through API, then open a fresh registration
      page and check `409` and the visible UI message.
- [x] Run each short password as a separate test case so the report identifies
      the exact input.
- [x] Run each invalid email as a separate test case.
- [ ] Limit the visual snapshot to a stable homepage component.
      Mask version and dynamic data, set the viewport, and remove icon dependence
      on the CDN. Update the baseline only after manually inspecting the diff.
- [ ] Set `trace: 'retain-on-failure'` after the current debugging work is complete.
- [ ] Make `check:ci`, `api-tests`, and `smoke-tests` pass in that order.

Completion criterion: the three commands above pass without retries.

### Stage 1 — organize projects and test data

- [x] Move the staff management and assignment suites to `*.isolated.spec.ts`.
      Current collection assigns both suites to the isolated-user project.
- [ ] Clarify the split: keep anonymous redirects in `no-auth-tests` and
      separate journeys that register and log in users.
      When introducing `*.journey.spec.ts`, add a matching `testMatch`;
      the current configuration does not collect that pattern.
- [ ] Use the demo account only for read-only profile tests.
- [ ] Every state-changing test must create its own user and resources.
- [x] Obtain the transfer recipient ID by registering a fresh account,
      without logging into the shared `EMPTY_USER`.
- [x] Obtain the initial balance through API rather than hardcoding `18450`.
      `TC-FIN-003` also reads the balance after the rejected transfer; source
      inspected on October 6, 2026, without a new execution result.
- [ ] Start with `workers: 1`, then measure `2` and `3`.
      Do not add retries as a remedy for rate limiter 429 responses.
- [x] Validate environment values when accessed. Coverage collection supplies
      a local base URL, bypasses dotenv loading, and needs no account credentials.

Completion criterion: a full run has a recorded baseline, and no two tests
invalidate each other's sessions.

### Stage 1b — address API layer technical debt

This backlog was retained from an older refactoring plan. Implement it in small
commits alongside contract tests:

- [ ] Use the shared `ApiEnvelope<T>` in `httpClient`, expose the API's
      `error`, and improve the message for `success: false` with a 2xx status.
- [ ] Do not add 204 handling or `putJson` until a real contract test shows the need.
- [ ] Move happy-path `loginAs` and `registerVerifiedUser` to `postJson`,
      but retain raw `APIResponse` in functions used for 4xx assertions.
- [ ] Decide whether to exercise or remove the currently unused API helpers
      `transferFunds`, `deleteAssignment`, and `cancelAllMyOffers`.
      `getTransactions`, `getAssignments`, and `createAssignment` are used in
      current API tests; `deleteOneOffer` is called by `cancelAllMyOffers`.
      Recheck callers before removal; the similarly named Financial Page Object
      method is a separate UI action.
- [ ] Extend financial, farm, and marketplace response models only from real
      responses captured in API tests.
- [ ] Remove `expect()` from `MarketplacePage`, separate helpers into constants
      and factories, and clarify names of overlapping UI/API actions.

### Stage 2 — a small, fast P0 suite

- [ ] Parameterized public-page smoke: Home, Login, Register, Docs,
      Swagger iframe, Alerts, and Contact.
- [ ] Route-protection matrix for anonymous and authenticated users:
      Profile, Marketplace, Financial. Exclude the three Staff & Fields pages
      from anonymous redirect requirements according to section 2;
      their authenticated features remain in farm-test scope.
- [ ] For a protected route, assert the final URL and absence of unexpected
      console errors, not just an HTML document status of 200.
- [x] Verify session persistence after reload and removal after logout.
      Login tests now use registered users and reopen the profile after logout
      to verify the login redirect and visible login control.
- [ ] Keep one short happy path: a fresh user creates a field, staff member,
      and assignment; confirm the final state through API.
- [ ] Tag tests consistently with `@p0`, `@smoke`, `@api`, `@ui`, and `@e2e`.

Completion criterion: the relevant P0 scenario has a recorded targeted run
without retries. This learning repository does not require a fixed repeated-run
threshold.

### Stage 3 — API contracts before more UI tests

Implementation order:

1. **Financial API**
   - [x] account and opening balance;
   - [x] history with `total`, `limit`, `offset`, and `hasMore`;
   - [x] transaction-history filters by type, category, and date range;
   - [x] income and expense and their effect on the balance;
   - [x] transfer: minimum `0.01`, maximum `999.99`, balance equal to the
         amount, exceeding the balance, and a nonexistent recipient.
2. **Farm API**
   - [x] create a field and retrieve it by ID with its name and area;
   - [x] delete an assigned field and confirm that its assignment is also gone;
   - [x] update a field and verify the persisted values;
   - [x] staff and animal CRUD have API assertions; the user reported a passing
         run on October 5, but its command and entry count are not recorded;
   - [x] assignment and unassignment have API assertions; targeted execution
         evidence for both cases is still incomplete in this plan;
   - [ ] establish and cover the product contract for deleting an assigned
         resource in each supported direction;
   - [ ] agreed boundaries for age, animal count, and required fields;
   - [ ] district and allowed animal types.
   - [x] correct the UI pagination scenario `TC-FARM-013`: it is in an isolated
         UI spec, uses unique field names, searches for the requested subset,
         and asserts `1/2` then `2/2` for six fields. Source inspected on
         October 6, 2026; no new run recorded.
3. **Marketplace API**
   - [ ] offer listing and `my-offers`;
   - [ ] creating and cancelling an owned offer;
   - [ ] preventing purchase of one's own offer;
   - [ ] purchase, ownership transfer, and two financial entries;
   - [ ] insufficient funds and a double-purchase attempt.
4. **Users and Profile API**
   - [ ] reading and updating a fresh account;
   - [ ] deleting only a fresh test account;
   - [ ] preventing access to another user's data.
5. **Alerts, Contact, and System API**
   - [ ] alerts, history, upcoming, and filters;
   - [ ] valid and invalid contact forms;
   - [ ] healthcheck, ping, about, and statistics.

These checkboxes track implemented assertions, not successful execution.
Initially assert only stable, business-relevant fields. Once real responses are
understood, consider schema validation, for example `@playwright/test` with
`zod` or `ajv`. Swagger and real responses help discover the API, but observed
behavior does not automatically become a requirement. Describe discrepancies
with the expected contract and deliberately define test scope.

Completion criterion: every main domain has at least a happy path, a boundary
case, and an authorization failure, without copying the same cases into UI.

### Stage 4 — expand UI coverage by domain

#### Profile and authentication

- [ ] editing the display name on a fresh account;
- [ ] password and password-confirmation validation;
- [ ] uploading an invalid file type;
- [ ] deleting a fresh account with `DELETE` confirmation;
- [ ] 2FA only when the feature is active and its data can be controlled.

#### Farm

- [ ] search and pagination for fields, staff, and animals;
- [ ] editing all important fields, not just the name;
- [ ] animal–field relationships and district;
- [ ] one representative assignment-view test instead of repeating the same
      assertion across seven presentations;
- [ ] charts: rendering data and switching chart type without JS errors.

#### Marketplace and finances

- [ ] offer filtering and pagination;
- [ ] cancelling an owned offer through UI;
- [ ] separate field and animal purchase scenarios without a conditional inside the test;
- [ ] transaction-history filters by type, category, and date range;
- [ ] card/CVV validation and transfer-form limits.

#### New public features

- [ ] Alerts: search, severity, region, and empty results;
- [ ] Contact: required fields, invalid email, Clear, and successful submission;
- [ ] Docs: search and showing/hiding feature-flagged descriptions;
- [ ] Map: test only after deliberately enabling the feature flag.

### Stage 5 — nonfunctional quality and CI

- [ ] Add `pull_request` to the workflow.
- [ ] Split CI into `quality`, fast `api`, `smoke`, and full `regression`.
- [ ] Run full regression manually or on a schedule until rate limiting
      and test data are fully isolated.
- [ ] Add `@axe-core/playwright` only after P0 is stable; start with
      Home, Login, Register, and one authenticated screen.
- [ ] After Chromium, add Firefox for P0. Add WebKit and mobile views only
      when they do not triple the time spent debugging fundamentals.
- [ ] Limit visual tests to a few stable components. Do not mask most of
      the page simply to make the snapshot pass.
- [ ] Retain the report after every CI run, and traces/screenshots only on failure.

#### Optional quality experiments

Keep these behind a concrete testing decision rather than treating them as a
second active backlog:

- The application code coverage pilot exists in `scripts/coverage/app-code.mjs`.
  Record a reproducible run and its selected-file denominator before deciding
  whether to expand it or publish it in CI. Keep it separate from scenario coverage.
- Store comparable runs before calculating historical flaky-test indicators or
  setting a coverage gate. One run cannot establish a trend or a threshold.
- Add a narrow test-quality scanner only for recurring problems that the existing
  ESLint, TypeScript, and scenario-ID checks do not catch. Start with one rule
  and a focused test for it.
- Try mutation testing on one small module when there is a specific assertion
  strength question. Consider Pact, test-impact mapping, or a unified dashboard
  only when a concrete integration or reporting decision needs them.

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

| ID             | Area        | Scenario                                                               | Layer  | Priority | Risk     | Scope    | Notes                                                                                                                          |
| -------------- | ----------- | ---------------------------------------------------------------------- | ------ | -------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| TC-ASSIGN-001  | Farm        | should assignment for new staff and field                              | UI     | P1       | high     | included | -                                                                                                                              |
| TC-ASSIGN-002  | Farm        | should not show assigned staff in select dropdown                      | UI     | P1       | medium   | included | -                                                                                                                              |
| TC-ASSIGN-003  | Farm        | should unassigned works correctly                                      | UI     | P1       | high     | included | -                                                                                                                              |
| TC-ASSIGN-004  | Farm        | should show 2 staff assigned to field in tree view                     | UI     | P1       | medium   | included | -                                                                                                                              |
| TC-ASSIGN-005  | Farm        | A user can assign their staff member to their field through API        | API    | P1       | high     | included | Source checks fieldId, staffId, and the stored assignment; current targeted run not recorded.                                  |
| TC-ASSIGN-006  | Farm        | Removing a staff assignment leaves it absent from the assignment list  | API    | P1       | high     | included | Source checks the created pair, delete response, and read-back; user reported a pass on 2026-10-04 without a recorded command. |
| TC-AUTH-001    | Auth        | should register new user successfully with valid data                  | API    | P0       | high     | included | -                                                                                                                              |
| TC-AUTH-002    | Auth        | should reject registration with invalid email format                   | API    | P0       | medium   | included | -                                                                                                                              |
| TC-AUTH-003    | Auth        | should reject registration with duplicate email                        | API    | P0       | medium   | included | -                                                                                                                              |
| TC-AUTH-004    | Auth        | should login successfully with valid credentials                       | API    | P0       | high     | included | -                                                                                                                              |
| TC-AUTH-005    | Auth        | should reject login with non-existent email                            | API    | P0       | medium   | included | -                                                                                                                              |
| TC-AUTH-006    | Auth        | should reject login with wrong password                                | API    | P0       | high     | included | -                                                                                                                              |
| TC-AUTH-007    | Auth        | should validate valid token via GET request                            | API    | P0       | high     | included | -                                                                                                                              |
| TC-AUTH-008    | Auth        | should reject invalid token via GET request                            | API    | P0       | critical | included | -                                                                                                                              |
| TC-AUTH-009    | Auth        | should validate valid token via POST request                           | API    | P0       | high     | included | -                                                                                                                              |
| TC-AUTH-010    | Auth        | should reject invalid token via POST request                           | API    | P0       | critical | included | -                                                                                                                              |
| TC-AUTH-011    | Auth        | should logout successfully                                             | API    | P0       | high     | included | -                                                                                                                              |
| TC-AUTH-012    | Auth        | Anonymous fields request returns 401 without field data                | API    | P0       | critical | included | -                                                                                                                              |
| TC-CHART-001   | Charts      | Chart type switches without JavaScript errors                          | UI     | P2       | low      | included | Planned contract; review expected behavior before implementation.                                                              |
| TC-FARM-001    | Farm        | should create a new field in Staff & Fields view                       | UI     | P1       | high     | included | -                                                                                                                              |
| TC-FARM-002    | Farm        | should create a new animal herd in Staff & Fields view                 | UI     | P1       | medium   | included | -                                                                                                                              |
| TC-FARM-003    | Farm        | should create a new staff in Staff & Fields view                       | UI     | P1       | high     | included | -                                                                                                                              |
| TC-FARM-004    | Farm        | should edit a field name                                               | UI     | P1       | medium   | included | -                                                                                                                              |
| TC-FARM-005    | Farm        | should delete a field                                                  | UI     | P1       | high     | included | -                                                                                                                              |
| TC-FARM-006    | Farm        | should update a staff                                                  | UI     | P1       | medium   | included | -                                                                                                                              |
| TC-FARM-007    | Farm        | should delete a staff                                                  | UI     | P1       | high     | included | -                                                                                                                              |
| TC-FARM-008    | Farm        | should edit a animal                                                   | UI     | P1       | medium   | included | -                                                                                                                              |
| TC-FARM-009    | Farm        | should delete a animal                                                 | UI     | P1       | high     | included | -                                                                                                                              |
| TC-FARM-010    | Farm        | A newly created field can be retrieved with its name and area          | API    | P0       | medium   | included | Targeted API run passed 2026-09-27 (one worker, no retries).                                                                   |
| TC-FARM-012    | Farm        | Deleting an assigned field removes its field and assignment            | API    | P1       | high     | included | Source asserts status 200 and resources absent; API-project run passed on 2026-09-30 (1 worker, zero retries).                 |
| TC-FARM-013    | Farm        | Fields search and pagination show the requested subset                 | UI     | P1       | medium   | included | User-reported pass 2026-09-27; command/result pending.                                                                         |
| TC-FARM-014    | Farm        | Updating a field persists its new name and area                        | API    | P1       | medium   | included | Checks PUT response and GET read-back; targeted and API-project runs passed 2026-09-30.                                        |
| TC-FARM-015    | Farm        | A newly created staff member appears with their name, surname, and age | API    | P1       | high     | included | Focused run passed 2026-10-04 (2/2 including health-check); ESLint and TypeScript checks passed.                               |
| TC-FARM-016    | Farm        | A newly created animal herd appears with its type and amount           | API    | P1       | medium   | included | Source uses createdAnimal and getAnimals to check ID, type, and amount; focused run not recorded.                              |
| TC-FARM-017    | Farm        | Updating a staff member persists the changed name, surname, and age    | API    | P1       | medium   | included | Checks PUT response and updated values in a later staff list; user-reported pass 2026-10-05, command unknown.                  |
| TC-FARM-018    | Farm        | Updating an animal herd persists the changed type and amount           | API    | P1       | medium   | included | Checks PUT response and updated values in a later animal list; user-reported pass 2026-10-05, command unknown.                 |
| TC-FARM-019    | Farm        | Deleting a staff member removes that member from the staff list        | API    | P1       | high     | included | Checks DELETE status and absence from later staff list; user-reported pass 2026-10-05, command unknown.                        |
| TC-FARM-020    | Farm        | Deleting an animal herd removes that herd from the animal list         | API    | P1       | medium   | included | Checks DELETE response and absence from later animal list; user-reported pass 2026-10-05, command unknown.                     |
| TC-FIN-001     | Finance     | verify account balance and transaction history                         | UI     | P1       | medium   | included | -                                                                                                                              |
| TC-FIN-002     | Finance     | verify funds transfer between users                                    | UI     | P1       | critical | included | -                                                                                                                              |
| TC-FIN-003     | Finance     | verify prevent overdraft                                               | UI     | P1       | critical | included | Source reviewed 2026-10-06: initial API balance and a new read after rejection; no new run recorded.                           |
| TC-FIN-004     | Finance     | Transaction history respects limit and offset and exposes hasMore      | API    | P1       | medium   | included | -                                                                                                                              |
| TC-FIN-005     | Finance     | Income and expense update the API account balance                      | API    | P1       | critical | included | -                                                                                                                              |
| TC-FIN-006     | Finance     | Transfer accepts the minimum amount 0.01                               | API    | P1       | high     | included | -                                                                                                                              |
| TC-FIN-007     | Finance     | Transfer accepts the maximum amount 999.99                             | API    | P1       | high     | included | -                                                                                                                              |
| TC-FIN-008     | Finance     | Transfer of the full available balance leaves zero                     | API    | P1       | high     | included | -                                                                                                                              |
| TC-FIN-009     | Finance     | Transfer above available balance leaves both accounts unchanged        | API    | P1       | critical | included | -                                                                                                                              |
| TC-FIN-010     | Finance     | Transfer to a nonexistent recipient is rejected                        | API    | P1       | high     | included | -                                                                                                                              |
| TC-FIN-011     | Finance     | A fresh user can read their financial account and balance              | API    | P1       | high     | included | Compares account `userId` with the fresh user's ID; API-project run passed 2026-09-30.                                         |
| TC-FIN-012     | Finance     | Transaction history filters by type                                    | API    | P1       | medium   | included | Creates income and expense, then checks that the income filter returns only the expected transaction.                          |
| TC-FIN-013     | Finance     | Transaction history filters by category                                | API    | P1       | medium   | included | Creates two income categories, then checks that the salary filter returns only the expected transaction.                       |
| TC-FIN-014     | Finance     | Transaction history filters by date range                              | API    | P1       | medium   | included | Checks matching and empty ranges; API-project run passed 2026-09-30.                                                           |
| TC-FIN-015     | Finance     | Transfer above 999.99 ROL is rejected without changing either balance  | API    | P1       | high     | included | API-project run passed 2026-09-30 (one worker, zero retries).                                                                  |
| TC-GUARD-001   | Auth        | should redirect anonymous user from /profile.html to login             | UI     | P0       | high     | included | -                                                                                                                              |
| TC-GUARD-002   | Auth        | should redirect anonymous user from /marketplace.html to login         | UI     | P0       | high     | included | -                                                                                                                              |
| TC-GUARD-003   | Auth        | should redirect anonymous user from /financial.html to login           | UI     | P0       | high     | included | -                                                                                                                              |
| TC-GUARD-004   | Auth        | Anonymous Staff and Fields main page redirects to login                | UI     | P0       | high     | excluded | Deliberate UI redirect exclusion recorded in section 2; API authorization remains in scope.                                    |
| TC-GUARD-005   | Auth        | Anonymous assignments page redirects to login                          | UI     | P0       | high     | excluded | Deliberate UI redirect exclusion recorded in section 2; authenticated features remain in scope.                                |
| TC-GUARD-006   | Auth        | Anonymous charts page redirects to login                               | UI     | P0       | low      | excluded | Deliberate UI redirect exclusion recorded in section 2; chart behavior remains in scope.                                       |
| TC-JOURNEY-001 | Journeys    | should create assignment for new farmer                                | E2E    | P0       | high     | included | -                                                                                                                              |
| TC-JOURNEY-002 | Journeys    | marketplace e2e test                                                   | E2E    | P0       | high     | included | -                                                                                                                              |
| TC-JOURNEY-003 | Journeys    | verify blocked transaction                                             | E2E    | P0       | critical | included | -                                                                                                                              |
| TC-LOGIN-001   | Auth        | should display correct user data after login                           | UI     | P0       | medium   | included | -                                                                                                                              |
| TC-LOGIN-002   | Auth        | session management should work correctly                               | UI     | P0       | high     | included | -                                                                                                                              |
| TC-MARKET-001  | Marketplace | should buy random offer and verify transaction history                 | UI     | P1       | high     | included | -                                                                                                                              |
| TC-MARKET-002  | Marketplace | should return error when offer is to expensive                         | UI     | P1       | high     | included | -                                                                                                                              |
| TC-MARKET-003  | Marketplace | create offer and verify in My Offers page                              | UI     | P1       | medium   | included | -                                                                                                                              |
| TC-MARKET-004  | Marketplace | An owner can cancel an offer through API                               | API    | P1       | high     | included | Planned contract; review expected behavior before implementation.                                                              |
| TC-MARKET-005  | Marketplace | A different user cannot cancel another owner offer                     | API    | P1       | critical | included | Planned contract; review expected behavior before implementation.                                                              |
| TC-MARKET-006  | Marketplace | An owner can cancel an offer through UI                                | UI     | P1       | high     | included | Planned contract; review expected behavior before implementation.                                                              |
| TC-PROFILE-001 | Profile     | should display correct user information in profile sections            | UI     | P1       | medium   | included | Full-run observation: redirected to login; investigate shared-session invalidation.                                            |
| TC-PROFILE-002 | Profile     | A fresh user can update the display name                               | UI     | P1       | medium   | included | Planned contract; review expected behavior before implementation.                                                              |
| TC-PROFILE-003 | Profile     | A fresh user can delete their own account after confirmation           | UI     | P1       | high     | included | Planned contract; review expected behavior before implementation.                                                              |
| TC-PUBLIC-001  | Public      | Alerts page opens and displays its main controls                       | UI     | P2       | low      | included | Planned contract; review expected behavior before implementation.                                                              |
| TC-PUBLIC-002  | Public      | Contact rejects missing required fields                                | UI     | P2       | medium   | included | Planned contract; review expected behavior before implementation.                                                              |
| TC-PUBLIC-003  | Public      | Contact accepts a valid submission                                     | UI     | P2       | medium   | included | Planned contract; review expected behavior before implementation.                                                              |
| TC-REG-001     | Auth        | should register new user successfully                                  | UI     | P0       | high     | included | Review needed: assertion still depends on a transient success message.                                                         |
| TC-REG-002     | Auth        | should display validation errors for invalid email and short password  | UI     | P0       | medium   | included | -                                                                                                                              |
| TC-REG-003     | Auth        | should prevent registration with empty required fields                 | UI     | P0       | medium   | included | Review needed: hidden success alone does not prove required-field validation.                                                  |
| TC-REG-004     | Auth        | should reject password with 1 characters                               | UI     | P0       | high     | included | -                                                                                                                              |
| TC-REG-005     | Auth        | should reject password with 2 characters                               | UI     | P0       | high     | included | -                                                                                                                              |
| TC-REG-006     | Auth        | should reject registration for empty password                          | UI     | P0       | high     | included | -                                                                                                                              |
| TC-REG-007     | Auth        | should reject registration with duplicate email                        | UI     | P0       | medium   | included | -                                                                                                                              |
| TC-REG-008     | Auth        | should reject invalid email: "plaintext"                               | UI     | P0       | medium   | included | -                                                                                                                              |
| TC-REG-009     | Auth        | should reject invalid email: "@example.com"                            | UI     | P0       | medium   | included | -                                                                                                                              |
| TC-REG-010     | Auth        | should reject invalid email: "user@"                                   | UI     | P0       | medium   | included | -                                                                                                                              |
| TC-REG-011     | Auth        | should reject invalid email: "user @example.com"                       | UI     | P0       | medium   | included | -                                                                                                                              |
| TC-SMOKE-001   | Public      | should display the correct page title 'Rolnopol' on homepage           | UI     | P0       | low      | included | -                                                                                                                              |
| TC-SMOKE-002   | Public      | should load login page successfully                                    | UI     | P0       | medium   | included | -                                                                                                                              |
| TC-SMOKE-003   | Public      | should load API documentation page successfully                        | UI     | P0       | low      | included | -                                                                                                                              |
| TC-SMOKE-004   | Public      | should load documentation page successfully                            | UI     | P0       | low      | included | -                                                                                                                              |
| TC-SMOKE-005   | Public      | should not display marketplace for non-logged user                     | UI     | P0       | high     | included | Overlaps TC-GUARD-002; both existing cases are counted separately.                                                             |
| TC-SMOKE-006   | Public      | should load register page successfully                                 | UI     | P0       | medium   | included | -                                                                                                                              |
| TC-SMOKE-007   | Public      | api app health check                                                   | API    | P0       | high     | included | -                                                                                                                              |
| TC-VIS-001     | Visual      | should match homepage visual snapshot                                  | Visual | P2       | low      | included | Missing baseline in current visual-project path; review the image before creating a baseline.                                  |

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

### Names and files

- `*.api.spec.ts` — HTTP contracts without a browser.
- `*.isolated.spec.ts` — UI with a user created for the test.
- `*.journey.spec.ts` — a few scenarios spanning multiple domains.
- Test names describe behavior and outcome, for example
  `should reject transfer above available balance`.

### Arrange–Act–Assert

- Prefer preparing data through API.
- Perform one main user action through UI.
- UI assertions check messages/behavior; API assertions check business state.
- Page Objects contain no `expect()` and do not force the happy path
  when a method is also used in negative tests.

### Stability

- Prefer `getByRole`, `getByLabel`, and `getByTestId`.
- Do not use `waitForTimeout()` in actual tests.
- Do not swallow errors with an empty `.catch(() => {})` without documenting
  why cleanup can safely fail.
- Do not share accounts modified by parallel tests.
- Retries remain `0` until the cause of flakiness is known.
- For each flakiness fix, reproduce the issue first, then run the test
  at least five times.

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
renders README and this plan alongside the metrics and filtered scenario table.
CI retains both Playwright HTML and coverage artifacts, including failed runs.

The source fingerprint includes test and helper code, report tooling, config,
package files and the two documents. A Git revision alone cannot identify local
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
- The plan is updated from actual results, not merely the presence of a test file.

## 10. Upcoming exercises with the mentor

This is the immediate sequence selected from the existing stages, not a second
backlog. The learner implements each code change; the mentor explains and reviews
it. Keep one behavior per exercise and one small implementation per commit.

On October 6, the learner chose to defer coverage-run diagnosis and continue
private learning exercises. The user reports passing tests; the collection error
does not provide an execution baseline. Report tooling is not a prerequisite
for the following exercises. Ordinary focused Playwright runs remain useful.

1. **Optional small Farm refactor before the next scenario.** The proposed
   `getStaff` reader and its smallest migration are described in
   [REFACTOR.md](REFACTOR.md#small-farm-reader-exercise-proposed-on-october-6-2026).
   Use the existing `getJson` mechanism for state reads. Start with the final
   read in `TC-FARM-019`; preserve raw responses where tests assert exact HTTP
   statuses. This is a proposal for learner implementation, not a completed
   refactor or a reason to rewrite all API tests.

2. **Finish the small registration correction — Stage 0, `TC-REG-001`.** In
   `tests/auth/registration.noauth.spec.ts`, remove only
   `expect(registerPage.successMessage).toBeVisible()` with its `await`.
   Keep the existing response wait started before submission, status `201`,
   login header, and final URL checks. The goal is to verify successful
   registration without racing a message that disappears on navigation.
   Run the focused case:

   ```bash
   npx playwright test tests/auth/registration.noauth.spec.ts --project=no-auth-tests --grep "should register new user successfully" --workers=1 --retries=0
   ```

   Then verify the affected project and `npm run check:ci`. This test belongs
   to `no-auth-tests`, not `smoke-tests`.

3. **Delete a staff member assigned to a field — Stage 3 Farm.** First establish
   whether the agreed contract removes the assignment or rejects deletion.
   Do not infer that direction solely from `TC-FARM-012`, which deletes a field.
   Once agreed, add one case to `tests/api/farm.api.spec.ts`, with a new catalog
   ID and the existing farm tags. Reuse `createdField`, create the staff member
   explicitly, and use `createAssignment` / `getAssignments` from
   `src/api/farm.api.ts`. Confirm the pair exists before the action. For accepted
   deletion, assert the response, staff and assignment absence, and field
   preservation. For rejected deletion, assert the error and preservation of all
   three. Give the explicitly created staff member cleanup appropriate to the
   chosen contract; `createdStaff` would otherwise delete it again on teardown.
   The smallest first action is contract discovery and a written expectation;
   implementing the single scenario follows as a separate step.

4. **Add one negative Farm contract — Stage 3 animal types.** Establish the
   allowed types and choose one unsupported value; agree on the rejection
   status/error before implementation. Use a fresh user and raw
   `request.post` for the rejected request, since `createAnimal` uses a throwing
   helper. Assert status, `success: false`, the agreed error, and an unchanged
   animal list. Do not combine animal count, staff age, required fields, and
   district into this test. Each can become a later boundary exercise after its
   API contract is agreed. Keep the documented zero-field-area exclusion.

5. **Cancel an owned offer — Stage 3 Marketplace, `TC-MARKET-004`.** First
   establish offer creation and cancellation responses, including whether
   `my-offers` retains a cancelled entry. Add
   `tests/api/marketplace.api.spec.ts` (already matched by `api-tests`), import
   the existing data fixtures, and prepare one owned field plus one offer through
   API. Verify that exact offer is active before DELETE. Assert the cancellation
   response, its absence from active listings, and the agreed `my-offers` state.
   Reuse `getMarketplaceOffers` for reads; use raw `request.delete` when asserting
   the DELETE response. Keep offer cleanup before field-fixture teardown.
   No new generic client or fixture layer is needed for this first scenario.

6. **Reject cancellation by another user — `TC-MARKET-005`.** Extend the same
   API spec with one separate case. Prepare owner A's offer and a fresh user B
   with a separate request context; use B to attempt deletion of A's offer.
   Agree on the authorization status/error, then assert that rejection and
   reread as A to confirm the offer remains active. Reuse the separate-account
   request-context pattern in `tests/api/financial.api.spec.ts`; dispose the
   context and clean up A's own data explicitly. Do not relogin either user on
   the other user's request context.

For each new scenario, first update the catalog and add exactly one static
`case-id`, then run `npm run coverage:readme` and `npm run coverage:validate`.
Verify the focused case with one worker and zero retries, then its project and
`npm run check:ci`. Use `--grep` with the actual test title; case-ID annotations
are not title filters. Record outcomes separately from implementation checkboxes.

After this sequence, select one agreed age/count/required-field boundary or
Marketplace purchase rule. The remaining registration-required-field assertion
(`TC-REG-003`), smoke baseline, session/project organization, visual baseline,
and CI work stay in their existing stages; they are not prerequisites for every
individual API exercise. Keep visual diagnosis separate from API contract work.

When report tooling becomes useful again, record an API baseline with
`npm run coverage:run -- --project=api-tests --workers=1 --retries=0`.
Each coverage run replaces the current result; archive it before comparing runs.

CLI/MCP browser exploration is optional when clarifying expected behavior.
Neither exploration tools nor an agent are dependencies of the coverage report.
