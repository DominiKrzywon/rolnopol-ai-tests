# Definitions and result records

## Run outcomes

Report raw counts: passed, failed, flaky (if distinguished by the reporter),
skipped, and unexecuted because of interruption/setup failure. Preserve the
reporter's category names and explain unusual expected failures (`test.fail`).

For a run without retries: pass rate = passed / (passed + failed).
Show skipped and unexecuted tests separately. A zero denominator means no data.
Do not apply this formula without explanation to reports with retries or expected failures.

With retries, distinguish the first attempt, final outcome, and passes after retry.
If the report cannot reconstruct first attempts, state that limitation.

## Repeatability

A unit is project + file + full test title + test variant. Repetitions of the
same unit are attempts, not new unique tests.

A mixed-outcome test has both pass and fail results in comparable attempts on
the same revision. Mixed-outcome share = number of units with mixed outcomes /
number of units with at least two executed attempts in the stated window.
Do not call this failure probability or the cause of instability.

Label retry outcomes as reporter observations; do not automatically equate them
with the metric above. Changes to the application version, accounts, or rate
limiters restrict comparability.

## Duration and coverage

Distinguish suite duration from summed test durations under parallel execution.
Compare the same scope, workers, environment, and reporting method. For one attempt,
report one observation; for a series, report attempt count, median, and range
when the data is available.

Calculate scenario coverage only against an explicit requirements list.
Separate planned, implemented, and execution-confirmed scenarios.
Code coverage requires application instrumentation; types and spec counts do not replace it.

For this repository, included TEST_PLAN catalog rows form the denominator.
`coverage-report/coverage.json` separates implementation from confirmation;
README is a generated index and is also rendered as documentation in the report.
Confirmation requires passing evidence for every collected project on the same
source fingerprint, with no global run errors. Stale or absent provenance means
no current confirmation. Retries and repetitions are attempts; expected failures,
skips, interruptions and partial runs are not confirmed scenarios. Catalog Notes
may identify weak assertions even when the associated test passes.

## Short report format

- Data: date, command, revision, application, environment, and scope.
- Result: raw counts, metric with denominator, skipped/unexecuted tests.
- Interpretation: what the data supports and what remains a hypothesis.
- Next step: one check or exercise.

Calculation example using fictional data: 4 passed, 1 failed, and 2 skipped
without retries give 4/5 successful executed cases and 2 skips. Do not record
this as a Rolnopol result or as 80% application coverage.
