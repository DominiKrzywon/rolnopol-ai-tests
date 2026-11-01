import assert from 'node:assert/strict';
import test from 'node:test';

import { validateStaffList } from '../../src/schemas/farm.schema.ts';

const validStaff = {
  id: 1,
  name: 'Jan',
  surname: 'Kowalski',
  age: 30,
};

test('accepts a valid staff list', async () => {
  const staff = [
    {
      ...validStaff,
    },
  ];

  assert.equal(validateStaffList(staff), true);
});

test('not accepts invalid staff list data', async () => {
  const staff = [
    {
      ...validStaff,
      age: '22',
    },
  ];

  assert.equal(validateStaffList(staff), false);
});

test('rejects a staff member without surname', async () => {
  const staff = [
    {
      id: 1,
      name: 'Ziutek',
      age: 1,
    },
  ];

  assert.equal(validateStaffList(staff), false);
});

test('accepts an empty staff list', async () => {
  const staff = [];
  assert.equal(validateStaffList(staff), true);
});

test('valid for more than one staff', async () => {
  const staff = [
    {
      ...validStaff,
    },
    {
      ...validStaff,
      id: 2,
      age: '123',
    },
  ];

  assert.equal(validateStaffList(staff), false);
});

test('accept staff with extra field', async () => {
  const staff = [
    {
      ...validStaff,
      skills: ['coding', 'testing', 'acrobatics'],
    },
  ];

  assert.equal(validateStaffList(staff), true);
});
