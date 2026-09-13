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

## Shared learning and test workflow

Read [the shared context](../.agents/skills/CONTEXT.md) for learning mode,
repository sources, environment handling and validation scope.
Use the [skill catalog](../README.md#agent-skills) to choose a procedure.
All skill packages live in .agents/skills; maintain workflows there instead
of duplicating them in agent or prompt files.

Use [playwright-test-automation](../.agents/skills/playwright-test-automation/SKILL.md)
for test design and implementation. Review-only requests use the small or
advanced review skill according to dependency scope.
