import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toISODate, formatDateTRFull, fromISO, turkishWeekdays, turkishWeekdaysShort, getWorkouts, getBodyWeightInfo, saveBodyWeight, clearBodyWeight, saveWorkout, resolveWeightValue } from '../utils/storage';
import WeekStrip from '../components/WeekStrip';
import CalendarModal from '../components/CalendarModal';
import ImportWorkoutModal from '../components/ImportWorkoutModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { detectWorkoutType, WORKOUT_TYPE_META } from '../utils/workoutTypes';

const LAST_SELECTED_DATE_KEY = 'main_last_selected_date';

export default function MainPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    const todayISO = toISODate(new Date());
    if (typeof window === 'undefined') return todayISO;
    try {
      const stored = window.localStorage.getItem(LAST_SELECTED_DATE_KEY);
      return stored || todayISO;
    } catch (err) {
      console.warn('Son seçilen tarih okunamadı', err);
      return todayISO;
    }
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bodyWeightInput, setBodyWeightInput] = useState('');
  const [bodyWeightMeta, setBodyWeightMeta] = useState({ value: null, isFallback: false, sourceDate: null });
  const [workoutsByDate, setWorkoutsByDate] = useState({});
  const [isPrefetching, setIsPrefetching] = useState(true);
  const [isWeightEditorOpen, setIsWeightEditorOpen] = useState(false);
  const [bodyWeightDraft, setBodyWeightDraft] = useState('');
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth < 768;
  });
  const editorRef = useRef(null);
  const weightInputRef = useRef(null);
  const touchStateRef = useRef({ startX: 0, startY: 0, lastX: 0, lastY: 0, active: false });

  const handleSelectDate = (iso) => {
    setSelectedDate(iso);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LAST_SELECTED_DATE_KEY, iso);
      } catch (err) {
        console.warn('Son seçilen tarih kaydedilemedi', err);
      }
    }
  };

  const handleGoToday = () => {
    const today = toISODate(new Date());
    handleSelectDate(today);
  };

  const handleShiftDay = (offset) => {
    if (!offset) return;
    const current = fromISO(selectedDate);
    if (Number.isNaN(current.getTime())) return;
    const next = new Date(current);
    next.setDate(current.getDate() + offset);
    handleSelectDate(toISODate(next));
  };

  const handleTouchStart = (event) => {
    if (event.touches.length !== 1) {
      touchStateRef.current.active = false;
      return;
    }
    if (isCalendarOpen || isImportOpen || isWeightEditorOpen) {
      touchStateRef.current.active = false;
      return;
    }
    const touch = event.touches[0];
    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: touch.clientX,
      lastY: touch.clientY,
      active: true,
    };
  };

  const handleTouchMove = (event) => {
    const state = touchStateRef.current;
    if (!state.active || event.touches.length !== 1) {
      return;
    }
    const touch = event.touches[0];
    state.lastX = touch.clientX;
    state.lastY = touch.clientY;

    const deltaX = Math.abs(state.lastX - state.startX);
    const deltaY = Math.abs(state.lastY - state.startY);
    if (deltaY > deltaX && deltaY > 20) {
      state.active = false;
    }
  };

  const handleTouchEnd = () => {
    const state = touchStateRef.current;
    if (!state.active) {
      return;
    }
    state.active = false;
    const deltaX = state.lastX - state.startX;
    const deltaY = state.lastY - state.startY;

    if (Math.abs(deltaX) < 60 || Math.abs(deltaY) > 40) {
      return;
    }

    if (deltaX > 0) {
      handleShiftDay(-1);
    } else {
      handleShiftDay(1);
    }
  };

  const dateFull = formatDateTRFull(selectedDate);
  const [dateLongPart, weekdayFromFull] = dateFull.split(', ');
  const dateLong = dateLongPart || dateFull;
  const dateObj = fromISO(selectedDate);
  const dayIndex = dateObj.getDay();
  const weekdayLabel = weekdayFromFull || turkishWeekdays[dayIndex];

  useEffect(() => {
    let isMounted = true;

    async function prefetchWorkouts() {
      try {
        setIsPrefetching(true);
        const all = await getWorkouts();
        if (!isMounted) return;

        if (all && typeof all === 'object') {
          setWorkoutsByDate(all);
        } else {
          setWorkoutsByDate({});
        }
      } catch (error) {
        console.error('Workouts önbelleğe alınırken hata:', error);
        setWorkoutsByDate({});
      } finally {
        if (isMounted) {
          setIsPrefetching(false);
        }
      }
    }

    prefetchWorkouts();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  // Firebase'den body weight bilgisi çek
  useEffect(() => {
    let isMounted = true;

    async function loadBodyWeight() {
      try {
        const info = await getBodyWeightInfo(selectedDate);
        if (isMounted) {
          setBodyWeightInput(info.value !== null ? String(info.value) : '');
          setBodyWeightMeta(info);
        }
      } catch (error) {
        console.error('Body weight yüklenirken hata:', error);
      }
    }

    loadBodyWeight();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, refreshKey]);

  useEffect(() => {
    if (!isWeightEditorOpen) {
      setBodyWeightDraft(bodyWeightInput);
    }
  }, [bodyWeightInput, isWeightEditorOpen]);

  useEffect(() => {
    if (!isWeightEditorOpen) return;
    if (typeof document === 'undefined') return;

    const handleClickOutside = (event) => {
      if (editorRef.current && !editorRef.current.contains(event.target)) {
        setIsWeightEditorOpen(false);
        setBodyWeightDraft(bodyWeightInput);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isWeightEditorOpen, bodyWeightInput]);

  useEffect(() => {
    if (!isWeightEditorOpen) return;
    const timer = setTimeout(() => {
      if (weightInputRef.current) {
        weightInputRef.current.focus();
        weightInputRef.current.select();
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [isWeightEditorOpen]);

  // Sayfa focus aldığında refresh et
  useEffect(() => {
    const handleFocus = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobileViewport) return undefined;
    if (typeof document === 'undefined') return undefined;

    const originalOverflow = document.body.style.overflow;
    if (isWeightEditorOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileViewport, isWeightEditorOpen]);

  const commitBodyWeight = async (nextValue = bodyWeightInput) => {
    const trimmed = (nextValue ?? '').trim().replace(',', '.');

    try {
      if (!trimmed) {
        await clearBodyWeight(selectedDate);
        const latest = await getBodyWeightInfo(selectedDate);
        const formatted = latest.value !== null ? String(Number(latest.value.toFixed(1))) : '';
        setBodyWeightInput(formatted);
        setBodyWeightMeta(latest);
        setBodyWeightDraft(formatted);
        return;
      }

      const numeric = parseFloat(trimmed);
      if (!Number.isFinite(numeric) || numeric <= 0) {
        alert('Lütfen geçerli bir ağırlık değeri girin.');
        return;
      }

      await saveBodyWeight(selectedDate, numeric);
      const latest = await getBodyWeightInfo(selectedDate);
      const formatted = latest.value !== null ? String(Number(latest.value.toFixed(1))) : '';
      setBodyWeightInput(formatted);
      setBodyWeightMeta({ ...latest, isFallback: false, sourceDate: selectedDate });
      setBodyWeightDraft(formatted);
    } catch (error) {
      console.error('Body weight kaydedilirken hata:', error);
      alert('Vücut ağırlığı kaydedilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleBodyWeightEditorKeyDown = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      await commitBodyWeight(bodyWeightDraft);
      setIsWeightEditorOpen(false);
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setBodyWeightDraft(bodyWeightInput);
      setIsWeightEditorOpen(false);
    }
  };

  const handleClearBodyWeight = async () => {
    await commitBodyWeight('');
  };

  if (isPrefetching) {
    return <LoadingSpinner fullScreen message="Antrenman verileriniz yükleniyor..." />;
  }

  const currentWorkout = workoutsByDate[selectedDate] || null;
  const currentWorkoutType = currentWorkout ? detectWorkoutType(currentWorkout) : null;
  const currentWorkoutMeta = currentWorkoutType ? WORKOUT_TYPE_META[currentWorkoutType] : null;

  let bodyWeightDisplay = bodyWeightInput && bodyWeightInput.trim().length > 0
    ? `${bodyWeightInput} kg`
    : '—';
  if (bodyWeightMeta.isFallback && bodyWeightMeta.value !== null) {
    bodyWeightDisplay = `${bodyWeightDisplay} *`;
  }

  const toggleWeightEditor = () => {
    if (isWeightEditorOpen) {
      setIsWeightEditorOpen(false);
      setBodyWeightDraft(bodyWeightInput);
    } else {
      setBodyWeightDraft(bodyWeightInput);
      setIsWeightEditorOpen(true);
    }
  };

  const renderBodyWeightBadge = () => {
    const editorCard = (
      <div className="rounded-2xl border border-primary/30 bg-background-dark/95 backdrop-blur p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-white">Vücut Ağırlığı</p>
            {bodyWeightMeta.isFallback && bodyWeightMeta.value !== null && bodyWeightMeta.sourceDate && (
              <p className="text-[11px] text-primary/70 mt-1">
                {formatDateTRFull(bodyWeightMeta.sourceDate)} değerini kullanıyor
              </p>
            )}
            {!bodyWeightMeta.isFallback && bodyWeightMeta.value === null && (
              <p className="text-[11px] text-gray-400 mt-1">
                Henüz kayıt yok. Boş bırakırsanız önceki günün değeri kullanılır.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setIsWeightEditorOpen(false);
              setBodyWeightDraft(bodyWeightInput);
            }}
            className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            ref={weightInputRef}
            value={bodyWeightDraft}
            onChange={(e) => setBodyWeightDraft(e.target.value)}
            onKeyDown={handleBodyWeightEditorKeyDown}
            inputMode="decimal"
            className="w-full rounded-lg border border-primary/40 bg-background-dark px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Değer"
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={async () => {
              await handleClearBodyWeight();
              setIsWeightEditorOpen(false);
            }}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10"
          >
            Sıfırla
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setBodyWeightDraft(bodyWeightInput);
                setIsWeightEditorOpen(false);
              }}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/10"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={async () => {
                await commitBodyWeight(bodyWeightDraft);
                setIsWeightEditorOpen(false);
              }}
              className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-background-dark transition hover:bg-primary/90"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    );

    const handleOverlayClick = (event) => {
      if (event.target === event.currentTarget) {
        setIsWeightEditorOpen(false);
        setBodyWeightDraft(bodyWeightInput);
      }
    };

    return (
      <div className="relative" ref={editorRef}>
        <button
          type="button"
          onClick={toggleWeightEditor}
          className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:border-primary/60 hover:text-white"
          title={bodyWeightMeta.isFallback && bodyWeightMeta.sourceDate ? `${formatDateTRFull(bodyWeightMeta.sourceDate)} değerinden geliyor` : 'Vücut ağırlığını düzenle'}
        >
          <span className="material-symbols-outlined text-[14px] text-primary">monitor_weight</span>
          {bodyWeightDisplay}
        </button>

        {isWeightEditorOpen && (
          isMobileViewport ? (
            <div
              className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
              onClick={handleOverlayClick}
            >
              <div className="w-full max-w-sm">
                {editorCard}
              </div>
            </div>
          ) : (
            <div className="absolute right-0 z-30 mt-2 w-64">
              {editorCard}
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark"
      key={refreshKey}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <header className="flex items-center bg-background-dark p-4 pb-2 justify-between sticky top-0 z-20 border-b border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleGoToday}
            className="rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/80"
            aria-label="Bugüne git"
            title="Bugüne git"
          >
            <img
              src="/logo-mark.svg"
              alt="Strength Data"
              className="h-10 w-10 md:h-12 md:w-12 rounded-2xl shadow-lg shadow-primary/30"
            />
          </button>
        </div>
        <div className="flex flex-col items-center flex-1 px-2 text-center gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70 md:hidden">
            {weekdayLabel}
          </span>
          <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 md:block">
            {weekdayLabel}
          </span>
          <span className="text-sm font-semibold text-gray-100 md:text-base">
            {dateLong}
          </span>
          <button
            type="button"
            onClick={handleGoToday}
            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <span className="material-symbols-outlined text-[14px]">my_location</span>
            Bugün
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/gelistirmeler')}
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 md:h-12 md:w-12 bg-transparent text-white hover:bg-gray-700 transition"
            aria-label="Geliştirmeler"
            title="Geliştirmeler"
          >
            <span className="material-symbols-outlined text-xl md:text-2xl">tips_and_updates</span>
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 md:h-12 md:w-12 bg-transparent text-primary hover:bg-gray-700 transition"
            aria-label="JSON import"
            title="Antrenman ekle (JSON)"
          >
            <span className="material-symbols-outlined text-xl md:text-2xl">upload_file</span>
          </button>
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 md:h-12 md:w-12 bg-transparent text-white hover:bg-gray-700 transition"
            aria-label="Takvimi aç"
          >
            <span className="material-symbols-outlined text-xl md:text-2xl">calendar_month</span>
          </button>
        </div>
      </header>

      {/* Week Strip */}
      <WeekStrip selectedDate={selectedDate} onDateSelect={handleSelectDate} refreshKey={refreshKey} />

      {/* Main Content */}
      <main className="flex-grow p-4 pb-24 md:pb-8 max-w-4xl mx-auto w-full">
        {currentWorkout ? (
          <div className="flex flex-col gap-4 animate-slide-in">
            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-background-dark/80 p-4 md:p-6 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-semibold text-white/80">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-primary/80">
                    {weekdayLabel}
                  </span>
                  {currentWorkoutMeta && (
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] md:text-xs font-semibold ${currentWorkoutMeta.badgeClass}`}>
                      <span className="material-symbols-outlined text-sm">fitness_center</span>
                      {currentWorkoutMeta.badgeLabel || currentWorkoutMeta.label}
                    </span>
                  )}
                  {currentWorkout.workoutFocus && currentWorkout.workoutFocus.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {currentWorkout.workoutFocus.map((focus) => (
                        <span key={focus} className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/80">
                          {focus}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {renderBodyWeightBadge()}
                  <button
                    onClick={() => navigate(`/workout/${selectedDate}`)}
                    className="flex size-9 md:size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                    aria-label="Düzenle"
                  >
                    <span className="material-symbols-outlined text-base md:text-lg">edit</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 md:space-y-3">
                {currentWorkout.items.map((item, idx) => {
                  const displayName = item.displayName || item.name;
                  const setSummary = `${item.sets.length} set`;
                  const quickSummary = item.sets
                    .map((s) => {
                      const numericWeight = Number(s?.w || 0);
                      const label = s?.wDisplay && s.wDisplay.length > 0
                        ? s.wDisplay
                        : (Number.isFinite(numericWeight) && numericWeight > 0 ? `${numericWeight} kg` : '—');
                      return `${s.r}×${label}`;
                    })
                    .join(', ');

                  return (
                    <div
                      key={`${displayName}-${idx}`}
                      className="flex w-full items-center justify-between gap-3 md:gap-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 md:px-4 md:py-4 text-left"
                    >
                      <div className="flex flex-col min-w-0 gap-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white text-sm md:text-base truncate">{displayName}</p>
                          <span className="inline-flex items-center rounded-full bg-black/30 px-2 py-0.5 text-[10px] md:text-[11px] text-white/70">
                            {setSummary}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-400 truncate">{quickSummary}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {currentWorkout.workoutFuel && (
                <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3">
                  <p className="text-xs md:text-sm font-semibold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">electric_bolt</span>
                    Antrenman Yakıtı
                  </p>
                  <p className="text-xs md:text-sm text-gray-200 mt-1">{currentWorkout.workoutFuel}</p>
                </div>
              )}

              {currentWorkout.notes && (
                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <p className="text-xs md:text-sm text-gray-200 whitespace-pre-wrap">{currentWorkout.notes}</p>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-slide-in">
            <section className="rounded-3xl border border-dashed border-white/15 bg-black/20 px-6 py-10 md:py-14 text-center shadow-inner shadow-black/20">
              <div className="flex justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-white/40">fitness_center</span>
              </div>
              <p className="text-sm md:text-base text-white/70">Bu gün için antrenman kaydı yok</p>
              <p className="text-[12px] md:text-xs text-white/40 mt-1">Yeni bir antrenman planlamak için aşağıdaki seçenekleri kullan.</p>
              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => navigate(`/workout/${selectedDate}`)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 md:px-6 py-2.5 md:py-3 font-semibold text-background-dark shadow-lg shadow-primary/30 hover:bg-primary/90 transition text-sm md:text-base"
                >
                  <span className="material-symbols-outlined text-lg md:text-xl">add</span>
                  Manuel Ekle
                </button>
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 md:px-6 py-2.5 md:py-3 font-semibold text-white hover:border-primary/40 hover:text-primary transition text-sm md:text-base"
                >
                  <span className="material-symbols-outlined text-lg md:text-xl">upload_file</span>
                  JSON ile Ekle
                </button>
              </div>
              <div className="mt-6 flex justify-center">
                {renderBodyWeightBadge()}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Bottom Nav - Mobile Only */}
      <nav className="fixed bottom-4 right-4 z-20 flex flex-col gap-2 md:bottom-6 md:right-6">
        <button
          onClick={() => navigate('/exercises')}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary text-background-dark px-5 md:px-6 py-2.5 font-semibold shadow-xl shadow-primary/40 hover:shadow-primary/60 transition text-sm md:text-base"
        >
          <span className="material-symbols-outlined text-lg md:text-xl">list_alt</span>
          <span className="hidden sm:inline">Egzersizlerim</span>
          <span className="sm:hidden">Egzersizler</span>
        </button>
      </nav>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => {
          setIsCalendarOpen(false);
          setRefreshKey(prev => prev + 1);
        }}
        onSelectDate={handleSelectDate}
      />

      {/* Import Modal */}
      <ImportWorkoutModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        selectedDate={selectedDate}
        onSuccess={() => {
          setIsImportOpen(false);
          setRefreshKey(prev => prev + 1);
        }}
      />
    </div>
  );
}
