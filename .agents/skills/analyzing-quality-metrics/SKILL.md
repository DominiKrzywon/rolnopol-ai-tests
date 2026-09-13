---
name: analyzing-quality-metrics
description: 'Interpret Rolnopol Playwright run results, skipped tests, duration, repeated-run stability, and scenario coverage for learning decisions. Use when asked whether tests are reliable or improving; distinguish measured outcomes from missing history and code coverage.'
---

# Metrics that support learning

Apply the [shared context](../CONTEXT.md).
Select a metric for a decision: what to fix, what to repeat, or which exercise to choose.

## Workflow

1. Inspect `coverage-report/coverage.json`, the associated Playwright JSON,
   reporter configuration, and dated evidence in TEST_PLAN.md when available.
   The [README](../../../README.md#scenario-coverage-report) documents generation.
   `coverage:report` renders saved inputs without AI or application access.
   Do not assume artifacts are fresh or that CI/history is available.
2. Use the [definitions and result format](references/metrics.md).
   Record the date, code revision if known, application version if known,
   environment, project, command, workers, retries, and repetition scope.
3. Separate collected, executed, skipped, and unexecuted tests blocked by setup
   failure. `--list` collection is not a test result.
4. For stability, compare the same code under controlled environment conditions.
   A single passing run does not establish a flake rate. Do not add retries
   merely to obtain a number.
5. Without history, report one observation and a data collection plan.
   A chart becomes useful when comparable data points exist.
6. Finish with an interpretation and one next action. Explain possible effects
   of data, sessions, or rate limiting; do not present hypotheses as causes.

7. Use included catalog rows as the explicit denominator. Distinguish implemented
   IDs from execution-confirmed IDs. Check freshness, global errors, projects,
   attempts, and catalog Notes. Setup and excluded cases are outside the denominator.
   Unknown or stale provenance means no current confirmation.

## Boundaries

Test count is not application coverage. Scenario coverage is not code coverage.
The repository does not automatically supply production incident data or a
mutation score; do not require them for a simple report. Without data, do not
set release-readiness thresholds or an arbitrary quality percentage.

## Done

Every number has a denominator or unit, a time window, and a source. Skips
and data gaps are explicit. The report helps choose the next step in the existing plan.
