import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const validId = (id) =>
  typeof id === 'string' && /^[a-f0-9]{20}-[a-f0-9]{20}$/.test(id);

export function matchPlaywrightReport(summary, run) {
  if (
    !run ||
    summary.startTime !== Date.parse(run.stats.startTime) ||
    summary.duration !== run.stats.duration
  )
    return { status: 'mismatch', tests: [] };
  const provenance = run.config?.metadata?.coverage;
  if (
    provenance?.runId &&
    summary.metadata?.coverage?.runId !== provenance.runId
  )
    return { status: 'mismatch', tests: [] };
  if (
    provenance?.fingerprint &&
    summary.metadata?.coverage?.fingerprint !== provenance.fingerprint
  )
    return { status: 'mismatch', tests: [] };
  const tests = (summary.files || [])
    .flatMap((file) => file.tests || [])
    .flatMap((test) => {
      const ids = (test.annotations || []).filter(
        (item) => item.type === 'case-id',
      );
      if (ids.length !== 1 || !validId(test.testId)) return [];
      return [
        {
          caseId: ids[0].description,
          project: test.projectName,
          playwrightTestId: test.testId,
        },
      ];
    });
  return { status: 'matched', tests };
}

// Playwright 1.58 embeds its report index in a ZIP. Unsupported formats disable links.
async function readSummary(html) {
  const base64 =
    /<script[^>]*id="playwrightReportBase64"[^>]*>data:application\/zip;base64,([A-Za-z0-9+/=]+)<\/script>/.exec(
      html,
    )?.[1];
  if (!base64) throw new Error('Unsupported HTML report format');
  const { yauzl } = require(
    path.join(
      path.dirname(require.resolve('playwright-core/package.json')),
      'lib/zipBundle.js',
    ),
  );
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(
      Buffer.from(base64, 'base64'),
      { lazyEntries: true },
      (error, zip) => {
        if (error) return reject(error);
        zip.on('error', reject);
        zip.on('end', () => reject(new Error('Missing report index')));
        zip.on('entry', (entry) => {
          if (entry.fileName !== 'report.json') return zip.readEntry();
          zip.openReadStream(entry, (streamError, stream) => {
            if (streamError) {
              zip.close();
              return reject(streamError);
            }
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', (error) => {
              zip.close();
              reject(error);
            });
            stream.on('end', () => {
              zip.close();
              try {
                resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
              } catch (error) {
                reject(error);
              }
            });
          });
        });
        zip.readEntry();
      },
    );
  });
}

export async function loadPlaywrightLinks(file, run) {
  if (!run) return { status: 'no-run', tests: [] };
  try {
    return matchPlaywrightReport(
      await readSummary(await readFile(file, 'utf8')),
      run,
    );
  } catch (error) {
    return {
      status: error.code === 'ENOENT' ? 'missing' : 'unavailable',
      tests: [],
    };
  }
}

export function playwrightTestLink(id) {
  return validId(id)
    ? `../playwright-report/index.html#?testId=${encodeURIComponent(id)}`
    : null;
}
