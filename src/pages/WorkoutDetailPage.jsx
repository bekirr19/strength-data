import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getWorkoutByDate, getWorkouts, saveWorkout, deleteWorkout, resolveWeightValue, getExercises, saveExercises, renameExerciseEverywhere, normalizeExerciseName } from '../utils/storage-client';
import { getExerciseInfo } from '../utils/exerciseMetadata';
import { formatDateLongEN } from '../utils/datetime';
import ExerciseEditModal from '../components/ExerciseEditModal';
import { ArrowLeft, Trash2, CalendarCog, Pencil, Copy, Plus, X, Search, History, Check } from 'lucide-react';
import { Card } from '../ds/components/layout/Card';
import { Stepper } from '../ds/components/forms/Stepper';
import { Input } from '../ds/components/forms/Input';
import { FilterChip } from '../ds/components/forms/FilterChip';
import { Button } from '../ds/components/buttons/Button';
import { IconButton } from '../ds/components/buttons/IconButton';
import { Modal } from '../ds/components/feedback/Modal';

const CATEGORY_ORDER = ['push', 'pull', 'leg', 'other'];

const MAIN_PAGE_CATEGORY_PRIORITY = {
  leg: 0,
  chest: 1,
  back: 2,
  shoulder: 3,
  arm: 4,
  core: 5,
  other: 6,
};

const detectCategoryKey = (item, library = []) => {
  const name = item?.displayName || item?.name || '';
  const canonical = item?.canonicalName || normalizeExerciseName(name);
  const key = canonical.toLowerCase();

  // Custom library lookup
  const customExercise = library.find((ex) => {
    const exKey = (ex.canonicalName || normalizeExerciseName(ex.name)).toLowerCase();
    return exKey === key;
  });

  const overrides = { ...item, ...customExercise };
  const info = getExerciseInfo(name, overrides);
  const cat = (info?.category || '').toLowerCase();
  const muscles = Array.isArray(info?.muscleLabels)
    ? info.muscleLabels.map((m) => m.toLowerCase())
    : [];

  const matches = (keyword) => cat.includes(keyword) || muscles.some((m) => m.includes(keyword));

  if (matches('chest') || matches('gogus') || matches('göğüs')) return 'chest';
  if (matches('back') || matches('sirt') || matches('sırt')) return 'back';
  if (matches('shoulder') || matches('omuz') || matches('deltoid')) return 'shoulder';
  if (matches('arm') || matches('kol') || matches('bicep') || matches('tricep')) return 'arm';
  if (matches('leg') || matches('bacak') || matches('quad') || matches('hamstring') || matches('glute')) return 'leg';
  if (matches('core') || matches('abs') || matches('karin') || matches('karın')) return 'core';
  return 'other';
};

const normalizeFocus = (focusArray = []) =>
  Array.from(
    new Set(
      focusArray
        .filter(Boolean)
        .map((f) => f.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, 'tr'));

const focusKey = (focusArray = []) => normalizeFocus(focusArray).join('|').toLowerCase();

const inferFocusFromName = (name = '') => {
  const lower = name.toLowerCase();
  const set = new Set();
  if (lower.includes('push')) set.add('Push');
  if (lower.includes('pull')) set.add('Pull');
  if (lower.includes('leg') || lower.includes('bacak')) set.add('Leg');
  return normalizeFocus(Array.from(set));
};
const canonicalFromParts = (canonical, name) => normalizeExerciseName(canonical || name || '');
const canonicalKeyFromParts = (canonical, name) => canonicalFromParts(canonical, name).toLowerCase();

export default function WorkoutDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { date } = useParams();
  const [workout, setWorkout] = useState({ dateISO: date, items: [], notes: '', workoutFuel: '', workoutName: '', workoutFocus: [] });
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [workoutsByDate, setWorkoutsByDate] = useState(null);
  const [editExerciseModal, setEditExerciseModal] = useState({
    isOpen: false,
    exerciseIndex: null,
    editingKey: '',
    originalName: '',
    form: {
      name: '',
      category: 'other',
      muscles: [],
      weightStep: 2.5,
    },
  });
  const [isSavingExerciseEdit, setIsSavingExerciseEdit] = useState(false);
  const [focusTarget, setFocusTarget] = useState(null); // { exerciseIdx, setIdx, field: 'w' | 'r' }
  const dateInputRef = useRef(null);

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

  const sortedItems = useMemo(() => {
    return (workout.items || [])
      .map((item, idx) => ({
        item,
        idx,
        category: detectCategoryKey(item, exerciseLibrary),
        usage: workoutUsageMap[canonicalFromParts(item.canonicalName, item.displayName || item.name).toLowerCase()] || exerciseUsageMap[canonicalFromParts(item.canonicalName, item.displayName || item.name).toLowerCase()] || 0,
      }))
      .sort((a, b) => {
        const pa = MAIN_PAGE_CATEGORY_PRIORITY[a.category] ?? MAIN_PAGE_CATEGORY_PRIORITY.other;
        const pb = MAIN_PAGE_CATEGORY_PRIORITY[b.category] ?? MAIN_PAGE_CATEGORY_PRIORITY.other;
        if (pa !== pb) return pa - pb;

        if (a.usage !== b.usage) return b.usage - a.usage;

        const nameA = a.item.displayName || a.item.name || '';
        const nameB = b.item.displayName || b.item.name || '';
        return nameA.localeCompare(nameB, 'tr');
      });
  }, [workout.items, exerciseLibrary, workoutUsageMap, exerciseUsageMap]);

  const normalizeWorkoutLabel = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('push')) return 'Push Day';
    if (lower.includes('pull')) return 'Pull Day';
    if (lower.includes('leg') || lower.includes('bacak')) return 'Leg Day';
    return '';
  };

  const labelFromFocus = (focusArray = []) => {
    const normalized = normalizeFocus(focusArray);
    if (normalized.length === 0) return '';
    if (normalized.length === 1) return `${normalized[0]} Day`;
    return normalized.join(' + ');
  };

  const inferWorkoutTypeFromHistory = async (targetDate, cachedWorkouts) => {
    try {
      let all = cachedWorkouts;
      if (!all || Object.keys(all).length === 0) {
        all = await getWorkouts();
      }
      if (!all) return '';

      const sameDayEntry = all[targetDate];
      const sameDayLabel = normalizeWorkoutLabel(sameDayEntry?.workoutName);
      if (sameDayLabel) {
        return sameDayLabel;
      }

      const sortedKeys = Object.keys(all)
        .filter((key) => key <= targetDate)
        .sort((a, b) => (a > b ? -1 : 1));

      for (const key of sortedKeys) {
        const label = normalizeWorkoutLabel(all[key]?.workoutName);
        if (label) {
          return label;
        }
      }

      return '';
    } catch (error) {
      console.error('Antrenman türü çıkarılırken hata:', error);
      return '';
    }
  };
  const filteredLibrary = useMemo(() => {
    const query = pickerSearch.trim().toLowerCase();

    return exerciseLibrary
      .map((exercise) => {
        const displayName = exercise.displayName || exercise.name;
        const canonical = canonicalFromParts(exercise.canonicalName, displayName);
        const info = getExerciseInfo(displayName, exercise);
        return {
          exercise,
          displayName,
          canonical,
          info,
        };
      })
      .filter(({ displayName, canonical, info }) => {
        if (!query) return true;
        const nameLower = displayName.toLowerCase();
        const canonicalLower = canonical.toLowerCase();
        if (nameLower.includes(query) || canonicalLower.includes(query)) return true;
        return info.muscleLabels.some((label) => label.toLowerCase().includes(query));
      })
      .sort((a, b) => {
        return a.displayName.localeCompare(b.displayName, 'tr');
      });
  }, [exerciseLibrary, pickerSearch]);

  const closeExercisePicker = () => {
    setIsPickerOpen(false);
    setPickerSearch('');
  };

  useEffect(() => {
    const handleFocus = async () => {
      const exercisesData = await getExercises();
      setExerciseLibrary(exercisesData);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    if (!isPickerOpen) {
      return undefined;
    }
    if (typeof document === 'undefined') {
      return undefined;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isPickerOpen]);

  useEffect(() => {
    async function loadWorkout() {
      try {
        setIsLoading(true);
        const [existing, exercisesData] = await Promise.all([
          getWorkoutByDate(date),
          getExercises()
        ]);
        
        setExerciseLibrary(exercisesData);
        
        if (existing) {
          const normalizedName = normalizeWorkoutLabel(existing.workoutName);
          const inferredFocus = Array.isArray(existing.workoutFocus) && existing.workoutFocus.length > 0
            ? normalizeFocus(existing.workoutFocus)
            : inferFocusFromName(existing.workoutName || normalizedName);

          setWorkout({
            ...existing,
            workoutName: normalizedName,
            workoutFocus: inferredFocus,
            items: (existing.items || []).map((item) => ({
              ...item,
              name: item.displayName || item.name,
              displayName: item.displayName || item.name,
              canonicalName: canonicalFromParts(item.canonicalName, item.displayName || item.name),
              sets: (item.sets || []).map((set) => ({
                ...set,
                w: typeof set.wDisplay === 'string' && set.wDisplay.length > 0
                  ? set.wDisplay
                  : (Number.isFinite(Number(set.w)) && Number(set.w) > 0 ? String(Number(set.w)) : ''),
                r: Number(set.r || 0),
              })),
            })),
          });
        } else {
          const inferredType = await inferWorkoutTypeFromHistory(date, workoutsByDate);
          setWorkout({
            dateISO: date,
            workoutName: inferredType || '',
            workoutFocus: inferFocusFromName(inferredType || ''),
            workoutFuel: '',
            items: [],
            notes: '',
          });
        }
      } catch (error) {
        console.error('Error loading workout:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkout();
  }, [date]);

  useEffect(() => {
    if (isLoading) return;
    if (location.state?.openPicker) {
      openExercisePicker();
      navigate('.', { replace: true, state: {} });
    }
  }, [isLoading, location.state]);

  useEffect(() => {
    let isMounted = true;

    async function fetchWorkouts() {
      try {
        const all = await getWorkouts();
        if (isMounted) {
          setWorkoutsByDate(all || {});
        }
      } catch (error) {
        console.error('Antrenman geçmişi yüklenirken hata:', error);
        if (isMounted) {
          setWorkoutsByDate({});
        }
      }
    }

    fetchWorkouts();

    return () => {
      isMounted = false;
    };
  }, []);

  const mapTemplateItems = (templateItems) => {
    if (!Array.isArray(templateItems)) {
      return [];
    }

    return templateItems.map((item) => ({
      name: item.displayName || item.name || '',
      displayName: item.displayName || item.name || '',
  canonicalName: canonicalFromParts(item.canonicalName, item.displayName || item.name || ''),
      sets: [{ w: '', r: '' }],
    }));
  };

  const selectWorkoutTemplateByFocus = async (nextFocus) => {
    const normalizedFocus = normalizeFocus(nextFocus);
    const targetKey = focusKey(normalizedFocus);
    const targetLabel = labelFromFocus(normalizedFocus);

    try {
      const all = await getWorkouts();
      setWorkoutsByDate(all || {});

      const entries = all ? Object.entries(all) : [];
      const sortedDates = entries
        .map(([dateKey]) => dateKey)
        .filter((dateKey) => dateKey !== workout.dateISO)
        .sort((a, b) => (a > b ? -1 : 1));

      const focusMatches = sortedDates.filter((dateKey) => {
        const candidate = all[dateKey];
        if (!candidate) return false;

        const candidateFocus = Array.isArray(candidate.workoutFocus) ? candidate.workoutFocus : [];
        const candidateKey = focusKey(candidateFocus);
        const hasExercises = Array.isArray(candidate.items) && candidate.items.length > 0;

        if (hasExercises && candidateKey === targetKey) return true;

        // Fallback: eski kayıtlar sadece isim içeriyorsa, isimde tüm etiketler geçiyorsa eşleştir
        const nameLower = (candidate.workoutName || '').toLowerCase();
        const allNamesMatch = normalizedFocus.every((f) => nameLower.includes(f.toLowerCase()));
        return hasExercises && normalizedFocus.length > 0 && allNamesMatch;
      });

      // İstenen davranış: aynı odaklı son kaydın bir öncesini getir (2. önceki).
      const targetDate = focusMatches[1] || focusMatches[0];

      if (targetDate) {
        const template = all[targetDate];
        setWorkout((prev) => ({
          ...prev,
          workoutName: targetLabel,
          workoutFocus: normalizedFocus,
          items: mapTemplateItems(template.items),
        }));
      } else {
        setWorkout((prev) => ({
          ...prev,
          workoutName: targetLabel,
          workoutFocus: normalizedFocus,
          items: [{ name: '', displayName: '', canonicalName: '', sets: [{ w: '', r: '' }] }],
        }));
      }
    } catch (error) {
      console.error('Antrenman şablonu seçilirken hata:', error);
      setWorkout((prev) => ({
        ...prev,
        workoutName: targetLabel,
        workoutFocus: normalizedFocus,
        items: [{ name: '', displayName: '', canonicalName: '', sets: [{ w: '', r: '' }] }],
      }));
    }
  };

  const openExercisePicker = async () => {
    const exercisesData = await getExercises();
    setExerciseLibrary(exercisesData);
    setPickerSearch('');
    setIsPickerOpen(true);
  };

  const handleManualAddExercise = () => {
    setWorkout((prev) => ({
      ...prev,
      items: [...prev.items, { name: '', displayName: '', canonicalName: '', sets: [{ w: '', r: '' }] }],
    }));
    setFocusTarget({ exerciseIdx: workout.items.length, setIdx: 0, field: 'w' });
    closeExercisePicker();
  };

  const handleToggleFocus = async (label) => {
    const nextFocus = normalizeFocus(
      (workout.workoutFocus || []).includes(label)
        ? (workout.workoutFocus || []).filter((f) => f !== label)
        : [...(workout.workoutFocus || []), label]
    );

    const nextLabel = labelFromFocus(nextFocus);

    setWorkout((prev) => ({
      ...prev,
      workoutFocus: nextFocus,
      workoutName: nextLabel,
    }));
  };

  const handleLoadTemplateFromHistory = async () => {
    const currentFocus = normalizeFocus(workout.workoutFocus || []);
    if (currentFocus.length === 0) {
      alert('Lütfen önce en az bir tür seçin.');
      return;
    }
    await selectWorkoutTemplateByFocus(currentFocus);
  };

  const openExerciseEditModal = async (exerciseIdx) => {
    const current = workout.items[exerciseIdx];
    if (!current) return;

    const canonical = canonicalFromParts(current.canonicalName, current.displayName || current.name);
    const key = canonical.toLowerCase();

    const exercisesData = await getExercises();
    setExerciseLibrary(exercisesData);
    const match = exercisesData.find((exercise) => canonicalKeyFromParts(exercise.canonicalName, exercise.name) === key);

    const baseName = match?.displayName || match?.name || current.displayName || current.name || canonical;
    const info = getExerciseInfo(baseName, match || current);
    const category = match?.customCategory || info.category || 'other';
    const muscles = Array.isArray(match?.customMuscles) && match.customMuscles.length > 0
      ? match.customMuscles
      : Array.isArray(info.muscles)
        ? info.muscles
        : [];

    setEditExerciseModal({
      isOpen: true,
      exerciseIndex: exerciseIdx,
      editingKey: key,
      originalName: baseName,
      form: {
        name: baseName,
        category,
        muscles,
        weightStep: match?.weightStep ?? 2.5,
      },
    });
  };

  const closeExerciseEditModal = () => {
    setEditExerciseModal({
      isOpen: false,
      exerciseIndex: null,
      editingKey: '',
      originalName: '',
      form: {
        name: '',
        category: 'other',
        muscles: [],
        weightStep: 2.5,
      },
    });
    setIsSavingExerciseEdit(false);
  };

  const updateExerciseEditForm = (updater) => {
    setEditExerciseModal((prev) => {
      const nextForm = typeof updater === 'function' ? updater(prev.form) : { ...prev.form, ...updater };
      return {
        ...prev,
        form: {
          ...prev.form,
          ...nextForm,
        },
      };
    });
  };

  const handleExerciseEditSave = async () => {
    if (!editExerciseModal.isOpen || editExerciseModal.exerciseIndex === null) {
      return;
    }

    const trimmedName = (editExerciseModal.form.name || '').trim();
    if (!trimmedName) {
      alert('Lütfen geçerli bir egzersiz adı girin.');
      return;
    }

    const normalized = normalizeExerciseName(trimmedName);
    if (!normalized) {
      alert('Egzersiz adı geçersiz.');
      return;
    }

    const originalTrimmed = (editExerciseModal.originalName || '').trim();
    const originalNormalized = normalizeExerciseName(editExerciseModal.originalName);

    const category = editExerciseModal.form.category || 'other';
    const muscles = Array.isArray(editExerciseModal.form.muscles)
      ? editExerciseModal.form.muscles.filter(Boolean)
      : [];
    const weightStep = editExerciseModal.form.weightStep ?? 2.5;

    try {
      setIsSavingExerciseEdit(true);
      const exercisesData = await getExercises();

      const newKey = normalized.toLowerCase();
      const editingKey = editExerciseModal.editingKey;

      const conflict = exercisesData.some((exercise) => {
        const key = canonicalKeyFromParts(exercise.canonicalName, exercise.name);
        return key === newKey && key !== editingKey;
      });

      if (conflict) {
        alert('Bu isimde başka bir egzersiz mevcut. Lütfen farklı bir isim deneyin.');
        setIsSavingExerciseEdit(false);
        return;
      }

      const updatedList = [...exercisesData];
      const targetIndex = updatedList.findIndex((exercise) => canonicalKeyFromParts(exercise.canonicalName, exercise.name) === editingKey);

      if (targetIndex === -1) {
        updatedList.push({
          name: trimmedName,
          displayName: trimmedName,
          canonicalName: normalized,
          customCategory: category,
          customMuscles: muscles,
          weightStep,
          createdAt: Date.now(),
          used: 0,
        });
      } else {
        updatedList[targetIndex] = {
          ...updatedList[targetIndex],
          name: trimmedName,
          displayName: trimmedName,
          canonicalName: normalized,
          customCategory: category,
          customMuscles: muscles,
          weightStep,
        };
      }

      await saveExercises(updatedList);

      const shouldRenameEverywhere = Boolean(originalTrimmed) && (
        originalTrimmed.toLowerCase() !== trimmedName.toLowerCase() ||
        (!!originalNormalized && originalNormalized.toLowerCase() !== normalized.toLowerCase())
      );

      if (shouldRenameEverywhere) {
        await renameExerciseEverywhere(editExerciseModal.originalName, trimmedName, normalized);
        const refreshedWorkouts = await getWorkouts();
        setWorkoutsByDate(refreshedWorkouts || {});
      }

      const refreshedExercises = await getExercises();
      setExerciseLibrary(refreshedExercises);

      setWorkout((prev) => {
        const items = prev.items.map((item) => {
          const itemKey = canonicalKeyFromParts(item.canonicalName, item.name);
          if (itemKey === editingKey) {
            return {
              ...item,
              name: trimmedName,
              displayName: trimmedName,
              canonicalName: normalized,
            };
          }
          return item;
        });
        return {
          ...prev,
          items,
        };
      });

      closeExerciseEditModal();
    } catch (error) {
      console.error('Egzersiz düzenlenirken hata:', error);
      alert('Egzersiz güncellenemedi. Lütfen tekrar deneyin.');
      setIsSavingExerciseEdit(false);
    }
  };

  const handleSelectExercise = ({ displayName, canonical }) => {
    setWorkout((prev) => ({
      ...prev,
      items: [...prev.items, { name: displayName, displayName, canonicalName: canonical, sets: [{ w: '', r: '' }] }],
    }));
    setFocusTarget({ exerciseIdx: workout.items.length, setIdx: 0, field: 'w' });
    closeExercisePicker();
  };

  const handleDeleteExercise = (idx) => {
    const updated = [...workout.items];
    updated.splice(idx, 1);
    setWorkout({ ...workout, items: updated });
  };

  const handleAddSet = (exerciseIdx) => {
    setWorkout((prev) => {
      const items = [...prev.items];
      const target = { ...items[exerciseIdx] };
      const sets = [...(target.sets || [])];
      const lastSet = sets[sets.length - 1] || { w: '', r: '' };
      sets.push({ w: lastSet.w || '', r: lastSet.r || '' });
      target.sets = sets;
      items[exerciseIdx] = target;
      return { ...prev, items };
    });
  };

  const handleDeleteSet = (exerciseIdx, setIdx) => {
    const updated = [...workout.items];
    updated[exerciseIdx].sets.splice(setIdx, 1);
    setWorkout({ ...workout, items: updated });
  };

  const handleSetChange = (exerciseIdx, setIdx, field, value) => {
    const updated = [...workout.items];
    updated[exerciseIdx].sets[setIdx][field] = value;
    setWorkout({ ...workout, items: updated });
  };

  const handleDuplicateSet = (exerciseIdx, setIdx) => {
    setWorkout((prev) => {
      const items = [...prev.items];
      const target = { ...items[exerciseIdx] };
      const sets = [...(target.sets || [])];
      const source = sets[setIdx];
      if (!source) return prev;
      sets.push({ ...source });
      target.sets = sets;
      items[exerciseIdx] = target;
      return { ...prev, items };
    });
  };

  const adjustWeight = (current, delta) => {
    const normalized = String(current ?? '').trim();
    const lower = normalized.toLowerCase();
    
    // Body Weight veya BW ile başlıyorsa
    if (lower.startsWith('body') || lower.startsWith('bw')) {
      // BW+X formatında mı?
      const plusIndex = normalized.indexOf('+');
      if (plusIndex !== -1) {
        const extraPart = normalized.slice(plusIndex + 1).trim();
        const extra = parseFloat(extraPart);
        if (Number.isFinite(extra)) {
          const newExtra = Math.max(0, extra + delta);
          if (newExtra === 0) {
            return 'BW';
          }
          return `BW+${newExtra % 1 === 0 ? newExtra : newExtra.toFixed(1)}`;
        }
      }
      // Sadece BW ise, artırırsak BW+delta yap
      if (delta > 0) {
        return `BW+${delta}`;
      }
      // Azaltma olursa BW olarak bırak
      return 'BW';
    }

    // Normal sayısal değer
    const numeric = parseFloat(normalized.replace(',', '.'));
    if (!Number.isFinite(numeric)) {
      return String(delta > 0 ? delta : 0);
    }

    const next = numeric + delta;
    const clamped = Math.max(0, Math.round(next * 10) / 10);
    if (clamped === 0) {
      return '';
    }
    return clamped % 1 === 0 ? String(clamped) : clamped.toFixed(1);
  };

  const buildCleanWorkout = (targetDateISO) => {
    const issues = [];

    const cleanedItems = (workout.items || [])
      .map((it, exerciseIdx) => {
        const trimmedName = (it.displayName || it.name || '').trim();
        const exerciseLabel = trimmedName || `Egzersiz ${exerciseIdx + 1}`;

        if (!trimmedName) {
          issues.push(`${exerciseLabel} için bir isim girin.`);
          return null;
        }

        const canonical = canonicalFromParts(it.canonicalName, trimmedName);
        if (!canonical) {
          issues.push(`${exerciseLabel} adı geçerli değil.`);
          return null;
        }

        const sets = Array.isArray(it.sets) ? it.sets : [];
        const cleanedSets = [];

        sets.forEach((set, setIdx) => {
          const repsInput = String(set?.r ?? '').trim();
          const weightInput = String(set?.w ?? '').trim();

          const hasReps = repsInput.length > 0;
          const hasWeight = weightInput.length > 0;

          if (!hasReps && !hasWeight) {
            return;
          }

          if (!hasReps || !hasWeight) {
            issues.push(`${exerciseLabel} set ${setIdx + 1} için ağırlık ve tekrar değerlerini birlikte girin ya da tamamen boş bırakın.`);
            return;
          }

          const reps = Number(repsInput);
          if (!Number.isFinite(reps) || reps <= 0) {
            issues.push(`${exerciseLabel} set ${setIdx + 1} için geçerli tekrar sayısı girin.`);
            return;
          }

          const { value, display } = resolveWeightValue(weightInput, trimmedName, targetDateISO);

          const isBodyWeight = display && (display === 'Body Weight' || display.startsWith('BW'));
          const hasValidWeight = Number.isFinite(value) && value > 0;

          if (!isBodyWeight && !hasValidWeight) {
            issues.push(`${exerciseLabel} set ${setIdx + 1} için geçerli ağırlık girin (sayı veya BW yazın).`);
            return;
          }

          cleanedSets.push({
            w: value,
            wDisplay: display || String(value),
            r: reps,
          });
        });

        return {
          ...it,
          name: trimmedName,
          displayName: trimmedName,
          canonicalName: canonical,
          sets: cleanedSets,
        };
      })
      .filter(Boolean);

    if (cleanedItems.length === 0) {
      issues.push('Kaydetmek için en az bir egzersiz adı girin.');
    }

    const cleaned = {
      ...workout,
      dateISO: targetDateISO,
      workoutFocus: Array.isArray(workout.workoutFocus) ? workout.workoutFocus : [],
      items: cleanedItems,
    };

    return { cleaned, issues };
  };

  const handleDelete = async () => {
    if (confirm('Bu antrenmanı silmek istediğinizden emin misiniz?')) {
      await deleteWorkout(date);
      alert('Antrenman silindi!');
      navigate('/');
    }
  };

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    if (!newDate || newDate === date) return;

    try {
      const targetWorkout = await getWorkoutByDate(newDate);
      if (targetWorkout && Array.isArray(targetWorkout.items) && targetWorkout.items.length > 0) {
        alert(`Seçilen tarihte (${newDate}) zaten bir antrenman kaydı mevcut. Lütfen başka bir tarih seçin.`);
        if (dateInputRef.current) {
          dateInputRef.current.value = date;
        }
        return;
      }

      const { cleaned, issues } = buildCleanWorkout(newDate);
      if (issues.length > 0) {
        alert(issues.join('\n'));
        if (dateInputRef.current) {
          dateInputRef.current.value = date;
        }
        return;
      }

      if (confirm(`Antrenmanı ${newDate} tarihine taşımak istediğinize emin misiniz?`)) {
        await saveWorkout(cleaned);
        await deleteWorkout(date);
        navigate(`/workout/${newDate}`, { replace: true });
      } else {
        if (dateInputRef.current) {
          dateInputRef.current.value = date;
        }
      }
    } catch (error) {
      console.error('Tarih değiştirilirken hata:', error);
      alert('Tarih değiştirilemedi.');
      if (dateInputRef.current) {
        dateInputRef.current.value = date;
      }
    }
  };

  const handleSave = async () => {
    const { cleaned, issues } = buildCleanWorkout(workout.dateISO);

    if (issues.length > 0) {
      alert(issues.join('\n'));
      return;
    }

    // Hızlı çıkış: önce navigasyon, kaydı arka planda yap
    navigate('/', { state: { updatedWorkout: cleaned } });

    try {
      await saveWorkout(cleaned);
    } catch (error) {
      console.error('Antrenman kaydedilirken hata:', error);
      alert('Antrenman kaydedilirken bir hata oluştu.');
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-page)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent)', animation: 'sd-spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Loading workout…</p>
        <style>{`@keyframes sd-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const FOCUS_LABELS = ['Pull', 'Push', 'Leg'];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-page)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(247,248,250,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <IconButton ariaLabel="Back" variant="ghost" onClick={() => navigate(-1)}><ArrowLeft size={20} /></IconButton>
        <h2 style={{ flex: 1, margin: 0, textAlign: 'center', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>Workout Detail</h2>
        <IconButton ariaLabel="Delete workout" variant="ghost" onClick={handleDelete} style={{ color: 'var(--red-500)' }}><Trash2 size={18} /></IconButton>
      </header>

      <main style={{ flex: 1, padding: '16px 16px 96px', maxWidth: 560, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-.02em', color: 'var(--text-primary)' }}>{formatDateLongEN(date)}</h1>
          <div style={{ position: 'relative' }}>
            <IconButton ariaLabel="Move workout" variant="outline" onClick={() => dateInputRef.current?.showPicker()}><CalendarCog size={18} /></IconButton>
            <input ref={dateInputRef} type="date" style={{ position: 'absolute', inset: 0, opacity: 0, width: 0, height: 0 }} onChange={handleDateChange} defaultValue={date} />
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {FOCUS_LABELS.map((label) => (
              <FilterChip key={label} label={label} active={(workout.workoutFocus || []).includes(label)} onClick={() => handleToggleFocus(label)} style={{ flex: 1, justifyContent: 'center' }} />
            ))}
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {(workout.workoutFocus || []).length > 0 ? `Loads the 2nd-most-recent ${labelFromFocus(workout.workoutFocus)} exercises` : 'No focus selected'}
            </span>
            <Button variant="ghost" size="sm" icon={<History size={16} />} onClick={handleLoadTemplateFromHistory} style={{ color: 'var(--text-link)', flexShrink: 0 }}>Load from history</Button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sortedItems.map(({ item, idx: exerciseIdx }, loopIdx) => {
            const itemKey = canonicalKeyFromParts(item.canonicalName, item.displayName || item.name);
            const libEntry = exerciseLibrary.find((e) => canonicalKeyFromParts(e.canonicalName, e.name) === itemKey);
            const weightStep = libEntry?.weightStep ?? 2.5;
            return (
              <Card key={exerciseIdx} pad="md" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="sd-eyebrow" style={{ color: 'var(--accent)', marginBottom: 3 }}>Exercise {loopIdx + 1}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button type="button" onClick={() => { if (item.name) navigate(`/exercise/${encodeURIComponent(item.name)}`); }} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-lg)', fontWeight: 800, letterSpacing: '-.01em', color: 'var(--text-primary)', textAlign: 'left' }}>
                        {item.name || 'Untitled exercise'}
                      </button>
                      <IconButton ariaLabel="Edit exercise" variant="soft" size="sm" onClick={() => openExerciseEditModal(exerciseIdx)}><Pencil size={15} /></IconButton>
                    </div>
                  </div>
                  <IconButton ariaLabel="Delete exercise" variant="ghost" onClick={() => handleDeleteExercise(exerciseIdx)} style={{ color: 'var(--red-500)' }}><Trash2 size={18} /></IconButton>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {item.sets.map((set, setIdx) => (
                    <div key={setIdx} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingBottom: 1, width: 26, flexShrink: 0 }}>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)' }}>{setIdx + 1}</span>
                        <IconButton ariaLabel="Duplicate set" variant="soft" size="sm" onClick={() => handleDuplicateSet(exerciseIdx, setIdx)} style={{ color: 'var(--accent)' }}><Copy size={14} /></IconButton>
                      </div>
                      <Stepper label="kg" value={set.w} onChange={(e) => handleSetChange(exerciseIdx, setIdx, 'w', e.target.value)} onDecrement={() => handleSetChange(exerciseIdx, setIdx, 'w', adjustWeight(set.w, -weightStep))} onIncrement={() => handleSetChange(exerciseIdx, setIdx, 'w', adjustWeight(set.w, weightStep))} />
                      <Stepper label="Reps" value={set.r} onChange={(e) => handleSetChange(exerciseIdx, setIdx, 'r', e.target.value)} onDecrement={() => handleSetChange(exerciseIdx, setIdx, 'r', Math.max(0, Number(set.r || 0) - 1))} onIncrement={() => handleSetChange(exerciseIdx, setIdx, 'r', Number(set.r || 0) + 1)} />
                      <IconButton ariaLabel="Delete set" variant="ghost" onClick={() => handleDeleteSet(exerciseIdx, setIdx)} style={{ color: 'var(--red-500)', marginBottom: 1 }}><Trash2 size={18} /></IconButton>
                    </div>
                  ))}
                </div>

                <Button variant="ghost" fullWidth icon={<Plus size={16} />} onClick={() => handleAddSet(exerciseIdx)} style={{ border: '1px dashed var(--border-strong)', color: 'var(--text-secondary)' }}>Add set</Button>
              </Card>
            );
          })}
        </div>

        <div style={{ marginTop: 14 }}>
          <Button variant="secondary" fullWidth size="lg" icon={<Plus size={18} />} onClick={openExercisePicker}>Add Exercise</Button>
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pre-workout fuel</label>
            <Input value={workout.workoutFuel || ''} onChange={(e) => setWorkout({ ...workout, workoutFuel: e.target.value })} placeholder="e.g. 2 eggs, 1 banana, caffeine (200mg)" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</label>
            <textarea value={workout.notes || ''} onChange={(e) => setWorkout({ ...workout, notes: e.target.value })} rows={4} placeholder="How did today go? Note your energy, motivation, or anything you struggled with." style={{ width: '100%', resize: 'vertical', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--surface-card)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-xs)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
      </main>

      <ExerciseEditModal
        isOpen={editExerciseModal.isOpen}
        form={editExerciseModal.form}
        onChange={updateExerciseEditForm}
        onClose={closeExerciseEditModal}
        onSave={handleExerciseEditSave}
        isSaving={isSavingExerciseEdit}
      />

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
                <button key={canonical} onClick={() => handleSelectExercise({ displayName, canonical })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', padding: '12px 4px', border: 'none', background: 'none', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{displayName}</span>
                    <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>{[info.category, info.muscleLabels.join(', ')].filter(Boolean).join(' · ')}</span>
                  </div>
                  <Plus size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                </button>
              ))}
              <button onClick={handleManualAddExercise} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '14px 4px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-link)', fontWeight: 700, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)' }}>
                <Plus size={16} /> New / manual exercise
              </button>
            </>
          )}
        </div>
      </Modal>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: 'linear-gradient(to top, var(--surface-page) 72%, transparent)', zIndex: 20 }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <Button variant="primary" fullWidth size="lg" icon={<Check size={18} />} onClick={handleSave}>Save Workout</Button>
        </div>
      </div>
    </div>
  );
}
