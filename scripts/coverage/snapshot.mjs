import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export function sourceSnapshot(root) {
  root = path.resolve(root);
  const files = [];
  const visit = (relative) => {
    const absolute = path.join(root, relative);
    if (!existsSync(absolute)) return;
    for (const entry of readdirSync(absolute, { withFileTypes: true })) {
      const child = `${relative}/${entry.name}`;
      if (entry.isDirectory()) visit(child);
      else if (entry.isFile() && /\.(?:ts|mjs|json|png|jpg)$/.test(entry.name))
        files.push(child);
    }
  };
  ['tests', 'src', 'scripts/coverage'].forEach(visit);
  files.push(
    'README.md',
    'TEST_PLAN.md',
    'playwright.config.ts',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
  );
  const hash = createHash('sha256');
  for (const file of files.sort()) {
    hash.update(file + '\0');
    hash.update(
      /\.(?:png|jpg)$/.test(file)
        ? readFileSync(path.join(root, file))
        : readFileSync(path.join(root, file), 'utf8').replaceAll('\r\n', '\n'),
    );
    hash.update('\0');
  }
  let revision = null;
  try {
    revision = execFileSync(
      'git',
      [
        '-c',
        `safe.directory=${root.replaceAll('\\', '/')}`,
        'rev-parse',
        'HEAD',
      ],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
  } catch {
    /* A downloaded repository may have no Git metadata. */
  }
  return { fingerprint: hash.digest('hex'), revision };
}
