import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  unlink,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TEST_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const OUTPUT_DIR = path.join(TEST_ROOT, 'coverage-report', 'app-code');
const FILTERS = [
  'tests/api/farm.api.spec.ts',
  'tests/api/financial.api.spec.ts',
  '--project=api-tests',
];
const SOURCE_FILES = [
  'routes/v1/auth.route.js',
  'routes/v1/authorization.route.js',
  'routes/v1/fields.route.js',
  'routes/v1/financial.route.js',
  'controllers/auth.controller.js',
  'controllers/resource.controller.js',
  'controllers/financial.controller.js',
  'services/auth.service.js',
  'services/resource.service.js',
  'services/financial.service.js',
  'middleware/auth.middleware.js',
  'middleware/rate-limit.middleware.js',
  'helpers/response-helper.js',
  'data/database-manager.js',
];

function appPathFromArgs(args) {
  if (args.length === 0) return path.resolve(TEST_ROOT, '..', 'rolnopol');
  if (args.length === 2 && args[0] === '--app') return path.resolve(args[1]);
  throw new Error(
    'Usage: npm run coverage:app-code -- [--app path-to-rolnopol]',
  );
}

function runGit(cwd, args) {
  const result = spawnSync(
    'git',
    ['-c', 'safe.directory=' + cwd.replace(/\\/g, '/'), ...args],
    {
      cwd,
      encoding: 'utf8',
      windowsHide: true,
    },
  );
  return result.status === 0 ? result.stdout.trim() : null;
}

function runNode(args, cwd, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd,
      env,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout = (stdout + chunk.toString()).slice(-12000);
    });
    child.stderr.on('data', (chunk) => {
      stderr = (stderr + chunk.toString()).slice(-12000);
    });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

function harnessSource(appVersion) {
  return [
    "const { test } = require('node:test');",
    "const assert = require('node:assert/strict');",
    "const http = require('node:http');",
    "const { spawn } = require('node:child_process');",
    "process.env.NODE_ENV = 'test';",
    "const app = require('./api/index.js');",
    "test('Playwright API run', { timeout: 180000 }, async () => {",
    '  const server = http.createServer(app);',
    '  await new Promise((resolve, reject) => {',
    "    server.once('error', reject);",
    "    server.listen(0, '127.0.0.1', resolve);",
    '  });',
    "  const baseURL = 'http://127.0.0.1:' + server.address().port;",
    '  try {',
    '    let ready = false;',
    '    for (let attempt = 0; attempt < 100; attempt++) {',
    '      try {',
    "        const response = await fetch(baseURL + '/api/v1/healthcheck');",
    '        if (response.ok) { ready = true; break; }',
    '      } catch {}',
    '      await new Promise((resolve) => setTimeout(resolve, 100));',
    '    }',
    "    assert.ok(ready, 'Isolated app did not become ready');",
    "    const args = ['scripts/coverage/cli.mjs', 'run', ..." +
      JSON.stringify(FILTERS) +
      '];',
    '    const result = await new Promise((resolve, reject) => {',
    '      const child = spawn(process.execPath, args, {',
    '        cwd: ' + JSON.stringify(TEST_ROOT) + ',',
    '        env: { ...process.env, BASE_URL: baseURL, COVERAGE_APP_VERSION: ' +
      JSON.stringify(appVersion) +
      ' },',
    '        windowsHide: true,',
    "        stdio: ['ignore', 'pipe', 'pipe'],",
    '      });',
    '      child.stdout.resume();',
    '      child.stderr.resume();',
    "      child.on('error', reject);",
    "      child.on('close', (code) => resolve(code));",
    '    });',
    "    assert.equal(result, 0, 'Playwright run failed; inspect coverage-report/playwright-results.json');",
    '  } finally {',
    '    await new Promise((resolve) => server.close(resolve));',
    '  }',
    '});',
    '',
  ].join('\n');
}

function parseLcov(text) {
  const records = new Map();
  for (const block of text.split('end_of_record')) {
    const rows = block.trim().split(/\r?\n/);
    const source = rows.find((row) => row.startsWith('SF:'));
    if (!source) continue;
    const file = source.slice(3).replace(/\\/g, '/');
    if (records.has(file)) throw new Error('Duplicate LCOV source: ' + file);
    const value = (name) =>
      Number(
        rows
          .find((row) => row.startsWith(name + ':'))
          ?.slice(name.length + 1) ?? 0,
      );
    const uncoveredLines = rows
      .filter((row) => row.startsWith('DA:'))
      .map((row) => row.slice(3).split(',').map(Number))
      .filter(([, hits]) => hits === 0)
      .map(([line]) => line);
    records.set(file, {
      file,
      lines: { covered: value('LH'), total: value('LF') },
      functions: { covered: value('FNH'), total: value('FNF') },
      branches: { covered: value('BRH'), total: value('BRF') },
      uncoveredLines,
    });
  }
  return records;
}

function selectLcov(text, appRoot) {
  return text
    .split('end_of_record')
    .flatMap((block) => {
      const source = block.match(/^SF:(.+)$/m)?.[1];
      if (!source) return [];
      const file = source.replace(/\\/g, '/').replace(/\r$/, '');
      if (!SOURCE_FILES.includes(file)) return [];
      const absolute = path.join(appRoot, file).replace(/\\/g, '/');
      return [
        block.trim().replace(/^SF:.+$/m, 'SF:' + absolute) +
          '\nend_of_record\n',
      ];
    })
    .join('');
}

function totalFor(files, metric) {
  return files.reduce(
    (sum, file) => ({
      covered: sum.covered + file[metric].covered,
      total: sum.total + file[metric].total,
    }),
    { covered: 0, total: 0 },
  );
}

function percent(metric) {
  return metric.total === 0 ? null : (100 * metric.covered) / metric.total;
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char],
  );
}

function metricCell(metric) {
  const share = percent(metric);
  return share === null
    ? '—'
    : share.toFixed(1) +
        '% <small>(' +
        metric.covered +
        '/' +
        metric.total +
        ')</small>';
}

function renderHtml(report) {
  const cards = [
    ['Lines', report.metrics.lines],
    ['Functions', report.metrics.functions],
    ['Branches', report.metrics.branches],
  ]
    .map(
      ([label, metric]) =>
        '<div class="card"><span>' +
        label +
        '</span><strong>' +
        (percent(metric)?.toFixed(1) ?? '—') +
        '%</strong><small>' +
        metric.covered +
        ' / ' +
        metric.total +
        '</small></div>',
    )
    .join('');
  const rows = report.files
    .map((file) => {
      const uncovered = file.uncoveredLines.length
        ? file.uncoveredLines.join(', ')
        : 'None among instrumented lines';
      return (
        '<tr data-file="' +
        escapeHtml(file.file.toLowerCase()) +
        '"><td><details><summary>' +
        escapeHtml(file.file) +
        '</summary><p>Uncovered lines: ' +
        escapeHtml(uncovered) +
        '</p></details></td><td>' +
        metricCell(file.lines) +
        '</td><td>' +
        metricCell(file.functions) +
        '</td><td>' +
        metricCell(file.branches) +
        '</td></tr>'
      );
    })
    .join('\n');
  return [
    '<!doctype html><html lang="en"><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<link rel="icon" href="data:,">',
    '<title>Rolnopol application code coverage</title>',
    '<style>body{font:16px/1.5 system-ui,sans-serif;max-width:1150px;margin:auto;padding:2rem;color:#172321;background:#f7faf8}',
    'h1{line-height:1.15}small,.muted{color:#53635d}.cards{display:flex;gap:1rem;flex-wrap:wrap;margin:1.5rem 0}',
    '.card{background:white;border:1px solid #d7e2db;border-radius:12px;padding:1rem;min-width:150px;display:grid}',
    '.card strong{font-size:2rem;color:#146245}table{width:100%;border-collapse:collapse;background:white}',
    'th,td{text-align:left;vertical-align:top;padding:.7rem;border-bottom:1px solid #e1e9e3}th{background:#e9f2eb}',
    'summary{cursor:pointer;font-weight:600}details p{overflow-wrap:anywhere;max-height:12rem;overflow:auto}',
    'input{font:inherit;padding:.6rem;width:min(100%,28rem);border:1px solid #8ca99b;border-radius:8px}',
    '.note{background:#eaf4ed;border-left:4px solid #247650;padding:1rem;margin:1.5rem 0}',
    '@media(max-width:650px){body{padding:1rem}table{font-size:.83rem}th,td{padding:.4rem}}</style>',
    '<h1>Application code coverage</h1>',
    '<p class="muted">Rolnopol backend pilot · Auth, Fields, Financial · ' +
      escapeHtml(report.generatedAt) +
      '</p>',
    '<div class="cards">' + cards + '</div>',
    '<div class="note">These percentages use exactly ' +
      report.files.length +
      ' listed application files as the denominator. The run executed ' +
      report.tests.passed +
      '/' +
      report.tests.executed +
      ' selected Playwright API tests. Other backend modules, browser JavaScript, and the application’s own Vitest suite are outside this report.</div>',
    '<p><strong>Application:</strong> ' +
      escapeHtml(report.app.version) +
      ' · revision ' +
      escapeHtml(report.app.revision ?? 'unknown') +
      (report.app.dirty ? ' (working tree has changes)' : '') +
      '<br><strong>Test selection:</strong> ' +
      escapeHtml(report.tests.filters.join(' ')) +
      '<br><strong>Test result:</strong> ' +
      escapeHtml(report.tests.status) +
      ' · <strong>Node:</strong> ' +
      escapeHtml(report.nodeVersion) +
      '</p>',
    '<label for="search">Find a file</label><br><input id="search" type="search" placeholder="e.g. financial.service">',
    '<p><a href="lcov.info">LCOV data</a> · <a href="summary.json">JSON summary</a> · ' +
      '<a href="../index.html">Scenario coverage</a></p>',
    '<table><thead><tr><th>Application file</th><th>Lines</th><th>Functions</th><th>Branches</th></tr></thead>',
    '<tbody>' + rows + '</tbody></table>',
    '<p class="muted">Route registration runs at startup and can count as covered even when a route was not exercised. Review assertions and the scenario report before interpreting these numbers.</p>',
    '<script>document.querySelector("#search").addEventListener("input",e=>{const q=e.target.value.toLowerCase();for(const row of document.querySelectorAll("tbody tr"))row.hidden=!row.dataset.file.includes(q)});</script>',
    '</html>',
  ].join('\n');
}

async function cleanupTemp(tempApp) {
  const absolute = path.resolve(tempApp);
  const tmpRoot = path.resolve(os.tmpdir());
  if (
    !absolute.startsWith(tmpRoot + path.sep) ||
    !path.basename(absolute).startsWith('rolnopol-app-code-')
  ) {
    throw new Error('Unsafe temporary cleanup path');
  }
  const dependencyLink = path.join(absolute, 'node_modules');
  try {
    if ((await lstat(dependencyLink)).isSymbolicLink())
      await unlink(dependencyLink);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await rm(absolute, { recursive: true, force: true });
}

async function main() {
  const appRoot = appPathFromArgs(process.argv.slice(2));
  const appPackage = JSON.parse(
    await readFile(path.join(appRoot, 'package.json'), 'utf8'),
  );
  if (appPackage.name !== 'rolnopol-app')
    throw new Error('Expected a rolnopol-app checkout at ' + appRoot);
  for (const file of SOURCE_FILES) await readFile(path.join(appRoot, file));
  const appRevision = runGit(appRoot, ['rev-parse', 'HEAD']);
  const appDirty = Boolean(runGit(appRoot, ['status', '--short']));
  const fingerprint = createHash('sha256');
  for (const file of SOURCE_FILES) {
    fingerprint.update(file);
    fingerprint.update(await readFile(path.join(appRoot, file)));
  }
  await mkdir(OUTPUT_DIR, { recursive: true });
  const tempApp = await mkdtemp(path.join(os.tmpdir(), 'rolnopol-app-code-'));
  try {
    await cp(appRoot, tempApp, {
      recursive: true,
      filter(source) {
        const relative = path.relative(appRoot, source).replace(/\\/g, '/');
        const parts = relative.split('/');
        return !parts.some(
          (part) =>
            part === '.git' ||
            part === 'node_modules' ||
            part === '.env' ||
            part.startsWith('.env.'),
        );
      },
    });
    await symlink(
      path.join(appRoot, 'node_modules'),
      path.join(tempApp, 'node_modules'),
      process.platform === 'win32' ? 'junction' : 'dir',
    );
    await writeFile(
      path.join(tempApp, 'app-code-coverage.test.cjs'),
      harnessSource(appPackage.version),
    );
    const lcovPath = path.join(tempApp, 'app-code-coverage.lcov');
    const result = await runNode(
      [
        '--test',
        '--experimental-test-coverage',
        '--test-reporter=lcov',
        '--test-reporter-destination=' + lcovPath,
        'app-code-coverage.test.cjs',
      ],
      tempApp,
      { ...process.env, NODE_ENV: 'test' },
    );
    const lcov = await readFile(lcovPath, 'utf8');
    const records = parseLcov(lcov);
    const files = SOURCE_FILES.map((file) => {
      const record = records.get(file);
      if (!record)
        throw new Error(
          'Selected application file absent from V8 coverage: ' + file,
        );
      return record;
    });
    const scenario = JSON.parse(
      await readFile(
        path.join(TEST_ROOT, 'coverage-report', 'coverage.json'),
        'utf8',
      ),
    );
    if (!scenario.run || scenario.freshness !== 'current') {
      throw new Error('Playwright scenario results are missing or stale');
    }
    const stats = scenario.run.stats;
    const executed = stats.expected + stats.unexpected + stats.flaky;
    const report = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      scope: 'Auth, Fields, Financial backend pilot',
      app: {
        version: appPackage.version,
        revision: appRevision,
        dirty: appDirty,
        sourceFingerprint: fingerprint.digest('hex'),
      },
      nodeVersion: process.version,
      tests: {
        filters: FILTERS,
        executed,
        passed: stats.expected,
        failed: stats.unexpected,
        flaky: stats.flaky,
        status: result.code === 0 ? 'passed' : 'failed',
      },
      metrics: {
        lines: totalFor(files, 'lines'),
        functions: totalFor(files, 'functions'),
        branches: totalFor(files, 'branches'),
      },
      files,
    };
    await writeFile(
      path.join(OUTPUT_DIR, 'lcov.info'),
      selectLcov(lcov, appRoot),
    );
    await writeFile(
      path.join(OUTPUT_DIR, 'summary.json'),
      JSON.stringify(report, null, 2) + '\n',
    );
    await writeFile(path.join(OUTPUT_DIR, 'index.html'), renderHtml(report));
    process.stdout.write(
      'Application report: ' + path.join(OUTPUT_DIR, 'index.html') + '\n',
    );
    process.stdout.write(
      'Selected tests: ' +
        report.tests.passed +
        '/' +
        report.tests.executed +
        ' passed\n',
    );
    process.stdout.write(
      'Selected-file line coverage: ' +
        metricCell(report.metrics.lines).replace(/<[^>]+>/g, '') +
        '\n',
    );
    if (result.code !== 0) {
      process.stderr.write(
        'Coverage runner exited with code ' +
          result.code +
          '. Inspect the Playwright report.\n',
      );
      process.exitCode = 1;
    }
  } finally {
    await cleanupTemp(tempApp);
  }
}

main().catch((error) => {
  process.stderr.write(error.message + '\n');
  process.exitCode = 1;
});
