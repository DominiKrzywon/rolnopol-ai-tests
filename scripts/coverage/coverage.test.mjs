import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

import { renderMarkdown, renderReport } from './html.mjs';
import {
  buildReport,
  parseCatalog,
  updateReadme,
  validateInventory,
} from './model.mjs';
import InventoryReporter from './reporter.mjs';
import { sourceSnapshot } from './snapshot.mjs';

const snapshot = { fingerprint: 'current', revision: 'revision' };
const row = (id = 'TC-AUTH-001', scope = 'included') => ({
  id,
  area: 'Auth',
  scenario: 'Reject invalid login',
  layer: 'API',
  priority: 'P0',
  scope,
  notes: '-',
});
const catalog = [row(), row('TC-AUTH-002')];
const unit = (project = 'api-tests') => ({
  caseIds: ['TC-AUTH-001'],
  infrastructure: false,
  file: 'api/auth.api.spec.ts',
  line: 1,
  column: 1,
  title: 'reject login',
  project,
  tags: [],
});
const inventory = (tests = [unit()]) => ({ schemaVersion: 1, snapshot, tests });
const result = (status = 'passed', overrides = {}) => ({
  projectName: 'api-tests',
  annotations: [{ type: 'case-id', description: 'TC-AUTH-001' }],
  expectedStatus: 'passed',
  status: status === 'passed' ? 'expected' : 'unexpected',
  results: [
    { status, retry: 0, duration: 20, startTime: '2026-09-13T00:00:00Z' },
  ],
  ...overrides,
});
const run = (tests = [result()], fingerprint = 'current') => ({
  config: {
    metadata: { coverage: { fingerprint } },
    workers: 1,
    projects: [{ name: 'api-tests', retries: 0, repeatEach: 1 }],
  },
  errors: [],
  stats: {
    startTime: '2026-09-13T00:00:00Z',
    duration: 30,
    expected: 1,
    unexpected: 0,
    flaky: 0,
    skipped: 0,
  },
  suites: [
    {
      suites: [
        {
          specs: [
            { title: 'reject login', file: 'api/auth.api.spec.ts', tests },
          ],
        },
      ],
    },
  ],
});
const markdown = (rows) =>
  `<!-- coverage-catalog:start -->\n| ID | Area | Scenario | Layer | Priority | Scope | Notes |\n| --- | --- | --- | --- | --- | --- | --- |\n${rows}\n<!-- coverage-catalog:end -->`;
const catalogRow =
  '| TC-AUTH-001 | Auth | Reject a \\| b | API | P0 | included | - |';

test('catalog parses escaped pipes and rejects duplicate IDs and malformed columns', () => {
  assert.equal(parseCatalog(markdown(catalogRow))[0].scenario, 'Reject a | b');
  assert.throws(
    () => parseCatalog(markdown(catalogRow + '\n' + catalogRow)),
    /duplicate/,
  );
  assert.throws(
    () => parseCatalog(markdown(catalogRow).replace('| Area |', '| Module |')),
    /columns/,
  );
  assert.throws(
    () => parseCatalog(markdown(catalogRow.replace('included', 'excluded'))),
    /reason/,
  );
  assert.throws(
    () =>
      parseCatalog(markdown(catalogRow) + '<!-- coverage-catalog:start -->'),
    /exactly one/,
  );
});

test('README generation preserves authored content and is idempotent', () => {
  const original =
    '# Hello\n<!-- coverage-index:start -->old<!-- coverage-index:end -->\nFooter';
  const updated = updateReadme(original, catalog);
  assert.match(updated, /^# Hello/);
  assert.match(updated, /Footer$/);
  assert.equal(updateReadme(updated, catalog), updated);
  assert.match(updated, /TC-AUTH-002/);
});

test('inventory validates IDs without treating planned gaps as errors', () => {
  validateInventory(catalog, inventory());
  assert.throws(
    () => validateInventory(catalog, inventory([{ ...unit(), caseIds: [] }])),
    /exactly one/,
  );
  assert.throws(
    () =>
      validateInventory(
        catalog,
        inventory([{ ...unit(), caseIds: ['TC-NEW-001'] }]),
      ),
    /Unknown/,
  );
  assert.throws(
    () =>
      validateInventory(catalog, inventory([unit(), { ...unit(), line: 2 }])),
    /Duplicate/,
  );
  assert.throws(
    () => validateInventory(catalog, inventory([unit(), unit()])),
    /Duplicate/,
  );
  assert.throws(
    () => validateInventory([row('TC-AUTH-001', 'excluded')], inventory()),
    /Excluded/,
  );
  validateInventory(catalog, inventory([unit(), unit('firefox')]));
});

test('setup is outside the scenario denominator and cannot disguise scenario tests', () => {
  const setup = {
    ...unit('setup-demo-user'),
    infrastructure: true,
    caseIds: [],
  };
  const report = buildReport(
    catalog,
    inventory([unit(), setup]),
    run(),
    snapshot,
  );
  assert.equal(report.metrics.denominator, 2);
  assert.equal(report.metrics.implemented, 1);
  assert.throws(
    () =>
      validateInventory(
        catalog,
        inventory([{ ...unit(), infrastructure: true }]),
      ),
    /infrastructure/,
  );
});

test('no run means implemented and planned, with no execution confirmation', () => {
  const report = buildReport(catalog, inventory(), null, snapshot);
  assert.deepEqual(
    report.cases.map((item) => item.status),
    ['not-run', 'planned'],
  );
  assert.equal(report.metrics.confirmed, null);
  assert.equal(report.metrics.automationPercent, 50);
});

test('only matching evidence confirms execution; stale inventory is rejected', () => {
  assert.equal(
    buildReport(catalog, inventory(), run(), snapshot).metrics.confirmed,
    1,
  );
  assert.equal(
    buildReport(catalog, inventory(), run([], 'old'), snapshot).freshness,
    'stale',
  );
  assert.equal(
    buildReport(catalog, inventory(), run([], 'old'), snapshot).metrics
      .confirmed,
    null,
  );
  assert.equal(
    buildReport(catalog, inventory(), run([], null), snapshot).freshness,
    'unknown',
  );
  assert.throws(
    () => buildReport(catalog, inventory(), run(), { fingerprint: 'changed' }),
    /stale/,
  );
});

test('passing only one required project gives partial confirmation', () => {
  const report = buildReport(
    catalog,
    inventory([unit(), unit('firefox')]),
    run(),
    snapshot,
  );
  assert.equal(report.cases[0].status, 'partial');
  assert.equal(report.metrics.confirmed, 0);
});

test('missing repetition results cannot confirm the scenario', () => {
  const input = run();
  input.config.projects[0].repeatEach = 5;
  const report = buildReport(catalog, inventory(), input, snapshot);
  assert.equal(report.cases[0].status, 'partial');
  assert.equal(report.metrics.confirmed, 0);
});

test('source provenance handles Windows paths with a trailing separator', () => {
  const root = path.resolve('scripts/coverage/../..');
  const first = sourceSnapshot(root);
  const second = sourceSnapshot(root + path.sep);
  assert.equal(first.fingerprint, second.fingerprint);
  assert.equal(first.revision, second.revision);
});

test('untrusted numeric metadata is escaped in HTML', () => {
  const report = buildReport(catalog, inventory(), run(), snapshot);
  const payload = '<img src=x onerror=alert(1)>';
  report.cases[0].observations[0].attempts[0].retry = payload;
  report.cases[0].observations[0].attempts[0].durationMs = payload;
  report.cases[0].tests[0].line = payload;
  const html = renderReport(report, '# README', '# PLAN');
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img src=x/);
});

test('repetitions and retries do not inflate scenario counts', () => {
  const repeated = buildReport(
    catalog,
    inventory(),
    run([result(), result()]),
    snapshot,
  );
  assert.equal(repeated.metrics.confirmed, 1);
  assert.equal(repeated.cases[0].observations.length, 2);
  const mixed = buildReport(
    catalog,
    inventory(),
    run([result(), result('failed')]),
    snapshot,
  );
  assert.equal(mixed.cases[0].status, 'flaky');
  const retry = result('passed', {
    status: 'flaky',
    results: [
      { status: 'failed', retry: 0, duration: 20 },
      { status: 'passed', retry: 1, duration: 10 },
    ],
  });
  assert.equal(
    buildReport(catalog, inventory(), run([retry]), snapshot).metrics.confirmed,
    0,
  );
});

test('explicit skips, blocked tests, interruptions and expected failures stay distinct', () => {
  const skip = result('skipped', { status: 'skipped' });
  assert.equal(
    buildReport(catalog, inventory(), run([skip]), snapshot).cases[0].status,
    'not-run',
  );
  skip.annotations.push({ type: 'skip' });
  assert.equal(
    buildReport(catalog, inventory(), run([skip]), snapshot).cases[0].status,
    'skipped',
  );
  assert.equal(
    buildReport(catalog, inventory(), run([result('interrupted')]), snapshot)
      .cases[0].status,
    'interrupted',
  );
  const expectedFailure = result('failed', {
    expectedStatus: 'failed',
    status: 'expected',
  });
  assert.equal(
    buildReport(catalog, inventory(), run([expectedFailure]), snapshot).cases[0]
      .status,
    'expected-failure',
  );
  assert.equal(
    buildReport(catalog, inventory(), run([expectedFailure]), snapshot).metrics
      .confirmed,
    0,
  );
});

test('global run errors prevent confirmation even if a case passed', () => {
  const input = run();
  input.errors.push({ message: 'global teardown failed' });
  const report = buildReport(catalog, inventory(), input, snapshot);
  assert.equal(report.metrics.confirmed, null);
  assert.equal(report.run.globalErrorCount, 1);
});

test('unknown result mappings and invalid JSON structures fail loudly', () => {
  assert.throws(
    () => buildReport(catalog, inventory(), {}, snapshot),
    /Invalid Playwright/,
  );
  assert.throws(
    () =>
      buildReport(
        catalog,
        inventory(),
        run([result('passed', { annotations: [] })]),
        snapshot,
      ),
    /case-id/,
  );
  assert.throws(
    () =>
      buildReport(
        catalog,
        inventory(),
        run([result('passed', { projectName: 'unknown' })]),
        snapshot,
      ),
    /no inventory/,
  );
});

test('zero denominator is no percentage, not a fabricated 100%', () => {
  const report = buildReport([], inventory([]), null, snapshot);
  assert.equal(report.metrics.automationPercent, null);
  assert.equal(report.metrics.confirmedPercent, null);
});

test('Markdown renders content without accepting scripts, HTML or dangerous URLs', () => {
  const html = renderMarkdown(
    '# Guide\n\n<script>alert(1)</script>\n\n[bad](javascript:evil) [good](https://example.com)\n\n```ts\nconst x = "<img>";\n```\n\n| A | B |\n| --- | --- |\n| one | two |',
    'readme',
  );
  assert.match(html, /id="readme-guide"/);
  assert.match(html, /<table>/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>|href="javascript:/);
  assert.match(html, /href="https:\/\/example.com"/);
  assert.match(html, /const x =/);
});

test('HTML embeds both documents, escapes scenario text and excludes raw logs', () => {
  const input = run();
  input.suites[0].suites[0].specs[0].tests[0].results[0].stdout = [
    { text: 'secret-log' },
  ];
  const report = buildReport(
    [{ ...row(), scenario: '</td><script>bad()</script>' }],
    inventory(),
    input,
    snapshot,
  );
  const html = renderReport(report, '# Readme content', '# Plan content');
  assert.match(html, /Readme content/);
  assert.match(html, /Plan content/);
  assert.match(html, /&lt;script&gt;bad/);
  assert.doesNotMatch(html, /secret-log|<script>bad/);
  assert.doesNotMatch(JSON.stringify(report), /secret-log/);
});

test('reporter captures declaration annotations and refuses failed collection', () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'rolnopol-inventory-'));
  const previous = process.env.COVERAGE_INVENTORY;
  try {
    process.env.COVERAGE_INVENTORY = path.join(directory, 'inventory.json');
    const reporter = new InventoryReporter();
    const declaration = {
      annotations: [{ type: 'case-id', description: 'TC-AUTH-001' }],
      titlePath: () => ['', 'api-tests', 'auth.spec.ts', 'login'],
      location: {
        file: path.join(directory, 'auth.spec.ts'),
        line: 2,
        column: 3,
      },
      parent: { project: () => ({ name: 'api-tests' }) },
      tags: ['@api'],
    };
    reporter.onBegin({ rootDir: directory }, { allTests: () => [declaration] });
    reporter.onEnd({ status: 'passed' });
    assert.equal(
      JSON.parse(readFileSync(process.env.COVERAGE_INVENTORY)).tests[0]
        .caseIds[0],
      'TC-AUTH-001',
    );
    reporter.onError();
    assert.throws(
      () => reporter.onEnd({ status: 'failed' }),
      /collection failed/,
    );
  } finally {
    if (previous === undefined) delete process.env.COVERAGE_INVENTORY;
    else process.env.COVERAGE_INVENTORY = previous;
    assert.equal(
      path.dirname(path.resolve(directory)),
      path.resolve(os.tmpdir()),
    );
    assert.ok(path.basename(directory).startsWith('rolnopol-inventory-'));
    rmSync(directory, { recursive: true });
  }
});

test('environment validates credentials on access, not during collection imports', () => {
  const source = readFileSync(
    new URL('../../src/config/env.config.ts', import.meta.url),
    'utf8',
  ).replace("import 'dotenv/config';", '');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    process: { env: { BASE_URL: 'http://localhost:3000' } },
  });
  assert.equal(exports.BASE_API_URL, 'http://localhost:3000/api/v1');
  assert.throws(() => exports.ENV.DEMO_USER_PASSWORD, /DEMO_USER_PASSWORD/);
});
