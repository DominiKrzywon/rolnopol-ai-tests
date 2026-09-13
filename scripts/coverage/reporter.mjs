import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export default class InventoryReporter {
  onBegin(config, suite) {
    this.inventory = {
      schemaVersion: 1,
      collectedAt: new Date().toISOString(),
      snapshot: JSON.parse(process.env.COVERAGE_CONTEXT || 'null'),
      tests: suite.allTests().map((test) => ({
        caseIds: test.annotations
          .filter((item) => item.type === 'case-id')
          .map((item) => item.description),
        infrastructure: test.annotations.some(
          (item) =>
            item.type === 'coverage-role' && item.description === 'setup',
        ),
        title: test.titlePath().slice(2).join(' > '),
        file: path
          .relative(config.rootDir, test.location.file)
          .replaceAll('\\', '/'),
        line: test.location.line,
        column: test.location.column,
        project: test.parent.project().name,
        tags: test.tags,
      })),
    };
  }

  onError() {
    this.failed = true;
  }

  onEnd(result) {
    if (this.failed || !this.inventory || result.status !== 'passed') {
      throw new Error('Test collection failed; no inventory was written.');
    }
    const output = process.env.COVERAGE_INVENTORY;
    if (!output) throw new Error('COVERAGE_INVENTORY is required.');
    mkdirSync(path.dirname(output), { recursive: true });
    writeFileSync(output, JSON.stringify(this.inventory, null, 2) + '\n');
  }
}
