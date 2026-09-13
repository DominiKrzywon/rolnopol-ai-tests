import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { format, resolveConfig } from 'prettier';

import { renderReport } from './html.mjs';
import {
  buildReport,
  parseCatalog,
  updateReadme,
  validateInventory,
} from './model.mjs';
import { loadPlaywrightLinks } from './playwright-links.mjs';
import { sourceSnapshot } from './snapshot.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const output = path.join(root, 'coverage-report');
const inventoryFile = path.join(output, 'inventory.json');
const resultsFile = path.join(output, 'playwright-results.json');
const command = process.argv[2];
const args = process.argv.slice(3);
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) =>
  writeFileSync(file, JSON.stringify(value, null, 2) + '\n');

function playwright(arguments_, environment) {
  const result = spawnSync(
    process.execPath,
    [
      path.join(root, 'node_modules/@playwright/test/cli.js'),
      'test',
      ...arguments_,
    ],
    { cwd: root, env: environment, stdio: 'inherit', shell: false },
  );
  if (result.error) throw result.error;
  return result.status ?? 1;
}

function collect() {
  mkdirSync(output, { recursive: true });
  if (existsSync(inventoryFile)) unlinkSync(inventoryFile);
  // --list never runs fixtures. Avoid loading .env or needing real accounts.
  const environment = {
    ...process.env,
    BASE_URL: 'http://localhost:3000',
    DOTENV_CONFIG_PATH: path.join(output, 'disabled-dotenv'),
    COVERAGE_CONTEXT: JSON.stringify(sourceSnapshot(root)),
    COVERAGE_INVENTORY: inventoryFile,
  };
  for (const key of Object.keys(environment)) {
    if (/^(?:DEMO|EMPTY)_USER_/.test(key)) delete environment[key];
  }
  const code = playwright(
    ['--list', '--reporter=./scripts/coverage/reporter.mjs'],
    environment,
  );
  if (code !== 0 || !existsSync(inventoryFile))
    throw new Error(`Collection failed (${code})`);
  const inventory = readJson(inventoryFile);
  validateInventory(parseCatalog(read('TEST_PLAN.md')), inventory);
  process.stdout.write(
    `Collected ${inventory.tests.length} tests; ${inventory.tests.filter((test) => test.infrastructure).length} setup entries.\n`,
  );
  return inventory;
}

async function expectedReadme() {
  return format(
    updateReadme(read('README.md'), parseCatalog(read('TEST_PLAN.md'))),
    {
      ...(await resolveConfig(path.join(root, 'README.md'))),
      parser: 'markdown',
    },
  );
}

async function generate(resultPath) {
  const plan = read('TEST_PLAN.md');
  const readme = read('README.md');
  const inventory = readJson(inventoryFile);
  const run = resultPath ? readJson(resultPath) : null;
  const report = buildReport(
    parseCatalog(plan),
    inventory,
    run,
    sourceSnapshot(root),
    await loadPlaywrightLinks(
      path.join(root, 'playwright-report/index.html'),
      run,
    ),
  );
  report.documents = { readme, testPlan: plan };
  writeJson(path.join(output, 'coverage.json'), report);
  writeFileSync(
    path.join(output, 'index.html'),
    renderReport(report, readme, plan),
  );
  process.stdout.write(
    `Report: ${path.join(output, 'index.html')}\nImplemented: ${report.metrics.implemented}/${report.metrics.denominator}; result freshness: ${report.freshness}\n`,
  );
}

async function main() {
  if (command === 'collect' || command === 'validate') {
    if (args.length)
      throw new Error(
        `${command} does not accept filters; inventory must be complete.`,
      );
    collect();
    if (
      command === 'validate' &&
      read('README.md').replaceAll('\r\n', '\n') !==
        (await expectedReadme()).replaceAll('\r\n', '\n')
    ) {
      throw new Error(
        'README index is out of date. Run npm run coverage:readme.',
      );
    }
  } else if (command === 'readme') {
    if (args.length) throw new Error('readme does not accept arguments');
    writeFileSync(path.join(root, 'README.md'), await expectedReadme());
    process.stdout.write('Updated README scenario index.\n');
  } else if (command === 'report') {
    let resultPath = existsSync(resultsFile) ? resultsFile : null;
    if (args.length) {
      if (args.length === 1 && args[0] === '--no-results') resultPath = null;
      else if (args.length === 2 && args[0] === '--results')
        resultPath = path.resolve(args[1]);
      else
        throw new Error(
          'Use report [--no-results | --results path/to/results.json]',
        );
    }
    await generate(resultPath);
  } else if (command === 'run') {
    if (
      args.some(
        (arg) =>
          /^-[cu]/.test(arg) ||
          /^--(?:list|reporter|config|ui|help|version|update-snapshots|ignore-snapshots)(?:=|$)/.test(
            arg,
          ),
      )
    ) {
      throw new Error(
        'coverage:run requires the repository config and reporters; list/UI/config/reporter/snapshot-update overrides are unsupported.',
      );
    }
    collect();
    if (existsSync(resultsFile)) unlinkSync(resultsFile);
    const arguments_ = [
      '--workers=1',
      '--retries=0',
      '--update-snapshots=none',
      ...args,
    ];
    const context = {
      ...sourceSnapshot(root),
      runId: randomUUID(),
      command: ['playwright', 'test', ...arguments_],
      applicationVersion: process.env.COVERAGE_APP_VERSION || 'unknown',
    };
    const code = playwright(arguments_, {
      ...process.env,
      COVERAGE_CONTEXT: JSON.stringify(context),
      PLAYWRIGHT_JSON_OUTPUT_FILE: resultsFile,
      PLAYWRIGHT_HTML_OPEN: 'never',
    });
    // Generate even after test failure, preserving Playwright's exit code.
    await generate(existsSync(resultsFile) ? resultsFile : null);
    if (code === 0 && !existsSync(resultsFile)) {
      throw new Error(
        'Playwright exited successfully but produced no JSON results.',
      );
    }
    process.exitCode = code;
  } else {
    throw new Error(
      'Usage: node scripts/coverage/cli.mjs collect|validate|readme|run|report',
    );
  }
}

main().catch((error) => {
  process.stderr.write(`Coverage: ${error.message}\n`);
  process.exitCode = 1;
});
