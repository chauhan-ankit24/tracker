/** Utilities for working with local calendar days as YYYY-MM-DD strings. */

const pad = (n: number) => String(n).padStart(2, '0');

/** Returns a Date's local calendar day as YYYY-MM-DD. */
export function toDayKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Today's local day key. */
export function todayKey(): string {
  return toDayKey(new Date());
}

/** Parses a YYYY-MM-DD key back into a local Date (midnight). */
export function fromDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Whole days between two day keys (b - a). */
export function daysBetween(a: string, b: string): number {
  const ms = fromDayKey(b).getTime() - fromDayKey(a).getTime();
  return Math.round(ms / 86_400_000);
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** e.g. "5 Jul 2026" */
export function formatDate(key: string): string {
  const d = fromDayKey(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** e.g. "Sun, 5 Jul" */
export function formatDateShort(key: string): string {
  const d = fromDayKey(key);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Friendly label for the Today screen header. */
export function formatToday(): string {
  const d = new Date();
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
