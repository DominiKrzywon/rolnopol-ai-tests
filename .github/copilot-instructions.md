# Copilot Instructions for rolnopol-atf

## Important: Follow Coding Standards

**Always refer to and follow the guidelines in `CODING_STANDARDS.md`** for:

- Page Object Pattern implementation
- Test structure (Arrange-Act-Assert pattern)
- Locator strategies
- Code organization and best practices

## Conventional Commits

Use this format for all commit messages:

```
<type>: <description>
```

### Types

- **feat**: New feature or test
- **fix**: Bug fix
- **docs**: Documentation changes
- **test**: Adding or updating tests
- **chore**: Maintenance (dependencies, config, etc.)

### Examples

```
feat: add smoke test for homepage title
fix: correct login button selector
docs: update README with setup instructions
test: add user authentication tests
chore: update playwright to v1.40.0
```

### Rules

1. Use lowercase
2. No period at the end
3. Keep under 50 characters
4. Use imperative mood ("add" not "added")

## Test Framework

This project uses **Playwright Test** framework for end-to-end testing. Always review `playwright.config.ts` when creating tests to understand:

- Base URL configuration
- Timeout settings
- Browser configurations
- Test directory structure
- Reporter settings

## Test Creation Guidelines

When creating or updating tests, always use appropriate tags from the Test Plan and Tagging System (see TEST_PLAN.md):

### Examples

```typescript
test('should display title "Rolnopol" on homepage', {
  tag: ["@smoke", "@critical"],
});
test("user registration with valid data", {
  tag: ["@auth", "@registration", "@happy-path"],
});
test("prevent purchase with insufficient funds", {
  tag: ["@marketplace", "@validation", "@edge-case"],
});
```

Keep tags aligned with TEST_PLAN.md test cases for consistency.
