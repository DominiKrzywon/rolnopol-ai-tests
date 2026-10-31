import assert from 'node:assert/strict';
import test from 'node:test';

import { validateStaffList } from '../../src/schemas/farm.schema.ts';

test('accepts a valid staff list', async () => {
  const staff = [
    {
      id: 1,
      name: 'Ziutek',
      surname: 'Ziutkowski',
      age: 99,
    },
  ];

  const ifValid = validateStaffList(staff);

  assert.equal(ifValid, true);
});

test('not accepts invalid staff list data', async () => {
  const staff = [
    {
      id: 100,
      name: 'Ziutek',
      surname: 'Ziutkowki',
      age: '68',
    },
  ];

  const ifValid = validateStaffList(staff);

  assert.equal(ifValid, false);
});

test('rejects a staff member without surname', async () => {
  const staff = [
    {
      id: 1,
      name: 'Ziutek',
      age: 1,
    },
  ];

  const ifValid = validateStaffList(staff);

  assert.equal(ifValid, false);
});

test('accepts an empty staff list', async () => {
  const staff = [];
  const ifValid = validateStaffList(staff);
  assert.equal(ifValid, true);
});

test('valid for more than one staff', async () => {
  const staff1 = [
    {
      id: 1,
      name: 'Ziutek',
      surname: 'Ziutkowski',
      age: 11,
    },
  ];
  const staff2 = [
    {
      id: 2,
      name: 'Zdzisek',
      surname: 'Potocki',
      age: '123',
    },
  ];

  const ifValidStaff1 = validateStaffList(staff1);
  const ifValidStaff2 = validateStaffList(staff2);

  assert.equal(ifValidStaff1, true);
  assert.equal(ifValidStaff2, false);
});

test('accept staff with extra field', async () => {
  const staff = [
    {
      id: 3,
      name: 'Ziutek',
      surname: 'Ziutkowski',
      age: 44,
      skills: ['coding', 'testing', 'acrobatics'],
    },
  ];

  const ifValid = validateStaffList(staff);
  assert.equal(ifValid, true);
});
