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
- [x] Remove the transient success-message assertion from `TC-REG-001`.
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

- [x] Use the shared `ApiEnvelope<T>` in `httpClient` and reject envelopes
      whose `success` is not `true` (source inspected October 11, 2026).
      Failure diagnostics include the response body through `ApiError`.
      Focused runtime contract checks remain pending; this is a behavior change.
- [ ] Do not add 204 handling or `putJson` until a real contract test shows the need.
- [ ] Move happy-path `loginAs` and `registerVerifiedUser` to `postJson`,
      but retain raw `APIResponse` in functions used for 4xx assertions.
- [ ] Decide whether to exercise or remove the currently unused API helpers
      `transferFunds` and `deleteAssignment`.
      `getTransactions`, `getAssignments`, and `createAssignment` are used in
      current API tests; `cancelAllMyOffers` is now used by `TC-MARKET-003`
      cleanup, and calls `deleteOneOffer`.
      Recheck callers before removal; the similarly named Financial Page Object
      method is a separate UI action.
- [ ] Extend financial, farm, and marketplace response models only from real
      responses captured in API tests.
- [x] Remove `expect()` from `MarketplacePage` (October 11 working-tree review).
      Explicit `selectOption(String(itemId))` waits for the requested option.
- [ ] Separate helpers into constants and factories only where responsibilities
      justify it, and clarify names of overlapping UI/API actions.

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
   - [ ] district and allowed animal types beyond the unsupported-type case;
   - [x] assigned-staff deletion and unsupported-animal-type rejection have
         source assertions in `TC-FARM-021` and `TC-FARM-022`; no new run recorded.
   - [x] correct the UI pagination scenario `TC-FARM-013`: it is in an isolated
         UI spec, uses unique field names, searches for the requested subset,
         and asserts `1/2` then `2/2` for six fields. Source inspected on
         October 6, 2026; no new run recorded.
3. **Marketplace API**
   - [ ] buyer-visible offer listing;
   - [x] owned-offer creation setup, cancellation, and `my-offers` state are
         implemented in `TC-MARKET-004`; no new run recorded;
   - [x] another user cannot cancel the offer (`TC-MARKET-005`);
   - [x] preventing purchase of one's own offer (`TC-MARKET-007`);
         source assertions reviewed 2026-10-10, no new run recorded;
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
| TC-FIN-005     | Finance     | Income and expense update the API account balance                      | API    | P1       | critical | included | -                                                                                                                                                               |
| TC-FIN-006     | Finance     | Transfer accepts the minimum amount 0.01                               | API    | P1       | high     | included | -                                                                                                                                                               |
| TC-FIN-007     | Finance     | Transfer accepts the maximum amount 999.99                             | API    | P1       | high     | included | -                                                                                                                                                               |
| TC-FIN-008     | Finance     | Transfer of the full available balance leaves zero                     | API    | P1       | high     | included | -                                                                                                                                                               |
| TC-FIN-009     | Finance     | Transfer above available balance leaves both accounts unchanged        | API    | P1       | critical | included | -                                                                                                                                                               |
| TC-FIN-010     | Finance     | Transfer to a nonexistent recipient is rejected                        | API    | P1       | high     | included | -                                                                                                                                                               |
| TC-FIN-011     | Finance     | A fresh user can read their financial account and balance              | API    | P1       | high     | included | Compares account `userId` with the fresh user's ID; API-project run passed 2026-09-30.                                                                          |
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
| TC-MARKET-001  | Marketplace | should buy random offer and verify transaction history                 | UI     | P1       | high     | included | -                                                                                                                                                               |
| TC-MARKET-002  | Marketplace | should return error when offer is to expensive                         | UI     | P1       | high     | included | -                                                                                                                                                               |
| TC-MARKET-003  | Marketplace | create offer and verify in My Offers page                              | UI     | P1       | medium   | included | -                                                                                                                                                               |
| TC-MARKET-004  | Marketplace | An owner can cancel an offer through API                               | API    | P1       | high     | included | Source reviewed 2026-10-10: active owned offer, DELETE response, and cancelled state in a fresh my-offers read; no new run recorded.                            |
| TC-MARKET-005  | Marketplace | A different user cannot cancel another owner offer                     | API    | P1       | critical | included | Source reviewed 2026-10-10: another user receives 403 and the owner offer remains active; no new run recorded.                                                  |
| TC-MARKET-006  | Marketplace | An owner can cancel an offer through UI                                | UI     | P1       | high     | included | Planned contract; review expected behavior before implementation.                                                                                               |
| TC-MARKET-007  | Marketplace | An owner cannot buy their own offer                                    | API    | P1       | high     | included | Source reviewed 2026-10-10: status 400, error, unchanged balance, and active offer; no new run recorded. Corrects mistaken use of reserved UI ID TC-MARKET-006. |
| TC-PROFILE-001 | Profile     | should display correct user information in profile sections            | UI     | P1       | medium   | included | Full-run observation: redirected to login; investigate shared-session invalidation.                                                                             |
| TC-PROFILE-002 | Profile     | A fresh user can update the display name                               | UI     | P1       | medium   | included | Planned contract; review expected behavior before implementation.                                                                                               |
| TC-PROFILE-003 | Profile     | A fresh user can delete their own account after confirmation           | UI     | P1       | high     | included | Planned contract; review expected behavior before implementation.                                                                                               |
| TC-PUBLIC-001  | Public      | Alerts page opens and displays its main controls                       | UI     | P2       | low      | included | Planned contract; review expected behavior before implementation.                                                                                               |
| TC-PUBLIC-002  | Public      | Contact rejects missing required fields                                | UI     | P2       | medium   | included | Planned contract; review expected behavior before implementation.                                                                                               |
| TC-PUBLIC-003  | Public      | Contact accepts a valid submission                                     | UI     | P2       | medium   | included | Planned contract; review expected behavior before implementation.                                                                                               |
| TC-REG-001     | Auth        | should register new user successfully                                  | UI     | P0       | high     | included | Review needed: assertion still depends on a transient success message.                                                                                          |
| TC-REG-002     | Auth        | should display validation errors for invalid email and short password  | UI     | P0       | medium   | included | -                                                                                                                                                               |
| TC-REG-003     | Auth        | should prevent registration with empty required fields                 | UI     | P0       | medium   | included | Review needed: hidden success alone does not prove required-field validation.                                                                                   |
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
| TC-VIS-001     | Visual      | should match homepage visual snapshot                                  | Visual | P2       | low      | included | Missing baseline in current visual-project path; review the image before creating a baseline.                                                                   |

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

This sequence was refreshed from source inspection on October 11, 2026.
The learner implements code changes; the mentor explains, reviews, and may
update Markdown records. Keep each implementation small and separately reviewable.
No application tests were executed for this update. `npm run check:ci` passed
on the inspected working tree before documentation edits; implementation is not
a passing application baseline.

The earlier `getStaff` exercise is implemented, including its use in
`TC-FARM-019`. Assigned-staff deletion (`TC-FARM-021`) and unsupported-animal-type
rejection (`TC-FARM-022`) are present. Marketplace owner cancellation,
other-user cancellation rejection, and own-purchase rejection have API tests.
The catalog and Marketplace stage entries now reflect these additions.
Source inspection confirms steps 1 and 2 below are implemented; their execution
results have not been independently verified in this update.
See [REFACTOR.md](REFACTOR.md) for source observations and fixture design.

### Agreed scope: owned-offer cancellation

Keep `TC-MARKET-004` focused on the owner: active offer in `my-offers`, successful
DELETE response, and a fresh `my-offers` read showing that same offer cancelled.
The learner chose not to expand this test with a second user's listing checks.
Local application source excludes the current user's own offers from
`/marketplace/offers`; the mentor's earlier presence assertion was incorrect.
The listing assertions are already absent from the current test. Buyer-visible
listing disappearance is deferred, not a requirement for this exercise.

### Next small steps

1. **Completed in source: remove unrelated Marketplace reads.** The learner
   removed the three unused `getMarketplaceOffers(request)` calls and their
   import from `tests/api/marketplace.api.spec.ts`. Current offer-state, response,
   and balance assertions remain.

2. **Completed in source: extract one typed reader.** The learner implemented
   `getMyOffers(request): Promise<MarketplaceOffer[]>` and migrated both
   cancellation helpers. Selection, filtering, and cancellation remain in their
   callers. Specs retain raw responses for exact-status assertions.

3. **Completed: reconcile scenario metadata and catalog.** The planned UI
   cancellation keeps `TC-MARKET-006`; own-purchase rejection now uses
   `TC-MARKET-007`. Catalog entries for `TC-FARM-021` and `TC-FARM-022` were
   added. Marketplace rejection titles and tags now describe negative cases.
   The README index is generated from this catalog. Execution evidence remains
   separate from source implementation. `coverage:readme` and
   `coverage:validate` passed on 2026-10-10; collection found 89 entries, including
   one setup entry. Collection did not execute scenarios.

4. **Completed in source: registration correction.** `TC-REG-001` no longer
   asserts the transient success message. The pre-submission response wait,
   HTTP 201, login header, and final URL checks remain. On 2026-10-10 the learner
   reported everything working; no command, entry count, or report was supplied.
   This is a user-reported result, not an independently recorded baseline.

Verification commands for the first two exercises:

```bash
npx playwright test tests/api/marketplace.api.spec.ts --project=api-tests --workers=1 --retries=0
npx playwright test --project=api-tests --workers=1 --retries=0
npm run check:ci
```

Focused registration verification:

```bash
npx playwright test tests/auth/registration.noauth.spec.ts --project=no-auth-tests --grep "should register new user successfully" --workers=1 --retries=0
```

Use actual test titles for `--grep`; case-ID annotations are not title filters.
Record results separately from implementation checkboxes. For scenario changes,
run the focused case, then its project and `check:ci`. For new IDs, synchronize
both the catalog and generated README index.

### Historical refactoring proposals: October 10, 2026

Steps 5 and 6 below are implemented in commit `8596fda`; step 7 is implemented
in the current working tree. These paragraphs preserve the original proposals,
not current implementation instructions. The active next steps follow them.

5. **Make the HTTP envelope explicit in two small changes ? Stage 1b.**
   First use the existing `ApiEnvelope<T>` for the parsed response in
   `src/api/httpClient.ts`, replacing its inline type. Preserve current request,
   JSON parsing, status handling, and return behavior. This is a type-only
   refactor: it does not validate runtime JSON. Then separately decide and
   implement rejection when `success !== true`; currently only explicit
   `false` is rejected, so a missing success field is accepted. That second
   change tightens the reader contract and must not be presented as behavior
   preservation. Exercise the existing client with stubbed responses for a
   valid envelope, explicit failure, missing success, malformed JSON, and HTTP
   failure. Preserve support for successful delete responses without data.
   Do not add a schema library, 204 support, new HTTP verbs, or change raw
   negative-request helpers. Run focused client checks, dependent API tests,
   and `check:ci` for this shared change.

6. **Separate API session setup from browser setup ? Stage 1.**
   `freshUser` currently depends on a browser context and copies cookies even
   for API-only consumers. Separately, `TC-FIN-011` logs in that user again to
   obtain its session ID. Compare keeping the fixture, adding a proposed
   `apiSession` fixture returning the user plus session, and making `freshUser`
   a UI adapter over that session. Prefer the last option only when selected
   for implementation: migrate `TC-FIN-011` first to consume the session
   without another login. Preserve cookie setup for UI consumers, distinct
   accounts, and raw authentication scenarios. Do not migrate all tests at once.
   Verify the focused account case, then API and isolated UI consumers because
   authentication fixture changes cross both layers. No speed gain is claimed
   without measurement.

7. **Select the resource explicitly in UI offer creation ? Stage 1b.**
   `MarketplacePage.createNewOffer` randomly chooses an item although
   `TC-MARKET-003` already has `createdAnimal.id`. Compare keeping the existing
   method, adding an optional item-ID branch, and requiring an explicit item ID.
   Prefer the explicit input when undertaking this exercise; adapt both actual
   callers (the Marketplace spec and the farm-setup journey through
   `createMarketplaceOffer`). Inspect how the journey obtains seller resource
   IDs before implementation. Keep waiting for the requested option to load;
   do not simply remove the current readiness assertion. Select the option by
   ID and preserve UI success checks in specs. Resource/offer cleanup is a
   separate lifecycle concern, not implicitly solved by selection. Run both
   affected scenarios and their projects. Do not combine this with rebuilding
   purchase tests or shared Marketplace test data.

### Agreed decision: leave TC-MARKET-003 as implemented

On October 11, 2026, the learner explicitly chose to retain the current test.
They reported an error with the previous `createdAnimal` version and a passing
result with the current manual cow setup. The cause was not diagnosed, and no
command or report was supplied; this is a learner-reported result.

Keep the complete current `TC-MARKET-003`, including manual animal setup,
listing read, offer assertions, and nested cleanup. Do not propose restoring
`createdAnimal`, removing the listing read, or refactoring this case in routine
reviews or repository scans. Do not ask the learner to justify this decision
again. Revisit only if the learner explicitly selects it or a new reproducible
failure requires investigation. This learning-scope decision supersedes the
previous steps 8 and 9 and the earlier REFACTOR recommendation. It does not
establish that the fixture itself is broken or that the listing read is required.

### Active exercise: isolate and simplify TC-MARKET-001

The learner selected the former purchase-isolation step (step 10; item 3 in the
review summary). Implementation remains the learner's task. Preserve the case
ID, UI purchase, notification, transaction history, and ownership verification.
The planned scenario uses one test-owned field; it intentionally replaces random
field/animal coverage with a deterministic field purchase. An animal purchase
can be a separately selected exercise later.

The two `playwright/no-conditional-in-test` suppressions in
`tests/auth/marketplace.isolated.spec.ts` guard ternaries selecting fields versus
animals. With a known field, remove the ternaries and both suppressions. Do not
move those same branches into a helper solely to silence ESLint.

1. **Define the data contract and ownership boundary.** Reuse the buyer from
   the existing `freshUser` hook and its `request`; preserve the current top-up.
   Propose `fieldOfferForPurchase` in a new
   `src/fixtures/marketplace.fixture.ts`, extending `src/fixtures/data.fixture.ts`.
   It should expose `fieldId`, `fieldName`, `offerId`, `price`, and `description`.
   The fixture owns a separate seller request context, registration, login,
   resource setup, cleanup, and disposal. It does not buy the offer or assert
   the scenario. Review this contract before writing the full fixture.

   Existing patterns: `apiSession` in `auth.fixture.ts`, separate
   `playwrightRequest.newContext()` in `tests/api/marketplace.api.spec.ts`,
   and the lifecycle in `activeFieldOffer`. Do not reuse `activeFieldOffer`
   unchanged: it creates the resource for the buyer and deletes with its owner's
   original context, which does not model this two-user purchase.

2. **Prepare a seller and one identifiable field offer through API.** Use
   `prepareRandomUser`, `registerVerifiedUser`, `loginAs`, and farm API
   `createField`. Explicitly configure the new context with `baseURL: ENV.BASE_URL`
   and no buyer storage state. Start its `try/finally` immediately after context
   creation. Choose a unique field name and description, and an affordable price
   such as 250. Extend existing `createFieldOffer` with optional `description`
   and forward it in the payload, preserving the existing offer fixture's three scenario consumers.
   Inspect the creation response/actual endpoint to confirm description storage.
   Retain IDs as soon as creation succeeds so partial setup can be cleaned up.
   Do not create another API client or log in the buyer again.

   Small target: the fixture yields an active offer for the expected field and
   seller. Verify the setup first with `getMyOffers` in the focused scenario;
   never print the returned credentials or session. Run TypeScript and ESLint
   before proceeding to UI changes.

3. **Replace the random UI purchase.** Request `fieldOfferForPurchase` and
   import `test`/`expect` from the proposed Marketplace fixture. Keep the current
   test filename and project. Rename the title to
   `should buy an owned test field offer and verify transaction history` while
   preserving `TC-MARKET-001`. Use existing
   `marketplacePage.buyOfferByDescription(description)`. Its description filter
   supplies the lookup; use a unique value that matches one card. Keep the
   success notification assertion in the spec. Stop using `clickRandomBuyNow`
   and `PurchasedOffer` in this case; do not delete unrelated methods yet.

4. **Replace inference with exact assertions and remove both suppressions.**
   Read buyer fields before purchase and assert that `fieldId` is absent.
   After purchase, read them again and assert that exact ID and `fieldName`.
   Keep transaction history visible checks for `Purchase: ${fieldName}` and
   the exact negative `price`. The fresh buyer has no earlier purchases; assert
   one expense/history entry before using the existing last-amount helper.
   Also confirm the field no longer belongs to the seller. If needed, expose
   the seller request context explicitly as `sellerApi` from the fixture for
   that read; keep the ownership assertion in the spec. No generic
   `getOwnedResources` function or type-based branch is needed.

5. **Finish cleanup for every outcome.** Keep the seller context alive through
   `use`, and cancel only this offer if still active. Determine field ownership
   from fresh seller and buyer reads, not a flag set after a UI assertion: a
   purchase can succeed before a later assertion fails. Delete the exact field
   using its current owner's context. Missing fields during partial setup can
   be handled explicitly; failed reads and deletion errors must remain visible.
   Ensure context disposal runs in an outer `finally` even when cleanup fails.
   Ensure the buyer API session remains available through fixture teardown by
   declaring its `apiSession`/`request` dependencies. Avoid empty catches.

   This is ordinary lifecycle branching in fixture teardown, not alternative
   scenario paths in the spec. Once the focused case passes, temporarily fail
   an assertion after purchase and inspect cleanup; repeat with a failure before
   purchase. Revert each temporary failure and record the outcomes. This checks
   resource behavior that a successful run alone cannot establish.

6. **Verify and record the migration.** Run the focused case with one worker
   and zero retries, then `isolated-user-tests` because the fixture import and
   optional API helper parameter affect that project. Run Marketplace API tests
   for the existing `createFieldOffer` consumers and `npm run check:ci`.
   Update the existing catalog title, regenerate the README index, and validate
   mappings; keep the same case ID. Record actual results, including any unrelated
   failure, rather than declaring the whole suite reliable.

```bash
npx playwright test tests/auth/marketplace.isolated.spec.ts --project=isolated-user-tests --grep "should buy an owned test field offer and verify transaction history" --workers=1 --retries=0
npx playwright test --project=isolated-user-tests --workers=1 --retries=0
npx playwright test tests/api/marketplace.api.spec.ts --project=api-tests --workers=1 --retries=0
npm run check:ci
npm run coverage:readme
npm run coverage:validate
```

These are future implementation checks, not commands executed for this plan.
The catalog keeps its current title until the learner renames the actual test.
No changes to `TC-MARKET-003`, project matching, or global ESLint rules belong
in this exercise. Shared negative-purchase cases and the journey cleanup are
later exercises. HTTP-envelope checks remain later work in Stage 1b.

### Intentionally deferred

Additional Marketplace purchase contracts are deferred beyond the selected UI exercise. Before reusing
`activeFieldOffer`, inspect cleanup after ownership transfer: its field currently
belongs to the seller's `createdField` fixture. This fixture was selected for
cancellation and rejection scenarios; successful-purchase cleanup has not been
verified. Do not expand it speculatively now.

On October 6, the learner deferred coverage-run diagnosis. Reporting is not a
prerequisite for these exercises. When useful again, record an API baseline with
`npm run coverage:run -- --project=api-tests --workers=1 --retries=0`.
Archive results before comparing runs because each run replaces the current one.
Visual baselines, session/project organization, smoke baseline, and broader HTTP
client changes remain in their existing stages.
