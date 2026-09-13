# From exploration to a test

Apply the [test workflow](../../playwright-test-automation/SKILL.md).

1. Record one observed behavior and establish the expected outcome.
2. Select the UI or API layer and an existing fixture.
3. Replace temporary snapshot references with Page Object locators.
4. Prepare owned data and assert state after the action.
5. Match the filename to testMatch and tags to TEST_PLAN.md.
6. Run the spec and its project according to the shared context.

Generated code is a draft. Do not copy fixed delays, private sessions, incidental
application data, or assertions inside Page Objects.
For registration, check the response and final URL; a message may belong to a page
the browser has already left. Verify this against the current implementation.

Successful CLI interactions are not Playwright Test results.
