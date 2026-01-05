import { useState, useEffect, useMemo } from 'react';
import { toISODate, turkishMonths, getWorkouts } from '../utils/storage';
import { WORKOUT_TYPE_META, detectWorkoutType } from '../utils/workoutTypes';

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function CalendarModal({ isOpen, onClose, onSelectDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workoutMetadata, setWorkoutMetadata] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Modal açıldığında verileri yenile
  useEffect(() => {
    if (isOpen) {
      loadWorkouts();
    }
  }, [isOpen, currentMonth]);

  const loadWorkouts = async () => {
    try {
      setIsLoading(true);
      const workouts = await getWorkouts();
      const metadata = {};
      Object.keys(workouts || {}).forEach((iso) => {
        const workout = workouts[iso];
        metadata[iso] = {
          hasWorkout: true,
          type: detectWorkoutType(workout),
        };
      });
      setWorkoutMetadata(metadata);
    } catch (error) {
      console.error('CalendarModal: Workout metadata yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  // Calculate stats for the current view
  const stats = useMemo(() => {
    let total = 0;
    const byType = { push: 0, pull: 0, leg: 0, other: 0 };

    for (let d = 1; d <= daysInMonth; d++) {
      const dateISO = toISODate(new Date(year, month, d));
      const meta = workoutMetadata[dateISO];
      if (meta && meta.hasWorkout) {
        total++;
        if (meta.type && byType[meta.type] !== undefined) {
          byType[meta.type]++;
        } else {
          byType.other++;
        }
      }
    }
    return { total, byType };
  }, [year, month, daysInMonth, workoutMetadata]);

  if (!isOpen) return null;

  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const totalCells = 6 * 7;
  while (days.length < totalCells) {
    days.push(null);
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (day) => {
    const selected = new Date(year, month, day);
    onSelectDate(toISODate(selected));
    onClose();
  };

  // Swipe handlers
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextMonth();
    } else if (isRightSwipe) {
      handlePrevMonth();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-slide-in" onClick={onClose}>
      <div
        className="bg-background-dark border border-gray-700 rounded-2xl p-4 md:p-6 max-w-md w-full shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {turkishMonths[month]} {year}
            </h2>
            <button 
              onClick={handleToday}
              className="text-xs font-medium bg-gray-800 text-gray-400 px-2 py-1 rounded hover:bg-gray-700 hover:text-white transition-colors"
            >
              Bugün
            </button>
          </div>
          <div className="flex gap-1">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-800 active:bg-gray-700 rounded-lg transition text-gray-400 hover:text-white">
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-800 active:bg-gray-700 rounded-lg transition text-gray-400 hover:text-white">
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-4 p-3 bg-gray-800/40 rounded-xl border border-gray-700/50 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-400 font-medium">Aylık Özet</span>
            <span className="text-sm font-bold text-white bg-gray-700/50 px-2 py-0.5 rounded-md">
              {stats.total} Antrenman
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(WORKOUT_TYPE_META).map(([key, meta]) => (
              <div key={key} className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${meta.dotClass}`}></span>
                  <span className="text-xs text-gray-400 font-medium">{meta.label}</span>
                </div>
                <span className="text-lg font-bold text-white leading-none">
                  {stats.byType[key] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 shrink-0">
          {WEEKDAYS.map((day, idx) => (
            <div key={idx} className="text-center text-xs md:text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2 overflow-y-auto">
          {days.map((day, idx) => {
            const isPlaceholder = day === null;

            if (isPlaceholder) {
              return <div key={idx} className="aspect-square" aria-hidden />;
            }

            const dateISO = toISODate(new Date(year, month, day));
            const metadata = workoutMetadata[dateISO];
            const hasWorkout = Boolean(metadata);
            const workoutType = metadata?.type;
            const isToday = dateISO === toISODate(new Date());

            const baseClasses = 'aspect-square rounded-lg flex items-center justify-center text-xs md:text-sm font-medium transition-all border border-transparent relative';

            let colorClasses = 'text-gray-300 hover:bg-gray-800 active:bg-gray-700';
            
            if (isToday) {
              // Today style
              colorClasses = 'bg-primary text-background-dark font-bold hover:bg-primary/90 active:bg-primary/80 shadow-lg shadow-primary/20';
            } else if (workoutType && WORKOUT_TYPE_META[workoutType]) {
              // Workout type style
              colorClasses = `${WORKOUT_TYPE_META[workoutType].buttonClass} hover:opacity-90 active:opacity-80`;
            } else if (hasWorkout) {
              // Generic workout style
              colorClasses = 'bg-gray-700 text-white font-semibold hover:bg-gray-600 active:bg-gray-500';
            }

            return (
              <button
                key={idx}
                onClick={() => handleDayClick(day)}
                className={`${baseClasses} ${colorClasses}`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-4 md:mt-6 w-full py-3 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white rounded-xl font-semibold transition text-sm md:text-base shrink-0"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}