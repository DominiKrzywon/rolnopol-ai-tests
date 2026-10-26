# Project notes

The active learning queue, durable decisions and a short completion record.
[TEST_PLAN](TEST_PLAN.md) owns strategy, scope and scenario IDs;
[CODING_STANDARDS](CODING_STANDARDS.md) owns conventions. Git history preserves
older notes. This file is not embedded in the coverage report.

## SonarQube review: October 25 scan, October 26 source follow-up

The learner supplied a scanner log reporting ANALYSIS SUCCESSFUL (59.825 seconds)
for the [local project](http://localhost:9000/dashboard?id=rolnopol-tests), then
provided an earlier agent's review of three findings. According to that review,
the scan covered src and tests, excluding scripts; this scope was not independently
retrieved from the server. The earlier processing-task request returned HTTP 401.
The Quality Gate and server-side resolution of the findings remain unverified.

October 26 inspection confirms the learner's changes:

- src/helpers/testDataHelpers.ts: generateUniqueEmail now uses randomUUID from
  node:crypto, replacing the timestamp/Math.random combination. The reviewed
  previous use only distinguished test addresses; it was not a confirmed security
  vulnerability. UUID generation is a simpler chosen implementation.
- src/pages/MarketplacePage.ts: getBalance and getLastTransactionAmount now use
  Number.parseFloat. The unused parseAmount method has been removed. These are
  behavior-preserving changes to the function reference and parsing location;
  existing text normalization is retained.
- Before the final source follow-up, the learner reported both suggested focused
  commands passing: Marketplace purchase in isolated-user-tests and blocked
  transaction in no-auth-tests, one worker and zero retries. This is learner-reported
  evidence, not a mentor-run suite result or verification of every subsequent edit.
- The latest raw JSON currently records October 26 at 17:15:12 UTC: health-check
  and TC-JOURNEY-003 passed (2 expected, 0 unexpected, 0 skipped, 0 flaky;
  one worker, zero retries). It contains no source fingerprint. A new registration
  result after the UUID change has not been supplied.

A new SonarQube analysis is needed to verify server-side closure. Do not infer a
passed Quality Gate or security clearance from these source changes. No scanner
command or credential setup is documented because it has not been verified.
The app-code LCOV pilot measures selected backend files in the separate application
checkout; it does not establish code coverage of this test-framework repository.

## Current next steps: October 26, 2026

This queue takes precedence over the older learning choices below. Finish and
commit the current SonarQube/documentation work, then investigate one failing
scenario at a time. The unfinished Alerts exercise remains separate; it currently
has an empty callback and an unused alertsPage parameter and blocked the earlier
check:ci lint stage. Do not silently treat the commit as fully checked. Completing
Alerts or explicitly marking the unfinished scenario as skipped is a separate
learner decision; removing its unused parameter alone would leave a misleading pass.

### Evidence preserved before another run

The normalized coverage-report/coverage.json generated October 26 at 16:56:36 UTC
still describes the October 25 execution starting at 09:48:42 UTC against
http://localhost:3000: 42 expected and 6 unexpected Playwright outcomes, zero
skipped/flaky and zero global errors, two workers, zero retries. This is a UI-scope
execution, not a complete-suite result: 47 catalog scenarios are not-run in the
normalized report. Its projects metadata lists configured projects and does not
by itself establish execution scope. Source provenance is absent (unknown).
The normalized outcomes include 41 passed catalog scenarios and 6 failed; the
additional expected Playwright entry is infrastructure.

The raw JSON and Playwright HTML were replaced by newer focused runs. Therefore
old failure summaries below identify investigation targets, not proven causes.
Preserve any remaining matching trace/report locally before running again; do not
assume current Playwright links still refer to the October 25 execution.

| Order | Case           | Saved observation                                                                                  | Next small investigation                                                                                                                                                                              |
| ----- | -------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | TC-FARM-002    | Field-card visibility timed out at staff-management.isolated.spec.ts:96.                           | Check whether the herd POST finishes before the immediate navigation; distinguish save, reload and locator failures.                                                                                  |
| 2     | TC-FARM-003    | Staff-added visibility timed out at staff-management.isolated.spec.ts:125.                         | Inspect the staff POST and the actual message element/visibility before changing the expectation.                                                                                                     |
| 3     | TC-ASSIGN-001  | Notification assertion failed at staff-assign.isolated.spec.ts:56.                                 | Capture the assignment POST status and resulting notification; the saved summary omits expected/actual text.                                                                                          |
| 4     | TC-FARM-013    | Execution failed, with no actionable location in the normalized summary.                           | Reproduce once and identify setup, pagination or teardown as the failing phase before choosing a correction.                                                                                          |
| 5     | TC-PROFILE-001 | Profile run timed out with 9 recorded errors; first summarized location is profile.e2e.spec.ts:26. | Check the first failure, authenticated page and expected demo data. October 20 separately recorded Demo User versus Demo Userr; this is a hypothesis for investigation, not the October 25 diagnosis. |
| 6     | TC-JOURNEY-003 | Failed during the expensive-purchase step on October 25.                                           | Already passed in the latest October 26 focused JSON. Keep under observation; do not call it fixed or flaky from these two uncontrolled observations.                                                 |

### First exercise only: herd creation

Relevant files: tests/auth/staff-management.isolated.spec.ts (TC-FARM-002) and
src/pages/managementPages/ManagementMainPage.ts (addAnimalGroup). The helper
awaits the submit click; the spec immediately navigates away. A click completion
does not prove the asynchronous save has completed. This is a concrete race
candidate, not a reproduced root cause. Nearby Contact and Profile tests provide
the existing pattern: register a matching response waiter before the UI action.

1. Reproduce only the herd scenario with one worker and zero retries, recording
   the first failure and whether POST /api/v1/animals completes. Do not increase
   timeouts or add retries as a fix.
2. If the save/navigation race is observed, make the smallest spec change:
   register the exact POST response waiter before addAnimalGroup, await both,
   assert the documented status/success and the created herd's important values,
   then navigate and retain the field-card assertions. Keep assertions in the spec.
   If the request completes successfully, inspect the subsequent field load and
   locator instead; do not assume a waiter fixes a different problem.
3. Focused verification command:

```powershell
npx playwright test tests/auth/staff-management.isolated.spec.ts --project=isolated-user-tests --grep "should create a new animal herd" --workers=1 --retries=0
```

After a reproduced timing fix, repeat the focused scenario at least five times
without retries, then run check:ci. Broaden to the management file/project only
when shared Page Object behavior changes or further evidence justifies it.
Review this result before starting TC-FARM-003; the table is a queue, not a batch
implementation request. No application tests or new SonarQube scan were run for
this planning update; the mentor changed Markdown only.

## Current learning queue: October 18, 2026

Historical learning choices: the October 26 queue above now takes precedence.

Reviewed again on October 19, 2026 against the four October 18 commits
(`e1877bf` through `4f01a1b`) and the learner's subsequent Contact changes.
Contact validation, successful submission and account deletion are implemented;
do not assign their implementation again.
The profile waiter, Marketplace cancellation tag and visual spec path are
also corrected. Historical project results below apply to their recorded source.

### 1. Finish visual housekeeping

The active Windows baseline is
`tests/visual/homepage.visual.spec.ts-snapshots/homepage-visual-test-win32.png`.
An older, different PNG remains inside the nested
`homepage.visual.spec.ts-snapshots/homepage.visual.spec.ts-snapshots/` directory.
The learner can remove that obsolete nested directory after checking its contents.
Keep the active baseline. Linux CI baseline verification remains separate.

### 2. Account deletion: implementation and focused verification complete

Implemented in source and reviewed on October 18, 2026: modal visibility,
disabled/enabled confirmation, DELETE response status and JSON, success
notification, home URL/content, and rejected login (401, `error`, false success).
The October 19 focused profile-file run passed both profile cases and the health
dependency, including the final response/navigation/rejected-login assertions.
The final source has not been rerun across the entire isolated-user project;
the October 18 project result below remains historical evidence.
October 19 source review confirms the home URL now uses `ENV.BASE_URL`.
The previous hardcoded-localhost exercise is complete.

The test uses its own `freshUser`, ProfilePage modal locators, a response waiter
registered before confirmation, and the raw `loginUser` helper after deletion.
Keep these checks. Any remaining project-level completion check concerns
verification scope, not writing the scenario again.

### 3. Contact validation and successful submission: implemented

October 19 source review confirms both Contact exercises in
`tests/auth/contact.noauth.spec.ts`, using the base Page Object fixture.

- `TC-PUBLIC-002`: empty submission produces all four custom validation messages
  and keeps the contact URL. A `Request[]` records browser requests from before
  clicking through the validation assertions; filtering by POST and the exact
  configured contact endpoint confirms no matching request in that interval.
  The listener is removed in `finally` using the same function reference.
  The earlier string-array type, listener-name typo and incorrect endpoint
  filter are corrected. No fixed timeout was added.
- `TC-PUBLIC-003`: fills all four fields with generated data, registers the POST
  response waiter before submission, and checks HTTP 200, `success: true`,
  `Message received`, and the visible `Thanks! Message received.` notification.
  Four `expect.soft(...).toHaveValue('')` assertions check the form reset;
  failures still fail the test while allowing the remaining fields to be checked.
- `ContactPage` now provides subject/message and notification locators plus
  `sendTheMessage`; behavioral assertions remain in the spec.

The form uses custom validators with `novalidate` and depends on
`contactFormEnabled`. The UI describes a test form without a real inbox; backend
source saves contact records. No feature flags or cleanup endpoints were changed.
A form-scoped alert locator remains an optional simplification, not an active task.

### 4. Next learning choices

Contact implementation is complete; do not assign these two scenarios again.
After focused verification, the entire `no-auth-tests` project remains a separate
completion check; no full-project or full-suite result is implied.

October 21 source inspection confirms the Contact listener now has an explicit
`void` return type and block body. The earlier typing exercise is complete in
source; the October 19 warning below remains historical evidence. No new lint
result is implied.

The requested portfolio follow-up is now a concrete
[implemented history pilot](#portfolio-inspired-learning-review-october-21-2026).
Start by reading the generated history; implementation was explicitly requested. The
existing UI choices below remain alternatives.

October 21 learning preference: use reporting history occasionally on local runs.
Do not plan daily CI execution or recurring paid infrastructure for this personal
learning repository. The archiver/analyzer remains available as a work-relevant
example; collecting more history is not the next required exercise.

Suggested next small case: Alerts page controls (`TC-PUBLIC-001`). Source review
of `../rolnopol/public/alerts.html` confirms an Alerts heading, Search alerts
input, Select region combobox and Refresh alerts button (title attribute).
The page is gated by `alertsEnabled`; the severity filter has its own flag and
may be hidden/disabled. Initial proposed scope: heading, search, region and
refresh, with Alerts enabled as a known environment prerequisite. Do not make
assertions conditional merely to accommodate an unexpected environment state.

The learner's implementation target is `src/pages/AlertsPage.ts`,
`tests/auth/alerts.noauth.spec.ts`, an `ALERTS` entry in
`src/constants/pageUrls.ts` and an `alertsPage` fixture in
`src/fixtures/test.fixture.ts`. Follow ContactPage's locator declarations and
base fixture; no authenticated user is needed. Use the reserved case ID and
keep assertions in the spec. Verify visibility of the heading and visibility/
enabled state of the three controls; do not depend on daily alert counts.
This is a proposal, not authorization for the mentor to implement these files.

Focused verification after implementation:
`npm run coverage:run -- tests/auth/alerts.noauth.spec.ts --project=no-auth-tests --workers=1 --retries=0`,
then `npm run check:ci` and `npm run coverage:validate`. A shared Page Object
fixture addition may justify a focused Contact check if existing wiring changes;
do not run the full suite without a concrete impact. Update the catalog note
after implementation; only regenerate README if its generated index changes.

Follow-up choices: first inspect the UI/request after selecting a different
region and define a separate behavior case, or explore Contact keyboard/focus
accessibility. Assign new scenario IDs only once the follow-up contract is
defined. No application or browser run was performed for this planning update.

Chart switching without JavaScript errors (`TC-CHART-001`) and visual housekeeping
above remain alternatives. Keep any new exercise small and let the learner
implement test, source and configuration changes.

### 5. Page Object locator declarations: migration completed October 20

The learner prefers the `ContactPage` style, where fixed locators are initialized
beside their declarations through `this.page` (for example,
`readonly nameInput = this.page.getByPlaceholder('Jane Doe')`). Apply this
The agreed style initializes fixed locators beside their declarations through
`this.page`, as in `ContactPage`. Migrated all derived Page Objects with locator
constructors: Home, Financial, Login, Register, Profile, Marketplace, Docs,
API Docs, and both management pages. Kept `BasePage`'s constructor, action
methods, parameterized locator methods and existing locator behavior. Preserved
dependent-field order in `ManagementPage`, including `fieldsList` before
`fieldCards` and pagination before its child locators. The Page Object example
in `CODING_STANDARDS.md` now reflects this convention.

Verification on October 20: `npm run check:ci` passed. The UI run across
`smoke-tests`, `no-auth-tests`, `isolated-user-tests`, `demo-user-tests` and
`visual-test` reported 53 passed and 1 failed (54 total, including setup and
health). Financial isolated scenarios, management, registration, login,
Marketplace, documentation and the visual test passed. The remaining
`profile.e2e.spec.ts` failure expected `Demo User` but read `Demo Userr` from
both the displayed-name locator and input. Diagnose the demo profile data
separately; this run does not establish a clean full UI result. The failed
assertions observed the DOM through unchanged locators; no profile assertions
or test code were changed in this migration.

## Portfolio-inspired learning review: October 21, 2026

The [revised portfolio analysis](ANALIZA_PROJEKTOW_SDET.md) now describes
Rolnopol correctly. The learner explicitly requested implementation of the
archiver and analyzer after reporting a successful Contact run. This supersedes
the earlier proposal that the learner would write these scripts.

### Implemented: archive first, analyze recorded history

- `scripts/coverage/history.mjs` implements a standalone local archiver and
  deterministic history analyzer; no external tool or new dependency was added.
- `npm run coverage:archive` saves the current raw/normalized JSON and available
  report HTML under ignored `playwright-report-ci/learning-history/`.
  Each destination uses the execution timestamp and run ID. Existing archives
  cannot be overwritten. A manifest is written only after copying finishes.
- Raw and normalized reports must have matching provenance, statistics and
  global error count. Missing provenance or inputs fail visibly. Failed runs
  can be archived. The Playwright HTML is copied only when its embedded
  metadata matches the raw execution; missing/unsupported/mismatched HTML is
  reported explicitly. Coverage HTML availability is recorded separately.
- `npm run coverage:history` produces `history.md` and `history.json` in the
  archive root. It reads archives, never contacts the application, and refuses
  duplicate run IDs, invalid evidence or interrupted archives.
- The analyzer groups by recorded fingerprint, revision, command, target origin,
  application version, workers, project retry/repetition settings and Playwright
  version. Within a group, case ID plus project identifies a scenario.
- Outcomes remain separate: passes, failures, retry variation, skips, absent and
  other outcomes. Durations sum attempts for each observation. Counts include
  their run denominator and time window. Catalog rows without observations are
  not treated as executed tests. Health is a catalog scenario and remains
  visible; setup infrastructure has a separate count.
- Only the requested artifacts are copied from `coverage-report/`; unrelated
  historical subdirectories or screenshots are not recursively archived.
  Full Playwright HTML attachments are preserved when the HTML matches.
- Generated archive files are excluded from Prettier and ESLint; the archive
  root was already Git-ignored. The learner's existing .gitignore change was
  preserved. No test scenario, fixture or CI execution behavior was changed.

The user's October 21 run was inspected and archived successfully: one Contact
case (`TC-PUBLIC-002`, `no-auth-tests`) passed, plus the health case
(`TC-SMOKE-007`, `health-check`). The recorded run starts at
`2026-10-21T18:48:37.144Z`, ID
`84bc69bd-f372-465f-b4d7-18fe4f7ec588`. Both JSON reports agree and the
Playwright HTML matches. Application version is `unknown`. This is one
historical run, not a repeated-run stability result or current full-suite
confirmation. It was not rerun by the mentor during implementation.

### Why the two steps matter

The normal output paths are reused. An archive preserves the evidence needed
to compare an earlier failure against a later pass. The analyzer turns separate
reports into observations about the same case under matching recorded settings.

For example, passed/failed/passed on unchanged recorded inputs is mixed-outcome
evidence worth investigating. Failed/failed/failed is a persistent failure in
the sample. A failed attempt followed by a successful retry is retained as
retry variation. None of these observations establishes the cause. Sessions,
rate limiting, application state and the test itself remain possible causes.

OS/browser builds, data and external services are not fully identified by the
existing report metadata. An `unknown` application version cannot establish an
unchanged application. Matching groups are provisional comparisons, not proof
of controlled conditions. Embedded-document or tooling changes can also alter
the source fingerprint and intentionally split groups.

### Next small steps for the learner

1. Open `playwright-report-ci/learning-history/history.md` and compare its two
   rows with the archived original HTML. Explain why Contact and health appear
   separately and why one pass cannot prove stability.
2. After a future run of the same command, invoke `coverage:archive`, then
   `coverage:history`. Run archiving even when the test fails. Do not place it
   behind a success-only shell operator. Re-archiving the same run intentionally
   fails rather than adding another observation.
3. Keep browser/OS, app, environment and command consistent when collecting a
   small series. Code changes made for this implementation change the source
   fingerprint, so future runs may form a new group relative to the original.
   Retain the pilot archives until review; there is no automatic deletion.
4. If outcomes vary, inspect the corresponding archived HTML/trace before
   modifying waits, adding retries or attributing a root cause.
5. External flaky-analytics/CTRF/qa-report-lake remain optional later comparisons.
   They were not installed. Accessibility and existing visual housekeeping
   remain independent UI learning choices.

Archiving is manual by design and does not modify the runner or a test exit code.
Missing/partial current output after collection failure must be investigated
before archiving; this command snapshots files and does not prove they came from
the most recently attempted shell command.

### Verification record

`npm run coverage:test` passed 42/42 tooling tests, including 8 new history tests.
These exercise mixed outcomes, persistent failures, retry evidence, skipped and
absent executions, separation of conditions/projects, renamed case identity,
chronology, duplicate rejection, failed-run archiving, missing inputs, mismatched
reports, nesting protection and interrupted archives.

`npm run coverage:validate` passed with 94 collected entries including 1 setup
entry. It collected declarations only; it did not execute application tests.
The first isolated Node test attempt was blocked by sandbox `spawn EPERM`;
successful tooling tests and collection used approved execution outside that
restriction. `npm run check:ci` passed formatting, ESLint and TypeScript.
The archived HTML was also checked in headless Chromium: all three embedded
documents opened, scenario pagination and filtering worked, details expanded,
and a chapter anchor revealed its document section. A screenshot was inspected.
This successful saved run has no failure links to click; failure-link mapping
is covered by the existing tooling tests. No HTML renderer changes were needed.

## Agreed learning scope

The learner edits test, source and configuration files. The mentor explains,
reviews and may edit Markdown. Prefer small exercises and focused verification;
avoid speculative framework hardening.

### Agreed decision: keep Marketplace purchase cleanup

Keep `src/fixtures/marketplace.fixture.ts`, including seller/buyer reads and
nested `try/finally`. The learner rejected moving the buyer read into an `else`.
Do not propose this refactor, error aggregation or fault-injection exercises
in routine reviews or ask for renewed justification. Revisit only at the
learner's explicit request or for a new reproducible failure. This supersedes
older proposals and does not claim every failure path was tested.

### Agreed decision: leave TC-MARKET-003 as implemented

Keep the complete offer-creation test: manual animal setup, listing read,
assertions and nested cleanup. Do not restore `createdAnimal`, remove the listing
read or refactor the case routinely. Revisit only at the learner's request or
for a new reproducible failure. The learner reported the manual version working;
the earlier fixture-version failure was not diagnosed.

### Agreed scope: owned-offer cancellation

Keep `TC-MARKET-004` focused on the owner's active offer, successful DELETE and
fresh `my-offers` read showing the same offer cancelled. No buyer listing check:
the public listing excludes the current user's own offers.
Other application exclusions remain in
[TEST_PLAN](TEST_PLAN.md#2-scope-decisions).

## Completed exercises

October 19 Contact completion (after adding request tracking and the valid case):

- `npx playwright test tests/auth/contact.noauth.spec.ts --project=no-auth-tests --workers=1 --retries=0`:
  3 passed (both Contact scenarios and the health dependency), zero failed.
  This run includes the no-POST assertion and all four soft reset assertions.
- `npm run check:ci`: exit 0; formatting and TypeScript passed. ESLint reported
  zero errors and one explicit-function-return-type warning for `trackRequests`.
- After updating the catalog, `npm run coverage:readme` left the generated
  README index unchanged; `npm run coverage:validate` passed with 94 collected
  entries including 1 setup entry. The edited Markdown was formatted with Prettier.
- Browser execution used the previously approved route outside the sandbox's
  worker-spawn restriction. The mentor changed Markdown only; test and Page
  Object implementation belongs to the learner.

Earlier October 19 review of the October 18 changes (before Contact extensions):

- `npx playwright test tests/auth/contact.noauth.spec.ts --project=no-auth-tests --workers=1 --retries=0`:
  2 passed (Contact validation and the health dependency).
- `npx playwright test tests/auth/profile.isolated.spec.ts --project=isolated-user-tests --workers=1 --retries=0`:
  3 passed (display-name update, account deletion and the health dependency).
- `npm run check:ci`: passed formatting, ESLint and TypeScript checks before
  the documentation edits. No test, source or configuration files were changed.
- After the documentation edits, `npm run coverage:readme` regenerated the
  unchanged README scenario index; `npm run coverage:validate` passed and
  collected 93 entries including 1 setup entry. Prettier checks
  for NOTES, TEST_PLAN and README and `git diff --check` also passed.

The first Contact attempt failed before test execution with sandbox `spawn EPERM`;
the successful browser runs used approved execution outside that restriction.
These are focused results, not a current full-project or full-suite baseline.
The auth API error-message change was reviewed in source only; it was not rerun.

The October 15–17 batch is closed in source: Financial raw-response helpers and
recipient fixture; Marketplace API helpers and typed offer reader; isolated
purchase/rejection flows; registration response/navigation and native required
validation; the `TC-FIN-014` date interval; and `readResponseData` extraction with
`getAccountBalance` reuse (`0fc5a63`).

The learner reported passing quality checks, Financial API, all `api-tests`,
Marketplace UI and registration UI after the suggested commands. No terminal
summaries or counts were supplied; this is not a mentor-run or full-suite baseline.
Malformed-response checks were not demonstrated and are not an active exercise.

October 18 follow-up confirms the corrected profile waiter, cancellation tag and
visual spec layout. The learner reported the profile working without a command
or run summary. Mentor verification: `npm run coverage:collect` collected 91
entries including one setup; `npm run check:ci` passed. The visual command
`npx playwright test --project=visual-test --workers=1 --retries=0 --update-snapshots=none`
passed both the health dependency and visual test (2 passed); baselines were not
updated. The sandbox first blocked worker creation with `spawn EPERM`; the
successful run used approved execution outside that restriction.
The project-level command
`npx playwright test --project=isolated-user-tests --workers=1 --retries=0`
also passed: 23 passed (22 isolated cases and one health dependency), zero failed
and zero skipped. This includes the corrected profile and cancellation tests.
No test, source or configuration changes were made by the mentor.

## Reference roadmap

Use the small queue above for next choices; account deletion and both Contact
scenarios are already implemented. `TC-AUTH-012` covers anonymous fields access in
`tests/api/farm.api.spec.ts`. Do not reopen completed Financial, registration or
Marketplace purchase work or automatically migrate every HTTP endpoint.

## Reporting reference

Use [README](README.md#scenario-coverage-report) for commands and artifacts,
[TEST_PLAN](TEST_PLAN.md#metric-definitions) for metric definitions, and
`npm run coverage:validate` for scenario mappings and README index consistency.
Scenario coverage measures catalog cases, not application code or assertion
quality. Collection does not run tests; saved results need matching source
provenance for current confirmation. Copy report outputs before comparing runs.

## Repository evidence and environment: historical reference

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

### Initial inventory and verification

Application inventory: September 5, 2026, Rolnopol v1.79.0.
September 7, 2026 update: code review, test collection, `check:ci`,
and anonymous access checks at `http://localhost:3000`.

## API client convention: adoption record

Selected on October 12, 2026. This is the target convention for incremental
refactoring; existing tests have not all been migrated. The pilot
`TC-MARKET-004` and follow-ups `005` and `007` are implemented in source
(inspection: October 15, 2026; no new application run). See
[REFACTOR.md](REFACTOR.md#api-client-learning-exercise-october-12-2026) for the design
and [NOTES.md](NOTES.md#current-learning-queue-october-18-2026) for the next exercises.
