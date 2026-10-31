import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { analyzeHistory } from './history.mjs';

const defaultHistory = fileURLToPath(
  new URL('../../playwright-report-ci/learning-history/', import.meta.url),
);

export function buildSummary(history) {
  if (history.schemaVersion !== 1 || !Array.isArray(history.groups))
    throw new Error('Unsupported history format. Run coverage:history first.');

  const runs = history.groups.flatMap((group) =>
    group.runs.map((run) => {
      const counts = {};
      const scope = new Set();
      for (const item of group.cases) {
        for (const observation of item.observations) {
          if (observation.runId !== run.runId) continue;
          scope.add(`${item.id}@${item.project}`);
          counts[observation.status] = (counts[observation.status] || 0) + 1;
        }
      }
      return {
        runId: run.runId,
        date: run.startTime,
        source: group.conditions.fingerprint,
        scope: [...scope].sort(),
        counts,
        durationMs: run.durationMs ?? null,
        globalErrors: run.globalErrorCount,
      };
    }),
  );
  runs.sort(
    (a, b) =>
      Date.parse(a.date) - Date.parse(b.date) || a.runId.localeCompare(b.runId),
  );
  for (const [index, run] of runs.entries()) {
    const previous = runs[index - 1];
    run.changes = previous
      ? {
          scope: JSON.stringify(run.scope) !== JSON.stringify(previous.scope),
          source: run.source !== previous.source,
        }
      : null;
  }
  return { schemaVersion: 1, runs };
}

export function renderSummary(summary) {
  if (!summary.runs.length)
    return 'No archived runs. Run coverage:archive after coverage:run.\n';
  const rows = summary.runs.map((run) => {
    const {
      passed = 0,
      failed = 0,
      flaky = 0,
      skipped = 0,
      ...other
    } = run.counts;
    const projects = [...new Set(run.scope.map((item) => item.split('@')[1]))];
    return [
      run.date,
      run.source.slice(0, 10),
      projects.join(', ') || '(no observations)',
      run.scope.length,
      passed,
      failed,
      flaky,
      skipped,
      Object.values(other).reduce((sum, count) => sum + count, 0),
      run.durationMs === null ? '?' : (run.durationMs / 1000).toFixed(2),
      run.globalErrors,
      run.changes
        ? Object.keys(run.changes)
            .filter((key) => run.changes[key])
            .join(', ') || '-'
        : 'first run',
    ].map(String);
  });
  const headers = [
    'Date (UTC)',
    'Source',
    'Projects',
    'Cases',
    'Pass',
    'Fail',
    'Flaky',
    'Skip',
    'Other',
    'Run s',
    'Errors',
    'Changed',
  ];
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => row[index].length)),
  );
  const line = (row) =>
    row
      .map((cell, index) => cell.padEnd(widths[index]))
      .join(' | ')
      .trimEnd();
  return [
    'Scenario observations: health included, setup/excluded cases omitted.',
    'Counts include repetitions; Cases counts unique case/project pairs. Run s is wall-clock duration.',
    'Changed compares observed scope and test source with the previous row; outcomes alone do not diagnose regressions or flakiness.',
    '',
    line(headers),
    widths.map((width) => '-'.repeat(width)).join('-+-'),
    ...rows.map(line),
    '',
  ].join('\n');
}

export function summarizeHistory(history = defaultHistory) {
  analyzeHistory(history);
  const summary = buildSummary(
    JSON.parse(readFileSync(path.join(history, 'history.json'), 'utf8')),
  );
  const output = path.join(history, 'summary.json');
  writeFileSync(output, JSON.stringify(summary, null, 2) + '\n');
  return { summary, output };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const args = process.argv.slice(2);
    if (args.length && !(args.length === 1 && args[0] === '--json'))
      throw new Error('Usage: npm run coverage:summary -- [--json]');
    const { summary, output } = summarizeHistory();
    process.stdout.write(
      args[0] === '--json'
        ? JSON.stringify(summary, null, 2) + '\n'
        : renderSummary(summary) + `JSON: ${output}\n`,
    );
  } catch (error) {
    process.stderr.write(`Summary: ${error.message}\n`);
    process.exitCode = 1;
  }
}
