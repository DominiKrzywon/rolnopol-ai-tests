# Project notes

Historical evidence and completed exercises. These dated records do not establish
current test results. The single active backlog is [TEST_PLAN.md](TEST_PLAN.md).
This document is not embedded in the coverage HTML.

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

The next small exercises are detailed in [the active plan](TEST_PLAN.md#10-upcoming-exercises-with-the-mentor). Unresolved validation and
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
