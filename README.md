# Rolnopol ATF

Playwright and TypeScript tests for the Rolnopol learning application: API,
desktop UI and selected mobile browser profiles. Start with a healthcheck and
login test; the full suite also needs configured demo accounts.

## Quick Start

Requires Git, Node.js 22 (matching CI), npm and Docker Desktop with the Linux
engine running. First-time image and browser downloads may take several minutes.

### 1. Install the tests

```sh
git clone https://github.com/DominiKrzywon/rolnopol-ai-tests.git
cd rolnopol-ai-tests
npm ci
npx playwright install --with-deps chromium webkit
```

### 2. Start the application

Use the same pinned image as CI. Port 3000 must be free; stop any older local
Rolnopol process first. Run this command once:

```sh
docker run -d --name rolnopol-local -p 127.0.0.1:3000:3000 -e NODE_ENV=test jaktestowac/rolnopol:1.126.0@sha256:e496a86a035e5c68d081cdec92f1518e197c2ab62853abbfdf1128d46c42747e
```

For an existing container, use `docker start rolnopol-local`. Open
[healthcheck](http://localhost:3000/api/v1/healthcheck): expect `healthy` and
version `1.126.0`. The app is at [localhost:3000](http://localhost:3000).

### 3. Configure the address

Copy `.env.example` to `.env` in your editor. Keep
`BASE_URL=http://localhost:3000`. Account fields may stay empty for the two
checks below: the login test creates its own user. `.env` is Git-ignored.

If overriding the address in a terminal, use the syntax for your shell:

| Shell       | Command                                   |
| ----------- | ----------------------------------------- |
| Windows CMD | `set BASE_URL=http://localhost:3000`      |
| PowerShell  | `$env:BASE_URL = 'http://localhost:3000'` |
| Bash        | `export BASE_URL=http://localhost:3000`   |

### 4. Run the first checks

Run from the test repository:

```sh
npm run coverage:run -- --project=health-check
npm run coverage:run -- --project=no-auth-tests --grep "should display correct user data after login"
```

Expect one passing healthcheck, then two passing tests (login and its healthcheck
dependency). Open `coverage-report/index.html` for the latest scenario report.
Each execution replaces the latest results.

## Everyday commands

| Task                   | Command                                              |
| ---------------------- | ---------------------------------------------------- |
| Pixel 5 navigation     | `npm run coverage:run -- --project=mobile-pixel-5`   |
| iPhone 13 navigation   | `npm run coverage:run -- --project=mobile-iPhone-13` |
| Quality checks         | `npm run check:ci`                                   |
| Offline unit tests     | `npm run test:unit`                                  |
| Validate scenario IDs  | `npm run coverage:validate`                          |
| Open Playwright report | `npm run test:report`                                |

For the full suite, fill the `DEMO_USER_*` and `EMPTY_USER_*` values from
`.env.example` with accounts matching your application instance, then run
`npm run coverage:run`. Use an instance intended for testing: tests create and
modify data. Mobile profiles emulate browsers, not physical phones.

CI is [manually triggered](.github/workflows/playwright-e2e-tests.yml). It uses
its own application container and account settings; local `.env` is not uploaded.

## Scenario Coverage Report

[Scenarios and planned gaps](TEST_PLAN.md#4-scenario-catalog-and-coverage-contract)
are maintained only in TEST_PLAN. The report shows collected tests and execution
evidence; collection does not establish a pass. See [reporting](docs/REPORTING.md)
for archives, freshness, filters and the optional application-code coverage pilot.

## Documentation

- [Test plan](TEST_PLAN.md): scope, scenario IDs and mobile selection.
- [Coding standards](CODING_STANDARDS.md): test structure and conventions.
- [Decisions](DECISION_LOG.md): agreed project choices.
- [Reporting](docs/REPORTING.md): commands, outputs and history.

## Agent Skills

[Skill catalog](docs/AGENT_SKILLS.md) and
[shared context](.agents/skills/CONTEXT.md) describe the learning workflow.
Personal notes are local and are not required to run this repository.
