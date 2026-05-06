/**
 * Currency Utility (Cents Standard)
 * Handling financial values as integers to avoid floating point errors.
 */

/**
 * Converts a decimal value (Real) to cents (Integer)
 * Example: 10.50 -> 1050
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Converts cents (Integer) back to decimal (Real)
 * Example: 1050 -> 10.50
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Formats a numeric value (it can be BRL Real or Cents) to BRL String
 * @param value The value to format
 * @param isCents If true, treats the value as cents first
 */
export function formatBRL(value: number, isCents: boolean = false): string {
  const amount = isCents ? fromCents(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

/**
 * Parse a standard BRL input string (e.g. "1.250,90") to cents
 */
export function parseBRLInputToCents(input: string): number {
  const cleanValue = input.replace(/[^\d]/g, '');
  return parseInt(cleanValue, 10) || 0;
}
