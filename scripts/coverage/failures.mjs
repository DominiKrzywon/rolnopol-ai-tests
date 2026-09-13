import { stripVTControlCharacters } from 'node:util';

// Explicitly reviewed public text. Unknown runtime values never enter the export.
const publicValues = new Set([
  'Purchase completed successfully!',
  'Insufficient funds to complete purchase (no overdraft allowed)',
  'Insufficient funds for transfer',
  'visible',
  'hidden',
]);
const publicSteps = new Set([
  'register and login new user',
  'add resources',
  'assign staff to field',
  'register and login seller & buyer in parallel',
  'seller: add resource and create offer',
  'buyer: add funds and buy seller offer',
  'verify field ownership transfer',
  'verify zero user balance',
  'attempt expensive purchase with empty balance',
  'verify transaction was blocked',
  'should buy random offer',
  'verify purchase in transaction history',
  'verify ownership transfer',
  'create offer',
  'verify offer in My Offers page',
]);

function publicValue(text, label) {
  const match = new RegExp(
    `^${label}(?: (?:string|substring|pattern))?: (.+)$`,
    'm',
  ).exec(text);
  if (!match) return null;
  let value = match[1].trim();
  if (value.startsWith('"')) {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  return publicValues.has(value) ? value : null;
}

function failedStep(steps = []) {
  for (const step of steps) {
    const nested = failedStep(step.steps);
    if (nested) return nested;
    if (step.error) return step;
  }
  return null;
}

function locationInInventory(location, tests) {
  if (
    typeof location?.file !== 'string' ||
    !Number.isInteger(location.line) ||
    location.line < 1
  )
    return { file: null, line: null };
  const file = location.file.replaceAll('\\', '/');
  const match = tests.find(
    (test) =>
      file === test.file ||
      file === `tests/${test.file}` ||
      file.endsWith(`/tests/${test.file}`),
  );
  return match
    ? { file: `tests/${match.file}`, line: location.line }
    : { file: null, line: null };
}

export function summarizeFailure(attempt, tests) {
  if (!['failed', 'timedOut', 'interrupted'].includes(attempt.status))
    return null;
  const step = failedStep(attempt.steps);
  const error = attempt.error || attempt.errors?.[0] || step?.error;
  const text = stripVTControlCharacters(
    typeof error?.message === 'string' ? error.message : '',
  );
  const expected = publicValue(text, 'Expected');
  const actual = publicValue(text, 'Received');
  let message = 'Execution failed; inspect the Playwright report.';
  if (attempt.status === 'interrupted') message = 'Execution was interrupted.';
  else if (/snapshot.*doesn.t exist|snapshot.*missing/i.test(text))
    message = 'The expected visual snapshot is missing.';
  else if (expected !== null && actual !== null)
    message = 'Expected and received values differ.';
  else if (attempt.status === 'timedOut' || /Timeout|Timed out/.test(text))
    message = 'Execution or assertion timed out.';
  else if (/expect\(/.test(text)) message = 'An assertion failed.';
  return {
    step: publicSteps.has(step?.title) ? step.title : null,
    expected,
    actual,
    ...locationInInventory(
      attempt.errorLocation || error?.location || step?.error?.location,
      tests,
    ),
    message,
    errorCount: Math.max(attempt.errors?.length || 0, error ? 1 : 0),
  };
}
