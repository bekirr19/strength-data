import { useState, useEffect, useMemo } from 'react';
import { toISODate, turkishMonths, getWorkouts, formatDateTRFull } from '../utils/storage-client';
import { WORKOUT_TYPE_META, detectWorkoutType } from '../utils/workoutTypes';

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function CalendarModal({ isOpen, onClose, onSelectDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [allWorkouts, setAllWorkouts] = useState({});
  const [selectedPreviewDate, setSelectedPreviewDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Modal açıldığında verileri yenile
  useEffect(() => {
    if (isOpen) {
      loadWorkouts();
      setSelectedPreviewDate(null);
    }
  }, [isOpen]);

  const loadWorkouts = async () => {
    try {
      setIsLoading(true);
      const workouts = await getWorkouts();
      setAllWorkouts(workouts || {});
    } catch (error) {
      console.error('CalendarModal: Workout verileri yüklenirken hata:', error);
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
      const workout = allWorkouts[dateISO];
      if (workout) {
        total++;
        const type = detectWorkoutType(workout);
        if (type && byType[type] !== undefined) {
          byType[type]++;
        } else {
          byType.other++;
        }
      }
    }
    return { total, byType };
  }, [year, month, daysInMonth, allWorkouts]);

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
    const iso = toISODate(selected);
    setSelectedPreviewDate(iso);
  };

  const handleGoToDetail = () => {
    if (selectedPreviewDate) {
      onSelectDate(selectedPreviewDate);
      onClose();
    }
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md sm:p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-[#1C1C1E] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-4 md:p-6 w-full sm:max-w-md shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] animate-slide-up"
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
              className="text-xs font-bold bg-[#2C2C2E] text-gray-400 px-3 py-1.5 rounded-full hover:bg-[#3A3A3C] hover:text-white transition-colors"
            >
              Bugün
            </button>
          </div>
          <div className="flex gap-1">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-[#2C2C2E] active:bg-[#3A3A3C] rounded-lg transition text-[#48484A] hover:text-white">
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-[#2C2C2E] active:bg-[#3A3A3C] rounded-lg transition text-[#48484A] hover:text-white">
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-4 p-3 bg-white/5 rounded-2xl border border-white/5 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-[#8E8E93] font-medium">Aylık Özet</span>
            <span className="text-sm font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">
              {stats.total} Antrenman
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(WORKOUT_TYPE_META)
              .filter(([key]) => stats.byType[key] > 0)
              .map(([key, meta]) => (
              <div key={key} className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#2C2C2E] border border-white/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${meta.dotClass}`}></span>
                  <span className="text-xs text-[#8E8E93] font-medium">{meta.label}</span>
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
            <div key={idx} className="text-center text-xs md:text-sm font-bold text-[#8E8E93]">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2 overflow-y-auto pb-safe">
          {days.map((day, idx) => {
            const isPlaceholder = day === null;

            if (isPlaceholder) {
              return <div key={idx} className="aspect-square" aria-hidden />;
            }

            const dateISO = toISODate(new Date(year, month, day));
            const workout = allWorkouts[dateISO];
            const hasWorkout = Boolean(workout);
            const workoutType = workout ? detectWorkoutType(workout) : null;
            const isToday = dateISO === toISODate(new Date());

            // Base classes for the cell
            const baseClasses = 'aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all border border-transparent relative';
            
            // Text Color & Background
            let cellClasses = 'text-[#8E8E93] hover:bg-[#2C2C2E] active:bg-[#3A3A3C]';
            
            if (isToday) {
               // Today: Highlight background slightly or use Primary text
               cellClasses = 'bg-primary text-black font-bold border-primary shadow-[0_0_10px_rgba(59,130,246,0.3)]';
            } else if (toISODate(new Date(year, month, day)) === selectedPreviewDate) {
               cellClasses = 'bg-white/10 text-white border-white/20';
            } else if (hasWorkout) {
               // Improve contrast for days with workout if they are not today/selected
               cellClasses = 'text-white hover:bg-[#2C2C2E] active:bg-[#3A3A3C]';
            }

            // Dot Indicator Logic
            let dotElement = null;
            if (workoutType && WORKOUT_TYPE_META[workoutType]) {
               dotElement = <span className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${WORKOUT_TYPE_META[workoutType].dotClass}`} />;
            } else if (hasWorkout) {
               // Generic workout dot (gray or white)
               dotElement = <span className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-gray-400" />;
            }

            return (
              <button
                key={idx}
                onClick={() => handleDayClick(day)}
                className={`${baseClasses} ${cellClasses}`}
              >
                <span>{day}</span>
                {dotElement}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-4 md:mt-6 w-full py-4 bg-[#1C1C1E] border border-primary/20 hover:bg-[#2C2C2E] active:bg-[#3A3A3C] text-primary rounded-2xl font-bold transition text-sm md:text-base shrink-0 mb-safe"
        >
          Kapat
        </button>
      </div>

      {/* Preview Bottom Sheet */}
      {selectedPreviewDate && (
        <>
          {/* Backdrop for preview */}
          <div 
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedPreviewDate(null)}
          />
          
          {/* Sheet */}
          <div 
            className="fixed bottom-0 inset-x-0 z-[70] bg-[#1C1C1E] rounded-t-3xl p-6 shadow-2xl animate-slide-up flex flex-col gap-6 border-t border-white/10"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '60vh' }}
          >
            {/* Drag Handle (Visual) */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full" />

            {/* Header: Date */}
            <div>
              <h3 className="text-2xl font-bold text-white">
                {formatDateTRFull(selectedPreviewDate).split(' ').slice(0, 2).join(' ')} <span className="text-gray-400 font-medium">{formatDateTRFull(selectedPreviewDate).split(' ').slice(-1)}</span>
              </h3>
            </div>

            {/* Content Switch */}
            {allWorkouts[selectedPreviewDate] ? (
              <>
                {/* Summary Card */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex gap-4 items-center">
                   {/* Type Badge */}
                   {WORKOUT_TYPE_META[detectWorkoutType(allWorkouts[selectedPreviewDate])] && (
                     <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${WORKOUT_TYPE_META[detectWorkoutType(allWorkouts[selectedPreviewDate])].dotClass} bg-opacity-20`}>
                       <div className={`w-3 h-3 rounded-full ${WORKOUT_TYPE_META[detectWorkoutType(allWorkouts[selectedPreviewDate])].dotClass}`} />
                     </div>
                   )}
                   
                   <div className="flex-1">
                     <h4 className="text-white font-bold text-lg leading-tight">
                       {allWorkouts[selectedPreviewDate].workoutName || 'Antrenman'}
                     </h4>
                     {/* Workout Duration - Placeholder or Calculated if available */}
                     {/* Note: Duration is not currently in the data model, could be added later. 
                         Using calculated volume below. */}
                     <p className="text-gray-400 text-sm mt-0.5 font-medium flex items-center gap-1">
                       {(() => {
                          const w = allWorkouts[selectedPreviewDate];
                          if (!w || !w.items) return null;
                          const vol = w.items.reduce((total, item) => {
                              return total + item.sets.reduce((sTotal, set) => {
                                const weight = parseFloat(set.weight) || 0;
                                const reps = parseFloat(set.reps) || 0;
                                return sTotal + (weight * reps);
                              }, 0);
                          }, 0);
                          
                          if (vol === 0) return null;

                          return (
                            <>
                              <span className="material-symbols-outlined text-[14px]">fitness_center</span>
                              {Math.round(vol).toLocaleString()} kg Hacim
                            </>
                          );
                       })()}
                     </p>
                   </div>
                </div>

                {/* Exercises List */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Egzersizler</p>
                  <div className="flex flex-col gap-3">
                    {allWorkouts[selectedPreviewDate].items.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm text-gray-300">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0">
                            {idx + 1}
                          </span>
                          <span className="truncate font-medium text-white">{item.displayName || item.name}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-500 whitespace-nowrap">{item.sets.length} Set</span>
                      </div>
                    ))}
                    {allWorkouts[selectedPreviewDate].items.length > 4 && (
                      <p className="text-sm font-medium text-gray-400 pl-9">+ {allWorkouts[selectedPreviewDate].items.length - 4} egzersiz daha</p>
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleGoToDetail}
                  className="mt-auto w-full py-4 rounded-2xl bg-primary text-black font-bold text-base hover:bg-primary/90 transition shadow-lg shadow-primary/20 mb-safe"
                >
                  Antrenman Detayına Git
                </button>
              </>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-gray-500">bedtime</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">Bugün Dinlenme Günü</h4>
                  <p className="text-gray-400 text-sm mt-1">Herhangi bir antrenman kaydı bulunmuyor.</p>
                </div>
                
                <button 
                  onClick={handleGoToDetail}
                  className="mt-4 w-full py-4 rounded-2xl bg-white/10 text-white font-bold text-base hover:bg-white/20 transition mb-safe block border border-white/10"
                >
                  Hemen Başla
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}