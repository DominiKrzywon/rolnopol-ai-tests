import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  analyzeHistory,
  analyzeRuns,
  archiveRun,
  renderHistory,
} from './history.mjs';
import { buildReport } from './model.mjs';

function sample(id, statuses = ['passed'], overrides = () => {}) {
  const snapshot = { fingerprint: 'source', revision: 'revision' };
  const provenance = {
    ...snapshot,
    runId: id,
    command: ['playwright', 'test', '--project=public'],
    applicationVersion: 'app-v1',
  };
  const raw = {
    config: {
      metadata: { coverage: provenance, environment: 'http://localhost:3000' },
      version: '1.58.0',
      workers: 1,
      projects: [
        {
          name: 'public',
          retries: Math.max(0, statuses.length - 1),
          repeatEach: 1,
        },
      ],
    },
    errors: [],
    stats: { startTime: '2026-10-21T10:00:00.000Z', duration: 30 },
    suites: [
      {
        specs: [
          {
            title: 'submit form',
            tests: [
              {
                projectName: 'public',
                annotations: [
                  { type: 'case-id', description: 'TC-PUBLIC-002' },
                ],
                expectedStatus: 'passed',
                status:
                  statuses.length > 1
                    ? 'flaky'
                    : statuses[0] === 'failed'
                      ? 'unexpected'
                      : 'expected',
                results: statuses.map((status, retry) => ({
                  status,
                  retry,
                  duration: 10,
                  startTime: '2026-10-21T10:00:00.000Z',
                })),
              },
            ],
          },
        ],
      },
    ],
  };
  overrides(raw);
  const catalog = [
    {
      id: 'TC-PUBLIC-002',
      scenario: 'submit form',
      area: 'Public',
      priority: 'P2',
      risk: 'low',
      layer: 'UI',
      scope: 'included',
      notes: '-',
    },
  ];
  const inventory = {
    schemaVersion: 1,
    snapshot,
    tests: [
      {
        caseIds: ['TC-PUBLIC-002'],
        infrastructure: false,
        file: 'contact.spec.ts',
        line: 1,
        column: 1,
        title: 'submit form',
        project: 'public',
        tags: [],
      },
    ],
  };
  const report = buildReport(catalog, inventory, raw, snapshot);
  report.documents = { readme: '', testPlan: '', codingStandards: '' };
  return { raw, report };
}

function temporary(t) {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'rolnopol-history-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function save(directory, input) {
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    path.join(directory, 'coverage.json'),
    JSON.stringify(input.report),
  );
  writeFileSync(
    path.join(directory, 'playwright-results.json'),
    JSON.stringify(input.raw),
  );
  writeFileSync(
    path.join(directory, 'index.html'),
    '<html><body>Saved report</body></html>',
  );
}

test('one success is one observation, and repeated passes are not a stability verdict', () => {
  const one = analyzeRuns([sample('one', ['passed'], () => {})]);
  assert.equal(one[0].cases[0].runCount, 1);
  assert.match(renderHistory(one), /One run cannot establish stability/);
  const many = analyzeRuns([
    sample('one', ['passed'], () => {}),
    sample('two', ['passed'], () => {}),
  ]);
  assert.deepEqual(many[0].cases[0].counts, { passed: 2 });
  assert.equal(many[0].cases[0].classification, 'only passes observed');
});

test('mixed outcomes, consistent failures and retries remain distinct', () => {
  const mixed = analyzeRuns([
    sample('one', ['passed'], () => {}),
    sample('two', ['failed'], () => {}),
  ]);
  assert.equal(mixed[0].cases[0].classification, 'mixed outcomes');
  const failed = analyzeRuns([
    sample('one', ['failed'], () => {}),
    sample('two', ['failed'], () => {}),
  ]);
  assert.equal(failed[0].cases[0].classification, 'only failures observed');
  const retry = analyzeRuns([sample('one', ['failed', 'passed'], () => {})]);
  assert.equal(retry[0].cases[0].classification, 'retry variation');
  assert.deepEqual(
    retry[0].cases[0].observations[0].attempts.map((item) => item.status),
    ['failed', 'passed'],
  );
});

test('skips and absent executions do not become failures or passes', () => {
  const skipped = sample('skip', ['skipped'], (raw) => {
    raw.suites[0].specs[0].tests[0].annotations.push({ type: 'skip' });
  });
  const absent = sample('absent', [], () => {});
  absent.report.cases[0].execution.runs = [];
  const group = analyzeRuns([
    sample('pass', ['passed'], () => {}),
    skipped,
    absent,
  ])[0];
  assert.deepEqual(group.cases[0].counts, { passed: 1, skipped: 1 });
  assert.equal(group.cases[0].missingRuns, 1);
  assert.equal(group.cases[0].classification, 'other outcomes present');
});

test('changed conditions are separated; renamed scenarios retain their case ID', () => {
  for (const change of [
    (raw) => {
      raw.config.metadata.environment = 'http://other';
    },
    (raw) => {
      raw.config.metadata.coverage.applicationVersion = 'app-v2';
    },
    (raw) => {
      raw.config.metadata.coverage.fingerprint = 'other-source';
    },
    (raw) => {
      raw.config.metadata.coverage.command.push('--grep=other');
    },
    (raw) => {
      raw.config.workers = 2;
    },
  ]) {
    assert.equal(
      analyzeRuns([
        sample('one', ['passed'], () => {}),
        sample('two', ['passed'], change),
      ]).length,
      2,
    );
  }
  const renamed = sample('two', ['passed'], (raw) => {
    raw.suites[0].specs[0].title = 'renamed';
  });
  assert.equal(
    analyzeRuns([sample('one', ['passed'], () => {}), renamed])[0].cases.length,
    1,
  );
});

test('same case in different projects stays separate and chronological order uses time', () => {
  const later = sample('later', ['passed'], (raw) => {
    raw.stats.startTime = '2026-10-22T10:00:00Z';
  });
  const earlier = sample('earlier', ['passed'], () => {});
  later.report.cases[0].execution.runs.push({
    ...later.report.cases[0].execution.runs[0],
    project: 'other',
  });
  const group = analyzeRuns([later, earlier])[0];
  assert.equal(group.runs[0].runId, 'earlier');
  assert.equal(group.cases.length, 2);
  assert.equal(
    group.cases.find((item) => item.project === 'other').missingRuns,
    1,
  );
  assert.throws(() => analyzeRuns([earlier, earlier]), /Duplicate run ID/);
});

test('archives preserve failed runs, refuse overwrite and mark missing HTML', async (t) => {
  const directory = temporary(t);
  const source = path.join(directory, 'source');
  const history = path.join(directory, 'history');
  const input = sample('failed-run', ['failed'], () => {});
  save(source, input);
  const options = {
    source,
    history,
    playwright: path.join(directory, 'missing-html'),
  };
  const archived = await archiveRun(options);
  assert.equal(archived.playwrightHtml, 'missing');
  assert.equal(archived.coverageHtml, true);
  assert.deepEqual(
    JSON.parse(
      readFileSync(
        path.join(archived.destination, 'coverage-report/coverage.json'),
      ),
    ),
    input.report,
  );
  await assert.rejects(archiveRun(options), /EEXIST/);
  writeFileSync(path.join(source, 'coverage.json'), '{}');
  const result = analyzeHistory(history);
  assert.equal(result.runs, 1);
  assert.match(readFileSync(result.report, 'utf8'), /only failures observed/);
});

test('missing inputs, mixed executions and nested destinations are rejected', async (t) => {
  const directory = temporary(t);
  const source = path.join(directory, 'source');
  const history = path.join(directory, 'history');
  const options = {
    source,
    history,
    playwright: path.join(directory, 'playwright'),
  };
  await assert.rejects(archiveRun(options), /ENOENT/);
  const input = sample('one', ['passed'], () => {});
  save(source, input);
  await assert.rejects(
    archiveRun({ ...options, history: path.join(source, 'history') }),
    /outside/,
  );
  input.raw = structuredClone(input.raw);
  input.raw.config.metadata.coverage.runId = 'different';
  save(source, input);
  await assert.rejects(archiveRun(options), /different executions/);
  assert.equal(existsSync(history), false);
});

test('incomplete archives fail visibly and empty history is explicit', (t) => {
  const history = temporary(t);
  assert.equal(analyzeHistory(history).runs, 0);
  assert.match(
    readFileSync(path.join(history, 'history.md'), 'utf8'),
    /No archived runs/,
  );
  mkdirSync(path.join(history, 'interrupted-copy'));
  assert.throws(() => analyzeHistory(history), /Incomplete archive/);
});
