# Project notes

Personal learning decisions, the active exercise queue and a short completion
record. [TEST_PLAN.md](TEST_PLAN.md) owns test strategy, scope and scenario IDs;
[CODING_STANDARDS.md](CODING_STANDARDS.md) owns coding conventions. This file is
not embedded in the coverage report. Git history preserves older notes.

## Current learning queue: October 18, 2026

The previous batch is closed. The following sequence is proposed after inspecting
commits `249cec1`, `e0266f0`, `0fc5a63`, current source and the learner's local
Markdown edits. The learner implements each code change and requests review
before moving on. No application tests were run for this planning session.

### 1. Make the Auth diagnostic agree with its assertion

- **Evidence:** `TC-AUTH-008` in `tests/api/auth.api.spec.ts` says 401 in its
  assertion message while asserting 403. A failure would explain the wrong
  expectation. This is a local diagnostic issue, not proof of a wrong API status.
- **Small target:** correct the message to describe the existing 403 assertion.
  Keep the expected status unchanged unless separate contract evidence warrants
  changing it. Do not migrate the entire Auth file.
- **Verify:** run the focused command below. If it fails, inspect the actual
  response before choosing a new expectation.

```bash
npx playwright test tests/api/auth.api.spec.ts --project=api-tests --grep "should reject invalid token via GET request" --workers=1 --retries=0
```

### 2. Add owner cancellation through UI: TC-MARKET-006

- **Why next:** the catalog reserves this UI case, but there is no test for it.
  `TC-MARKET-004` already demonstrates the owner-only API state transition.
- **Files and patterns:** create `tests/auth/marketplace-cancellation.isolated.spec.ts`;
  import `test` and `expect` from `src/fixtures/data.fixture.ts` and request
  `activeFieldOffer` plus `freshUser` to prepare the offer and browser session.
  Use `src/pages/MarketplacePage.ts` for UI interactions and
  `getMyOffers` from `src/api/marketplace.api.ts` for fresh state reads.
  A separate file avoids the purchase file's unconditional account top-up.
- **Small target:** verify the exact offer is active, open My Offers and cancel
  that offer through UI. Scope the button to its card using the prepared field
  identity; do not select the last card. Inspect the actual confirmation flow,
  DELETE status and user-visible result before encoding their expectations.
  Start response waiting before the cancellation action. Assert the visible
  result and a fresh owner's read containing the same ID with `cancelled` status.
- **Boundary:** no buyer, purchase, balance setup or public listing assertion.
  Reuse the existing fixture cleanup; preserve the agreed purchase cleanup and
  `TC-MARKET-003`. Extend the Page Object only with necessary locators/actions.
- **Verify:** the first command checks collection; the second runs the new file.
  Review the focused result before running the isolated-user project once to
  close this exercise. Keep the existing case ID and record actual counts.

```bash
npx playwright test tests/auth/marketplace-cancellation.isolated.spec.ts --project=isolated-user-tests --list
npx playwright test tests/auth/marketplace-cancellation.isolated.spec.ts --project=isolated-user-tests --workers=1 --retries=0
```

### 3. Persist a changed display name: TC-PROFILE-002

- **Why after cancellation:** practice the same API-setup/UI-action/read-back
  structure in another domain, without Marketplace resource dependencies.
- **Files and patterns:** create `tests/auth/profile.isolated.spec.ts`, import
  `test` and `expect` from `src/fixtures/auth.fixture.ts`, and use `freshUser`.
  `src/pages/ProfilePage.ts` already exposes `displayNameInput`,
  `saveChangesBtn`, `displayedName`, `welcomeMessage` and `emailValue`.
  Add one focused update action there if useful; assertions remain in the spec.
- **Small target:** inspect the actual save request and expected success behavior.
  Change only the display name, wait for the save response before clicking,
  verify the new name, reload and verify persistence plus unchanged email.
  Use a fresh account; do not edit the demo account or change its password.
  Browser and API cookies do not automatically synchronize after UI changes.
- **Verify:** collect the new file, run it alone, then the isolated-user project
  once after review. Do not change `TC-PROFILE-001` solely because of its
  historical redirect note; investigate that session issue only if reproduced.

```bash
npx playwright test tests/auth/profile.isolated.spec.ts --project=isolated-user-tests --list
npx playwright test tests/auth/profile.isolated.spec.ts --project=isolated-user-tests --workers=1 --retries=0
```

### 4. Inspect and repair the visual test layout: TC-VIS-001

- **Evidence:** the spec is inside
  `tests/visual/homepage.visual.spec.ts-snapshots/`, with Windows PNGs in nested
  snapshot directories. The assertion requests `homepage.png`; the existing
  filenames do not demonstrate a baseline for the current `visual-test` project.
- **Small target:** collect and run only the visual project to establish the
  current expected snapshot path and failure. Move the spec to
  `tests/visual/homepage.visual.spec.ts`, retain its ID and inspect the screenshot
  before accepting a baseline. Decide which platform should own the baseline;
  CI uses Linux and existing PNGs are Windows-specific. Do not blindly update
  snapshots or add a cross-platform configuration change to this first exercise.
- **Verify:** repeat collection after moving the file and run the visual project
  with one worker and zero retries. If addressing reproducible flakiness, verify
  at least five repetitions after the fix, as required by Coding Standards.

```bash
npx playwright test --project=visual-test --list
npx playwright test --project=visual-test --workers=1 --retries=0
```

For each code exercise, finish with `npm run check:ci`. Extend execution beyond
the focused file only for a concrete dependency or the project-level completion
check. For the two new catalog-backed tests, run `npm run coverage:readme` and
`npm run coverage:validate`; the existing IDs need no duplicate catalog rows.
Record commands, passed/failed/skipped counts and dependency results here.
Collection and source inspection do not establish passing application behavior.

## Agreed learning scope

The learner edits test, source and configuration files. The mentor explains,
reviews and may edit Markdown. Prefer small exercises and focused verification;
this personal learning repository does not need speculative framework hardening.

### Agreed decision: keep Marketplace purchase cleanup

Keep the current cleanup in `src/fixtures/marketplace.fixture.ts`, including
seller/buyer reads and nested `try/finally`. The learner deliberately rejected
moving the buyer read into an `else` after earlier conflicting advice.

Do not propose this refactor, error aggregation or fault-injection exercises in
routine reviews. Do not ask the learner to justify the choice again. Revisit
only when the learner explicitly selects the topic or a new reproducible
failure requires investigation. This decision supersedes older proposals in
REFACTOR and coding-debt notes; it does not claim all failure paths were tested.

### Agreed decision: leave TC-MARKET-003 as implemented

Keep the complete offer-creation test: manual animal setup, listing read, offer
assertions and nested cleanup. Do not restore `createdAnimal`, remove the listing
read or refactor the case in routine reviews. Revisit only at the learner's
explicit request or for a new reproducible failure. The learner reported the
manual setup working; the earlier fixture-version failure was not diagnosed.

### Agreed scope: owned-offer cancellation

Keep `TC-MARKET-004` focused on the owner: active offer, successful DELETE and a
fresh `my-offers` read showing the same offer cancelled. Buyer-visible listing
checks are outside this exercise. The application's public offer listing excludes
the current user's own offers; do not restore an own-offer presence assertion.

Other application scope exclusions, including anonymous Staff & Fields redirects
and zero field area through API, remain in [TEST_PLAN](TEST_PLAN.md#2-repository-evidence-and-environment).

## Completed exercises

The October 15?17 batch is closed:

- Financial raw GET/POST response helpers, explicit success assertions and the
  separate recipient fixture are implemented. Income/expense tests check both
  response data and fresh balances.
- Marketplace API cancellation/rejection helpers and the typed `getMyOffers`
  reader are implemented; unrelated unused listing reads were removed.
- Marketplace UI purchase and insufficient-funds tests use an exact test-owned
  field offer and verify ownership and financial state after the action.
- Registration checks the successful response and final navigation; the transient
  success-message assertion was removed. Required-field validation checks native
  validity, focus and URL.
- `TC-FIN-014` now uses a correctly ordered interval before the transaction.
- `readResponseData` was extracted from `send`; `getAccountBalance` reuses
  `getAccountResponse` and returns the balance as before. Commit: `0fc5a63`.

The learner reported passing `check:ci`, the Financial API file, all `api-tests`,
the Marketplace UI file and the registration UI file after the suggested commands.
No terminal summaries or counts were supplied. These are learner-reported results,
not mentor executions or a full-suite baseline. Dedicated malformed-response
checks were not demonstrated and are not an active follow-up task.

## Reference roadmap

The current queue above owns the proposed next steps. Broader authorization,
account-deletion and public-page exercises remain deferred until this small
batch is reviewed. `TC-AUTH-012` already tests anonymous fields access in
`tests/api/farm.api.spec.ts`; do not propose it as a missing case. Do not
automatically expand the HTTP refactor to every endpoint or reopen completed
Financial, registration and Marketplace purchase work.

## Reporting reference

See [README](README.md#scenario-coverage-report) for normal report use and
[TEST_PLAN](TEST_PLAN.md#metric-definitions) for metric definitions. Scenario
coverage measures catalog cases, not application code coverage or assertion
quality. The separate backend code-coverage pilot is documented in
[README](README.md#application-code-coverage).

```bash
# Validate scenario mappings and the generated README index
npm run coverage:validate

# Execute one project and generate scenario coverage with run provenance
npm run coverage:run -- --project=api-tests

# Rebuild from saved inputs without executing tests
npm run coverage:report

# Generate a catalog-only report without application execution
npm run coverage:collect
npm run coverage:report -- --no-results
```

Open `coverage-report/index.html`. `coverage:run` defaults to one worker and zero
retries and preserves a failed test exit code. Outputs are replaced on the next
run; copy them before comparing history. Plain Playwright results without
provenance do not establish current confirmation. Collection does not run tests.

Keep `coverage-report/` and `playwright-report/` beside each other for diagnostic
links. Raw Playwright output can contain application data; do not paste tokens,
cookies, credentials or unsanitized traces. Failure-export rules and JSON schema
are maintained in [coverage tooling](scripts/coverage/), rather than duplicated
here. Report-tool tests run with `npm run coverage:test`.
