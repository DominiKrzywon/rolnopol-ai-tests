import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { buildSummary, renderSummary, summarizeHistory } from './summary.mjs';

function group(runId, date, source, id, statuses, durationMs = 100) {
  return {
    conditions: {
      fingerprint: source,
      applicationVersion: 'private-app-label',
    },
    runs: [{ runId, startTime: date, durationMs, globalErrorCount: 1 }],
    cases: [
      {
        id,
        project: 'api-tests',
        observations: statuses.map((status) => ({
          runId,
          status,
          durationMs: 500,
        })),
      },
    ],
  };
}

test('chronological comparison retains failures and flags scope/source changes across groups', () => {
  const summary = buildSummary({
    schemaVersion: 1,
    groups: [
      group('later', '2026-10-22T10:00:00Z', 'new', 'TC-B', ['failed']),
      group('first', '2026-10-21T10:00:00Z', 'old', 'TC-A', ['passed']),
      group('same', '2026-10-23T10:00:00Z', 'new', 'TC-B', ['passed']),
    ],
  });
  assert.deepEqual(
    summary.runs.map((run) => run.runId),
    ['first', 'later', 'same'],
  );
  assert.equal(summary.runs[0].changes, null);
  assert.deepEqual(summary.runs[1].changes, { scope: true, source: true });
  assert.deepEqual(summary.runs[2].changes, { scope: false, source: false });
  assert.equal(summary.runs[1].counts.failed, 1);
  assert.ok(!JSON.stringify(summary).includes('private-app-label'));
});

test('repetitions and non-success outcomes are preserved; run duration is not summed test time', () => {
  const summary = buildSummary({
    schemaVersion: 1,
    groups: [
      group('one', '2026-10-21T10:00:00Z', 'source', 'TC-A', [
        'passed',
        'failed',
        'flaky',
        'skipped',
        'interrupted',
        'not-run',
      ]),
    ],
  });
  const run = summary.runs[0];
  assert.equal(run.scope.length, 1);
  assert.deepEqual(run.counts, {
    passed: 1,
    failed: 1,
    flaky: 1,
    skipped: 1,
    interrupted: 1,
    'not-run': 1,
  });
  assert.equal(run.durationMs, 100);
  assert.equal(run.globalErrors, 1);
  assert.match(renderSummary(summary), /api-tests/);
  assert.match(renderSummary(summary), /0\.10/);
});

test('unknown duration stays unknown and unsupported history is rejected', () => {
  const input = group('one', '2026-10-21T10:00:00Z', 'source', 'TC-A', []);
  delete input.runs[0].durationMs;
  const summary = buildSummary({ schemaVersion: 1, groups: [input] });
  assert.equal(summary.runs[0].durationMs, null);
  assert.deepEqual(summary.runs[0].counts, {});
  assert.match(renderSummary(summary), /no observations/);
  assert.throws(
    () => buildSummary({ schemaVersion: 2, groups: [] }),
    /Unsupported/,
  );
});

test('empty archive produces a valid saved JSON and useful terminal guidance', (t) => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'rolnopol-summary-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const { summary, output } = summarizeHistory(directory);
  assert.deepEqual(JSON.parse(readFileSync(output, 'utf8')), {
    schemaVersion: 1,
    runs: [],
  });
  assert.match(renderSummary(summary), /coverage:archive/);
});
