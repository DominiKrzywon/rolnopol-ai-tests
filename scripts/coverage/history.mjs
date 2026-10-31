import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

import { validateCoverageReport } from './model.mjs';
import { loadPlaywrightLinks } from './playwright-links.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const defaultHistory = path.join(root, 'playwright-report-ci/learning-history');
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) =>
  writeFileSync(file, JSON.stringify(value, null, 2) + '\n');

function evidence(directory) {
  const report = readJson(path.join(directory, 'coverage.json'));
  const raw = readJson(path.join(directory, 'playwright-results.json'));
  validateCoverageReport(report);
  const provenance = report.run?.provenance;
  if (
    !provenance ||
    !/^[a-zA-Z0-9-]{1,100}$/.test(provenance.runId || '') ||
    !provenance.fingerprint ||
    !Array.isArray(provenance.command) ||
    !Number.isFinite(Date.parse(report.run.startTime))
  )
    throw new Error(
      'A completed coverage:run report with provenance is required.',
    );
  if (
    !isDeepStrictEqual(provenance, raw.config?.metadata?.coverage) ||
    !isDeepStrictEqual(report.run.stats, raw.stats) ||
    report.run.globalErrorCount !== raw.errors?.length
  )
    throw new Error(
      'Raw and normalized reports belong to different executions.',
    );
  return { report, raw };
}

/** Save evidence from its original execution, even if today's source has changed. */
export async function archiveRun({
  source = path.join(root, 'coverage-report'),
  playwright = path.join(root, 'playwright-report'),
  history = defaultHistory,
} = {}) {
  const { report, raw } = evidence(source);
  const timestamp = new Date(report.run.startTime)
    .toISOString()
    .replaceAll(':', '-');
  const destination = path.resolve(
    history,
    `${timestamp}-${report.run.provenance.runId}`,
  );
  // Prevent accidental recursive copying when callers supply a custom destination.
  for (const input of [source, playwright]) {
    const relative = path.relative(path.resolve(input), destination);
    const outside =
      relative === '..' ||
      relative.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relative);
    if (!relative || !outside)
      throw new Error('History must be outside the input report directories.');
  }
  const html = await loadPlaywrightLinks(
    path.join(playwright, 'index.html'),
    raw,
  );
  mkdirSync(history, { recursive: true });
  // Exclusive creation intentionally refuses duplicate runs and partial archives.
  mkdirSync(destination);
  const coverageDestination = path.join(destination, 'coverage-report');
  mkdirSync(coverageDestination);
  for (const name of [
    'coverage.json',
    'playwright-results.json',
    'inventory.json',
    'index.html',
  ]) {
    if (existsSync(path.join(source, name)))
      copyFileSync(
        path.join(source, name),
        path.join(coverageDestination, name),
      );
  }
  if (html.status === 'matched')
    cpSync(playwright, path.join(destination, 'playwright-report'), {
      recursive: true,
    });
  const manifest = {
    schemaVersion: 1,
    runId: report.run.provenance.runId,
    archivedAt: new Date().toISOString(),
    playwrightHtml: html.status,
    coverageHtml: existsSync(path.join(coverageDestination, 'index.html')),
  };
  // Written last: its absence identifies an interrupted/partial copy.
  writeJson(path.join(destination, 'archive.json'), manifest);
  return { destination, ...manifest };
}

function classify(statuses) {
  if (!statuses.length) return 'no execution';
  if (statuses.includes('flaky')) return 'retry variation';
  if (statuses.includes('passed') && statuses.includes('failed'))
    return 'mixed outcomes';
  if (statuses.every((status) => status === 'passed'))
    return 'only passes observed';
  if (statuses.every((status) => status === 'failed'))
    return 'only failures observed';
  return 'other outcomes present';
}

/** Group only matching recorded conditions; unknown external state remains a limitation. */
export function analyzeRuns(inputs) {
  const groups = new Map();
  const seen = new Set();
  for (const { report, raw } of inputs) {
    const run = report.run;
    if (seen.has(run.provenance.runId))
      throw new Error(`Duplicate run ID: ${run.provenance.runId}`);
    seen.add(run.provenance.runId);
    const conditions = {
      fingerprint: run.provenance.fingerprint,
      revision: run.provenance.revision,
      environment: run.environment,
      applicationVersion: run.provenance.applicationVersion || 'unknown',
      command: run.provenance.command,
      workers: run.workers,
      projects: run.projects,
      playwrightVersion: raw.config.version || 'unknown',
    };
    const key = JSON.stringify(conditions);
    if (!groups.has(key))
      groups.set(key, { conditions, runs: [], cases: new Map() });
    const group = groups.get(key);
    group.runs.push({
      runId: run.provenance.runId,
      startTime: run.startTime,
      durationMs: run.durationMs,
      globalErrorCount: run.globalErrorCount,
      infrastructureEntries: report.infrastructure.length,
    });
    for (const item of report.cases) {
      if (item.scope !== 'included') continue;
      for (const observation of item.execution.runs) {
        const caseKey = JSON.stringify([item.id, observation.project]);
        if (!group.cases.has(caseKey))
          group.cases.set(caseKey, {
            id: item.id,
            project: observation.project,
            observations: [],
          });
        group.cases.get(caseKey).observations.push({
          runId: run.provenance.runId,
          startTime: run.startTime,
          status: observation.status,
          durationMs: observation.durationMs,
          attempts: observation.attempts.map(
            ({ status, retry, durationMs }) => ({ status, retry, durationMs }),
          ),
        });
      }
    }
  }
  return [...groups.values()]
    .map((group) => {
      group.runs.sort(
        (a, b) => Date.parse(a.startTime) - Date.parse(b.startTime),
      );
      return {
        conditions: group.conditions,
        runs: group.runs,
        cases: [...group.cases.values()]
          .map((item) => {
            item.observations.sort(
              (a, b) => Date.parse(a.startTime) - Date.parse(b.startTime),
            );
            const counts = {};
            for (const observation of item.observations)
              counts[observation.status] =
                (counts[observation.status] || 0) + 1;
            const representedRuns = new Set(
              item.observations.map((observation) => observation.runId),
            );
            return {
              ...item,
              counts,
              runCount: representedRuns.size,
              missingRuns: group.runs.length - representedRuns.size,
              classification: classify(
                item.observations.map((observation) => observation.status),
              ),
            };
          })
          .sort((a, b) =>
            `${a.id}:${a.project}`.localeCompare(`${b.id}:${b.project}`),
          ),
      };
    })
    .sort(
      (a, b) =>
        Date.parse(a.runs[0].startTime) - Date.parse(b.runs[0].startTime),
    );
}

const cell = (value) =>
  String(value)
    .replaceAll('|', '\\|')
    .replace(/[\r\n]/g, ' ');

export function renderHistory(groups) {
  const lines = [
    '# Test execution history',
    '',
    'Historical observations, not current scenario confirmation or application code coverage.',
    'Groups match recorded source, command, environment, app version and settings.',
    'OS/browser builds, database state and external services are not fully recorded: verify them separately.',
    'Unknown app versions do not establish identical applications. One run cannot establish stability.',
    'Mixed outcomes and retry variation are investigation signals, not root-cause diagnoses.',
    'No tests are quarantined. Health scenarios stay visible; setup infrastructure is separate.',
    '',
  ];
  for (const [index, group] of groups.entries()) {
    lines.push(
      `## Group ${index + 1}: ${group.runs.length} archived run(s)`,
      '',
      `Window: ${group.runs[0].startTime} to ${group.runs.at(-1).startTime}.`,
      `Environment: ${cell(group.conditions.environment)}; application: ${cell(group.conditions.applicationVersion)}.`,
      `Source fingerprint: ${cell(group.conditions.fingerprint)}.`,
      `Command: ${cell(group.conditions.command.join(' '))}.`,
      `Global errors: ${group.runs.reduce((sum, run) => sum + run.globalErrorCount, 0)}; setup infrastructure entries: ${group.runs.reduce((sum, run) => sum + run.infrastructureEntries, 0)}.`,
      '',
      '| Case | Project | Runs observed / group runs | Outcomes | Attempts | Duration range (ms, summed attempts per observation) | Observation |',
      '| --- | --- | --- | --- | --- | --- | --- |',
    );
    for (const item of group.cases) {
      const durations = item.observations.map(
        (observation) => observation.durationMs,
      );
      const attempts = item.observations.reduce(
        (sum, observation) => sum + observation.attempts.length,
        0,
      );
      const outcomes = Object.entries(item.counts)
        .map(([status, count]) => `${status}: ${count}`)
        .join(', ');
      lines.push(
        `| ${cell(item.id)} | ${cell(item.project)} | ${item.runCount}/${group.runs.length} | ${cell(outcomes)}; absent: ${item.missingRuns} | ${attempts} | ${Math.min(...durations)}–${Math.max(...durations)} | ${item.classification} |`,
      );
    }
    lines.push('');
  }
  if (!groups.length)
    lines.push(
      'No archived runs. Run coverage:archive after coverage:run.',
      '',
    );
  return lines.join('\n');
}

export function analyzeHistory(history = defaultHistory) {
  const inputs = [];
  if (existsSync(history)) {
    for (const entry of readdirSync(history, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const directory = path.join(history, entry.name);
      const manifestFile = path.join(directory, 'archive.json');
      if (!existsSync(manifestFile))
        throw new Error(
          `Incomplete archive: ${entry.name}. Inspect it before continuing.`,
        );
      const manifest = readJson(manifestFile);
      const input = evidence(path.join(directory, 'coverage-report'));
      if (
        manifest.schemaVersion !== 1 ||
        manifest.runId !== input.report.run.provenance.runId
      )
        throw new Error(`Invalid archive manifest: ${entry.name}`);
      inputs.push(input);
    }
  }
  const groups = analyzeRuns(inputs);
  mkdirSync(history, { recursive: true });
  writeJson(path.join(history, 'history.json'), { schemaVersion: 1, groups });
  writeFileSync(path.join(history, 'history.md'), renderHistory(groups));
  return {
    runs: inputs.length,
    groups: groups.length,
    report: path.join(history, 'history.md'),
  };
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (args.length || !['archive', 'analyze'].includes(command))
    throw new Error('Usage: node scripts/coverage/history.mjs archive|analyze');
  if (command === 'archive') {
    const archive = await archiveRun();
    process.stdout.write(
      `Archived: ${archive.destination}\nPlaywright HTML: ${archive.playwrightHtml}; coverage HTML: ${archive.coverageHtml}\n`,
    );
  } else {
    const result = analyzeHistory();
    process.stdout.write(
      `History: ${result.runs} run(s), ${result.groups} condition group(s)\nReport: ${result.report}\n`,
    );
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main().catch((error) => {
    process.stderr.write(`History: ${error.message}\n`);
    process.exitCode = 1;
  });
