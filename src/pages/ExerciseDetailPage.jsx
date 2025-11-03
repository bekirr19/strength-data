import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWorkouts, getExercises, formatDateTRFull, fromISO, normalizeExerciseName, turkishMonths } from '../utils/storage';
import { Area, AreaChart, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export default function ExerciseDetailPage() {
  const navigate = useNavigate();
  const { exerciseName } = useParams();
  const decodedName = decodeURIComponent(exerciseName);
  const canonicalName = normalizeExerciseName(decodedName) || decodedName;
  
  const [exercises, setExercises] = useState([]);
  const [workouts, setWorkouts] = useState({});
  const [timeRange, setTimeRange] = useState('monthly');
  const [monthSelection, setMonthSelection] = useState('rolling');

  useEffect(() => {
    const fetchData = async () => {
      const [exercisesData, workoutsData] = await Promise.all([getExercises(), getWorkouts()]);
      setExercises(exercisesData);
      setWorkouts(workoutsData);
    };
    fetchData();
  }, []);

  const matchedExercise = exercises.find((exercise) => {
    const key = (exercise.canonicalName || normalizeExerciseName(exercise.name)).toLowerCase();
    return key === canonicalName.toLowerCase();
  });
  const displayName = matchedExercise?.displayName || decodedName;
  
  const history = [];
  let pr = 0;

  const now = new Date();
  const focusYear = 2025;
  const startOfYear = new Date(focusYear, 0, 1);

  const isBenchPressView = canonicalName.toLowerCase() === normalizeExerciseName('Bench Press').toLowerCase();

  const estimateOneRepMax = (weight, reps) => {
    const w = Number(weight);
    const r = Number(reps);
    if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(r) || r <= 0) {
      return 0;
    }
    return Number((w * (1 + r / 30)).toFixed(1));
  };

  Object.keys(workouts).forEach((iso) => {
    const w = workouts[iso];
    const when = fromISO(iso);
    const entry = w.items.find((it) => {
      const canonical = it.canonicalName || normalizeExerciseName(it.name);
      return canonical.toLowerCase() === canonicalName.toLowerCase();
    });

    if (entry) {
      const maxWeight = Math.max(...entry.sets.map((s) => Number(s.w || 0)));
      const oneRmValues = entry.sets
        .map((s) => estimateOneRepMax(s.w, s.r))
        .filter((val) => Number.isFinite(val) && val > 0);
      const sessionPeakOneRm = oneRmValues.length > 0 ? Math.max(...oneRmValues) : 0;
      const sessionTotalOneRm = oneRmValues.reduce((acc, val) => acc + val, 0);
      const totalVolume = entry.sets.reduce((acc, s) => {
        const weight = Number(s.w || 0);
        const reps = Number(s.r || 0);
        if (isBenchPressView) {
          return acc + estimateOneRepMax(weight, reps);
        }
        if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(reps) || reps <= 0) {
          return acc;
        }
        return acc + weight * reps;
      }, 0);

      pr = Math.max(pr, maxWeight);

      history.push({
        iso,
        when,
        maxWeight,
        totalVolume,
        peakOneRm: sessionPeakOneRm,
        totalOneRm: sessionTotalOneRm,
        text: entry.sets
          .map((s, i) => {
            const weightValue = Number(s.w || 0);
            const weightLabel = s.wDisplay ? s.wDisplay : (Number.isFinite(weightValue) && weightValue > 0 ? `${weightValue} kg` : '—');
            const estimated = estimateOneRepMax(weightValue, Number(s.r || 0));
            return `Set ${i + 1}: ${s.r} tekrar @ ${weightLabel}${estimated > 0 ? ` (1RM≈${estimated} kg)` : ''}`;
          })
          .join('<br/>'),
      });
    }
  });

  history.sort((a, b) => a.when - b.when);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIdx) => {
      const start = new Date(focusYear, monthIdx, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(focusYear, monthIdx + 1, 0);
      end.setHours(23, 59, 59, 999);

      return {
        key: `${focusYear}-${String(monthIdx + 1).padStart(2, '0')}`,
        label: turkishMonths[monthIdx],
        shortLabel: turkishMonths[monthIdx],
        start,
        end,
      };
    });
  }, [focusYear]);

  let filteredHistory = history;
  let rangeLabel = '';

  if (monthSelection !== 'rolling') {
    const selectedMonth = monthOptions.find((opt) => opt.key === monthSelection);
    if (selectedMonth) {
      filteredHistory = history.filter((h) => h.when >= selectedMonth.start && h.when <= selectedMonth.end);
  rangeLabel = selectedMonth.label;
    } else {
      filteredHistory = [];
      rangeLabel = 'Seçili ay verisi yok';
    }
  } else if (timeRange === 'weekly') {
    const ms7 = 7 * 24 * 3600 * 1000;
    filteredHistory = history.filter((h) => (now - h.when) <= ms7);
    rangeLabel = 'Son 7 gün';
  } else if (timeRange === 'monthly') {
    const ms30 = 30 * 24 * 3600 * 1000;
    filteredHistory = history.filter((h) => (now - h.when) <= ms30);
    rangeLabel = 'Son 30 gün';
  } else if (timeRange === 'yearly') {
    const currentYearHistory = history.filter((h) => h.when >= startOfYear);
    if (currentYearHistory.length > 0) {
      filteredHistory = currentYearHistory;
      rangeLabel = `Bu yıl (${now.getFullYear()})`;
    } else {
      filteredHistory = history;
      rangeLabel = 'Tüm zamanlar';
    }
  } else {
    rangeLabel = 'Tüm zamanlar';
  }

  const weightChartData = filteredHistory.map(h => ({
    date: h.iso,
    label: new Date(h.iso).getDate() + '/' + (new Date(h.iso).getMonth() + 1),
    weight: h.maxWeight,
  }));

  const oneRmChartData = filteredHistory.map(h => ({
    date: h.iso,
    label: new Date(h.iso).getDate() + '/' + (new Date(h.iso).getMonth() + 1),
    oneRm: Number(Number(h.totalOneRm || 0).toFixed(1)),
  }));

  const volumeChartData = filteredHistory.map(h => ({
    date: h.iso,
    label: new Date(h.iso).getDate() + '/' + (new Date(h.iso).getMonth() + 1),
    volume: Number(isBenchPressView ? Number(h.totalVolume.toFixed(1)) : Math.round(h.totalVolume)),
  }));

  const currentPR = filteredHistory.length > 0 ? Math.max(...filteredHistory.map(h => h.maxWeight)) : 0;
  const currentVolume = filteredHistory.reduce((acc, h) => acc + h.totalVolume, 0);
  const formattedCurrentVolume = Number.isFinite(currentVolume)
    ? (isBenchPressView ? Number(currentVolume.toFixed(1)) : Math.round(currentVolume))
    : 0;
  const highestOneRm = filteredHistory.length > 0 ? Math.max(...filteredHistory.map((h) => h.peakOneRm || 0)) : 0;
  const totalOneRmSum = filteredHistory.reduce((acc, h) => acc + (h.totalOneRm || 0), 0);
  const formattedTotalOneRm = Number.isFinite(totalOneRmSum) ? Number(totalOneRmSum.toFixed(1)) : 0;

  const calculateFirstToLastDelta = (entries, valueSelector) => {
    if (!entries || entries.length < 2) {
      return null;
    }

    const firstValue = Number(valueSelector(entries[0]) || 0);
    const lastValue = Number(valueSelector(entries[entries.length - 1]) || 0);

    if (!Number.isFinite(firstValue) || !Number.isFinite(lastValue) || firstValue <= 0) {
      return null;
    }

    const change = ((lastValue - firstValue) / firstValue) * 100;
    return Number.isFinite(change) ? Number(change.toFixed(1)) : null;
  };

  const calculateFirstToMaxDelta = (entries, valueSelector) => {
    if (!entries || entries.length < 2) {
      return null;
    }

    const firstValue = Number(valueSelector(entries[0]) || 0);
    if (!Number.isFinite(firstValue) || firstValue <= 0) {
      return null;
    }

    const maxValue = entries.reduce((max, entry) => {
      const v = Number(valueSelector(entry) || 0);
      return Number.isFinite(v) && v > max ? v : max;
    }, 0);

    if (maxValue <= 0) {
      return null;
    }

    const change = ((maxValue - firstValue) / firstValue) * 100;
    return Number.isFinite(change) ? Number(change.toFixed(1)) : null;
  };

  const prDelta = calculateFirstToMaxDelta(filteredHistory, (entry) => entry.maxWeight);
  const volumeDelta = calculateFirstToLastDelta(filteredHistory, (entry) => entry.totalVolume);
  const oneRmDelta = calculateFirstToLastDelta(filteredHistory, (entry) => entry.totalOneRm);

  const createTooltip = (suffix) => ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const rawValue = payload[0].value;
    const value = Number.isFinite(rawValue) ? rawValue : Number(rawValue);
    return (
      <div className="bg-background-dark border border-primary/30 rounded-lg p-2 shadow-lg">
        <p className="text-white text-xs md:text-sm font-semibold">{label}</p>
        <p className="text-primary text-xs md:text-sm">{value} {suffix}</p>
      </div>
    );
  };

  const weightTooltip = createTooltip('kg');
  const oneRmTooltip = createTooltip('kg (toplam 1RM)');
  const volumeTooltip = createTooltip(isBenchPressView ? 'kg (1RM toplamı)' : 'kg');

  if (!rangeLabel) {
    rangeLabel = 'Tüm zamanlar';
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark">
      <div className="flex items-center bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-gray-700/50 backdrop-blur-sm">
        <button
          onClick={() => navigate(-1)}
          className="text-white flex size-10 md:size-12 shrink-0 items-center justify-center -ml-2 md:-ml-3 hover:bg-gray-700 active:bg-gray-600 rounded-lg transition"
        >
          <span className="material-symbols-outlined text-xl md:text-2xl">arrow_back</span>
        </button>
        <h1 className="text-white text-base md:text-lg font-bold leading-tight flex-1 text-center px-2 truncate">
          {displayName}
        </h1>
        <div className="size-10 md:size-12"></div>
      </div>

      <div className="flex px-4 py-3 max-w-4xl mx-auto w-full">
        <div className="flex h-9 md:h-10 flex-1 items-center justify-center rounded-lg bg-white/5 p-1">
          <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 md:px-3 has-[:checked]:bg-white dark:has-[:checked]:bg-[#1d382c] has-[:checked]:shadow text-slate-400 text-xs md:text-sm font-medium transition">
            <span>Haftalık</span>
            <input
              className="invisible w-0"
              name="time-range"
              type="radio"
              checked={timeRange === 'weekly'}
              onChange={() => setTimeRange('weekly')}
            />
          </label>
          <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 md:px-3 has-[:checked]:bg-white dark:has-[:checked]:bg-[#1d382c] has-[:checked]:shadow text-slate-400 text-xs md:text-sm font-medium transition">
            <span>Aylık</span>
            <input
              className="invisible w-0"
              name="time-range"
              type="radio"
              checked={timeRange === 'monthly'}
              onChange={() => setTimeRange('monthly')}
            />
          </label>
          <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 md:px-3 has-[:checked]:bg-white dark:has-[:checked]:bg-[#1d382c] has-[:checked]:shadow text-slate-400 text-xs md:text-sm font-medium transition">
            <span>Yıllık</span>
            <input
              className="invisible w-0"
              name="time-range"
              type="radio"
              checked={timeRange === 'yearly'}
              onChange={() => setTimeRange('yearly')}
            />
          </label>
        </div>
      </div>

      {timeRange === 'yearly' && (
        <div className="flex px-4 pb-2 md:pb-3 max-w-4xl mx-auto w-full">
          <div className="flex w-full flex-wrap items-center justify-center gap-1 md:gap-2 rounded-lg bg-white/5 p-1">
            <button
              onClick={() => setMonthSelection('rolling')}
              className={`flex-1 min-w-[4.5rem] px-3 py-1.5 text-center text-xs md:text-sm rounded-full border transition ${monthSelection === 'rolling' ? 'bg-primary text-background-dark border-primary' : 'bg-gray-900/60 text-gray-200 border-gray-700 hover:border-primary/60 hover:text-primary'}`}
            >
              Son 1 Ay
            </button>
            {monthOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setMonthSelection(opt.key)}
                className={`flex-1 min-w-[4.5rem] px-3 py-1.5 text-center text-xs md:text-sm rounded-full border transition ${monthSelection === opt.key ? 'bg-primary/80 text-background-dark border-primary' : 'bg-gray-900/60 text-gray-200 border-gray-700 hover:border-primary/60 hover:text-primary'}`}
              >
                {opt.shortLabel}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 md:gap-4 px-4 py-2 md:py-3 pb-24 md:pb-8 max-w-4xl mx-auto w-full">
        {/* Maksimum Ağırlık */}
        <div className="flex flex-col gap-2 rounded-xl bg-white/5 p-4 md:p-5">
          <p className="text-white text-sm md:text-base font-medium">Maksimum Ağırlık (kg)</p>
          <p className="text-white tracking-tight text-2xl md:text-[32px] font-bold">
            {currentPR ? `${currentPR} kg` : '—'}
          </p>
          <div className="flex gap-2 items-center flex-wrap">
            <p className="text-slate-400 text-xs md:text-sm">{rangeLabel}</p>
            {prDelta !== null && Number(prDelta) !== 0 && (
              <div className={`flex items-center gap-1 text-xs md:text-sm font-medium ${Number(prDelta) > 0 ? 'text-primary' : 'text-red-400'}`}>
                <span className="material-symbols-outlined text-sm md:text-base">
                  {Number(prDelta) > 0 ? 'trending_up' : 'trending_down'}
                </span>
                <span>{prDelta > 0 ? '+' : ''}{prDelta}%</span>
              </div>
            )}
          </div>

          {weightChartData.length > 0 ? (
            <div className="h-32 md:h-40 mt-2 md:mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightChartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0df293" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0df293" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis
                    dataKey="label"
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickLine={false}
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip content={weightTooltip} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#0df293"
                    strokeWidth={2}
                    fill="url(#colorWeight)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-32 md:h-40 mt-2 md:mt-4 flex items-center justify-center text-gray-500 text-xs md:text-sm">
              Bu dönemde veri yok
            </div>
          )}
        </div>

        {/* Tahmini 1RM */}
        <div className="flex flex-col gap-2 rounded-xl bg-white/5 p-4 md:p-5">
          <p className="text-white text-sm md:text-base font-medium">Toplam Tahmini 1RM (kg)</p>
          <p className="text-white tracking-tight text-2xl md:text-[32px] font-bold">
            {formattedTotalOneRm ? `${formattedTotalOneRm} kg` : '—'}
          </p>
          <p className="text-slate-400 text-xs md:text-sm">En yüksek 1RM: {highestOneRm ? `${Number(highestOneRm.toFixed(1))} kg` : '—'}</p>
          <div className="flex gap-2 items-center flex-wrap">
            <p className="text-slate-400 text-xs md:text-sm">{rangeLabel}</p>
            {oneRmDelta !== null && Number(oneRmDelta) !== 0 && (
              <div className={`flex items-center gap-1 text-xs md:text-sm font-medium ${Number(oneRmDelta) > 0 ? 'text-primary' : 'text-red-400'}`}>
                <span className="material-symbols-outlined text-sm md:text-base">
                  {Number(oneRmDelta) > 0 ? 'trending_up' : 'trending_down'}
                </span>
                <span>{oneRmDelta > 0 ? '+' : ''}{oneRmDelta}%</span>
              </div>
            )}
          </div>

          {oneRmChartData.length > 0 ? (
            <div className="h-32 md:h-40 mt-2 md:mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={oneRmChartData}>
                  <defs>
                    <linearGradient id="colorOneRm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis
                    dataKey="label"
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickLine={false}
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip content={oneRmTooltip} />
                  <Area
                    type="monotone"
                    dataKey="oneRm"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    fill="url(#colorOneRm)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-32 md:h-40 mt-2 md:mt-4 flex items-center justify-center text-gray-500 text-xs md:text-sm">
              Bu dönemde veri yok
            </div>
          )}
        </div>

        {/* Toplam Tonaj */}
        <div className="flex flex-col gap-2 rounded-xl bg-white/5 p-4 md:p-5">
          <p className="text-white text-sm md:text-base font-medium">
            Toplam {isBenchPressView ? 'Tahmini 1RM Toplamı' : 'Tonaj'} (kg)
          </p>
          <p className="text-white tracking-tight text-2xl md:text-[32px] font-bold">
            {formattedCurrentVolume} kg
          </p>
          <div className="flex gap-2 items-center flex-wrap">
            <p className="text-slate-400 text-xs md:text-sm">{rangeLabel}</p>
            {volumeDelta !== null && Number(volumeDelta) !== 0 && (
              <div className={`flex items-center gap-1 text-xs md:text-sm font-medium ${Number(volumeDelta) > 0 ? 'text-primary' : 'text-red-400'}`}>
                <span className="material-symbols-outlined text-sm md:text-base">
                  {Number(volumeDelta) > 0 ? 'trending_up' : 'trending_down'}
                </span>
                <span>{volumeDelta > 0 ? '+' : ''}{volumeDelta}%</span>
              </div>
            )}
          </div>

          {volumeChartData.length > 0 ? (
            <div className="h-32 md:h-40 mt-2 md:mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeChartData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0df293" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0df293" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis
                    dataKey="label"
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickLine={false}
                  />
                  <Tooltip content={volumeTooltip} />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#0df293"
                    strokeWidth={2}
                    fill="url(#colorVolume)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-32 md:h-40 mt-2 md:mt-4 flex items-center justify-center text-gray-500 text-xs md:text-sm">
              Bu dönemde veri yok
            </div>
          )}
        </div>
      </div>

      <h2 className="text-white text-base md:text-lg font-bold px-4 pb-2 pt-4 max-w-4xl mx-auto w-full">Antrenman Geçmişi</h2>
      <div className="flex flex-col pb-24 md:pb-8 max-w-4xl mx-auto w-full">
        {history.length > 0 ? (
          history.reverse().map((h, idx) => {
            const isPR = h.maxWeight === pr;
            return (
              <div
                key={idx}
                className="flex flex-col gap-2 px-4 py-3 md:py-4 border-b border-white/5"
              >
                <p className="text-white text-sm md:text-base font-medium">
                  {formatDateTRFull(h.iso)}
                  {isPR && <span className="text-[10px] md:text-xs text-primary font-semibold ml-2 align-middle">PR!</span>}
                </p>
                <p
                  className="text-slate-400 text-xs md:text-sm"
                  dangerouslySetInnerHTML={{ __html: h.text }}
                />
              </div>
            );
          })
        ) : (
          <div className="px-4 py-6 text-slate-400 text-center text-sm md:text-base">Bu egzersiz için henüz kayıt yok.</div>
        )}
      </div>
    </div>
  );
}
