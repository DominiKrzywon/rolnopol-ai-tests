import assert from 'node:assert/strict';
import test from 'node:test';

import { parseBalance } from '../../src/helpers/balanceHelpers.ts';

test('check validation of balance helper', () => {
  const actualBalance = parseBalance('-50.00 ROL');

  assert.equal(actualBalance, -50);
});

test('check validation of "50 ROL"', () => {
  const actualBalance = parseBalance('50.00 ROL');

  assert.equal(actualBalance, 50);
});

test('check validation of 0 ROL', () => {
  const actualBalance = parseBalance('0.00 ROL');

  assert.equal(actualBalance, 0);
});

test('check validation of number', () => {
  const actualBalance = parseBalance('1 234,56 ROL');

  assert.equal(actualBalance, 1234.56);
});

test('rejects empty balance text', () => {
  assert.throws(() => parseBalance(''), /Invalid balance/);
});
