# Rolnopol ATF

Automated testing framework for the Rolnopol agricultural management system using Playwright and TypeScript.

## Quick Start

### Prerequisites

- Node.js v18+
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

## Documentation

- **[TEST_PLAN.md](./TEST_PLAN.md)** - Test strategy, cases, and tags
- **[CODING_STANDARDS.md](./CODING_STANDARDS.md)** - Code style and patterns

## Links

- [Repository](https://github.com/aiprzemo/rolnopol-atf)
- [Issues](https://github.com/aiprzemo/rolnopol-atf/issues)
- [Playwright Docs](https://playwright.dev/)
