import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { toISODate, turkishWeekdaysShort, turkishMonths, getWorkouts, fromISO } from '../utils/storage';
import { WORKOUT_TYPE_META, detectWorkoutType } from '../utils/workoutTypes';

const DAYS_VISIBLE = 14;

const computeWindowStart = (iso) => {
  const base = fromISO(iso);
  base.setDate(base.getDate() - (DAYS_VISIBLE - 1));
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

export default function WeekStrip({ selectedDate, onDateSelect }) {
  const [weekStart, setWeekStart] = useState(() => computeWindowStart(selectedDate));

  const containerRef = useRef(null);
  const todayISO = toISODate(new Date());
  const workouts = useMemo(() => getWorkouts(), []);

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
  const handleGoToday = () => {
    if (selectedDate !== todayISO) {
      setWeekStart(computeWindowStart(todayISO));
    }
    onDateSelect(todayISO);
  };

  // Touch swipe işlemleri
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startX = 0;
    let isDragging = false;

    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    };

    const onTouchEnd = (e) => {
      if (!isDragging) return;
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          moveSelectionBy(1);
        } else {
          moveSelectionBy(-1);
        }
      }
      isDragging = false;
    };

    container.addEventListener('touchstart', onTouchStart);
    container.addEventListener('touchend', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [moveSelectionBy]);

  useEffect(() => {
    const selectedDateObj = fromISO(selectedDate);
    const windowStart = new Date(weekStart);
    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowEnd.getDate() + DAYS_VISIBLE - 1);

    if (selectedDateObj < windowStart) {
      setWeekStart(() => new Date(selectedDateObj));
    } else if (selectedDateObj > windowEnd) {
      const adjustedStart = new Date(selectedDateObj);
      adjustedStart.setDate(adjustedStart.getDate() - (DAYS_VISIBLE - 1));
      setWeekStart(() => adjustedStart);
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
  const rangeLabel = formatRangeLabel(rangeStart, rangeEnd);

  return (
    <div className="sticky top-[57px] md:top-[65px] z-10 bg-background-dark/95 backdrop-blur-sm border-b border-gray-700/50">
      <div className="px-2 md:px-4 py-3 md:py-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={handlePrevDay}
            className="p-1 md:p-1.5 hover:bg-gray-700 active:bg-gray-600 rounded-lg transition flex-shrink-0"
            aria-label="Önceki gün"
          >
            <span className="material-symbols-outlined text-gray-400 text-lg md:text-xl">chevron_left</span>
          </button>

          <div ref={containerRef} className="grid grid-cols-7 gap-1.5 md:gap-3 flex-1 py-1">
            {days.map((d) => {
              const iso = toISODate(d);
              const isSelected = iso === selectedDate;
              const isToday = iso === todayISO;
              const workout = workouts[iso];
              const workoutType = detectWorkoutType(workout);
              const typeMeta = workoutType ? WORKOUT_TYPE_META[workoutType] : null;
              const hasWorkout = Boolean(workout);

              let paletteClasses = 'bg-transparent text-gray-300 hover:bg-gray-800 active:bg-gray-700';
              if (typeMeta) {
                paletteClasses = `${typeMeta.buttonClass} hover:opacity-95 active:opacity-90`;
              } else if (hasWorkout) {
                paletteClasses = 'bg-primary/30 text-primary font-semibold hover:bg-primary/40 active:bg-primary/50';
              }

              if (isSelected) {
                paletteClasses = 'bg-primary text-background-dark hover:bg-primary/90 active:bg-primary/80 ring-2 ring-white/80 scale-105';
              } else if (isToday) {
                paletteClasses += ' ring-1 ring-primary/50';
              }

              return (
                <button
                  key={iso}
                  onClick={() => onDateSelect(iso)}
                  className={`
                    flex flex-col items-center justify-center text-center p-2 md:p-2.5 rounded-lg transition-all border border-transparent min-h-[3.5rem]
                    ${paletteClasses}
                  `}
                >
                  <span className="text-[10px] md:text-xs font-medium uppercase tracking-wide">
                    {turkishWeekdaysShort[d.getDay()]}
                  </span>
                  <span className="mt-0.5 md:mt-1 text-base md:text-lg font-semibold">
                    {d.getDate()}
                  </span>
                  {typeMeta && (
                    <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-80">
                      {typeMeta.label.split(' ')[0]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextDay}
            className="p-1 md:p-1.5 hover:bg-gray-700 active:bg-gray-600 rounded-lg transition flex-shrink-0"
            aria-label="Sonraki gün"
          >
            <span className="material-symbols-outlined text-gray-400 text-lg md:text-xl">chevron_right</span>
          </button>

          <button
            onClick={handleGoToday}
            className="p-1 md:p-1.5 hover:bg-primary/20 active:bg-primary/30 rounded-lg transition flex-shrink-0"
            aria-label="Bugüne git"
            title="Bugüne git"
          >
            <span className="material-symbols-outlined text-primary text-lg md:text-xl">today</span>
          </button>
        </div>

        <div className="mt-2 text-center text-[11px] md:text-xs text-gray-400 font-medium">
          <span className="text-primary/80">{weekLabel}</span>
          <span className="mx-1 text-gray-600">•</span>
          <span>{rangeLabel}</span>
        </div>
      </div>
    </div>
  );
}