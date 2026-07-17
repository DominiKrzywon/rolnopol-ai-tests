export function generateUniqueEmail(prefix: string = 'testuser'): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${prefix}${timestamp}${randomStr}@example.com`;
}

export const FIELD_AREA = 25;
export const STAFF_AGE = 30;
