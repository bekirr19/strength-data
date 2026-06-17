import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, CalendarDays, MessageSquare, ShieldCheck, Plus, Pencil, ChevronRight, Scale, Zap, Dumbbell, ListChecks, X, Copy, Trash2, ExternalLink, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toISODate, fromISO, getWorkouts, getBodyWeightInfo, saveBodyWeight, clearBodyWeight, saveWorkout, resolveWeightValue, getExercises, normalizeExerciseName } from '../utils/storage-client';
import { WEEKDAYS_SHORT, WEEKDAYS_LONG, MONTHS_SHORT } from '../utils/datetime';
import CalendarModal from '../components/CalendarModal';
import BodyWeightModal from '../components/BodyWeightModal';
import { detectWorkoutType } from '../utils/workoutTypes';
import { getExerciseInfo } from '../utils/exerciseMetadata';
import { WeekStrip } from '../ds/components/navigation/WeekStrip';
import { BottomNav } from '../ds/components/navigation/BottomNav';
import { Card } from '../ds/components/layout/Card';
import { Avatar } from '../ds/components/layout/Avatar';
import { SetChip } from '../ds/components/data-display/SetChip';
import { WorkoutTypeBadge } from '../ds/components/data-display/WorkoutTypeBadge';
import { Input } from '../ds/components/forms/Input';
import { Stepper } from '../ds/components/forms/Stepper';
import { Button } from '../ds/components/buttons/Button';
import { IconButton } from '../ds/components/buttons/IconButton';
import { Modal } from '../ds/components/feedback/Modal';
import { EmptyState } from '../ds/components/feedback/EmptyState';

const LAST_SELECTED_DATE_KEY = 'main_last_selected_date';

const getStoredDate = () => {
  try { return sessionStorage.getItem(LAST_SELECTED_DATE_KEY) || null; } catch { return null; }
};
const storeDate = (date) => {
  try { sessionStorage.setItem(LAST_SELECTED_DATE_KEY, date); } catch { /* ignore */ }
};

const canonicalFromParts = (canonical, name) => normalizeExerciseName(canonical || name || '');
const CATEGORY_PRIORITY = { leg: 0, chest: 1, back: 2, shoulder: 3, arm: 4, core: 5, other: 6 };

// Map detectWorkoutType() output to a WorkoutTypeBadge type key.
const WT_BADGE = { push: 'push', pull: 'pull', leg: 'leg', 'pull-push': 'upper', 'leg-push': 'legPush', 'leg-pull': 'legPull', 'leg-pull-push': 'full' };
// Single-color dot category for the week strip.
const dotCategory = (type) => (type === 'push' || type === 'pull' || type === 'leg' ? type : type ? 'other' : null);

const detectCategoryKey = (item, library = []) => {
  const name = item?.displayName || item?.name || '';
  const canonical = item?.canonicalName || normalizeExerciseName(name);
  const key = canonical.toLowerCase();

  const customExercise = library.find((ex) => {
    const exKey = (ex.canonicalName || normalizeExerciseName(ex.name)).toLowerCase();
    return exKey === key;
  });

  const overrides = { ...item, ...customExercise };
  const info = getExerciseInfo(name, overrides);
  const cat = (info?.category || '').toLowerCase();
  const muscles = Array.isArray(info?.muscleLabels) ? info.muscleLabels.map((m) => m.toLowerCase()) : [];

  const matches = (keyword) => cat.includes(keyword) || muscles.some((m) => m.includes(keyword));

  if (matches('chest') || matches('gogus') || matches('göğüs')) return 'chest';
  if (matches('back') || matches('sirt') || matches('sırt')) return 'back';
  if (matches('shoulder') || matches('omuz') || matches('deltoid')) return 'shoulder';
  if (matches('arm') || matches('kol') || matches('bicep') || matches('tricep')) return 'arm';
  if (matches('leg') || matches('bacak') || matches('quad') || matches('hamstring') || matches('glute')) return 'leg';
  if (matches('core') || matches('abs') || matches('karin') || matches('karın')) return 'core';
  return 'other';
};

export default function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAdmin } = useAuth();

  const [selectedDate, setSelectedDate] = useState(() => {
    if (location.state?.date) return location.state.date;
    return getStoredDate() || toISODate(new Date());
  });

  useEffect(() => { storeDate(selectedDate); }, [selectedDate]);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bodyWeightInput, setBodyWeightInput] = useState('');
  const [bodyWeightMeta, setBodyWeightMeta] = useState({ value: null, isFallback: false, sourceDate: null });
  const [workoutsByDate, setWorkoutsByDate] = useState({});
  const [isPrefetching, setIsPrefetching] = useState(true);
  const [isBodyWeightModalOpen, setIsBodyWeightModalOpen] = useState(false);
  const [isWeightEditorOpen, setIsWeightEditorOpen] = useState(false);
  const [bodyWeightDraft, setBodyWeightDraft] = useState('');
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });
  const editorRef = useRef(null);
  const profileMenuRef = useRef(null);
  const weightInputRef = useRef(null);
  const touchStateRef = useRef({ startX: 0, startY: 0, lastX: 0, lastY: 0, active: false });

  useEffect(() => {
    if (location.state?.loginSuccess) {
      setShowWelcomeToast(true);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setShowWelcomeToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [exerciseLibrary, setExerciseLibrary] = useState([]);

  useEffect(() => {
    async function loadLibrary() {
      try {
        const data = await getExercises();
        setExerciseLibrary(data);
      } catch (err) {
        console.error('Could not load exercise list', err);
      }
    }
    loadLibrary();
  }, []);

  const exerciseUsageMap = useMemo(() => {
    const map = {};
    exerciseLibrary.forEach((exercise) => {
      const key = canonicalFromParts(exercise.canonicalName, exercise.name).toLowerCase();
      map[key] = exercise.used || 0;
    });
    return map;
  }, [exerciseLibrary]);

  const workoutUsageMap = useMemo(() => {
    const map = {};
    Object.values(workoutsByDate || {}).forEach((wo) => {
      (wo.items || []).forEach((it) => {
        const key = canonicalFromParts(it.canonicalName, it.displayName || it.name).toLowerCase();
        map[key] = (map[key] || 0) + 1;
      });
    });
    return map;
  }, [workoutsByDate]);

  const [editingExercise, setEditingExercise] = useState(null);

  const filteredLibrary = useMemo(() => {
    const query = pickerSearch.trim().toLowerCase();
    return exerciseLibrary
      .map((exercise) => {
        const displayName = exercise.displayName || exercise.name;
        const canonical = canonicalFromParts(exercise.canonicalName, displayName);
        const info = getExerciseInfo(displayName, exercise);
        return { exercise, displayName, canonical, info };
      })
      .filter(({ displayName, canonical, info }) => {
        if (!query) return true;
        const nameLower = displayName.toLowerCase();
        const canonicalLower = canonical.toLowerCase();
        if (nameLower.includes(query) || canonicalLower.includes(query)) return true;
        return info.muscleLabels.some((label) => label.toLowerCase().includes(query));
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'en'));
  }, [exerciseLibrary, pickerSearch]);

  const openExercisePicker = async () => {
    const exercisesData = await getExercises();
    setExerciseLibrary(exercisesData);
    setPickerSearch('');
    setIsPickerOpen(true);
  };

  const closeExercisePicker = () => {
    setIsPickerOpen(false);
    setPickerSearch('');
  };

  const handleSelectExercise = async ({ displayName, canonical }) => {
    let workout = workoutsByDate[selectedDate];
    if (!workout) {
      workout = { dateISO: selectedDate, items: [], workoutName: '', workoutFocus: [], workoutFuel: '', notes: '' };
    }
    const newItem = { name: displayName, displayName, canonicalName: canonical, sets: [{ w: '', r: '' }] };
    const updatedItems = [...(workout.items || []), newItem];
    const updatedWorkout = { ...workout, items: updatedItems };

    setWorkoutsByDate((prev) => ({ ...prev, [selectedDate]: updatedWorkout }));
    setIsPickerOpen(false);

    try {
      await saveWorkout(updatedWorkout);
    } catch (error) {
      console.error('Error adding exercise:', error);
      alert('Something went wrong adding the exercise.');
    }
  };

  const handleManualAddExercise = async () => {
    let workout = workoutsByDate[selectedDate];
    if (!workout) {
      workout = { dateISO: selectedDate, items: [], workoutName: '', workoutFocus: [], workoutFuel: '', notes: '' };
    }
    const newItem = { name: '', displayName: '', canonicalName: '', sets: [{ w: '', r: '' }] };
    const updatedItems = [...(workout.items || []), newItem];
    const updatedWorkout = { ...workout, items: updatedItems };

    setWorkoutsByDate((prev) => ({ ...prev, [selectedDate]: updatedWorkout }));
    setIsPickerOpen(false);

    try {
      await saveWorkout(updatedWorkout);
    } catch (error) {
      console.error('Error adding manual exercise:', error);
    }
  };

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

  const openQuickEdit = (item, index, autoFocus = false) => {
    const data = JSON.parse(JSON.stringify(item));
    if (data.sets) {
      data.sets = data.sets.map((s) => {
        if (s.wDisplay && (s.wDisplay.toLowerCase().includes('body') || s.wDisplay.toLowerCase().includes('bw') || s.wDisplay.toLowerCase().includes('vücut'))) {
          let val = s.wDisplay;
          if (val === 'Body Weight' || val === 'Vücut Ağırlığı' || val === 'BW') val = 'BW';
          return { ...s, w: val };
        }
        return s;
      });
    }
    setEditingExercise({ index, data, autoFocus });
  };

  const closeQuickEdit = () => setEditingExercise(null);

  const handleQuickEditSetChange = (setIdx, field, value) => {
    setEditingExercise((prev) => {
      if (!prev) return null;
      const newData = { ...prev.data };
      const newSets = [...newData.sets];
      newSets[setIdx] = { ...newSets[setIdx], [field]: value };
      newData.sets = newSets;
      return { ...prev, data: newData };
    });
  };

  const handleQuickEditAddSet = () => {
    setEditingExercise((prev) => {
      if (!prev) return null;
      const newData = { ...prev.data };
      const newSets = [...newData.sets];
      const lastSet = newSets[newSets.length - 1] || { w: '', r: '' };
      newSets.push({ w: lastSet.w || '', r: lastSet.r || '' });
      newData.sets = newSets;
      return { ...prev, data: newData };
    });
  };

  const handleQuickEditDeleteSet = (setIdx) => {
    setEditingExercise((prev) => {
      if (!prev) return null;
      const newData = { ...prev.data };
      const newSets = [...newData.sets];
      newSets.splice(setIdx, 1);
      newData.sets = newSets;
      return { ...prev, data: newData };
    });
  };

  const handleQuickEditDuplicateSet = (setIdx) => {
    setEditingExercise((prev) => {
      if (!prev) return null;
      const newData = { ...prev.data };
      const newSets = [...newData.sets];
      const source = newSets[setIdx];
      newSets.push({ ...source });
      newData.sets = newSets;
      return { ...prev, data: newData };
    });
  };

  const handleQuickEditDeleteExercise = () => {
    if (!editingExercise || !currentWorkout) return;
    const updatedItems = currentWorkout.items.filter((_, i) => i !== editingExercise.index);
    const { cleanedWorkout, issues } = buildCleanWorkout(currentWorkout.dateISO, updatedItems);
    if (issues.length > 0) { alert(issues.join('\n')); return; }
    closeQuickEdit();
    navigate('/', { state: { updatedWorkout: cleanedWorkout } });
    (async () => {
      try { await saveWorkout(cleanedWorkout); }
      catch (error) { console.error('Error deleting exercise:', error); alert('Something went wrong deleting the exercise.'); }
    })();
  };

  const buildCleanWorkout = (targetDateISO, itemsOverride = null) => {
    const baseWorkout = workoutsByDate[targetDateISO] || { dateISO: targetDateISO, items: [], notes: '', workoutFuel: '', workoutName: '', workoutFocus: [] };
    const issues = [];
    const sourceItems = itemsOverride || baseWorkout.items || [];

    const cleanedItems = sourceItems
      .map((it, exerciseIdx) => {
        const trimmedName = (it.displayName || it.name || '').trim();
        const exerciseLabel = trimmedName || `Exercise ${exerciseIdx + 1}`;
        if (!trimmedName) { issues.push(`Enter a name for ${exerciseLabel}.`); return null; }
        const canonical = canonicalFromParts(it.canonicalName, trimmedName);
        if (!canonical) { issues.push(`${exerciseLabel} name is not valid.`); return null; }

        const sets = Array.isArray(it.sets) ? it.sets : [];
        const cleanedSets = [];

        sets.forEach((set, setIdx) => {
          const repsInput = String(set?.r ?? '').trim();
          const weightInput = String(set?.w ?? '').trim();
          const hasReps = repsInput.length > 0;
          const hasWeight = weightInput.length > 0;
          if (!hasReps && !hasWeight) return;
          if (!hasReps || !hasWeight) {
            issues.push(`${exerciseLabel} set ${setIdx + 1}: enter weight and reps together, or leave both empty.`);
            return;
          }
          const reps = Number(repsInput);
          if (!Number.isFinite(reps) || reps <= 0) { issues.push(`${exerciseLabel} set ${setIdx + 1}: enter a valid rep count.`); return; }
          const { value, display } = resolveWeightValue(weightInput, trimmedName, targetDateISO);
          const isBodyWeight = display && (display === 'Body Weight' || display.startsWith('BW'));
          const hasValidWeight = Number.isFinite(value) && value > 0;
          if (!isBodyWeight && !hasValidWeight) { issues.push(`${exerciseLabel} set ${setIdx + 1}: enter a valid weight (a number or BW).`); return; }
          cleanedSets.push({ w: value, wDisplay: display || String(value), r: reps });
        });

        return { ...it, name: trimmedName, displayName: trimmedName, canonicalName: canonical, sets: cleanedSets };
      })
      .filter(Boolean);

    if (cleanedItems.length === 0) issues.push('Add at least one exercise name to save.');

    const cleanedWorkout = {
      ...baseWorkout,
      dateISO: targetDateISO,
      workoutFocus: Array.isArray(baseWorkout.workoutFocus) ? baseWorkout.workoutFocus : [],
      items: cleanedItems,
    };
    return { cleanedWorkout, issues };
  };

  const handleQuickEditSave = async () => {
    if (!editingExercise || !currentWorkout) return;
    const { index, data } = editingExercise;
    const cleanedSets = data.sets.map((set) => {
      const w = String(set.w || '').trim();
      const r = Number(set.r);
      if (!w && !r) return null;
      const { value, display } = resolveWeightValue(w, data.name, currentWorkout.dateISO);
      return { w: value, wDisplay: display || String(value), r: Number.isFinite(r) ? r : 0 };
    }).filter(Boolean);

    const updatedItem = { ...data, sets: cleanedSets };
    const updatedItems = [...currentWorkout.items];
    updatedItems[index] = updatedItem;

    const { cleanedWorkout, issues } = buildCleanWorkout(currentWorkout.dateISO, updatedItems);
    if (issues.length > 0) { alert(issues.join('\n')); return; }

    closeQuickEdit();
    navigate('/', { state: { updatedWorkout: cleanedWorkout } });
    try { await saveWorkout(cleanedWorkout); }
    catch (error) { console.error('Error saving quick edit:', error); alert('Something went wrong saving.'); }
  };

  const handleSelectDate = (iso) => {
    setSelectedDate(iso);
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem(LAST_SELECTED_DATE_KEY, iso); }
      catch (err) { console.warn('Could not store last selected date', err); }
    }
  };

  const handleGoToday = () => handleSelectDate(toISODate(new Date()));

  const handleShiftDay = (offset) => {
    if (!offset) return;
    const current = fromISO(selectedDate);
    if (Number.isNaN(current.getTime())) return;
    const next = new Date(current);
    next.setDate(current.getDate() + offset);
    handleSelectDate(toISODate(next));
  };

  const handleTouchStart = (event) => {
    if (event.touches.length !== 1) { touchStateRef.current.active = false; return; }
    if (isCalendarOpen || isWeightEditorOpen) { touchStateRef.current.active = false; return; }
    const touch = event.touches[0];
    touchStateRef.current = { startX: touch.clientX, startY: touch.clientY, lastX: touch.clientX, lastY: touch.clientY, active: true };
  };

  const handleTouchMove = (event) => {
    const state = touchStateRef.current;
    if (!state.active || event.touches.length !== 1) return;
    const touch = event.touches[0];
    state.lastX = touch.clientX;
    state.lastY = touch.clientY;
    const deltaX = Math.abs(state.lastX - state.startX);
    const deltaY = Math.abs(state.lastY - state.startY);
    if (deltaY > deltaX && deltaY > 20) state.active = false;
  };

  const handleTouchEnd = () => {
    const state = touchStateRef.current;
    if (!state.active) return;
    state.active = false;
    const deltaX = state.lastX - state.startX;
    const deltaY = state.lastY - state.startY;
    if (Math.abs(deltaX) < 60 || Math.abs(deltaY) > 40) return;
    if (deltaX > 0) handleShiftDay(-1); else handleShiftDay(1);
  };

  const dateObj = fromISO(selectedDate);
  const dateBig = `${dateObj.getDate()} ${MONTHS_SHORT[dateObj.getMonth()]}`;
  const weekdayLabel = WEEKDAYS_LONG[dateObj.getDay()];
  const todayISO = toISODate(new Date());

  // 7-day Monday-start week containing the selected date.
  const weekDays = useMemo(() => {
    const sel = fromISO(selectedDate);
    const mondayOffset = (sel.getDay() + 6) % 7;
    const monday = new Date(sel);
    monday.setDate(sel.getDate() - mondayOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = toISODate(d);
      const wo = workoutsByDate[iso];
      const type = wo ? detectWorkoutType(wo) : null;
      return { iso, wd: WEEKDAYS_SHORT[d.getDay()], d: d.getDate(), category: dotCategory(type), today: iso === todayISO };
    });
  }, [selectedDate, workoutsByDate, todayISO]);

  useEffect(() => {
    let isMounted = true;
    async function prefetchWorkouts() {
      try {
        setIsPrefetching(true);
        if (location.state?.updatedWorkout) {
          setWorkoutsByDate((prev) => ({ ...prev, [location.state.updatedWorkout.dateISO]: location.state.updatedWorkout }));
        }
        const all = await getWorkouts();
        if (!isMounted) return;
        if (all && typeof all === 'object') {
          if (location.state?.updatedWorkout) all[location.state.updatedWorkout.dateISO] = location.state.updatedWorkout;
          setWorkoutsByDate(all);
        } else {
          setWorkoutsByDate({});
        }
      } catch (error) {
        console.error('Error prefetching workouts:', error);
        setWorkoutsByDate({});
      } finally {
        if (isMounted) setIsPrefetching(false);
      }
    }
    prefetchWorkouts();
    return () => { isMounted = false; };
  }, [refreshKey, location.state]);

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
        console.error('Error loading body weight:', error);
      }
    }
    loadBodyWeight();
    return () => { isMounted = false; };
  }, [selectedDate, refreshKey]);

  useEffect(() => {
    if (!isWeightEditorOpen) setBodyWeightDraft(bodyWeightInput);
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
      if (weightInputRef.current) { weightInputRef.current.focus(); weightInputRef.current.select(); }
    }, 80);
    return () => clearTimeout(timer);
  }, [isWeightEditorOpen]);

  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setIsProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    const handleFocus = () => setRefreshKey((prev) => prev + 1);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleResize = () => setIsMobileViewport(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobileViewport) return undefined;
    if (typeof document === 'undefined') return undefined;
    const originalOverflow = document.body.style.overflow;
    if (isWeightEditorOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = originalOverflow;
    return () => { document.body.style.overflow = originalOverflow; };
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
      if (!Number.isFinite(numeric) || numeric <= 0) { alert('Please enter a valid weight.'); return; }
      await saveBodyWeight(selectedDate, numeric);
      const latest = await getBodyWeightInfo(selectedDate);
      const formatted = latest.value !== null ? String(Number(latest.value.toFixed(1))) : '';
      setBodyWeightInput(formatted);
      setBodyWeightMeta({ ...latest, isFallback: false, sourceDate: selectedDate });
      setBodyWeightDraft(formatted);
    } catch (error) {
      console.error('Error saving body weight:', error);
      alert('Could not save body weight. Please try again.');
    }
  };

  if (isPrefetching) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-page)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent)', animation: 'sd-spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Loading your workouts…</p>
        <style>{`@keyframes sd-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const currentWorkout = workoutsByDate[selectedDate] || null;
  const currentWorkoutType = currentWorkout ? detectWorkoutType(currentWorkout) : null;
  const currentBadgeType = currentWorkoutType ? WT_BADGE[currentWorkoutType] : null;

  const findPreviousSameTypeDate = () => {
    if (!currentWorkoutType) return null;
    const keys = Object.keys(workoutsByDate || {}).filter((k) => k < selectedDate).sort((a, b) => (a > b ? -1 : 1));
    for (const dateKey of keys) {
      const wo = workoutsByDate[dateKey];
      if (!wo) continue;
      if (detectWorkoutType(wo) === currentWorkoutType) return dateKey;
    }
    return null;
  };

  const handleJumpPrevWorkoutType = () => {
    const prevDate = findPreviousSameTypeDate();
    if (prevDate) handleSelectDate(prevDate);
    else alert('No previous workout of the same type found.');
  };

  const BodyWeightBadge = () => {
    const hasWeight = bodyWeightMeta.value !== null;
    return (
      <button
        type="button"
        onClick={() => setIsBodyWeightModalOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, height: 28, padding: '0 10px',
          borderRadius: 'var(--radius-full)', background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)',
          fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-bold)', color: 'var(--text-secondary)', cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
        title={bodyWeightMeta.isFallback && bodyWeightMeta.sourceDate ? `Carried over from a previous day` : 'Edit body weight'}
      >
        <Scale size={13} style={{ color: 'var(--accent)' }} />
        <span className="sd-tnum">{hasWeight ? `${bodyWeightMeta.value} kg` : 'Add weight'}</span>
        {bodyWeightMeta.isFallback && hasWeight && <span style={{ color: 'var(--text-tertiary)' }}>*</span>}
      </button>
    );
  };

  const qeKey = editingExercise ? (editingExercise.data.canonicalName || normalizeExerciseName(editingExercise.data.displayName || editingExercise.data.name || '')).toLowerCase() : '';
  const qeLibEntry = editingExercise ? exerciseLibrary.find((e) => (e.canonicalName || normalizeExerciseName(e.name || '')).toLowerCase() === qeKey) : null;
  const qeWeightStep = qeLibEntry?.weightStep ?? 2.5;

  const menuItemStyle = { display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', background: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'left' };

  return (
    <div
      style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-page)' }}
      key={refreshKey}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(247,248,250,0.9)', backdropFilter: 'saturate(180%) blur(8px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={handleGoToday} aria-label="Go to today" style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
            <img src="/logo-blue.svg" alt="Strength Data" width="38" height="38" style={{ borderRadius: 11 }} />
          </button>
          <div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, letterSpacing: '-.02em', color: 'var(--text-primary)', lineHeight: 1.05 }}>{dateBig}</div>
            <div className="sd-eyebrow" style={{ marginTop: 2 }}>{weekdayLabel} · {dateObj.getFullYear()}</div>
          </div>
        </div>

        <div style={{ position: 'relative' }} ref={profileMenuRef}>
          <button onClick={() => setIsProfileMenuOpen((o) => !o)} aria-label="User menu" style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%' }}>
            <Avatar src={currentUser?.photoURL} name={currentUser?.displayName} size={40} icon={<User size={22} />} />
          </button>
          {isProfileMenuOpen && (
            <>
              <div onClick={() => setIsProfileMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }} />
              <div className="sd-slide-in" style={{ position: 'absolute', right: 0, top: 48, zIndex: 31, width: 210, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: 6 }}>
                <button style={menuItemStyle} onClick={() => { setIsCalendarOpen(true); setIsProfileMenuOpen(false); }}>
                  <CalendarDays size={18} style={{ color: 'var(--text-secondary)' }} /> Calendar
                </button>
                <button style={menuItemStyle} onClick={() => { navigate('/gelistirmeler'); setIsProfileMenuOpen(false); }}>
                  <MessageSquare size={18} style={{ color: 'var(--text-secondary)' }} /> Feedback
                </button>
                {isAdmin && (
                  <button style={menuItemStyle} onClick={() => { navigate('/admin'); setIsProfileMenuOpen(false); }}>
                    <ShieldCheck size={18} style={{ color: 'var(--text-secondary)' }} /> Admin
                  </button>
                )}
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 0' }} />
                <button style={menuItemStyle} onClick={() => { navigate('/profile'); setIsProfileMenuOpen(false); }}>
                  <User size={18} style={{ color: 'var(--text-secondary)' }} /> Profile
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Welcome toast */}
      {showWelcomeToast && (
        <div className="sd-slide-in" style={{ position: 'fixed', top: 76, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--green-500)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>Signed in</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Your data is synced and ready.</div>
            </div>
          </div>
        </div>
      )}

      {/* Week strip */}
      <div style={{ position: 'sticky', top: 67, zIndex: 10, background: 'rgba(247,248,250,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-subtle)', padding: '10px 16px' }}>
        <WeekStrip days={weekDays} selectedISO={selectedDate} onSelect={handleSelectDate} />
      </div>

      {/* Main */}
      <main style={{ flex: 1, padding: '16px 16px 110px', maxWidth: 560, margin: '0 auto', width: '100%' }}>
        {currentWorkout ? (
          <Card pad="md" className="sd-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* card header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                {currentBadgeType && <WorkoutTypeBadge type={currentBadgeType} onClick={handleJumpPrevWorkoutType} />}
                <BodyWeightBadge />
              </div>
              <IconButton ariaLabel="Edit workout" variant="soft" size="sm" onClick={() => navigate(`/workout/${selectedDate}`)}>
                <Pencil size={16} />
              </IconButton>
            </div>

            {/* exercise rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(currentWorkout.items || [])
                .map((item, idx) => ({
                  item, idx,
                  category: detectCategoryKey(item, exerciseLibrary),
                  usage: workoutUsageMap[canonicalFromParts(item.canonicalName, item.displayName || item.name).toLowerCase()] || exerciseUsageMap[canonicalFromParts(item.canonicalName, item.displayName || item.name).toLowerCase()] || 0,
                }))
                .sort((a, b) => {
                  const pa = CATEGORY_PRIORITY[a.category] ?? CATEGORY_PRIORITY.other;
                  const pb = CATEGORY_PRIORITY[b.category] ?? CATEGORY_PRIORITY.other;
                  if (pa !== pb) return pa - pb;
                  if (a.usage !== b.usage) return b.usage - a.usage;
                  const nameA = a.item.displayName || a.item.name || '';
                  const nameB = b.item.displayName || b.item.name || '';
                  return nameA.localeCompare(nameB, 'en');
                })
                .map(({ item, idx }) => {
                  const displayName = item.displayName || item.name;
                  return (
                    <button
                      type="button"
                      key={`${displayName}-${idx}`}
                      onClick={() => openQuickEdit(item, idx)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: 12, border: '1px solid var(--border-subtle)', background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'left', WebkitTapHighlightColor: 'transparent' }}
                    >
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{displayName}</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {item.sets.map((s, j) => {
                            let label = s?.wDisplay && s.wDisplay.length > 0 ? s.wDisplay : (Number(s?.w) > 0 ? String(Number(s.w)) : '—');
                            if (label === 'Body Weight' || label === 'Vücut Ağırlığı') label = 'BW';
                            return <SetChip key={j} reps={s.r} weight={label} />;
                          })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)' }}>
                        <span className="sd-eyebrow">{item.sets.length} sets</span>
                        <ChevronRight size={18} />
                      </div>
                    </button>
                  );
                })}
            </div>

            {currentWorkout.workoutFuel && (
              <Card tint="accent" pad="sm" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Zap size={16} style={{ color: 'var(--accent-hover)', marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--accent-hover)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Fuel</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-700)', marginTop: 2 }}>{currentWorkout.workoutFuel}</div>
                </div>
              </Card>
            )}

            {currentWorkout.notes && (
              <Card tint="sunken" pad="sm">
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)', whiteSpace: 'pre-wrap' }}>{currentWorkout.notes}</div>
              </Card>
            )}
          </Card>
        ) : (
          <div className="sd-slide-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <EmptyState
              tone="accent"
              icon={<Dumbbell size={28} />}
              title="No workout logged for this day"
              subtitle="Add your first exercise to get started."
              action={<Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate(`/workout/${selectedDate}`)}>Add manually</Button>}
            />
            <BodyWeightBadge />
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', left: 16, right: 16, bottom: 16, zIndex: 15, maxWidth: 480, margin: '0 auto' }}>
        <BottomNav
          activeKey="today"
          onSelect={(k) => { if (k === 'today') handleGoToday(); else if (k === 'exercises') navigate('/exercises'); }}
          items={[
            { key: 'today', label: 'Today', icon: <CalendarDays size={22} /> },
            { key: 'exercises', label: 'Exercises', icon: <Dumbbell size={22} /> },
          ]}
          primary={{ label: 'Add Exercise', icon: <Plus size={26} />, onClick: openExercisePicker }}
        />
      </div>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => { setIsCalendarOpen(false); setRefreshKey((prev) => prev + 1); }}
        onSelectDate={handleSelectDate}
      />

      {/* Exercise Picker */}
      <Modal
        open={isPickerOpen}
        onClose={closeExercisePicker}
        variant="sheet"
        contained={false}
        title="Add Exercise"
        subtitle="Pick from your library or add a new one"
        headerRight={<IconButton ariaLabel="Close" variant="soft" onClick={closeExercisePicker}><X size={18} /></IconButton>}
      >
        <div style={{ paddingBottom: 12 }}>
          <Input icon={<Search size={18} />} placeholder="Search exercises…" value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} autoFocus />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredLibrary.length === 0 ? (
            <div style={{ padding: '24px 8px', textAlign: 'center' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 12 }}>No exercises match your search.</p>
              <Button variant="secondary" icon={<Plus size={16} />} onClick={handleManualAddExercise}>New / manual exercise</Button>
            </div>
          ) : (
            <>
              {filteredLibrary.map(({ displayName, canonical, info }) => (
                <button
                  key={canonical}
                  onClick={() => handleSelectExercise({ displayName, canonical })}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', padding: '12px 4px', border: 'none', background: 'none', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{displayName}</span>
                    <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>
                      {[info.category, info.muscleLabels.join(', ')].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  <Plus size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                </button>
              ))}
              <button
                onClick={handleManualAddExercise}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '14px 4px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-link)', fontWeight: 700, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)' }}
              >
                <Plus size={16} /> New / manual exercise
              </button>
            </>
          )}
        </div>
      </Modal>

      {/* Body Weight Modal */}
      <BodyWeightModal
        isOpen={isBodyWeightModalOpen}
        onClose={() => setIsBodyWeightModalOpen(false)}
        initialWeight={bodyWeightInput}
        selectedDate={selectedDate}
        onSave={async (val) => { await commitBodyWeight(val); }}
      />

      {/* Quick Edit Modal */}
      {editingExercise && (
        <Modal
          open
          onClose={closeQuickEdit}
          variant="sheet"
          contained={false}
          eyebrow="Edit"
          title={editingExercise.data.displayName || editingExercise.data.name || 'Untitled exercise'}
          headerRight={
            <>
              <Button variant="secondary" size="sm" icon={<ExternalLink size={14} />} onClick={() => navigate(`/exercise/${encodeURIComponent(editingExercise.data.displayName || editingExercise.data.name)}`)}>Detail</Button>
              <IconButton ariaLabel="Close" variant="soft" onClick={closeQuickEdit}><X size={18} /></IconButton>
            </>
          }
          footer={<Button variant="primary" fullWidth size="lg" onClick={handleQuickEditSave}>Save &amp; close</Button>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 4 }}>
            {editingExercise.data.sets.map((set, setIdx) => (
              <div key={setIdx} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingBottom: 1, width: 28, flexShrink: 0 }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)' }}>{setIdx + 1}</span>
                  <IconButton ariaLabel="Duplicate set" variant="soft" size="sm" onClick={() => handleQuickEditDuplicateSet(setIdx)} style={{ color: 'var(--accent)' }}><Copy size={15} /></IconButton>
                </div>
                <Stepper label="kg" value={set.w} onChange={(e) => handleQuickEditSetChange(setIdx, 'w', e.target.value)} onDecrement={() => handleQuickEditSetChange(setIdx, 'w', adjustWeight(set.w, -qeWeightStep))} onIncrement={() => handleQuickEditSetChange(setIdx, 'w', adjustWeight(set.w, qeWeightStep))} />
                <Stepper label="Reps" value={set.r} onChange={(e) => handleQuickEditSetChange(setIdx, 'r', e.target.value)} onDecrement={() => handleQuickEditSetChange(setIdx, 'r', Math.max(0, Number(set.r || 0) - 1))} onIncrement={() => handleQuickEditSetChange(setIdx, 'r', Number(set.r || 0) + 1)} />
                <IconButton ariaLabel="Delete set" variant="ghost" onClick={() => handleQuickEditDeleteSet(setIdx)} style={{ color: 'var(--red-500)', marginBottom: 1 }}><Trash2 size={18} /></IconButton>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 14 }}>
            <Button variant="danger" onClick={handleQuickEditDeleteExercise} style={{ flex: '0 0 auto' }}>Delete</Button>
            <Button variant="secondary" fullWidth icon={<Plus size={16} />} onClick={handleQuickEditAddSet}>Add set</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
