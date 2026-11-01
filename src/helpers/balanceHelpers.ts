export function parseBalance(text: string): number {
  return Number(
    text
      .replace(',', '.')
      .replace(/\s/g, '')
      .replace(/[^\d.-]/g, ''),
  );
}
