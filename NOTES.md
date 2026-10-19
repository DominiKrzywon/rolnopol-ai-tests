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

Small remaining quality step: `check:ci` succeeds with one ESLint warning at
`tests/auth/contact.noauth.spec.ts:18` for the missing explicit return type of
`trackRequests`. The learner can make the listener return `void` explicitly and
use a block body for `requests.push(request)`; the current expression returns
the array's new length. This is a typing/style warning, not a failed assertion.
It does block commits: `.husky/pre-commit` runs lint-staged, whose TypeScript
ESLint command uses `--max-warnings=0`. Reproduced with
`npx eslint tests/auth/contact.noauth.spec.ts --max-warnings=0` (exit 1), while
`npm run check:ci` exits 0 with the same warning. Fix the listener before
committing; do not bypass the hook.

Suggested next small case: Alerts page controls (`TC-PUBLIC-001`). First inspect
`../rolnopol/public/alerts.html` and agree which main controls the scenario covers.
Then add a no-auth spec and a minimal Alerts Page Object using the base fixture,
asserting the heading and those controls. Verify the new file first, then run
`npm run check:ci` and `npm run coverage:validate`; retain the reserved case ID.
This is a proposed choice, not an agreed implementation request.

Chart switching without JavaScript errors (`TC-CHART-001`) and visual housekeeping
above remain alternatives. Keep any new exercise small and let the learner
implement test, source and configuration changes.

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
