# Project decisions

## Purpose

This is my personal repository for practice and learning against Rolnopol running on localhost.

## Manual CI

GitHub Actions runs are deliberately triggered manually, rather than on every push or pull request.

## Application runtime

Run Rolnopol through npm locally and in GitHub Actions on localhost:3000.
Use commit fb7fd89f4473f841cfa1560ce4979fe11b81bf6e (1.126.0) with
`patches/rolnopol-cookie.patch` in both environments. Docker is no longer the
application runtime for this learning repository. README owns setup commands.

## Scope decisions

- Test anonymous redirects for Profile, Marketplace, and Finance; omit Staff & Fields redirects. Authenticated farm tests and API authorization remain in scope.
- Omit API rejection of zero field area: the UI restriction does not establish an API contract. Do not require `POST /fields` with `area: 0` to fail; `TC-FARM-011` stays unused.
- Use isolated users for state changes because a new login invalidates the previous session. Account for separate browser/request cookies and per-IP rate limits when choosing setup and parallelism.

## Report history

Keep a compact JSON, terminal table, and HTML history with date, scope, test source, outcome counts, duration, and global errors. Flag scope/source changes and non-passing cases; omit application version.

npm run coverage:run
npm run coverage:archive
npm run coverage:summary

## API schemas

Continue the runtime response-schema work started in `src/schemas`, alongside assertions of business behavior.

## Fast unit tests

Extend the existing reporting-tool unit tests with small, fast tests of schemas and useful test helpers, without browsers or a running application.

## Mobile views

Practise Playwright device emulation on a few selected mobile profiles; this does not replace testing on physical devices.

## Performance

Later, explore selected endpoints with k6 and retain only the key results and execution context in concise JSON.

## Test size and proportionate assertions

Agreed November 12, 2026:

- Keep each test within one editor page in the learner's normal layout. Prefer
  a smaller behavioral scope; do not compress formatting or hide excess assertions
  in helpers just to meet the limit.
- Judge coverage across the selected suite. Shared mobile login tests already
  exercise Submit and verify successful login. Do not add trial clicks, viewport
  checks or more button geometry to TC-MOBILE-003; simplify its layout scope.
- Do not require exact CSS properties for mobile menu collapse. A deliberate
  state-and-navigation check is acceptable here: aria-expanded=false verifies
  declared state, not visual collapse. Accept and describe that limit instead of
  repeatedly expanding the test. CSS checks also couple it to implementation.
- The learner implements test changes and aligns TEST_PLAN scenario descriptions.
  These decisions do not mean existing code has already been simplified.
  NOTES owns the learning steps and progress.
