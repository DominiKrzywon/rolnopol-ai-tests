# Rolnopol ATF

Automated testing framework for the Rolnopol agricultural management system using Playwright and TypeScript.

## Quick Start

### Prerequisites

- Node.js v18.0.0 or higher (recommended: v20 or v22)
- npm v9+

### Installation

```bash
git clone https://github.com/aiprzemo/rolnopol-atf.git
cd rolnopol-atf
npm install
npm run install:drivers
```

## Running Tests

```bash
# Run all tests
npm test

# Run with visible browser
npm run test:headed

# Debug mode
npm run test:debug

# View test report
npm run test:report
```

### Filter by Tags

```bash
# Run specific test categories
npx playwright test --grep @smoke
npx playwright test --grep @auth

# Exclude test types
npx playwright test --grep-invert @negative
```

## Code Quality & Static Analysis

This project uses **ESLint**, **Prettier**, and **TypeScript** for static code analysis and formatting.

### Quality Scripts

```bash
# Local development - auto-fix formatting and linting
npm run check         # format + lint + type-check

# CI mode - non-mutating checks
npm run check:ci      # format:check + lint + type-check

# Individual checks
npm run format        # Apply Prettier formatting
npm run format:check  # Verify Prettier compliance (non-TS files)
npm run lint          # Run ESLint checks
npm run tsc:check     # TypeScript type checking
```

### Configuration

- **ESLint**: Flat config at [eslint.config.mjs](eslint.config.mjs)
  - TypeScript-aware linting with `typescript-eslint`
  - Playwright test rules via `eslint-plugin-playwright`
  - Import sorting via `eslint-plugin-simple-import-sort`

- **Prettier**: Configuration at [.prettierrc.json](.prettierrc.json)
  - Single quotes, 2-space indentation
  - Auto line wrapping

- **TypeScript**: Configuration at [tsconfig.json](tsconfig.json)
  - ESNext modules for modern import/export syntax
  - Strict mode enabled
  - No emit (type-checking only)

- **Husky & lint-staged**: Pre-commit hooks
  - Auto-fix and lint staged files before commit
  - Full TypeScript type-check pre-commit

### VS Code Integration

Recommended extensions (see [.vscode/extensions.json](.vscode/extensions.json)):
- **Playwright Test for VSCode** - Test execution and debugging
- **Prettier** - Code formatting
- **ESLint** - Real-time linting feedback
- **Code Spell Checker** - Spelling validation

VS Code settings (see [.vscode/settings.json](.vscode/settings.json)):
- Format on save (Prettier)
- import sorting handled by ESLint (not VS Code's organize imports)

### CI/CD Pipeline

Quality checks run in GitHub Actions **before** any tests:
1. **format:check** - Verify Prettier compliance (non-TS files)
2. **lint** - ESLint validation
3. **tsc:check** - TypeScript type checking
4. **test** - Playwright tests (runs only after quality passes)

See [.github/workflows/playwright-e2e-tests.yml](.github/workflows/playwright-e2e-tests.yml) for full pipeline.

## Documentation

- **[TEST_PLAN.md](./TEST_PLAN.md)** - Test strategy, cases, and tags
- **[CODING_STANDARDS.md](./CODING_STANDARDS.md)** - Code style and patterns

## Links

- [Repository](https://github.com/aiprzemo/rolnopol-atf)
- [Issues](https://github.com/aiprzemo/rolnopol-atf/issues)
- [Playwright Docs](https://playwright.dev/)
