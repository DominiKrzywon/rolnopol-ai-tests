# Rolnopol test plan

## 1. Purpose

This repository is for learning TypeScript, Playwright, API testing and test
design. Build a small, trustworthy framework that is easy to debug.

Rolnopol is an educational application. Choose the exercise scope deliberately;
its educational purpose does not establish whether an observed deviation is an
intended behavior. Resolve expected behavior before encoding assertions.

## 2. Scope and exclusions

Cover selected authentication, profile, farm, financial and marketplace workflows,
with auxiliary public pages, alerts, contact, charts and map checks where justified.
[TEST_CASES](TEST_CASES.md) is the only scenario registry, including planned gaps,
case-level scope and exclusions. It does not represent the whole application.

Test anonymous redirects for Profile, Marketplace and Finance; omit Staff & Fields
redirects. Do not infer an API rejection rule from a UI restriction alone.
[DECISION_LOG](DECISION_LOG.md#scope-decisions) records agreed scope decisions.

Keep shutdown, database restoration, feature flag changes and other destructive
administrative operations outside ordinary CI. Exercise them only in an agreed
disposable environment.

Mobile scope is browser emulation on Pixel 5 and iPhone 13, using selected shared
test definitions and focused mobile cases. Physical devices, broad device matrices
and visual baselines are outside the current scope. See the
[mobile selection](TEST_CASES.md#mobile-selection).

## 3. Risk and priorities

- **P0:** baseline health, login/session, route protection and a basic farm flow.
- **P1:** core account, farm, financial and marketplace contracts and business rules.
- **P2:** auxiliary features, accessibility and responsiveness.

Priority determines execution focus; risk describes the impact of a regression.
Case-level priorities, risk estimates and their definitions live in
[TEST_CASES](TEST_CASES.md#catalog-contract).

## 4. Test approach

- Verify business rules and HTTP contracts mainly through API tests.
- Use UI tests for user-visible behavior and a few E2E journeys across domains.
- Prepare data through API when setup UI is not under test.
- Use isolated users for state changes and independent data for each execution.
- Verify rejection reasons and relevant absence of side effects in negative tests.
- Use controlled network failures for frontend error handling; these do not prove
  backend failure behavior.
- Preserve one definition and ID when reusing a case across device projects.

[Coding standards](CODING_STANDARDS.md) own implementation conventions and
[project decisions](DECISION_LOG.md) explain agreed constraints.

## 5. Execution and evidence

Run against the pinned localhost application described in [README](README.md).
CI is manually triggered. Choose focused runs for local changes; extend scope
when shared fixtures, configuration or dependent behavior warrant it.

Collection proves that a scenario is mapped to a test. Passing execution supports
only the recorded scope and matching source; it does not assess assertion quality
or establish release readiness. The generated report owns current execution
results. See [reporting](docs/REPORTING.md) for commands, metric definitions,
freshness and archives.

## 6. Completion criteria

- Assertions detect the intended behavior or rejection and relevant state changes.
- Data is independent of execution order; cleanup affects only owned resources.
- The case passes in a focused run and its required project scope is verified.
- Name, tags, test layer and static case ID match the scenario catalog.
- Catalog validation and `npm run check:ci` pass.
- Record execution context and limitations; a test file alone does not prove a pass.

[NOTES](NOTES.md) owns learning exercises and progress, outside the coverage report.
