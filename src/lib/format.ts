export const NOT_MEASURED = 'Not measured';

/**
 * Returns 'Not measured' if value is null or undefined; otherwise calls fn.
 */
function withNullGuard<T>(
  value: T | null | undefined,
  formatter: (v: T) => string
): string {
  if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
    return NOT_MEASURED;
  }
  return formatter(value);
}

/**
 * Formats SoH or percentage shares: e.g. 85.4%
 */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  return withNullGuard(value, (v) => `${v.toFixed(decimals)}%`);
}

/**
 * Formats cell/pack voltages to 4 decimal places: e.g. 3.8172 V
 */
export function formatVoltage(value: number | null | undefined, decimals = 4): string {
  return withNullGuard(value, (v) => `${v.toFixed(decimals)} V`);
}

/**
 * Formats resistance to 5 decimal places: e.g. 0.00792 Ω
 */
export function formatResistance(value: number | null | undefined, decimals = 5): string {
  return withNullGuard(value, (v) => `${v.toFixed(decimals)} Ω`);
}

/**
 * Formats millivolts to 2 decimal places: e.g. 64.97 mV
 */
export function formatMillivolts(value: number | null | undefined, decimals = 2): string {
  return withNullGuard(value, (v) => `${v.toFixed(decimals)} mV`);
}

/**
 * Formats temperature to 2 decimal places: e.g. 32.32 °C
 */
export function formatTemperature(value: number | null | undefined, decimals = 2): string {
  return withNullGuard(value, (v) => `${v.toFixed(decimals)} °C`);
}

/**
 * Formats integer counts with locale grouping: e.g. 1,248
 */
export function formatCount(value: number | null | undefined): string {
  return withNullGuard(value, (v) => v.toLocaleString('en-US'));
}

/**
 * Formats pipeline latency in seconds: e.g. 0.42 s
 */
export function formatLatency(value: number | null | undefined, decimals = 2): string {
  return withNullGuard(value, (v) => `${v.toFixed(decimals)} s`);
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Formats date: e.g. '17 May 2026'
 */
export function formatDate(isoString: string | null | undefined): string {
  return withNullGuard(isoString, (s) => {
    const d = new Date(s);
    if (isNaN(d.getTime())) return NOT_MEASURED;
    const day = d.getUTCDate();
    const month = FULL_MONTHS[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    return `${day} ${month} ${year}`;
  });
}

/**
 * Formats time in UTC/local format: e.g. '10:30 AM'
 */
export function formatTime(isoString: string | null | undefined): string {
  return withNullGuard(isoString, (s) => {
    const d = new Date(s);
    if (isNaN(d.getTime())) return NOT_MEASURED;
    let hours = d.getUTCHours();
    const minutes = d.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // hour 0 should be 12
    const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${minStr} ${ampm}`;
  });
}

/**
 * Formats combined date and time: e.g. '17 May 2026, 10:30 AM'
 */
export function formatDateTime(isoString: string | null | undefined): string {
  return withNullGuard(isoString, (s) => {
    const datePart = formatDate(s);
    const timePart = formatTime(s);
    if (datePart === NOT_MEASURED || timePart === NOT_MEASURED) return NOT_MEASURED;
    return `${datePart}, ${timePart}`;
  });
}

/**
 * Formats ISO timestamp in tooltip: e.g. 2026-06-01T09:30:00Z
 */
export function formatShortDateTime(isoString: string | null | undefined): string {
  return withNullGuard(isoString, (s) => {
    const datePart = formatDate(s);
    const timePart = formatTime(s);
    if (datePart === NOT_MEASURED || timePart === NOT_MEASURED) return NOT_MEASURED;
    const d = new Date(s);
    const shortDate = `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    return `${shortDate}, ${timePart}`;
  });
}

export function formatIsoUtc(isoString: string | null | undefined): string {
  return withNullGuard(isoString, (s) => {
    const d = new Date(s);
    if (isNaN(d.getTime())) return NOT_MEASURED;
    return d.toISOString();
  });
}
