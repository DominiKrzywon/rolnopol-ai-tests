# Coding Standards

## API clients and explicit response assertions

Selected on October 12, 2026. This is the target convention for incremental
refactoring; existing tests have not all been migrated. The pilot
`TC-MARKET-004` and follow-ups `005` and `007` are implemented in source
(inspection: October 15, 2026; no new application run). See
[REFACTOR.md](REFACTOR.md#api-client-learning-exercise-october-12-2026) for the design
and [NOTES.md](NOTES.md#current-learning-queue-october-18-2026) for the next exercises.

### Responsibilities

- Domain API modules (`src/api/<domain>.api.ts`) own endpoint URLs, HTTP
  methods, headers and payload mapping. Use exported functions; no class is needed.
- Raw endpoint functions return `Promise<APIResponse>` and make one request.
  Use a `Response` suffix for new functions, such as `getMyOffersResponse`
  and `cancelOfferResponse`. Existing Auth names remain valid.
- Raw endpoint functions do not parse JSON, assert success, log in, retry or
  clean up. Expected 400/401/403 responses reach the spec unchanged.
- Specs own scenario inputs, actor selection, action order, expected statuses
  and business expectations. They explicitly call shared response assertions.
- Page Objects own browser interactions and locators. Put HTTP requests in
  domain API modules rather than Page Objects.
- Fixtures own sessions and resource lifecycles, including teardown.

### Existing successful convenience helpers

Keep `httpClient.ts` and existing convenience helpers such as `getMyOffers`,
`deleteOneOffer` and `getAccountBalance` for successful setup, supporting
reads and cleanup. Their data-only return values do not expose exact statuses.
They accept successful 2xx responses and reject unsuccessful envelopes;
they cannot replace raw functions when the test verifies exact 200/201 or 4xx.
Do not change their return types to migrate one test or add another transport.

### Shared response assertions are explicit

- `expectApiSuccess<T>(response, expectedStatus)` in
  `src/assertions/api.assertions.ts` checks the exact required status,
  parses JSON once, verifies a non-null, non-array object and checks
  `success === true`. It returns `ApiEnvelope<T>`.
- Specs choose 200 or 201 explicitly and retain business assertions: resource
  identity, state transitions, messages, balances and unchanged state after rejection.
- The helper reports endpoint and status context without dumping response bodies.
- Use it only for successful JSON envelopes. Keep negative-response assertions
  explicit, and do not use it for 204 responses without a body.
- TypeScript annotations do not validate runtime JSON. The helper does not
  validate `T`, require `data` or check every envelope field such as `timestamp`.
  Specs verify the response data needed by their scenario.
- This is a narrow exception to assertions directly in specs. Raw API functions
  and Page Objects contain no assertions; the spec calls the helper explicitly.

Existing Auth setup helpers verify prerequisites. Keep these convenience
contracts separate from assertions about the operation under test.

### Payloads and migration boundary

Keep scenario values in specs: offer ID, transfer amount, changed field name,
invalid animal type and expected message. Map those inputs to the wire payload
in the domain API function. Keep random user generation in existing factories
and ownership in fixtures. Do not inject valid defaults into negative input.

Migrate one selected test at a time. Preserve its case ID, tags, session,
exact statuses, business assertions, fresh reads after the action and cleanup.
`TC-MARKET-004` has two GETs and one DELETE without payloads; payload mapping
comes in a later exercise. Verify the focused scenario before migrating more tests.

## Code Comments

### General Principles

- **Remove obvious comments**: Don't state what the code clearly shows
- **Keep meaningful documentation**: Add JSDoc for architectural intent, context, or non-obvious design decisions
- **Explain intent**: Explain reasoning and the purpose of important test actions
- **Keep test comments short**: Use brief English comments at important scenario transitions so the reader can see what should happen next

### Guidelines

**✅ DO:**

- Add JSDoc for classes/modules explaining architectural purpose
- Document complex business logic or non-obvious behavior
- Explain workarounds or technical constraints
- Label important test actions and follow-up checks, such as `// Attempt cancellation as another user` or `// Verify the owner's offer is still active`
- Use comments selectively in tests with multiple actions, actors, or state checks; existing descriptive `test.step()` names can serve the same purpose

**❌ DON'T:**

- Add comments that repeat what code says (e.g., `// Create user` above `createUser()`)
- Use redundant section markers in simple code
- Over-document self-explanatory code

### Examples

**Bad:**

```typescript
// Navigate to the page using the PAGE_URL constant
async goto() {
  await this.page.goto(this.PAGE_URL);
}
```

**Good:**

```typescript
/**
 * Base class for Page Object pattern implementation.
 * Provides navigation and shared functionality; child classes define specific PAGE_URL.
 */
export abstract class BasePage {
  async goto() {
    await this.page.goto(this.PAGE_URL);
  }
}
```

## Test Structure: Arrange-Act-Assert (AAA)

All tests should follow the **Arrange-Act-Assert (AAA)** pattern:

- **Arrange**: Set up test data, create page objects, prepare the environment
- **Act**: Perform the action being tested
- **Assert**: Verify the expected outcome

### Guidelines

- Structure code to clearly show the three phases through blank lines and logical grouping
- AAA comment markers are optional; use short scenario comments where they clarify important actions or checks
- Keep each section focused and clear
- Declare expected error and success messages in Arrange, near the top of the test, before actions. Use `expectedErrorMessage` and `expectedSuccessMessage`, or a more specific name when the test checks multiple messages
- Pass those variables to assertions instead of writing message text inline. Keep expectations local to the scenario, including when assertions are inside `test.step()`
- This message convention does not require extracting status codes, counts, URLs, enum values, or assertion diagnostic text into variables

### Scenario comments and expected messages

Use `TC-MARKET-005` in `tests/api/marketplace.api.spec.ts` as the reference:

```typescript
const expectedErrorMessage = 'Not authorized to cancel this offer';
const { offerId } = activeFieldOffer;

// Attempt cancellation as another user
const response = await otherUserApi.delete(
  `${BASE_API_URL}/marketplace/offers/${offerId}`,
);
const body = await response.json();

expect(response.status()).toBe(403);
expect(body.error).toEqual(expectedErrorMessage);

// Verify the owner's offer is still active
const ownerResponse = await request.get(
  `${BASE_API_URL}/marketplace/my-offers`,
);
```

### Example

```typescript
test('should register new user', async ({ page }) => {
  const registerPage = new RegisterPage(page);
  const email = 'user@example.com';
  const password = 'password123';

  await registerPage.register(email, password);

  await expect(registerPage.successMessage).toBeVisible();
});
```

## Page Object Pattern

### Essential Rules

**1. No assertions in Page Objects**

- Page Objects should NEVER contain `expect()` statements
- All verifications belong in test files (`*.spec.ts`) only

**2. Page Objects provide interface, tests verify behavior**

- Page Objects: Define locators and action methods
- Test files: Use Page Objects and add assertions

### Basic Structure

```typescript
export class PageName extends BasePage {
  readonly PAGE_URL = '/page-path';
  readonly elementName = this.page.getByTestId('element-id');

  async performAction(param: string) {
    await this.elementName.fill(param);
  }
}
```

### Quick Reference

**✅ DO:**

- Use `readonly` for properties
- Prefer `getByTestId()` for locators (for stability and resilience to UI changes); use `getByRole()` or similar strategies when testing accessibility or user-facing roles
- Create methods for user actions
- Keep methods focused on single actions

**❌ DON'T:**

- Include `expect()` in Page Objects
- Add test logic or validations in Page Objects

### Example

**Page Object (no `expect()`):**

```typescript
async register(email: string, password: string) {
  await this.emailInput.fill(email);
  await this.passwordInput.fill(password);
  await this.registerSubmitBtn.click();
}
```

**Test File (all `expect()` here):**

```typescript
test('should register new user', async ({ page }) => {
  // Arrange
  const registerPage = new RegisterPage(page);

  // Act
  await registerPage.register('user@example.com', 'password123');

  // Assert
  await expect(registerPage.successMessage).toBeVisible();
});
```

## Test file conventions and stability

### Names and files

- `*.api.spec.ts` — HTTP contracts without a browser.
- `*.isolated.spec.ts` — UI with a user created for the test.
- `*.journey.spec.ts` — a few scenarios spanning multiple domains.
- Test names describe behavior and outcome, for example
  `should reject transfer above available balance`.

### Arrange–Act–Assert

- Prefer preparing data through API.
- Perform one main user action through UI.
- UI assertions check messages/behavior; API assertions check business state.
- Page Objects contain no `expect()` and do not force the happy path
  when a method is also used in negative tests.

### Stability

- Prefer `getByRole`, `getByLabel`, and `getByTestId`.
- Do not use `waitForTimeout()` in actual tests.
- Do not swallow errors with an empty `.catch(() => {})` without documenting
  why cleanup can safely fail.
- Do not share accounts modified by parallel tests.
- Retries remain `0` until the cause of flakiness is known.
- For each flakiness fix, reproduce the issue first, then run the test
  at least five times.

## Scenario IDs and catalog maintenance

[TEST_PLAN.md](TEST_PLAN.md#5-scenario-catalog-and-coverage-contract) owns the
manual catalog. Every scenario test declares exactly one annotation:

```ts
annotation: { type: 'case-id', description: 'TC-AUTH-001' }
```

Keep the ID when renaming a test or moving its file. Never reuse retired IDs.
Each parameterized input has an explicit ID in its data. Tags describe categories;
they do not replace IDs. Multiple projects may execute the same test definition.
The setup project is explicitly marked as infrastructure and has no scenario ID.

After changing the catalog, run `coverage:readme` and `coverage:validate`.
Unknown IDs, duplicate definitions, missing annotations, excluded collected cases,
and an outdated generated index fail validation. Planned rows without tests are
valid gaps. The catalog parser requires its exact headers and markers.
