# SDET portfolio projects: applicability to rolnopol-tests

Analysis date: October 21, 2026.

This document evaluates the projects listed in the [SDET portfolio](https://portfolio.sdet.pl/projects/) against **Rolnopol ATF**, the Playwright and TypeScript framework in this repository. It replaces the earlier analysis written for `ait2api1-api-ai`.

## Recommendation

The most useful next experiment is **historical stability analysis using the reports Rolnopol already produces**. Start with `flaky-analytics`; consider `qa-report-lake` later as a history viewer. Keep the existing scenario coverage report and its evidence rules. Accessibility is a useful subsequent UI exercise. CDAT is an architectural reference for a small comparison, not a reason to rewrite the framework.

These are optional proposals, not an implementation commitment or a replacement for the active learning queue in [NOTES.md](NOTES.md). Test strategy and scenario IDs remain in [TEST_PLAN.md](TEST_PLAN.md). The agreed Marketplace purchase cleanup remains outside this proposal.

## Evidence and limitations

Local inspection covered the Playwright configuration, workflow, package scripts, reporting implementation, selected Page Objects/actions, the visual test, test plan and learning notes. No application tests or third-party tools were executed for this analysis.

External research from this conversation covered README files for `flaky-analytics`, `qa-report-lake`, `sdet-wcag-toolkit`, `sdet-perf-toolkit`, `jarvis-brain-core` and `skills-radar`. The analyzer and report CLI were also inspected. Other portfolio entries received a catalog-level assessment. Direct loading of the portfolio page failed, so its project list came from the search index; private/coming-soon labels may lag behind publication. A request for `darco81/sdet-brain` README returned 404, leaving its implementation unverified.

Author-reported test counts, token savings and production outcomes were not reproduced. Before integrating a tool, pin a specific revision and verify its behavior with Rolnopol data.

## What Rolnopol already provides

| Verified local evidence                                                                                                                                                                                          | Implication                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [playwright.config.ts](playwright.config.ts) defines API, public UI, isolated-user, demo-user, smoke, visual, health and setup projects.                                                                         | Segment history by project and selected scope. Do not compare an API-only run with the entire suite as though the denominator were identical.                       |
| The configuration enables HTML and JSON reporters, with JSON written to `coverage-report/playwright-results.json`.                                                                                               | A usable input format already exists. Adding a JSON reporter is unnecessary.                                                                                        |
| [coverage CLI](scripts/coverage/cli.mjs) defaults to one worker, zero retries and no snapshot updates for `coverage:run`. It generates the report after test failure and preserves the Playwright exit code.     | Keep this baseline. Do not enable retries simply to feed a flaky dashboard.                                                                                         |
| [Source snapshot](scripts/coverage/snapshot.mjs), [report model](scripts/coverage/model.mjs) and [README](README.md) distinguish current confirmation from stale or unknown evidence.                            | A generic pass-rate chart must not replace Rolnopol's source-aware scenario confirmation.                                                                           |
| [Workflow](.github/workflows/playwright-e2e-tests.yml) supports `workflow_dispatch`, runs quality checks and `coverage:run`, and uploads HTML/coverage artifacts after success or failure with 30-day retention. | CI is manually triggered and already archives evidence. This is not the disabled workflow described in the old analysis. Remote run availability was not inspected. |
| [Page Objects](src/pages/), [actions](src/actions/), [API helpers](src/api/) and [fixtures](src/fixtures/) separate several responsibilities already.                                                            | Compare architecture against existing patterns before adding abstractions.                                                                                          |
| [Homepage visual test](tests/visual/homepage.visual.spec.ts) uses Playwright screenshot assertions and masks dynamic regions.                                                                                    | Visual regression already exists; a second pixel-diff engine is not the first need.                                                                                 |
| [Application coverage pilot](scripts/coverage/app-code.mjs) and its [README explanation](README.md#application-code-coverage) measure a defined backend scope.                                                   | Keep application code coverage separate from scenario coverage and flaky statistics.                                                                                |

### The actual reporting gap

The current reporting commands replace local outputs on subsequent runs. CI retains individual artifacts, but the inspected reporting path does not build a cross-run stability dashboard. A history experiment should start by preserving and grouping those existing outputs.

The source snapshot records a fingerprint and Git revision. `coverage:run` adds a run ID and application version, defaulting the latter to `unknown`; the configuration records the target origin. The report model also records worker and retry settings. Reuse this evidence instead of inventing a parallel identity scheme.

The workflow starts `jaktestowac/rolnopol:latest`, while the test destination comes from `BASE_URL`. Before comparing runs, verify that the configured destination matches the intended instance and record the actual application version or image identity. The inspected workflow does not explicitly set `COVERAGE_APP_VERSION`. An unchanged test SHA alone does not prove an unchanged application or environment.

## Portfolio-wide assessment

Project names and broad purposes come from the [portfolio catalog](https://portfolio.sdet.pl/projects/). Priorities below are recommendations for Rolnopol, not claims made by the author.

| Project                      | Role                       | Rolnopol use                                                                    | Priority                            |
| ---------------------------- | -------------------------- | ------------------------------------------------------------------------------- | ----------------------------------- |
| flaky-analytics              | Test instability analysis  | Analyze existing JSON reports across comparable runs                            | High                                |
| qa-report-lake               | Historical QA reports      | Optional history viewer alongside the scenario report                           | Medium, after the history pilot     |
| CDAT Pattern                 | UI test architecture       | Compare one feature with existing Page Objects/actions                          | Medium, educational                 |
| sdet-wcag-toolkit            | Accessibility audits       | Public-page accessibility exercise, then deliberate authenticated scope         | Medium                              |
| sdet-perf-toolkit            | Frontend performance       | Borrow measurement discipline; assess framework compatibility first             | Low                                 |
| jarvis-brain-core            | Code graph through MCP     | Map scenario IDs to tests, helpers and application routes                       | Low until navigation becomes costly |
| sdet-brain                   | Markdown retrieval         | Possible documentation search; implementation unverified                        | Low                                 |
| skills-radar                 | Skill discovery            | Consider only after measuring a discovery problem in the existing skill catalog | Low                                 |
| ai-seo-pack                  | Website metadata           | Relevant to a future published portfolio, not current test execution            | Low                                 |
| Umysł Pięciu                 | Multi-model decisions      | Optional learning experiment; no CI dependency                                  | Low                                 |
| sdet-canvas                  | UI prototyping             | Possible report-layout mockups                                                  | Low                                 |
| Portfolio v1                 | Archived website           | No concrete framework benefit identified                                        | Skip                                |
| Jarvis                       | Private QA platform        | Process inspiration; no public implementation assumed                           | Skip as a dependency                |
| AI QA Manual / Jarvis Manual | Announced QA workflow      | Reassess when public scope is confirmed                                         | Watch                               |
| Jarvis Figma                 | Announced design pipeline  | Relevant only with a real design-comparison task                                | Watch                               |
| Tempo Timesheet              | Worklog auditing           | Outside this framework's learning scope                                         | Skip                                |
| jarvis-brain                 | Private knowledge platform | Evaluate the public core instead if needed                                      | Skip as a dependency                |

## 1. flaky-analytics: first candidate

The [README](https://github.com/darco81/flaky-analytics/blob/main/README.md) describes Playwright JSON, JUnit and CTRF ingestion, deterministic Node scripts, a Markdown report and a quarantine proposal. The calculation path works without an AI session.

Inspection of [analyze.mjs](https://github.com/darco81/flaky-analytics/blob/main/scripts/analyze.mjs) confirmed detection of failed attempts followed by success, and differing final outcomes for the same SHA. Test identity uses suite, name and project; files are sorted by name when selecting the analysis window. Error categorization uses message patterns, so it supplies investigation hints rather than proven causes.

### How it fits Rolnopol

Start with repeated runs of one selected project, such as `api-tests`, using the existing one-worker, zero-retry baseline. With zero retries there will be no retry-flip evidence, but repeated comparable runs can still expose changes in final outcome. Preserve application identity, source fingerprint, project selection and environment alongside the reports.

The [test plan](TEST_PLAN.md#known-environment-constraints) already documents session invalidation and per-IP rate limiting. A `401` or `429` should trigger investigation of those conditions, not an automatic claim that a locator is unstable. A consistently failing test is also different from intermittent behavior.

Before importing real history, use a small controlled dataset containing stable successes, a same-source outcome change and a consistent failure. Check how the importer preserves Rolnopol's metadata and maps its `case-id` annotations. Do not assume that scenario IDs are the tool's native identity.

**Acceptance:** reported events match the source attempts; scope/environment groups remain separate; insufficient history is visible; no test is automatically skipped. Keep quarantine suggestions informational and make any learning decision in NOTES.

## 2. qa-report-lake: optional history layer

The [README](https://github.com/darco81/qa-report-lake/blob/main/README.md) describes a CTRF-based HTML report with an optional AI advisory section. The [CLI](https://github.com/darco81/qa-report-lake/blob/main/src/cli.ts) accepts `*.ctrf.json`, validates the files, sorts them by filename and bases its exit status on current failures. A Playwright-to-CTRF reporter or adapter is required; Rolnopol's raw JSON is not directly that format.

Use it only if the history pilot reveals a need that the current report does not cover. Keep the scenario report as the authority for catalog implementation, confirmation and freshness. Use the additional viewer for trends over explicitly comparable runs.

A conversion experiment must preserve project identity, individual attempts, timing, source/run identifiers and the selected scope, or document which fields require a sidecar. Use chronologically sortable filenames. Treat adapter validation as a prerequisite, not a naming-only conversion.

**Acceptance:** source and converted result counts agree; a failed run remains failed; report publication still happens on failure; historical passes are never displayed as current scenario confirmation. The first pilot should work with AI disabled. An optional explanation must not modify statuses or coverage metrics.

## 3. CDAT: a focused architecture comparison

The author's [four-layer explanation](https://portfolio.sdet.pl/en/from-the-field/cdat-pattern-part-2/) separates components, data, actions and tests. Rolnopol already has Page Objects, factories, fixtures, API helpers and actions. For example, [LoginPage](src/pages/LoginPage.ts) combines locators and a login operation, while [marketplace.actions.ts](src/actions/marketplace.actions.ts) delegates to a Page Object.

There is no demonstrated need to migrate the full framework. A useful future exercise would compare one small, new UI feature against both structures: where would a locator change occur, where does setup belong, and does an additional action layer reduce repetition or merely forward arguments?

Follow [CODING_STANDARDS.md](CODING_STANDARDS.md) and the existing fixture pattern. Keep business assertions visible in tests. Preserve the agreed locator declaration style and Marketplace purchase cleanup. Choose an exercise only when it fits the active learning queue; no refactor is authorized by this document.

## 4. Accessibility: a practical UI extension

The [WCAG toolkit README](https://github.com/darco81/sdet-wcag-toolkit/blob/main/README.md) describes static checks, Playwright/axe-based dynamic checks and optional AI source analysis. Its documented public v0.4.1 parses `audit.auth` without wiring authentication into the browser; authenticated-route support is listed in the Pro tier.

Begin with a public Rolnopol page such as login or contact. Define a small scope: accessible field names, visible focus and keyboard submission. Check findings against the rendered page and the application source before deciding whether to add a regression scenario.

Profile, financial and marketplace pages need deliberate session setup. Do not assume an API fixture token or the toolkit's auth configuration automatically supplies an authenticated browser. A focused test using Rolnopol's own authenticated fixtures may be simpler for that scope; toolkit adoption should earn its extra maintenance.

Automated findings are evidence for selected checks, not proof of complete accessibility. Review broader changes against the exclusions and educational scope in TEST_PLAN.

## 5. Visual regression: strengthen the existing path first

Rolnopol already uses `toHaveScreenshot` with dynamic-content masking. [NOTES](NOTES.md) records Windows baseline housekeeping and a separate Linux CI verification task. The current workflow runs on Ubuntu, so baseline compatibility should be established before adding external baseline storage or AI interpretation.

The screenshot features in [qa-report-lake](https://github.com/darco81/qa-report-lake/blob/main/README.md) may become useful when reviewing many historical diffs. For the current small scope, prioritize an understood baseline, comparable browser/OS settings and human review of meaningful changes. A model's suggestion to update a baseline should never itself establish that the new rendering is correct.

## 6. Knowledge and performance tools: defer until justified

- **jarvis-brain-core:** its [README](https://github.com/darco81/jarvis-brain-core/blob/main/README.md) describes an educational graph/search/MCP implementation, not automatic indexing of this framework. A first local map could link `case-id → spec → fixture/Page Object/API helper → application route`. Existing scenario IDs and the adjacent application checkout make this plausible, but a Markdown/JSON map may be sufficient. Measure whether it answers useful questions better than the current catalog. The demo server lacks authentication and is intended for local use.
- **skills-radar:** the [README](https://github.com/darco81/skills-radar/blob/main/README.md) includes Docker deployment for Windows/Linux and a separate native MLX path. Rolnopol already has a skill catalog and shared context. Add discovery infrastructure only if choosing relevant skills is a measured problem; do not assume a client's settings transfer unchanged to another client.
- **sdet-brain:** verify its current public repository, runtime and license before any trial. Keep the existing split between strategy, standards and learning notes instead of creating competing sources of truth.
- **sdet-perf-toolkit:** its [README](https://github.com/darco81/sdet-perf-toolkit/blob/main/README.md) targets Nuxt/Vue frontend audits and excludes backend/load testing. UI timing measurements could be useful later, but framework-specific source analysis needs a compatibility check. It does not establish API throughput or backend load capacity.

## Suggested small pilot

This is a candidate experiment; NOTES remains the active queue. The learner implements any agreed code/configuration changes.

1. **Inspect one existing run.** Use a saved `coverage:run` artifact to identify the raw JSON, source fingerprint, revision, application version, environment, project selection and run ID. Explain any unknown values. This can begin without running the application or changing code.
2. **Preserve comparable history.** Agree on one project and environment. Retain each run outside the overwritten output directory and outside committed generated reports. Reuse CI run ID/attempt for artifact identity and preserve source/application metadata. Decide retention explicitly.
3. **Validate flaky analysis.** Check a controlled dataset first, then a small real series. For example, 20 comparable runs can be an initial collection target, not statistical proof or a tool requirement. Inspect individual failure evidence before accepting classifications.
4. **Decide whether another viewer helps.** Trial CTRF conversion and qa-report-lake only if history navigation remains inconvenient. Keep catalog confirmation and application code coverage in their current reports.
5. **Choose one UI extension later.** A small accessibility scenario or baseline verification is more immediately relevant than a multi-agent platform or a general-purpose RAG service.

Do not run repeated state-changing suites against an unspecified target just to fill a dashboard. Follow the existing disposable-data, session and rate-limit rules. New tests or configuration changes require the user's implementation request, as defined in [AGENTS.md](AGENTS.md).

## Verification and reuse decisions

This revision is a documentation change. Verification is limited to Markdown formatting, local link targets and removal of the earlier repository-specific assumptions. It does not establish that any third-party integration runs successfully on Windows or that current Rolnopol tests pass.

When a tool is selected, distinguish learning from its design, running it separately and copying its source. The inspected README files declare AGPL-3.0-only for flaky-analytics and qa-report-lake, and AGPL-3.0-or-later for the WCAG/performance toolkits. Check the selected revision's LICENSE against the intended use before copying implementation. No external code was incorporated here.

**Decision:** preserve Rolnopol's existing reporting contract, add comparable history only when the learning queue allows it, and evaluate flaky-analytics first. Treat qa-report-lake as optional, accessibility as a useful UI extension, and CDAT as a focused design exercise.
