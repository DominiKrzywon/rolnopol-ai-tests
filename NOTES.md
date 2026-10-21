# Project notes

The active learning queue, durable decisions and a short completion record.
[TEST_PLAN](TEST_PLAN.md) owns strategy, scope and scenario IDs;
[CODING_STANDARDS](CODING_STANDARDS.md) owns conventions. Git history preserves
older notes. This file is not embedded in the coverage report.

## Current learning queue: October 18, 2026

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
[TEST_PLAN](TEST_PLAN.md#2-repository-evidence-and-environment).

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
