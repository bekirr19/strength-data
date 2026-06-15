/* Shared sample data, helpers, Icon + AreaChart for the Strength Data UI kit.
   Exposed on window for the screen files to consume. */

// ---- Lucide icon helper (icon-node → SVG string, stroke = currentColor) ----
function iconToSvg(node, size = 20, stroke = 2) {
  if (!node || !Array.isArray(node)) return '';
  const [, attrs, children] = node;
  const a = { ...attrs, width: size, height: size, 'stroke-width': stroke };
  const at = Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(' ');
  const kids = (children || []).map(([t, ca]) => `<${t} ${Object.entries(ca).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('');
  return `<svg ${at}>${kids}</svg>`;
}
function Icon({ name, size = 20, stroke = 2, style = {} }) {
  const node = (window.lucide && window.lucide[name]) || null;
  return <span style={{ display: 'inline-flex', alignItems: 'center', ...style }} dangerouslySetInnerHTML={{ __html: iconToSvg(node, size, stroke) }} />;
}

// ---- Category / muscle metadata ----
const CATEGORY = {
  push: { label: 'Push', muscles: 'Chest, Shoulders, Triceps' },
  pull: { label: 'Pull', muscles: 'Back, Biceps' },
  leg: { label: 'Leg', muscles: 'Legs, Glutes' },
  other: { label: 'Other', muscles: 'Core & Support' },
};

// ---- Exercise library (subset of the real app's defaults) ----
const LIBRARY = [
  { name: 'Bench Press', category: 'push', muscles: ['Chest', 'Shoulders', 'Triceps'], records: 117, last: '14 Jun' },
  { name: 'Incline Dumbbell Press', category: 'push', muscles: ['Chest', 'Shoulders'], records: 86, last: '14 Jun' },
  { name: 'Overhead Press', category: 'push', muscles: ['Shoulders', 'Triceps'], records: 98, last: '10 Jun' },
  { name: 'Lateral Raise', category: 'push', muscles: ['Shoulders'], records: 83, last: '14 Jun' },
  { name: 'Triceps Pushdown', category: 'push', muscles: ['Triceps'], records: 43, last: '07 Jun' },
  { name: 'Chest Fly', category: 'push', muscles: ['Chest'], records: 90, last: '14 Jun' },
  { name: 'Lat Pulldown', category: 'pull', muscles: ['Back', 'Lats', 'Biceps'], records: 91, last: '12 Jun' },
  { name: 'Cable Row', category: 'pull', muscles: ['Back', 'Biceps'], records: 77, last: '12 Jun' },
  { name: 'Pull Up', category: 'pull', muscles: ['Back', 'Lats', 'Biceps'], records: 38, last: '12 Jun' },
  { name: 'Barbell Curl', category: 'pull', muscles: ['Biceps'], records: 46, last: '12 Jun' },
  { name: 'Squat', category: 'leg', muscles: ['Legs', 'Quads', 'Glutes'], records: 11, last: '09 Jun' },
  { name: 'Romanian Deadlift', category: 'leg', muscles: ['Hamstrings', 'Glutes'], records: 10, last: '09 Jun' },
  { name: 'Leg Press', category: 'leg', muscles: ['Legs', 'Glutes'], records: 8, last: '09 Jun' },
  { name: 'Hip Thrust', category: 'leg', muscles: ['Glutes', 'Hamstrings'], records: 9, last: '09 Jun' },
  { name: 'Plank', category: 'other', muscles: ['Core'], records: 4, last: '05 Jun' },
];

// ---- Week strip days (around Mon 15 Jun 2026) ----
const WEEK = [
  { iso: '2026-06-08', wd: 'Mon', d: 8, category: 'push' },
  { iso: '2026-06-09', wd: 'Tue', d: 9, category: 'leg', caption: 'Leg' },
  { iso: '2026-06-10', wd: 'Wed', d: 10, category: 'push' },
  { iso: '2026-06-11', wd: 'Thu', d: 11, category: null },
  { iso: '2026-06-12', wd: 'Fri', d: 12, category: 'pull' },
  { iso: '2026-06-13', wd: 'Sat', d: 13, category: null },
  { iso: '2026-06-14', wd: 'Sun', d: 14, category: 'push' },
  { iso: '2026-06-15', wd: 'Mon', d: 15, category: 'push' },
];

// ---- Today's workout ----
const TODAY_WORKOUT = {
  date: '2026-06-15',
  weekday: 'Monday',
  dateLabel: 'June 15',
  category: 'push',
  bodyWeight: 78.5,
  fuel: 'Oats, banana & whey — 40 min before.',
  notes: 'Felt strong on press. Push for 102.5kg next week.',
  items: [
    { name: 'Bench Press', sets: [{ r: 12, w: 80 }, { r: 10, w: 90 }, { r: 6, w: 100, pr: 'new' }] },
    { name: 'Overhead Press', sets: [{ r: 12, w: 45 }, { r: 10, w: 50 }, { r: 8, w: 55 }] },
    { name: 'Incline Dumbbell Press', sets: [{ r: 12, w: 24 }, { r: 12, w: 26 }, { r: 10, w: 28 }] },
    { name: 'Lateral Raise', sets: [{ r: 15, w: 12 }, { r: 15, w: 12 }, { r: 12, w: 14 }] },
    { name: 'Triceps Pushdown', sets: [{ r: 15, w: 60 }, { r: 12, w: 66 }] },
  ],
};

// ---- Exercise detail: Bench Press progress ----
const BENCH_DETAIL = {
  name: 'Bench Press',
  muscles: 'Chest, Shoulders, Triceps',
  best: { value: 100, date: '15 Jun 2026' },
  trend: 4,
  // chronological sessions (oldest → newest)
  chart: {
    weight: [80, 82.5, 85, 85, 90, 90, 95, 95, 100],
    oneRm: [101, 104, 107, 106, 112, 114, 119, 118, 124],
    volume: [3200, 3380, 3500, 3460, 3900, 3950, 4180, 4120, 4320],
    labels: ['4/4', '11/4', '18/4', '2/5', '16/5', '23/5', '4/6', '10/6', '15/6'],
  },
  history: [
    { date: 'Mon 15 Jun', volume: 4320, sets: [{ w: 80, r: 12 }, { w: 90, r: 10 }, { w: 100, r: 6, pr: 'new' }] },
    { date: 'Wed 10 Jun', volume: 4180, sets: [{ w: 80, r: 12 }, { w: 90, r: 9 }, { w: 95, r: 6 }] },
    { date: 'Wed 04 Jun', volume: 3950, sets: [{ w: 75, r: 12 }, { w: 85, r: 10 }, { w: 95, r: 5 }] },
    { date: 'Fri 23 May', volume: 3900, sets: [{ w: 75, r: 12 }, { w: 85, r: 10 }, { w: 90, r: 6 }] },
    { date: 'Fri 16 May', volume: 3460, sets: [{ w: 70, r: 12 }, { w: 80, r: 10 }, { w: 90, r: 4, pr: 'tied' }] },
  ],
};

const USER = { name: 'Ahmet Yılmaz', email: 'ahmet@example.com' };

Object.assign(window, { Icon, CATEGORY, LIBRARY, WEEK, TODAY_WORKOUT, BENCH_DETAIL, USER });
