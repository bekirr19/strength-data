import { useState, useEffect } from 'react';
import { toISODate, turkishMonths, turkishWeekdaysShort, getWorkouts } from '../utils/storage';
import { WORKOUT_TYPE_META, detectWorkoutType } from '../utils/workoutTypes';

export default function CalendarModal({ isOpen, onClose, onSelectDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workoutMetadata, setWorkoutMetadata] = useState({});

  // Modal açıldığında verileri yenile
  useEffect(() => {
    if (isOpen) {
      const workouts = getWorkouts();
      const metadata = {};
      Object.keys(workouts).forEach((iso) => {
        const workout = workouts[iso];
        metadata[iso] = {
          hasWorkout: true,
          type: detectWorkoutType(workout),
        };
      });
      setWorkoutMetadata(metadata);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

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

  const handleDayClick = (day) => {
    const selected = new Date(year, month, day);
    onSelectDate(toISODate(selected));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-slide-in" onClick={onClose}>
      <div
        className="bg-background-dark border border-gray-700 rounded-2xl p-4 md:p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-800 active:bg-gray-700 rounded-lg transition">
            <span className="material-symbols-outlined text-lg md:text-xl">chevron_left</span>
          </button>
          <h2 className="text-lg md:text-xl font-bold text-white">
            {turkishMonths[month]} {year}
          </h2>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-800 active:bg-gray-700 rounded-lg transition">
            <span className="material-symbols-outlined text-lg md:text-xl">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
          {turkishWeekdaysShort.map((day, idx) => (
            <div key={idx} className="text-center text-xs md:text-sm font-medium text-gray-400">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
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

            const baseClasses = 'aspect-square rounded-lg flex items-center justify-center text-xs md:text-sm font-medium transition-all border border-transparent';

            let colorClasses = 'text-gray-200 hover:bg-gray-700 active:bg-gray-600';
            if (isToday) {
              colorClasses = 'bg-primary text-background-dark font-bold hover:bg-primary/90 active:bg-primary/80';
            } else if (workoutType && WORKOUT_TYPE_META[workoutType]) {
              colorClasses = `${WORKOUT_TYPE_META[workoutType].buttonClass} hover:opacity-95 active:opacity-90`;
            } else if (hasWorkout) {
              colorClasses = 'bg-primary/30 text-primary font-semibold hover:bg-primary/40 active:bg-primary/50';
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

        <div className="mt-4 md:mt-5 flex flex-wrap gap-3 text-xs md:text-sm text-gray-400">
          {Object.entries(WORKOUT_TYPE_META).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${meta.dotClass}`} />
              <span>{meta.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 md:mt-6 w-full py-2.5 md:py-3 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white rounded-lg font-semibold transition text-sm md:text-base"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}