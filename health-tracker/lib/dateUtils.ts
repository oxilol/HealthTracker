
/** Format any Date as YYYY-MM-DD */
export function toLocalDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Today's date as YYYY-MM-DD. */
export function todayLocalStr(): string {
  return toLocalDateStr(new Date());
}

/**
 * Advance (or rewind) a YYYY-MM-DD date string by days
 */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return toLocalDateStr(d);
}

/** Formats YYYY-MM-DD as short week/month/day e.g. 'Mon, Jan 1' */
export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function getMostRecentSaturday(from: Date = new Date()): string {
  const dateObj = new Date(from);
  const diff = (dateObj.getDay() + 1) % 7; // days since last Sat
  dateObj.setDate(dateObj.getDate() - diff);
  return toLocalDateStr(dateObj);
}

export function addWeeks(dateStr: string, numWeeks: number): string {
  const dateObj = new Date(`${dateStr}T12:00:00`);
  dateObj.setDate(dateObj.getDate() + numWeeks * 7);
  return toLocalDateStr(dateObj);
}

export function formatWeekRange(satStr: string): string {
  const sat = new Date(`${satStr}T12:00:00`);
  const fri = new Date(sat);
  fri.setDate(fri.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(sat)} – ${fmt(fri)}`;
}
