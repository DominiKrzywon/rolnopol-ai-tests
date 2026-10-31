# Project decisions

## Purpose

This is my personal repository for practice and learning against Rolnopol running on localhost.

## Manual CI

GitHub Actions runs are deliberately triggered manually, rather than on every push or pull request.

## Report history

Use teach and grilling to learn the existing archive/history, then start with a terminal table from history.json: date, scope, test-source identifier, outcome counts, duration, and global errors. Compare runs across application changes, flag scope/test-source differences, and omit application version from the summary.

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
