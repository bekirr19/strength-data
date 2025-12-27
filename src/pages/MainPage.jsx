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

  // Exercise Quick Edit State
  const [editingExercise, setEditingExercise] = useState(null);

  const adjustWeight = (current, delta) => {
    const normalized = String(current ?? '').trim();
    const lower = normalized.toLowerCase();
    
    if (lower.startsWith('body') || lower.startsWith('bw')) {
      const plusIndex = normalized.indexOf('+');
      if (plusIndex !== -1) {
        const extraPart = normalized.slice(plusIndex + 1).trim();
        const extra = parseFloat(extraPart);
        if (Number.isFinite(extra)) {
          const newExtra = Math.max(0, extra + delta);
          if (newExtra === 0) return 'BW';
          return `BW+${newExtra % 1 === 0 ? newExtra : newExtra.toFixed(1)}`;
        }
      }
      if (delta > 0) return `BW+${delta}`;
      return 'BW';
    }

    const numeric = parseFloat(normalized.replace(',', '.'));
    if (!Number.isFinite(numeric)) return String(delta > 0 ? delta : 0);

    const next = numeric + delta;
    const clamped = Math.max(0, Math.round(next * 10) / 10);
    if (clamped === 0) return '';
    return clamped % 1 === 0 ? String(clamped) : clamped.toFixed(1);
  };

  const openQuickEdit = (item, index) => {
    setEditingExercise({
      index,
      data: JSON.parse(JSON.stringify(item))
    });
  };

  const closeQuickEdit = () => {
    setEditingExercise(null);
  };

  const handleQuickEditSetChange = (setIdx, field, value) => {
    setEditingExercise(prev => {
      if (!prev) return null;
      const newData = { ...prev.data };
      const newSets = [...newData.sets];
      newSets[setIdx] = { ...newSets[setIdx], [field]: value };
      newData.sets = newSets;
      return { ...prev, data: newData };
    });
  };

  const handleQuickEditAddSet = () => {
    setEditingExercise(prev => {
      if (!prev) return null;
      const newData = { ...prev.data };
      const lastSet = newData.sets[newData.sets.length - 1] || { w: '', r: '' };
      newData.sets.push({ w: lastSet.w || '', r: lastSet.r || '' });
      return { ...prev, data: newData };
    });
  };

  const handleQuickEditDeleteSet = (setIdx) => {
    setEditingExercise(prev => {
      if (!prev) return null;
      const newData = { ...prev.data };
      newData.sets.splice(setIdx, 1);
      return { ...prev, data: newData };
    });
  };

  const handleQuickEditDuplicateSet = (setIdx) => {
    setEditingExercise(prev => {
      if (!prev) return null;
      const newData = { ...prev.data };
      const source = newData.sets[setIdx];
      newData.sets.splice(setIdx + 1, 0, { ...source });
      return { ...prev, data: newData };
    });
  };

  const handleQuickEditSave = async () => {
    if (!editingExercise || !currentWorkout) return;

    const { index, data } = editingExercise;
    
    // Validate sets
    const cleanedSets = data.sets.map(set => {
      const w = String(set.w || '').trim();
      const r = Number(set.r);
      
      if (!w && !r) return null; // Empty set

      const { value, display } = resolveWeightValue(w, data.name, currentWorkout.dateISO);
      
      return {
        w: value,
        wDisplay: display || String(value),
        r: Number.isFinite(r) ? r : 0
      };
    }).filter(Boolean);

    const updatedItem = {
      ...data,
      sets: cleanedSets
    };

    const updatedItems = [...currentWorkout.items];
    updatedItems[index] = updatedItem;

    const updatedWorkout = {
      ...currentWorkout,
      items: updatedItems
    };

    try {
      await saveWorkout(updatedWorkout);
      setRefreshKey(prev => prev + 1); // Trigger reload
      closeQuickEdit();
    } catch (error) {
      console.error('Hızlı düzenleme kaydedilirken hata:', error);
      alert('Kaydedilirken bir hata oluştu.');
    }
  };

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
      <div className="rounded-3xl border border-white/10 bg-[#1C1C1E] p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Vücut Ağırlığı</h3>
          <button
            type="button"
            onClick={() => {
              setIsWeightEditorOpen(false);
              setBodyWeightDraft(bodyWeightInput);
            }}
            className="rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white transition"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
               const val = parseFloat(bodyWeightDraft.replace(',', '.')) || 0;
               setBodyWeightDraft((Math.max(0, val - 0.5)).toFixed(1));
            }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10 active:scale-95 transition border border-white/5"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
          
          <div className="relative flex-1">
            <input
              ref={weightInputRef}
              value={bodyWeightDraft}
              onChange={(e) => setBodyWeightDraft(e.target.value)}
              onKeyDown={handleBodyWeightEditorKeyDown}
              inputMode="decimal"
              className="w-full rounded-xl border border-primary/30 bg-black/40 py-3 text-center text-2xl font-bold text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder-gray-600"
              placeholder="0.0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">kg</span>
          </div>

          <button
            type="button"
            onClick={() => {
               const val = parseFloat(bodyWeightDraft.replace(',', '.')) || 0;
               setBodyWeightDraft((val + 0.5).toFixed(1));
            }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10 active:scale-95 transition border border-white/5"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <button
            type="button"
            onClick={async () => {
              await handleClearBodyWeight();
              setIsWeightEditorOpen(false);
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-bold text-red-400 hover:bg-red-500/20 transition"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
            Sil
          </button>
          <button
            type="button"
            onClick={async () => {
              await commitBodyWeight(bodyWeightDraft);
              setIsWeightEditorOpen(false);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-background-dark hover:bg-primary/90 transition shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">check</span>
            Kaydet
          </button>
        </div>
        
        {bodyWeightMeta.isFallback && bodyWeightMeta.sourceDate && (
           <p className="mt-4 text-center text-[10px] text-gray-500">
             * Otomatik olarak önceki kayıttan ({formatDateTRFull(bodyWeightMeta.sourceDate)}) alındı.
           </p>
        )}
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
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/90 transition hover:bg-white/10 min-w-[80px]"
          title={bodyWeightMeta.isFallback && bodyWeightMeta.sourceDate ? `${formatDateTRFull(bodyWeightMeta.sourceDate)} değerinden geliyor` : 'Vücut ağırlığını düzenle'}
        >
          <span className="material-symbols-outlined text-base text-primary">monitor_weight</span>
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
      className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,242,147,0.15),rgba(16,34,27,0))]"
      key={refreshKey}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <header className="flex items-center bg-background-dark/80 p-4 pb-4 justify-between sticky top-0 z-20 border-b border-white/5 backdrop-blur-md mb-2">
        <div className="flex items-center shrink-0 gap-3">
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
              className="h-10 w-10 md:h-12 md:w-12 rounded-2xl"
            />
          </button>
          <div className="flex flex-col justify-center">
             <span className="text-lg font-bold text-white tracking-tight leading-none">
               {dateLong.split(' ').slice(0, 2).join(' ')}
             </span>
             <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 leading-tight mt-0.5">
               {weekdayLabel} • {dateLong.split(' ')[2]}
             </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/gelistirmeler')}
            className="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 text-gray-400 hover:text-white transition"
            aria-label="Geliştirmeler"
            title="Geliştirmeler"
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>lightbulb</span>
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 text-gray-400 hover:text-white transition"
            aria-label="JSON import"
            title="Antrenman ekle (JSON)"
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>upload</span>
          </button>
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 text-gray-400 hover:text-white transition"
            aria-label="Takvimi aç"
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>calendar_today</span>
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
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  {/* Day Badge */}
                  <span className="inline-flex items-center justify-center rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-white/90 uppercase tracking-wider border border-white/10 min-w-[60px]">
                    {weekdayLabel}
                  </span>

                  {/* Workout Type Badge */}
                  {currentWorkoutMeta && (
                    <span className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide border ${currentWorkoutMeta.badgeClass.replace('rounded-full', 'rounded-lg').replace('border ', '')} min-w-[70px]`}>
                      {currentWorkoutMeta.label}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Body Weight */}
                  {renderBodyWeightBadge()}

                  {/* Edit Button */}
                  <button
                    onClick={() => navigate(`/workout/${selectedDate}`)}
                    className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-white hover:bg-white/10 border border-white/10 transition"
                    aria-label="Düzenle"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                </div>
              </div>
              
              {currentWorkout.workoutFocus && currentWorkout.workoutFocus.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2">
                  {currentWorkout.workoutFocus.map((focus) => (
                    <span key={focus} className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium text-gray-400 border border-white/5">
                      {focus}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-2 md:space-y-3">
                {currentWorkout.items.map((item, idx) => {
                  const displayName = item.displayName || item.name;
                  const setSummary = `${item.sets.length} set`;
                  const quickSummary = item.sets
                    .map((s) => {
                      const numericWeight = Number(s?.w || 0);
                      let label = s?.wDisplay && s.wDisplay.length > 0
                        ? s.wDisplay
                        : (Number.isFinite(numericWeight) && numericWeight > 0 ? `${numericWeight} kg` : '—');
                      
                      if (label === 'Body Weight' || label === 'Vücut Ağırlığı') {
                        label = 'BW';
                      }

                      return (
                        <span key={Math.random()} className="inline-flex items-center bg-white/5 rounded px-1.5 py-0.5 text-xs mr-1.5 border border-white/5">
                          <span className="font-bold text-white">{s.r}</span>
                          <span className="text-gray-500 text-[10px] mx-0.5">×</span>
                          <span className="text-gray-300 font-medium">{label}</span>
                        </span>
                      );
                    });

                  return (
                    <button
                      type="button"
                      onClick={() => openQuickEdit(item, idx)}
                      key={`${displayName}-${idx}`}
                      className="flex w-full items-center justify-between gap-3 md:gap-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 md:px-4 md:py-4 text-left hover:bg-white/10 transition group"
                    >
                      <div className="flex flex-col min-w-0 gap-2 flex-1">
                        <div className="flex items-center justify-between pr-2">
                          <p className="font-bold text-white text-sm md:text-base truncate capitalize">{displayName}</p>
                        </div>
                        <div className="flex flex-wrap gap-y-1">
                          {quickSummary}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                         <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{item.sets.length} SET</span>
                         <span className="material-symbols-outlined group-hover:text-white transition">chevron_right</span>
                      </div>
                    </button>
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
      <nav className="fixed bottom-4 left-4 right-4 z-20 flex flex-row items-center gap-3 md:bottom-6 md:left-6 md:right-6">
        <button
          type="button"
          onClick={handleGoToday}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#1C1C1E] text-gray-300 shadow-lg shadow-black/40 hover:bg-white/10 hover:text-white transition"
          aria-label="Bugün'e git"
        >
          <span className="material-symbols-outlined text-xl">today</span>
        </button>
        
        <button
          onClick={() => navigate('/exercises')}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#1C1C1E] text-gray-300 shadow-lg shadow-black/40 hover:bg-white/10 hover:text-white transition"
          aria-label="Egzersizler"
        >
          <span className="material-symbols-outlined text-xl">list_alt</span>
        </button>

        <button
          onClick={() => navigate('/workout/' + selectedDate, { state: { openPicker: true } })}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary text-background-dark px-6 py-3 font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:bg-primary/90 transition text-base"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
          <span>Antrenman Ekle</span>
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

      {/* Quick Edit Modal */}
      {editingExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-[#1C1C1E] border border-white/10 p-5 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">
                  DÜZENLE
                </p>
                <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                  {editingExercise.data.displayName || editingExercise.data.name || 'İsimsiz Egzersiz'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/exercise/${encodeURIComponent(editingExercise.data.displayName || editingExercise.data.name)}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-xs font-bold text-white"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  Detay
                </button>
                <button
                  onClick={closeQuickEdit}
                  className="flex items-center justify-center size-8 rounded-full bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>

            {/* Sets */}
            <div className="space-y-2">
              {editingExercise.data.sets.map((set, setIdx) => (
                <div key={setIdx} className="flex items-end gap-2">
                  {/* Set Number & Duplicate */}
                  <div className="flex flex-col items-center gap-1 pb-0.5 w-8 shrink-0">
                    <span className="text-gray-500 font-bold text-xs">{setIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleQuickEditDuplicateSet(setIdx)}
                      className="flex items-center justify-center size-7 rounded-md bg-white/5 text-primary hover:bg-primary/20 transition border border-white/5"
                    >
                      <span className="material-symbols-outlined text-base font-bold">add</span>
                    </button>
                  </div>

                  {/* Weight */}
                  <div className="flex-1">
                    <label className="block text-center text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wide">kg</label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickEditSetChange(setIdx, 'w', adjustWeight(set.w, -2.5))}
                        className="flex items-center justify-center w-7 h-8 rounded-md bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition"
                      >
                        <span className="material-symbols-outlined text-base">remove</span>
                      </button>
                      <div className="flex-1 h-8 bg-black/40 flex items-center justify-center rounded-md border border-white/5">
                        <input
                          type="text"
                          value={set.w}
                          onChange={(e) => handleQuickEditSetChange(setIdx, 'w', e.target.value)}
                          className="w-full bg-transparent text-center text-white font-bold text-base focus:outline-none"
                          placeholder="0"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickEditSetChange(setIdx, 'w', adjustWeight(set.w, 2.5))}
                        className="flex items-center justify-center w-7 h-8 rounded-md bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition"
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                      </button>
                    </div>
                  </div>

                  {/* Reps */}
                  <div className="flex-1">
                    <label className="block text-center text-[9px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Tekrar</label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickEditSetChange(setIdx, 'r', Math.max(0, Number(set.r || 0) - 1))}
                        className="flex items-center justify-center w-7 h-8 rounded-md bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition"
                      >
                        <span className="material-symbols-outlined text-base">remove</span>
                      </button>
                      <div className="flex-1 h-8 bg-black/40 flex items-center justify-center rounded-md border border-white/5">
                        <input
                          type="number"
                          value={set.r}
                          onChange={(e) => handleQuickEditSetChange(setIdx, 'r', e.target.value)}
                          className="w-full bg-transparent text-center text-white font-bold text-base focus:outline-none"
                          placeholder="0"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickEditSetChange(setIdx, 'r', Number(set.r || 0) + 1)}
                        className="flex items-center justify-center w-7 h-8 rounded-md bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition"
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                      </button>
                    </div>
                  </div>

                  {/* Delete */}
                  <div className="pb-0.5">
                    <button
                      onClick={() => handleQuickEditDeleteSet(setIdx)}
                      className="flex items-center justify-center size-8 rounded-md text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Set Button */}
            <button
              onClick={handleQuickEditAddSet}
              className="mt-4 w-full py-3 rounded-xl border border-dashed border-white/10 bg-transparent text-gray-500 font-bold hover:bg-white/5 hover:text-gray-300 hover:border-white/20 transition flex items-center justify-center gap-2 text-xs"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Yeni Set Ekle
            </button>

            {/* Actions */}
            <div className="mt-4 pt-2">
              <button
                type="button"
                onClick={handleQuickEditSave}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-background-dark hover:bg-primary/90 transition shadow-lg shadow-primary/20"
              >
                Kaydet ve Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
