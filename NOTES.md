# Project notes

The active learning queue, durable decisions and a short completion record.
[TEST_PLAN](TEST_PLAN.md) owns strategy, scope and scenario IDs;
[CODING_STANDARDS](CODING_STANDARDS.md) owns conventions. Git history preserves
older notes. This file is not embedded in the coverage report.

## Current learning queue: October 18, 2026

The profile response waiter is now registered before the update action;
Marketplace cancellation uses the correct tag. The visual spec is now at
`tests/visual/homepage.visual.spec.ts` with a corrected import. Do not repeat
these implementation tasks. The current batch passed its project-level check; verification is recorded below.

### 1. Finish visual housekeeping

The active Windows baseline is
`tests/visual/homepage.visual.spec.ts-snapshots/homepage-visual-test-win32.png`.
An older, different PNG remains inside the nested
`homepage.visual.spec.ts-snapshots/homepage.visual.spec.ts-snapshots/` directory.
The learner can remove that obsolete nested directory after checking its contents.
Keep the active baseline. Linux CI baseline verification remains separate.

### 2. Delete a fresh user's own account: TC-PROFILE-003

Implemented in source and reviewed on October 18, 2026: modal visibility,
disabled/enabled confirmation, DELETE response status and JSON, success
notification, home URL/content, and rejected login (401, `error`, false success).
The learner reports the final version working; no command or counts were supplied.
The mentor's earlier focused run passed 2 tests (deletion and health dependency),
and `npm run check:ci` passed, before the final response/navigation/login assertions
were added. Final project-level and catalog checks remain pending.
The home URL currently hardcodes localhost; derive it from configured BASE_URL
before using this test against another environment.

- **Files:** add the case to `tests/auth/profile.isolated.spec.ts`; extend
  `src/pages/ProfilePage.ts` only for the required modal locators/actions.
  Reuse `freshUser` from `src/fixtures/auth.fixture.ts` and the existing
  `deleteAccountBtn`. Never use the demo account for deletion.
- **First small step:** open the deletion modal, assert that confirmation is
  disabled, fill `DELETE`, and assert that confirmation becomes enabled.
  Existing test IDs are `delete-confirmation-input` and `confirm-delete-btn`.
- **Complete target:** start a waiter before confirmation for
  `DELETE /api/v1/users/profile`, assert the agreed status and success response,
  then the user-visible result and home-page redirect. Confirm that login with
  the deleted user's credentials is rejected using the raw `loginUser` helper;
  a redirect alone does not prove account deletion. Inspect the actual response
  contract before selecting exact expected statuses/messages.
- **Discovery evidence:** local application source
  `../rolnopol/public/js/pages/profile.js`, `_setupDeleteAccountHandlers` and
  `_handleDeleteAccount`, requires `DELETE`, calls that endpoint and redirects
  to `/`. This is source inspection, not live validation of the deletion flow.
- **Verify:** run only the new case first, then quality and catalog checks.
  Keep the reserved ID; no duplicate catalog row is needed.

```bash
npx playwright test tests/auth/profile.isolated.spec.ts --project=isolated-user-tests --grep "@deletion" --workers=1 --retries=0
npm run check:ci
npm run coverage:validate
```

Use `@deletion` on the new test for this filter. After review, perform the
project-level completion check; report actual counts and dependency results.

### 3. Later catalog choices

After the profile exercise, choose one small P2 case: required-field
validation on Contact (`TC-PUBLIC-002`), Alerts page controls
(`TC-PUBLIC-001`) or chart-type switching without JavaScript errors
(`TC-CHART-001`). These are choices, not an agreed implementation order.

Proposed next exercise: Contact required-field validation. Source inspection on
October 18 found `novalidate` and custom FormComponent validators, so do not copy
the registration test's native-validation expectations. The form is gated by
`contactFormEnabled`; confirm it is enabled in the target environment first.
Use `tests/auth/contact.noauth.spec.ts`, a `ContactPage` and the base Page Object
fixture. First assert the name/email errors after empty submission; then add
subject/message errors and confirm that the user stays on the contact page.
Do not submit a valid message as part of this negative scenario.

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

Finish the small queue above before broader authorization, account-deletion or
public-page exercises. `TC-AUTH-012` already covers anonymous fields access in
`tests/api/farm.api.spec.ts`. Do not reopen completed Financial, registration or
Marketplace purchase work or automatically migrate every HTTP endpoint.

## Reporting reference

Use [README](README.md#scenario-coverage-report) for commands and artifacts,
[TEST_PLAN](TEST_PLAN.md#metric-definitions) for metric definitions, and
`npm run coverage:validate` for scenario mappings and README index consistency.
Scenario coverage measures catalog cases, not application code or assertion
quality. Collection does not run tests; saved results need matching source
provenance for current confirmation. Copy report outputs before comparing runs.
