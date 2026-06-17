// English date helpers for the light-theme UI.
// Locale-agnostic toISODate/fromISO still live in storage-client; these only
// cover display formatting that was previously Turkish.

export const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const toDate = (value) => {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }
  return new Date(value);
};

// "Mon 15 Jun"
export function formatDateEN(value) {
  const d = toDate(value);
  return `${WEEKDAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

// "Monday, 15 June 2026"
export function formatDateLongEN(value) {
  const d = toDate(value);
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

// "15 Jun"
export function formatDateShortEN(value) {
  const d = toDate(value);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}
