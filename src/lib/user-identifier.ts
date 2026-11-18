export const USER_IDENTIFIER_ERROR = 'شناسه باید عدد صحیح صفر یا مثبت و حداکثر ۲۱۴۷۴۸۳۶۴۷ باشد';

export function parseUserIdentifier(value: string): number | null {
  const normalized = value.trim()
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632));
  if (normalized === '') return null;
  const parsed = Number(normalized);
  return /^\d+$/.test(normalized) && Number.isInteger(parsed) && parsed <= 2147483647
    ? parsed
    : NaN;
}
