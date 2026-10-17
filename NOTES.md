# Project notes

Learning queue, historical evidence and completed exercises. Dated records do not
establish current test results. The current learning queue owns the next exercises;
[TEST_PLAN.md](TEST_PLAN.md) owns strategy, scope and the scenario catalog.
This document is not embedded in the coverage HTML.

## Current learning queue: October 17, 2026

This is the single active queue for mentor exercises. The learner edits code;
the mentor may edit Markdown. TEST_PLAN owns strategy, scope and catalog metadata.
The reference roadmap preserves longer-term ideas; the archived queue below
records earlier decisions. Notes and REFACTOR are not embedded in coverage HTML.

Review scope: commits `249cec1` and `e0266f0`, changed tests, helpers, fixtures
and related Markdown. The initially modified `debug.log` was not read or edited.
No application tests were executed for this review. Implementation and historical
learner reports do not establish current passing results.

The latest batch extracts the Financial recipient fixture, preserves raw
responses for explicit status assertions, checks fresh income/expense balances,
and strengthens insufficient-funds UI checks with an exact owned offer, HTTP 400,
balance and ownership assertions. Registration checks native required-field
validity. Do not repeat these completed migrations. Preserve TC-MARKET-003 as
implemented and TC-MARKET-004's owner-only scope, as agreed in the archived queue.

### 1. Correct the date-filter exercise

- **Status:** completed in source. Follow-up inspection confirms the earlier
  start at minus three days and later end at minus two days. The learner reported
  that it works; the exact executed command and counts were not supplied.
  The learner subsequently reported all tests passing after the suggested
  Financial-file command. No terminal summary or counts were supplied; this is
  learner-reported file-level evidence, not a mentor run or a full-suite result.
- **Original observation (medium):** `tests/api/financial.api.spec.ts:564` used minus two
  days for `startDate` and minus three for `endDate`. Start is later than end.
  This predates the last commit but matters when closing the Financial batch.
- **Impact:** an empty result cannot demonstrate filtering of a valid interval
  before the transaction; it may result from invalid input instead.
- **Small target:** retain `TC-FIN-014` and its three reads. Use minus three days
  for the earlier start and minus two for the later end. Keep the matching and
  future intervals. Invalid-range validation needs a separately agreed contract.
- **Learning:** distinguish an empty valid selection from invalid input.
- **Verify:** run the focused case below, retaining the matching transaction-ID
  and both empty-list assertions. Then run the Financial file and `check:ci`
  once to close its batch. Record actual counts, failures and commands.

```bash
npx playwright test tests/api/financial.api.spec.ts --project=api-tests --grep "should be able to check date range" --workers=1 --retries=0
npx playwright test tests/api/financial.api.spec.ts --project=api-tests --workers=1 --retries=0
npm run check:ci
```

### Agreed decision: keep Marketplace purchase cleanup

The learner explicitly chose to retain the current cleanup in
`src/fixtures/marketplace.fixture.ts`. They had deliberately removed the
conditional buyer-read variant after earlier advice in another conversation.
This is a personal learning repository; further cleanup hardening is outside
the selected exercise scope.

Do not propose moving the buyer read into an `else`, rebuilding this cleanup,
adding error aggregation or running fault-injection exercises as routine next
steps. Keep the current seller/buyer reads and nested `try/finally`. Do not ask
the learner to justify this choice again. Revisit only if the learner explicitly
selects the topic or a new reproducible failure requires investigation.

This decision supersedes the October 17 cleanup exercise and earlier cleanup
verification proposals in the archived queue and REFACTOR. It records accepted
learning scope, not proof that every failure path was verified.

### 2. Close remaining October 15 verification gaps

Record only missing results for the Financial API, Marketplace API, Marketplace
UI and registration files: command, scenario counts and failures. Reuse available
results; the learner reported the date-filter case working. Do not rerun
unrelated projects merely to enlarge the report. These
commands include the configured health-check dependency; distinguish it from
the requested scenarios. `--grep` matches titles, not case-ID annotations.

```bash
npx playwright test tests/api/marketplace.api.spec.ts --project=api-tests --workers=1 --retries=0
npx playwright test tests/auth/registration.noauth.spec.ts --project=no-auth-tests --workers=1 --retries=0
```

### 3. Pilot response parsing reuse in one Financial reader

The learner selected the next code exercise after reporting the Financial file
passing. Start with extraction inside `httpClient.ts` only: export
`readResponseData<T>(response: APIResponse, method: 'GET' | 'POST' | 'DELETE',
url: string): Promise<T>`. Move the existing response-reading and error-handling
block unchanged; `send` should fetch and delegate with its existing method and
URL. Keep `getJson`, `postJson` and `deleteJson` signatures and behavior. Review
this extraction before migrating `getAccountBalance` in a separate small step.

Follow-up review confirms that `readResponseData` contains the existing parsing
and error-handling block unchanged and `send` delegates after fetching. The
learner reported the suggested checks passing; no terminal output was supplied.
The mentor inspected the diff without executing checks. The second stage is
also implemented: `getAccountBalance` calls `getAccountResponse` and
`readResponseData<AccountData>`, passes `GET` and `response.url()`, and returns
`account.balance`. The `getJson` import remains for `getTransactions`.
The learner reported the result working after the suggested `check:ci` and
Financial-file verification; no command output or counts were supplied.
Do not propose repeating these two completed implementation stages. The learner
subsequently reported all API tests passing after the suggested
`npx playwright test --project=api-tests --workers=1 --retries=0` command.
This closes the API integration verification for this refactor. No terminal
summary or counts were supplied; the result is learner-reported, not a mentor
run. Do not repeat these runs without a new change or unresolved concern.
Dedicated malformed-response and error-path checks have not been demonstrated;
the passing API project alone does not establish those paths.

Original exercise rationale (now implemented): compare `src/api/httpClient.ts` and
`src/api/financial.api.ts`: `getAccountBalance` and `getAccountResponse` repeat an
endpoint URL. Propose a small parsing function that lets the convenience reader
consume the raw response function. Review its contract before implementing.
Preserve existing convenience return values, `ApiError` and success handling;
keep `expectApiSuccess` explicit in specs and raw 4xx responses accessible.
Do not migrate all domains or introduce another client class.

Verify successful parsing, HTTP failure, malformed JSON and missing/false success
with focused response checks, then the Financial file and actual shared-client
consumers. Broader verification depends on the final shared diff.

### Documentation verification for this review

An in-memory Node check using `parseCatalog` and `updateReadme` confirmed that
all 98 catalog rows are identical to HEAD and that the formatted README index
matches the catalog. It also checked 66 local Markdown links and their anchors
across the ten edited documents. `git diff --check` passed. These checks did not
write coverage artifacts. No application pass count is inferred from this review.
Saved HTML retains old documents until regenerated; the Markdown move changes
future report input, not already saved artifacts.

## Historical evidence

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

The next small exercises are detailed in [the active plan](NOTES.md#current-learning-queue-october-17-2026). Unresolved validation and
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

## Completed exercises

### Financial and UI refactoring batch: October 15, 2026

Source inspection confirms the implemented Financial GET and POST migrations,
external `AccountData` type, and Financial recipient fixture. `TC-FIN-005`
checks both transaction responses and fresh balances. Purchase-fixture cleanup
now attempts field cleanup even after cancellation failure and disposes the
seller context in an outer `finally`. Simultaneous cleanup failures can still
mask earlier errors; failure-path verification was not supplied.

`TC-MARKET-002` now uses its fixture's exact offer, captures the UI purchase
POST and checks 400, then verifies the message and fresh balance, offer status,
and both users' field ownership. The learner said the work was going well;
no exact Marketplace command, report, or count was provided.

`TC-REG-003` now checks missing required email and password values, email
focus, and the registration URL. After receiving the focused verification
instructions, the learner reported that it passed. The executed command and
entry count were not supplied, and this does not confirm the full registration
file or `check:ci`. No application tests were run by the mentor for this update.

Completed implementation is recorded here; remaining verification and future
exercises are selected in the current learning queue.

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

## Reporting reference

### Report commands and artifacts

The report combines collapsible README, TEST_PLAN, and CODING_STANDARDS, a collected test
inventory, and Playwright JSON results. It runs without AI. Open
`coverage-report/index.html` directly in a browser; no report server or internet
connection is required. Search and filter by ID, area, priority, risk, and result.

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

# Validate a saved coverage.json without opening HTML
npm run coverage:verify

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
| `coverage-report/index.html`              | Standalone report with collapsible documentation                        |
| `playwright-report/index.html`            | Standard Playwright diagnostics, including available attachments        |

Outputs are ignored by Git and replaced on the next run. Copy the output folder
before another run if you need history. Raw Playwright diagnostics may contain
application data; the coverage HTML/normalized JSON omit logs and attachments.

### Reading the numbers

- **Implemented**: included catalog IDs with a collected test / all included IDs.
- **Selected to run**: unique included IDs present in the selected Playwright
  results, including skipped or blocked cases; setup and repeated attempts do not
  add scenarios. No run is shown as N/A.
- **Confirmed**: included IDs passing in every collected project / all included
  IDs, provided results match the current source fingerprint and have no global errors.
- **Planned**: a catalog scenario without a collected implementation.
- **Not-run/partial**: no execution or incomplete project execution; never a pass.
- **Skipped, failed, flaky, interrupted, expected-failure**: separate observed states.
- **Excluded**: a documented scope decision, outside the denominator.

Risk is a provisional estimate of the effect of a regression in this learning
application. It is recorded per case in TEST_PLAN and is independent of the
P0/P1/P2 execution priority. Risk breakdowns use only included catalog rows.

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

See [Coding Standards](CODING_STANDARDS.md#scenario-ids-and-catalog-maintenance).

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

Normalized `coverage.json` uses **schemaVersion 5**. Each case has a `scenario`
object (`title`, `area`, `priority`, `risk`, `layer`) and an `execution` object (`status`,
`durationMs`, `runs`). Each run represents one project execution/repetition, with
its own status, duration, `playwrightTestId`, failure summary and `attempts`.
Each attempt retains its retry number, status, duration and failure. Durations
sum attempts; a run's failure is its last failed attempt, even if a retry passed.
Missing failure fields are `null`, never guessed from the test declaration.
The JSON also records the selected scenario count and validated priority,
risk, and area breakdowns with implemented and confirmed counts. Confirmed values are `null` without current run evidence.
`coverage:report` validates JSON before writing it; `coverage:verify` checks a
saved file independently of HTML.

## Reference roadmap

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

## Archived learning queue: October 15, 2026

The current queue below was refreshed from source inspection on October 15, 2026.
The learner implements code changes; the mentor explains, reviews, and may
update Markdown records. Keep each implementation small and separately reviewable.
No application tests were executed by the mentor for this update. Earlier
quality-check results predate this batch. Learner-reported results are identified
explicitly below; implementation is not a passing application baseline.

The earlier `getStaff` exercise is implemented, including its use in
`TC-FARM-019`. Assigned-staff deletion (`TC-FARM-021`) and unsupported-animal-type
rejection (`TC-FARM-022`) are present. Marketplace owner cancellation,
other-user cancellation rejection, and own-purchase rejection have API tests.
The catalog and Marketplace stage entries now reflect these additions.
Completed exercises and their verification evidence are recorded in
[Notes](NOTES.md#completed-exercises).
See [REFACTOR.md](REFACTOR.md) for source observations and fixture design.

### Agreed scope: owned-offer cancellation

Keep `TC-MARKET-004` focused on the owner: active offer in `my-offers`, successful
DELETE response, and a fresh `my-offers` read showing that same offer cancelled.
The learner chose not to expand this test with a second user's listing checks.
Local application source excludes the current user's own offers from
`/marketplace/offers`; the mentor's earlier presence assertion was incorrect.
The listing assertions are already absent from the current test. Buyer-visible
listing disappearance is deferred, not a requirement for this exercise.

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

### Implementation record: October 15, 2026

The implementation exercises from this queue are now present in source.
Do not propose repeating the migrations below. This update records inspected
code and learner-reported execution separately; no application tests were
executed by the mentor for this documentation update.

#### Implemented exercises

- [x] Marketplace response migration: `TC-MARKET-004`, `005`, and `007`
      use raw domain response functions and explicit success assertions.
      Negative 400/403 checks remain in specs.
- [x] Financial account migration: `TC-FIN-011` calls `getAccountResponse`
      and `expectApiSuccess<AccountData>(..., 200)`. The account identity,
      currency, and initial balance assertions remain. `AccountData` lives in
      `src/types/accountData.ts`; `getAccountBalance` keeps its existing contract.
- [x] Financial recipient lifecycle: `transferRecipient` moved into
      `src/fixtures/financial.fixture.ts`, extending the Auth fixture. It owns
      a separate recipient context, registration, login, and disposal.
      The former local `createLoggedInRecipient` function is no longer needed.
- [x] Financial POST migration: `TC-FIN-005` calls `createTransactionResponse`
      for income and expense. `CreateTransactionPayload` keeps card inputs
      explicit and optional; the raw function forwards the supplied payload.
      Both responses require 201 and success, check transaction data, and are
      followed by fresh balance reads. Existing `addTransaction` remains a
      setup convenience helper with its previous behavior.
- [x] Purchase-fixture cleanup: nested `try/finally` ensures the field cleanup
      is attempted after cancellation failure and seller-context disposal is
      attempted after cleanup failure. Exact current-owner lookup is preserved.
      Multiple cleanup failures can still mask earlier errors; fault-injection
      verification and preserving all errors remain separate follow-up work.
- [x] Isolated insufficient-funds UI: `TC-MARKET-002` uses
      `fieldOfferForPurchase` and its unique description. A response wait starts
      before the UI action and matches the purchase POST; status 400 and the
      notification are asserted. Fresh API reads verify zero buyer balance,
      the exact active offer, seller ownership, and absence from buyer fields.
- [x] Required-field validation: `TC-REG-003` checks native
      `validity.valueMissing` for email and password, focus on email, and the
      registration URL. The learner reported that the test passed. The exact
      command, entry count, full registration-file run, and quality-check result
      were not supplied. This is not evidence of a passing whole project.

`TC-MARKET-001` already buys a known seller-owned field and checks exact
ownership on both sides plus one transaction-history expense. Its history
assertion expects a field ID in the purchase text. Preserve the scope decisions
above, including leaving `TC-MARKET-003` as implemented.

#### Previously proposed verification and next steps

1. **Close the current batch with focused execution evidence.** Record the
   actual commands and results for the Financial API file, Marketplace API file,
   Marketplace UI file, registration file, and `check:ci`. Run only missing
   checks; do not repeat a check whose result is already available without a
   code change or unresolved concern. The learner's positive Marketplace comment
   did not specify a command or result count, so it is not a recorded file baseline.
2. **Verify purchase-fixture failure paths.** On test-owned data, temporarily
   fail before and after purchase and simulate cancellation failure. Verify
   that field cleanup is attempted and the seller context is disposed; revert
   temporary failures. A normal passing run does not establish these paths.
   Because a shared fixture changed, include `isolated-user-tests` when closing
   its verification scope. If multiple failures need clearer diagnosis, make
   error preservation a separate small implementation exercise.
3. **Consider the previously discussed HTTP-client duplication exercise.**
   After the current verification is complete, inspect separating HTTP sending
   from response parsing in `httpClient.ts`. The aim is to let convenience
   helpers reuse raw domain functions without repeating endpoint URLs.
   Preserve existing convenience return values and success behavior; keep
   `expectApiSuccess` explicit in specs and 4xx responses accessible.
   This is a proposed next exercise, not an implemented change or a reason to
   migrate every endpoint at once.

Verification commands below are suggestions, not recorded results. Each test
command also runs the configured health-check dependency.

```bash
npx playwright test tests/api/financial.api.spec.ts --project=api-tests --workers=1 --retries=0
npx playwright test tests/api/marketplace.api.spec.ts --project=api-tests --workers=1 --retries=0
npx playwright test tests/auth/marketplace.isolated.spec.ts --project=isolated-user-tests --workers=1 --retries=0
npx playwright test tests/auth/registration.noauth.spec.ts --project=no-auth-tests --workers=1 --retries=0
npm run check:ci
```

Use titles with `--grep`; case IDs are annotations, not title/tag filters.
Preserve case IDs. If a title or catalog row changes, run `coverage:readme`
and `coverage:validate`. Keep actual execution evidence in NOTES.

### Intentionally deferred

See [Coding debt notes](NOTES_CODING_DEBT.md#intentionally-deferred) for purchase
cleanup concerns and deferred reporting diagnosis. Active work is selected in the current learning queue; this archive records earlier decisions.
