export const START = '<!-- coverage-catalog:start -->';
export const END = '<!-- coverage-catalog:end -->';
export const INDEX_START = '<!-- coverage-index:start -->';
export const INDEX_END = '<!-- coverage-index:end -->';
const ID = /^TC-[A-Z]+-\d{3}$/;
const columns = [
  'ID',
  'Area',
  'Scenario',
  'Layer',
  'Priority',
  'Scope',
  'Notes',
];

export function section(text, start, end) {
  if (text.split(start).length !== 2 || text.split(end).length !== 2) {
    throw new Error(`Expected exactly one ${start} and ${end}`);
  }
  const from = text.indexOf(start) + start.length;
  const to = text.indexOf(end);
  if (to < from) throw new Error('Reversed coverage markers');
  return { from, to, body: text.slice(from, to) };
}

export function tableCells(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll('\\|', '|'));
}

export function parseCatalog(markdown) {
  const lines = section(markdown, START, END).body.trim().split(/\r?\n/);
  if (JSON.stringify(tableCells(lines[0])) !== JSON.stringify(columns)) {
    throw new Error(`Catalog columns must be: ${columns.join(', ')}`);
  }
  if (
    tableCells(lines[1] || '').length !== columns.length ||
    !tableCells(lines[1] || '').every((cell) => /^:?-{3,}:?$/.test(cell))
  ) {
    throw new Error('Invalid catalog table separator');
  }
  const ids = new Set();
  return lines
    .slice(2)
    .filter((line) => line.trim())
    .map((line) => {
      const cells = tableCells(line);
      if (cells.length !== columns.length)
        throw new Error(`Invalid catalog row: ${line}`);
      const [id, area, scenario, layer, priority, scope, notes] = cells;
      if (!ID.test(id) || ids.has(id))
        throw new Error(`Invalid or duplicate catalog ID: ${id}`);
      if (
        !area ||
        !scenario ||
        !['UI', 'API', 'E2E', 'Visual'].includes(layer) ||
        !['P0', 'P1', 'P2'].includes(priority) ||
        !['included', 'excluded'].includes(scope)
      ) {
        throw new Error(`Invalid fields for ${id}`);
      }
      if (scope === 'excluded' && (!notes || notes === '-')) {
        throw new Error(`Excluded case ${id} needs a reason`);
      }
      ids.add(id);
      return { id, area, scenario, layer, priority, scope, notes };
    });
}

export function validateInventory(catalog, inventory) {
  if (inventory.schemaVersion !== 1 || !Array.isArray(inventory.tests)) {
    throw new Error('Unsupported or invalid inventory');
  }
  const known = new Map(catalog.map((item) => [item.id, item]));
  const definitions = new Map();
  const units = new Set();
  for (const test of inventory.tests) {
    if (!Array.isArray(test.caseIds))
      throw new Error('Inventory caseIds must be an array');
    if (test.infrastructure) {
      if (test.project !== 'setup-demo-user' || test.caseIds.length) {
        throw new Error(
          'Only the unnumbered setup-demo-user project may be infrastructure',
        );
      }
      continue;
    }
    if (test.caseIds.length !== 1 || !ID.test(test.caseIds[0])) {
      throw new Error(
        `Test must have exactly one valid case-id: ${test.file}: ${test.title}`,
      );
    }
    const id = test.caseIds[0];
    if (!known.has(id)) throw new Error(`Unknown case-id: ${id}`);
    if (known.get(id).scope === 'excluded')
      throw new Error(`Excluded case is collected: ${id}`);
    const definition = JSON.stringify([
      test.file,
      test.line,
      test.column,
      test.title,
    ]);
    if (definitions.has(id) && definitions.get(id) !== definition) {
      throw new Error(`Duplicate case-id across test definitions: ${id}`);
    }
    const unit = `${id}:${test.project}`;
    if (units.has(unit)) throw new Error(`Duplicate inventory unit: ${unit}`);
    definitions.set(id, definition);
    units.add(unit);
  }
}

export function readmeIndex(catalog) {
  const cell = (value) => value.replaceAll('|', '\\|');
  return (
    '\n\n| ID | Area | Scenario | Layer | Priority | Scope |\n' +
    '| --- | --- | --- | --- | --- | --- |\n' +
    catalog
      .map(
        (item) =>
          `| ${[item.id, item.area, item.scenario, item.layer, item.priority, item.scope].map(cell).join(' | ')} |`,
      )
      .join('\n') +
    '\n\n'
  );
}

export function updateReadme(readme, catalog) {
  const { from, to } = section(readme, INDEX_START, INDEX_END);
  return readme.slice(0, from) + readmeIndex(catalog) + readme.slice(to);
}

export function flattenResults(report) {
  if (
    !Array.isArray(report.suites) ||
    !Array.isArray(report.config?.projects) ||
    !report.stats ||
    !Array.isArray(report.errors)
  ) {
    throw new Error('Invalid Playwright JSON report');
  }
  const entries = [];
  const visit = (suite) => {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || [])
        entries.push({ ...test, title: spec.title, file: spec.file });
    }
    for (const child of suite.suites || []) visit(child);
  };
  report.suites.forEach(visit);
  return entries;
}

function outcome(test) {
  const results = test.results || [];
  if (!results.length) return 'not-run';
  if (results.every((item) => item.status === 'skipped')) {
    return test.annotations?.some((item) =>
      ['skip', 'fixme'].includes(item.type),
    )
      ? 'skipped'
      : 'not-run';
  }
  if (results.some((item) => item.status === 'interrupted'))
    return 'interrupted';
  if (test.expectedStatus === 'failed') {
    return test.status === 'expected' ? 'expected-failure' : 'failed';
  }
  if (test.status === 'flaky') return 'flaky';
  if (test.status === 'unexpected') return 'failed';
  return results.every((item) => item.status === 'passed')
    ? 'passed'
    : 'not-run';
}

function aggregate(statuses) {
  if (!statuses.length) return 'not-run';
  if (statuses.includes('interrupted')) return 'interrupted';
  if (
    statuses.includes('flaky') ||
    (statuses.includes('passed') && statuses.includes('failed'))
  )
    return 'flaky';
  if (statuses.includes('failed')) return 'failed';
  if (statuses.every((status) => status === 'passed')) return 'passed';
  if (statuses.every((status) => status === 'not-run')) return 'not-run';
  if (statuses.every((status) => status === 'skipped')) return 'skipped';
  if (statuses.includes('expected-failure')) return 'expected-failure';
  return 'partial';
}

export function buildReport(catalog, inventory, run, snapshot) {
  validateInventory(catalog, inventory);
  if (inventory.snapshot?.fingerprint !== snapshot.fingerprint) {
    throw new Error('Inventory is stale. Run npm run coverage:collect.');
  }
  const entries = run ? flattenResults(run) : [];
  const units = new Map();
  const infrastructure = [];
  const knownUnits = new Set(
    inventory.tests
      .filter((test) => !test.infrastructure)
      .map((test) => `${test.caseIds[0]}:${test.project}`),
  );
  for (const entry of entries) {
    const summary = {
      project: entry.projectName,
      status: outcome(entry),
      expectedStatus: entry.expectedStatus,
      attempts: (entry.results || []).map((item) => ({
        status: item.status || 'not-run',
        retry: item.retry,
        durationMs: item.duration,
        startTime: item.startTime,
      })),
    };
    if (entry.projectName === 'setup-demo-user') {
      infrastructure.push(summary);
      continue;
    }
    const ids = (entry.annotations || []).filter(
      (item) => item.type === 'case-id',
    );
    if (ids.length !== 1)
      throw new Error(`Result must contain one case-id: ${entry.title}`);
    const key = `${ids[0].description}:${entry.projectName}`;
    if (!knownUnits.has(key))
      throw new Error(`Result has no inventory mapping: ${key}`);
    if (!units.has(key)) units.set(key, []);
    units.get(key).push(summary);
  }
  const provenance = run?.config?.metadata?.coverage;
  const freshness = !run
    ? 'no-run'
    : !provenance?.fingerprint
      ? 'unknown'
      : provenance.fingerprint === snapshot.fingerprint
        ? 'current'
        : 'stale';
  const cases = catalog.map((item) => {
    const tests = inventory.tests.filter((test) =>
      test.caseIds.includes(item.id),
    );
    const observations = tests.flatMap(
      (test) => units.get(`${item.id}:${test.project}`) || [],
    );
    const statuses = tests.flatMap((test) => {
      const matches = units.get(`${item.id}:${test.project}`);
      const expectedRepeats =
        run?.config.projects.find((project) => project.name === test.project)
          ?.repeatEach || 1;
      const states = matches ? matches.map((match) => match.status) : [];
      while (states.length < expectedRepeats) states.push('not-run');
      return states;
    });
    return {
      ...item,
      implemented: tests.length > 0,
      status:
        item.scope === 'excluded'
          ? 'excluded'
          : !tests.length
            ? 'planned'
            : aggregate(statuses),
      tests,
      observations,
    };
  });
  const included = cases.filter((item) => item.scope === 'included');
  const implemented = included.filter((item) => item.implemented).length;
  const confirmed =
    freshness === 'current' && run.errors.length === 0
      ? included.filter((item) => item.status === 'passed').length
      : null;
  const counts = {};
  for (const item of cases)
    counts[item.status] = (counts[item.status] || 0) + 1;
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    snapshot,
    scope:
      'Explicit TEST_PLAN scenario catalog; not application code coverage.',
    freshness,
    counts,
    metrics: {
      denominator: included.length,
      implemented,
      confirmed,
      automationPercent: included.length
        ? (implemented / included.length) * 100
        : null,
      confirmedPercent:
        confirmed !== null && included.length
          ? (confirmed / included.length) * 100
          : null,
    },
    run: run
      ? {
          provenance,
          environment: run.config.metadata?.environment || 'unknown',
          startTime: run.stats.startTime,
          durationMs: run.stats.duration,
          stats: run.stats,
          globalErrorCount: run.errors.length,
          workers: run.config.workers,
          projects: run.config.projects.map((project) => ({
            name: project.name,
            retries: project.retries,
            repeatEach: project.repeatEach,
          })),
        }
      : null,
    infrastructure,
    cases,
  };
}
