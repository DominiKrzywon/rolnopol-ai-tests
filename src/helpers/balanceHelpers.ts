export function parseBalance(text: string): number {
  const normalized = text
    .replace(',', '.')
    .replace(/\s/g, '')
    .replace(/[^\d.-]/g, '');

  if (normalized === '') {
    throw new Error('Invalid balance: amount is missing');
  }

  return Number(normalized);
}
