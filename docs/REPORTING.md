# Reports and execution evidence

Open `coverage-report/index.html` for scenario metrics, filters, and per-case
execution details. **Implemented** means a catalog scenario has a collected test;
**Confirmed** requires passing evidence matching the current source in every
required project. This measures scenarios, not application code coverage.

Use **History** to open the archived-run summary and **Latest scenario coverage**
to return. **Run details** keeps timing and setup results; full data is in JSON.
**Source metadata missing** means the saved run cannot confirm the current source,
even if its observed tests passed. Use `coverage:run` for new evidence.

Run these commands separately, including after test failures:

```bash
npm run coverage:run
npm run coverage:archive
npm run coverage:summary
```

| Output                                               | Purpose                                                         |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| `coverage-report/index.html`                         | Latest scenario report and embedded project documentation       |
| `playwright-report/index.html`                       | Playwright execution details and traces                         |
| `playwright-report-ci/learning-history/summary.html` | Archived runs, changes in scope/source, and case outcome labels |
| `playwright-report-ci/learning-history/summary.json` | Compact data for the same history                               |

In the history list, unsuccessful cases have `-fail`, `-flaky`, or `-skip`
labels. Fail counts unsuccessful tests; global errors concern the run itself.
Counts include repetitions; setup and excluded cases are omitted.

### How report updates work

`coverage:run` runs the full suite, or filters passed after `--`, with one worker
and zero retries by default. It replaces the latest results and generates the
report even after test failures. `npm test` and editor runs do not provide the
complete reporting/archiving workflow. Archive before the next execution.

`coverage:summary` refreshes JSON, HTML, and the terminal table from existing
archives; it does not run or archive tests. `coverage:history` exposes detailed
comparison groups. Archives are local, Git-ignored, and have no automatic expiry.

To refresh documentation without running tests, use `npm run coverage:collect`
then `npm run coverage:report`. Source or documentation edits can make saved
results stale; regeneration does not turn them into new passing evidence.
See [metric definitions](../TEST_PLAN.md#metric-definitions) for the reporting contract.

## Application Code Coverage

An optional backend pilot is separate from scenario coverage:

```bash
npm run coverage:app-code
```

Requires Node.js 22+ and an adjacent `../rolnopol` checkout with dependencies
(or `-- --app path/to/rolnopol`). Runs farm/financial API specs against a temporary
application copy and writes `coverage-report/app-code/index.html`,
`summary.json`, and `lcov.info`. Its scope is 14 backend files, excluding the
frontend; it also replaces the latest scenario results.

[Back to setup](../README.md)
