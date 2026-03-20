export function generateUniqueEmail(prefix: string = "testuser"): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${prefix}${timestamp}${randomStr}@example.com`;
}
