import Ajv, { type JSONSchemaType } from 'ajv';
import type { CreatedStaff } from 'src/types/testData';

const staffListSchema: JSONSchemaType<CreatedStaff[]> = {
  type: 'array',
  items: {
    type: 'object',
    required: ['id', 'name', 'surname', 'age'],
    additionalProperties: true,
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      surname: { type: 'string' },
      age: { type: 'number' },
    },
  },
};

const ajv = new Ajv({ allErrors: true });

export const validateStaffList = ajv.compile(staffListSchema);
