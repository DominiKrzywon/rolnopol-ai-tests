# Coding Standards

## Code Comments

### General Principles

- **Remove obvious comments**: Don't state what the code clearly shows
- **Keep meaningful documentation**: Add JSDoc for architectural intent, context, or non-obvious design decisions
- **Focus on "why", not "what"**: Explain reasoning, not mechanics

### Guidelines

**✅ DO:**

- Add JSDoc for classes/modules explaining architectural purpose
- Document complex business logic or non-obvious behavior
- Explain workarounds or technical constraints

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
- No AAA comment markers needed - the structure should be self-evident
- Keep each section focused and clear

### Example

```typescript
test("should register new user", async ({ page }) => {
  const registerPage = new RegisterPage(page);
  const email = "user@example.com";
  const password = "password123";

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
export class PageName {
  readonly page: Page;
  readonly elementName: Locator;

  constructor(page: Page) {
    this.page = page;
    this.elementName = page.getByTestId("element-id");
  }

  async goto() {
    await this.page.goto("/page-path");
  }

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
test("should register new user", async ({ page }) => {
  // Arrange
  const registerPage = new RegisterPage(page);

  // Act
  await registerPage.register("user@example.com", "password123");

  // Assert
  await expect(registerPage.successMessage).toBeVisible();
});
```
