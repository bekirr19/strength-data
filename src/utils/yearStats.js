// ============================================================
// Year in Review — pure stats computation.
// Mirrors the live app's formulas:
//   • Volume      = Σ (reps × resolvedWeight)
//   • 1RM (Epley) = w × (1 + r / 30)
//   • Bodyweight sets ("BW" / "BW+X") resolve from the bodyweight
//     collection with the latest-before-date fallback.
// All functions here are pure (no I/O) so they can be unit-tested.
// ============================================================
import { getExerciseInfo } from './exerciseMetadata';
import { workoutTypeOf } from '../ds/components/data-display/WorkoutTypeBadge';

const BODYWEIGHT_KEYWORDS = ['pull up', 'pull-up', 'chin up', 'chin-up', 'dip', 'dips', 'muscle up', 'muscle-up', 'barfix'];

// ---- bodyweight lookup with latest-before fallback ----
function makeBodyWeightResolver(bodyWeights = {}) {
  const keys = Object.keys(bodyWeights).filter((k) => Number.isFinite(Number(bodyWeights[k]))).sort();
  return (dateISO) => {
    if (Object.prototype.hasOwnProperty.call(bodyWeights, dateISO)) {
      const v = Number(bodyWeights[dateISO]);
      if (Number.isFinite(v) && v > 0) return v;
    }
    let latest = null;
    for (const k of keys) { if (k <= dateISO) latest = k; else break; }
    if (latest == null) return null;
    const v = Number(bodyWeights[latest]);
    return Number.isFinite(v) && v > 0 ? v : null;
  };
}

// ---- resolve a single set's effective weight (kg) ----
function resolveSetWeight(set, dateISO, bwAt) {
  const numeric = Number(set.w);
  const hasNumeric = Number.isFinite(numeric) && numeric > 0;
  const display = typeof set.wDisplay === 'string' ? set.wDisplay.toLowerCase().trim() : '';
  const fallback = bwAt(dateISO);

  if (display.startsWith('bw+')) {
    const m = display.match(/bw\s*\+\s*([\d.,]+)/i);
    const add = m ? parseFloat(m[1].replace(',', '.')) : 0;
    if (Number.isFinite(fallback) && fallback > 0) return fallback + add;
    if (hasNumeric) return numeric;
    return add;
  }
  if (['body weight', 'bodyweight', 'bw'].includes(display)) {
    if (Number.isFinite(fallback) && fallback > 0) return fallback;
    if (hasNumeric) return numeric;
    return 0;
  }
  if (hasNumeric) return numeric;
  if (Number.isFinite(fallback) && fallback > 0) return fallback;
  return 0;
}

const oneRm = (w, r) => {
  const W = Number(w); const R = Number(r);
  if (!Number.isFinite(W) || W <= 0 || !Number.isFinite(R) || R <= 0) return 0;
  return W * (1 + R / 30);
};

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function canonicalOf(item) {
  return (item.canonicalName || item.name || '').trim();
}

// Returns the sorted list of years (numbers) that have at least one workout.
export function availableYears(workouts = {}) {
  const set = new Set();
  Object.values(workouts).forEach((w) => {
    const iso = w && w.dateISO;
    if (typeof iso === 'string' && iso.length >= 4) set.add(Number(iso.slice(0, 4)));
  });
  return [...set].filter((y) => Number.isFinite(y)).sort((a, b) => a - b);
}

/**
 * computeYearStats(workouts, bodyWeights, year)
 * @param {Object} workouts    map keyed by date → { dateISO, items[], workoutFocus[] }
 * @param {Object} bodyWeights map keyed by date → kg
 * @param {number|'all'} year
 */
export function computeYearStats(workouts = {}, bodyWeights = {}, year = 'all') {
  const bwAt = makeBodyWeightResolver(bodyWeights);
  const inYear = (iso) => year === 'all' || (typeof iso === 'string' && iso.slice(0, 4) === String(year));

  const all = Object.values(workouts)
    .filter((w) => w && typeof w.dateISO === 'string' && Array.isArray(w.items))
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));

  const period = all.filter((w) => inYear(w.dateISO));

  if (period.length === 0) {
    return { empty: true, year };
  }

  // ---- aggregates over the selected period ----
  let totalSets = 0, totalReps = 0, totalVolume = 0;
  let heaviest = { weight: 0, exercise: '', dateISO: null };
  const exerciseCounts = {};
  const monthlyCount = Array(12).fill(0);
  const monthlyVolume = Array(12).fill(0);
  const dowCount = Array(7).fill(0);
  const categoryCount = { push: 0, pull: 0, leg: 0, other: 0 };
  const muscleCount = {};
  const workoutTypeCount = {};

  period.forEach((w) => {
    const d = new Date(w.dateISO + 'T00:00:00');
    const mo = d.getMonth();
    const dow = d.getDay();
    monthlyCount[mo] += 1;
    dowCount[dow] += 1;

    const focusSet = new Set();

    (w.items || []).forEach((item) => {
      const name = canonicalOf(item);
      if (!name) return;
      exerciseCounts[name] = (exerciseCounts[name] || 0) + 1;
      const info = getExerciseInfo(name, item);
      const cat = info.category || 'other';
      if (categoryCount[cat] != null) categoryCount[cat] += 1; else categoryCount.other += 1;
      if (cat === 'push' || cat === 'pull' || cat === 'leg') focusSet.add(cat);
      (info.muscles || []).forEach((m) => { muscleCount[m] = (muscleCount[m] || 0) + 1; });

      (item.sets || []).forEach((s) => {
        const r = Number(s.r) || 0;
        if (r <= 0) return;
        const wt = resolveSetWeight(s, w.dateISO, bwAt);
        totalSets += 1;
        totalReps += r;
        totalVolume += r * wt;
        monthlyVolume[mo] += r * wt;
        if (wt > heaviest.weight) heaviest = { weight: wt, exercise: name, dateISO: w.dateISO };
      });
    });

    // workout focus: explicit field if present, else derived from item categories
    let focusArr = Array.isArray(w.workoutFocus) && w.workoutFocus.length
      ? w.workoutFocus.map((f) => String(f).toLowerCase()).filter((f) => ['push', 'pull', 'leg'].includes(f))
      : [...focusSet];
    const typeKey = focusArr.length ? workoutTypeOf(focusArr) : 'other';
    workoutTypeCount[typeKey] = (workoutTypeCount[typeKey] || 0) + 1;
  });

  // ---- favorite exercise & most active month ----
  const sortedExercises = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1]);
  const favorite = sortedExercises[0] ? { name: sortedExercises[0][0], count: sortedExercises[0][1] } : null;
  let bestMonthIdx = -1, bestMonthVal = -1;
  monthlyCount.forEach((c, i) => { if (c > bestMonthVal) { bestMonthVal = c; bestMonthIdx = i; } });
  const mostActiveMonth = bestMonthVal > 0 ? { name: MONTHS_LONG[bestMonthIdx], count: bestMonthVal } : null;

  // ---- PRs: running max 1RM per exercise over ALL history; count events in period ----
  const runningMax = {};        // canonical → best 1RM so far
  const firstInPeriod = {};     // canonical → first 1RM seen inside the period (for gainers)
  const maxBeforePeriod = {};   // canonical → best 1RM strictly before the period
  const maxInPeriod = {};       // canonical → best 1RM within the period
  let prCount = 0;

  all.forEach((w) => {
    const within = inYear(w.dateISO);
    (w.items || []).forEach((item) => {
      const name = canonicalOf(item);
      if (!name) return;
      let sessionPeak = 0;
      (item.sets || []).forEach((s) => {
        const wt = resolveSetWeight(s, w.dateISO, bwAt);
        const e = oneRm(wt, s.r);
        if (e > sessionPeak) sessionPeak = e;
      });
      if (sessionPeak <= 0) return;

      const prev = runningMax[name] || 0;
      // count only genuine PRs — beating a previous best (not the first-ever session)
      if (within && prev > 0 && sessionPeak > prev + 1e-6) prCount += 1;
      if (sessionPeak > prev) runningMax[name] = sessionPeak;

      if (within) {
        if (firstInPeriod[name] == null) firstInPeriod[name] = sessionPeak;
        if (sessionPeak > (maxInPeriod[name] || 0)) maxInPeriod[name] = sessionPeak;
      } else {
        if (sessionPeak > (maxBeforePeriod[name] || 0)) maxBeforePeriod[name] = sessionPeak;
      }
    });
  });

  // ---- top 1RM gainers within the period ----
  const gainers = Object.keys(maxInPeriod).map((name) => {
    const baseline = maxBeforePeriod[name] != null ? maxBeforePeriod[name] : firstInPeriod[name];
    const gain = maxInPeriod[name] - (baseline || 0);
    return { name, gain: Math.round(gain * 10) / 10, best: Math.round(maxInPeriod[name] * 10) / 10 };
  }).filter((g) => g.gain > 0).sort((a, b) => b.gain - a.gain).slice(0, 5);

  // ---- longest streak (consecutive calendar days with a workout) ----
  const days = [...new Set(period.map((w) => w.dateISO))].sort();
  let longestStreak = days.length ? 1 : 0;
  let cur = days.length ? 1 : 0;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1] + 'T00:00:00');
    const now = new Date(days[i] + 'T00:00:00');
    const diff = Math.round((now - prev) / 86400000);
    if (diff === 1) { cur += 1; longestStreak = Math.max(longestStreak, cur); }
    else cur = 1;
  }

  // ---- weekly average ----
  const firstDate = new Date(days[0] + 'T00:00:00');
  const lastDate = new Date(days[days.length - 1] + 'T00:00:00');
  const spanDays = Math.max(1, Math.round((lastDate - firstDate) / 86400000) + 1);
  const weeks = Math.max(1, spanDays / 7);
  const perWeek = Math.round((period.length / weeks) * 10) / 10;

  // ---- best day of week ----
  let bestDowIdx = -1, bestDowVal = -1;
  dowCount.forEach((c, i) => { if (c > bestDowVal) { bestDowVal = c; bestDowIdx = i; } });

  // ---- bodyweight series over period ----
  const bwEntries = Object.entries(bodyWeights)
    .filter(([k, v]) => inYear(k) && Number.isFinite(Number(v)) && Number(v) > 0)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({ date, value: Number(v) }));
  const bodyweight = bwEntries.length
    ? {
        series: bwEntries,
        start: bwEntries[0].value,
        end: bwEntries[bwEntries.length - 1].value,
        change: Math.round((bwEntries[bwEntries.length - 1].value - bwEntries[0].value) * 10) / 10,
        min: Math.min(...bwEntries.map((e) => e.value)),
        max: Math.max(...bwEntries.map((e) => e.value)),
      }
    : null;

  // ---- chart-friendly arrays ----
  const monthly = MONTHS_SHORT.map((name, i) => ({
    name, full: MONTHS_LONG[i], count: monthlyCount[i],
    volume: Math.round(monthlyVolume[i] / 1000), // tonnes
  }));
  const byDow = DOW_SHORT.map((name, i) => ({ name, count: dowCount[i] }));
  const topExercises = sortedExercises.slice(0, 5).map(([name, count]) => ({
    name, count, info: getExerciseInfo(name),
  }));

  return {
    empty: false,
    year,
    totals: {
      workouts: period.length,
      sets: totalSets,
      reps: totalReps,
      volume: Math.round(totalVolume),
      volumeTonnes: Math.round(totalVolume / 1000),
    },
    favorite,
    mostActiveMonth,
    heaviest: heaviest.weight > 0 ? { ...heaviest, weight: Math.round(heaviest.weight * 10) / 10 } : null,
    prCount,
    gainers,
    longestStreak,
    perWeek,
    bestDay: bestDowVal > 0 ? { name: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][bestDowIdx], count: bestDowVal } : null,
    monthly,
    byDow,
    topExercises,
    categoryCount, // category split (push/pull/leg/other)
    muscleCount,
    workoutTypeCount,
    bodyweight,
  };
}
