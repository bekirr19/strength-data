import { useState, useRef, useEffect, useCallback } from 'react';
import { toISODate, turkishWeekdaysShort, turkishMonths, getWorkouts, fromISO, formatDateTRFull } from '../utils/storage-client';
import { WORKOUT_TYPE_META, detectWorkoutType } from '../utils/workoutTypes';

const DAYS_VISIBLE = 21;
const HALF_WINDOW = Math.floor(DAYS_VISIBLE / 2);

const computeWindowStart = (iso) => {
  const base = fromISO(iso);
  base.setDate(base.getDate() - HALF_WINDOW);
  return base;
};

const formatRangeLabel = (start, end) => {
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${start.getDate()}-${end.getDate()} ${turkishMonths[start.getMonth()]} ${start.getFullYear()}`;
  }

  if (sameYear) {
    return `${start.getDate()} ${turkishMonths[start.getMonth()]} - ${end.getDate()} ${turkishMonths[end.getMonth()]} ${start.getFullYear()}`;
  }

  return `${start.getDate()} ${turkishMonths[start.getMonth()]} ${start.getFullYear()} - ${end.getDate()} ${turkishMonths[end.getMonth()]} ${end.getFullYear()}`;
};

const getISOWeekNumber = (date) => {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
};

export default function WeekStrip({ selectedDate, onDateSelect, refreshKey }) {
  const [weekStart, setWeekStart] = useState(() => computeWindowStart(selectedDate));
  const [workouts, setWorkouts] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef(null);
  const todayISO = toISODate(new Date());

  // Workouts'u async olarak yükle
  useEffect(() => {
    loadWorkouts();
  }, [refreshKey]);

  const loadWorkouts = async () => {
    try {
      setIsLoading(true);
      const data = await getWorkouts();
      setWorkouts(data || {});
      console.log('WeekStrip: Workouts yüklendi:', Object.keys(data || {}).length, 'gün');
    } catch (error) {
      console.error('WeekStrip: Workouts yüklenirken hata:', error);
      setWorkouts({});
    } finally {
      setIsLoading(false);
    }
  };

  const days = [];
  for (let i = 0; i < DAYS_VISIBLE; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(d);
  }

  const moveSelectionBy = useCallback((delta) => {
    if (!delta) return;

    const next = fromISO(selectedDate);
    next.setDate(next.getDate() + delta);
    const nextISO = toISODate(next);

    const windowStart = new Date(weekStart);
    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowEnd.getDate() + DAYS_VISIBLE - 1);

    if (next < windowStart) {
      setWeekStart((prev) => {
        const updated = new Date(prev);
        updated.setDate(updated.getDate() + delta);
        return updated;
      });
    } else if (next > windowEnd) {
      setWeekStart((prev) => {
        const updated = new Date(prev);
        updated.setDate(updated.getDate() + delta);
        return updated;
      });
    }

    onDateSelect(nextISO);
  }, [onDateSelect, selectedDate, weekStart]);

  const handlePrevDay = () => moveSelectionBy(-1);
  const handleNextDay = () => moveSelectionBy(1);
  // Mobilde doğal kaydırma deneyimi için özel dokunma dinleyicisi yok

  useEffect(() => {
    const selectedDateObj = fromISO(selectedDate);
    const windowStart = new Date(weekStart);
    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowEnd.getDate() + DAYS_VISIBLE - 1);

    if (selectedDateObj < windowStart || selectedDateObj > windowEnd) {
      const adjustedStart = new Date(selectedDateObj);
      adjustedStart.setDate(adjustedStart.getDate() - HALF_WINDOW);
      setWeekStart(() => adjustedStart);
    }
  }, [selectedDate, weekStart]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const target = container.querySelector(`[data-day="${selectedDate}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedDate, weekStart]);

  const rangeStart = new Date(weekStart);
  const rangeEnd = new Date(weekStart);
  rangeEnd.setDate(rangeEnd.getDate() + DAYS_VISIBLE - 1);
  const weekStartNumber = getISOWeekNumber(rangeStart);
  const weekEndNumber = getISOWeekNumber(rangeEnd);
  const weekLabel = weekStartNumber === weekEndNumber
    ? `Hafta ${weekStartNumber}`
    : `Hafta ${weekStartNumber} - ${weekEndNumber}`;
  const selectedDateLabelFull = formatDateTRFull(selectedDate);
  const selectedDateDisplay = selectedDateLabelFull.split(', ')[0] || selectedDateLabelFull;

  return (
    <div className="sticky top-[57px] md:top-[65px] z-10 bg-background-dark/80 backdrop-blur-md border-b border-white/5">
      <div className="px-2 md:px-4 py-3 md:py-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={handlePrevDay}
            className="p-2 md:p-2.5 hover:bg-white/5 active:bg-white/10 rounded-lg transition flex-shrink-0"
            aria-label="Önceki gün"
          >
            <span className="material-symbols-outlined text-gray-200 text-xl md:text-2xl">chevron_left</span>
          </button>

          <div
            ref={containerRef}
            className="flex flex-1 gap-1.5 md:gap-3 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth snap-x snap-mandatory"
          >
            {days.map((d) => {
              const iso = toISODate(d);
              const isSelected = iso === selectedDate;
              const isToday = iso === todayISO;
              const workout = workouts[iso];
              const workoutType = detectWorkoutType(workout);
              const typeMeta = workoutType ? WORKOUT_TYPE_META[workoutType] : null;
              const hasWorkout = Boolean(workout);

              let paletteClasses = 'bg-transparent text-gray-400 hover:bg-white/5 active:bg-white/10 border border-transparent';
              if (typeMeta) {
                paletteClasses = `${typeMeta.buttonClass} hover:brightness-110 active:brightness-125 transition`;
              } else if (hasWorkout) {
                paletteClasses = 'bg-blue-500/10 text-blue-500 font-semibold border border-blue-500/20 hover:bg-blue-500/20 active:bg-blue-500/30';
              }

              if (isSelected) {
                if (typeMeta) {
                  // Seçili gün ve antrenman var: Kendi rengini koru ama seçili olduğunu belli et (parlak border + shadow)
                  paletteClasses = `${typeMeta.buttonClass} ring-2 ring-white/50 shadow-lg shadow-black/50 scale-105 z-10`;
                } else if (hasWorkout) {
                  // Antrenman var ama tipi yok (Generic): Primary tonunu koru
                  paletteClasses = 'bg-blue-500/20 text-blue-500 font-bold border border-blue-500/50 ring-2 ring-white/50 shadow-lg shadow-blue-500/20 scale-105 z-10';
                } else {
                  // Boş gün seçili: Yeşil yapma, nötr gri/beyaz tonlarında seçili olduğunu göster
                  paletteClasses = 'bg-white/10 text-white border border-white/20 ring-2 ring-white/50 shadow-lg shadow-black/50 scale-105 z-10';
                }
              } else if (isToday) {
                paletteClasses += ' ring-1 ring-blue-500/50';
              }

              return (
                <button
                  key={iso}
                  data-day={iso}
                  onClick={() => onDateSelect(iso)}
                  className={`
                    flex min-w-[68px] flex-col items-center justify-center text-center p-2 md:p-2.5 rounded-2xl transition-all border border-transparent min-h-[3.5rem] snap-start relative
                    ${paletteClasses}
                  `}
                >
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide opacity-80">
                    {turkishWeekdaysShort[d.getDay()]}
                  </span>
                  <span className="mt-0.5 md:mt-1 text-lg md:text-xl font-bold">
                    {d.getDate()}
                  </span>
                  {typeMeta && (
                    <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide opacity-90">
                      {typeMeta.label}
                    </span>
                  )}
                  {!typeMeta && hasWorkout && !isSelected && (
                    <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide opacity-90">
                      Workout
                    </span>
                  )}
                  {isSelected && !typeMeta && (
                    <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-background-dark/60"></span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 md:p-2.5 hover:bg-white/5 active:bg-white/10 rounded-lg transition flex-shrink-0"
            aria-label="Sonraki gün"
          >
            <span className="material-symbols-outlined text-gray-200 text-xl md:text-2xl">chevron_right</span>
          </button>

        </div>

        <div className="mt-2 text-center text-[11px] md:text-xs text-gray-400 font-medium">
          <span className="text-blue-500/80">{weekLabel}</span>
          <span className="mx-1 text-gray-600">•</span>
          <span>{selectedDateDisplay}</span>
        </div>
      </div>
    </div>
  );
}