import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWorkoutByDate, getWorkouts, saveWorkout, deleteWorkout, formatDateTRFull, resolveWeightValue, getExercises, saveExercises, renameExerciseEverywhere, normalizeExerciseName } from '../utils/storage';
import { getExerciseInfo, EXERCISE_CATEGORY_META, MUSCLE_OPTIONS } from '../utils/exerciseMetadata';

const CATEGORY_ORDER = ['push', 'pull', 'leg', 'other'];
const canonicalFromParts = (canonical, name) => normalizeExerciseName(canonical || name || '');
const canonicalKeyFromParts = (canonical, name) => canonicalFromParts(canonical, name).toLowerCase();

export default function WorkoutDetailPage() {
  const navigate = useNavigate();
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
    },
  });
  const [isSavingExerciseEdit, setIsSavingExerciseEdit] = useState(false);

  const normalizeWorkoutLabel = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('push')) return 'Push Day';
    if (lower.includes('pull')) return 'Pull Day';
    if (lower.includes('leg') || lower.includes('bacak')) return 'Leg Day';
    return '';
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
        const categoryDiff = CATEGORY_ORDER.indexOf(a.info.category) - CATEGORY_ORDER.indexOf(b.info.category);
        if (categoryDiff !== 0) return categoryDiff;
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
          setWorkout({
            ...existing,
            workoutName: normalizedName,
            workoutFocus: Array.isArray(existing.workoutFocus) ? existing.workoutFocus : [],
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
            workoutFocus: [],
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

  const selectWorkoutTemplate = async (nextWorkoutName) => {
    try {
      const all = await getWorkouts();
      setWorkoutsByDate(all || {});

      const entries = all ? Object.entries(all) : [];
      const sortedDates = entries
        .map(([dateKey]) => dateKey)
        .filter((dateKey) => dateKey !== workout.dateISO)
        .sort((a, b) => (a > b ? -1 : 1));
      const normalizedTarget = (nextWorkoutName || '').toLowerCase();

      const latestMatch = sortedDates.find((dateKey) => {
        const candidate = all[dateKey];
        if (!candidate) return false;

        const candidateName = (candidate.workoutName || '').toLowerCase();
        const candidateType = candidateName.replace(' day', '');
        const targetType = normalizedTarget.replace(' day', '');
        const hasExercises = Array.isArray(candidate.items) && candidate.items.length > 0;

        return hasExercises && (candidateName === normalizedTarget || candidateType === targetType);
      });

      if (latestMatch) {
        const template = all[latestMatch];
        setWorkout((prev) => ({
          ...prev,
          workoutName: nextWorkoutName,
          items: mapTemplateItems(template.items),
        }));
      } else {
        setWorkout((prev) => ({
          ...prev,
          workoutName: nextWorkoutName,
          items: [{ name: '', displayName: '', canonicalName: '', sets: [{ w: '', r: '' }] }],
        }));
      }
    } catch (error) {
      console.error('Antrenman şablonu seçilirken hata:', error);
      setWorkout((prev) => ({
        ...prev,
        workoutName: nextWorkoutName,
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
    setWorkout({
      ...workout,
      items: [...workout.items, { name: '', displayName: '', canonicalName: '', sets: [{ w: '', r: '' }] }],
    });
    closeExercisePicker();
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

  const toggleExerciseEditMuscle = (muscleKey) => {
    updateExerciseEditForm((prevForm) => {
      const exists = prevForm.muscles.includes(muscleKey);
      return {
        ...prevForm,
        muscles: exists
          ? prevForm.muscles.filter((m) => m !== muscleKey)
          : [...prevForm.muscles, muscleKey],
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
      sets.splice(setIdx + 1, 0, { ...source });
      target.sets = sets;
      items[exerciseIdx] = target;
      return { ...prev, items };
    });
  };

  const adjustWeight = (current, delta) => {
    const normalized = typeof current === 'string' ? current.trim() : '';
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

  const handleDelete = async () => {
    if (confirm('Bu antrenmanı silmek istediğinizden emin misiniz?')) {
      await deleteWorkout(date);
      alert('Antrenman silindi!');
      navigate('/');
    }
  };

  const handleSave = async () => {
    const issues = [];

    const cleanedItems = workout.items
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
            // tamamen boş bırakılmış, şablon satırı olarak kabul et ve kaydetme kapsamına alma
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

          const { value, display } = resolveWeightValue(weightInput, trimmedName, workout.dateISO);

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

    if (issues.length > 0) {
      alert(issues.join('\n'));
      return;
    }

    if (cleanedItems.length === 0) {
      alert('Kaydetmek için en az bir egzersiz adı girin.');
      return;
    }

    const cleaned = {
      ...workout,
      workoutFocus: Array.isArray(workout.workoutFocus) ? workout.workoutFocus : [],
      items: cleanedItems,
    };

    await saveWorkout(cleaned);
    alert('Antrenman kaydedildi!');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-primary"></div>
          <p className="text-sm text-gray-400">Antrenman yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <div className="flex items-center p-4 pb-2 justify-between sticky top-0 z-10 bg-background-dark/95 backdrop-blur-sm border-b border-gray-700/50">
        <button onClick={() => navigate(-1)} className="flex size-10 md:size-12 items-center justify-center hover:bg-gray-700 active:bg-gray-600 rounded-lg transition -ml-2">
          <span className="material-symbols-outlined text-white text-xl md:text-2xl">arrow_back</span>
        </button>
        <h2 className="text-white text-base md:text-lg font-bold flex-1 text-center px-2">Antrenman Detayı</h2>
        <button 
          onClick={handleDelete}
          className="flex size-10 md:size-12 items-center justify-center hover:bg-red-900/20 active:bg-red-900/30 rounded-lg transition text-red-400"
          aria-label="Antrenmanı sil"
        >
          <span className="material-symbols-outlined text-xl md:text-2xl">delete</span>
        </button>
      </div>

      <main className="flex-grow px-4 pb-24 md:pb-8 max-w-4xl mx-auto w-full">
        <h1 className="text-white text-xl md:text-[28px] font-bold pb-3 pt-4">{formatDateTRFull(date)}</h1>

        {/* Antrenman Adı */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Antrenman Türü</label>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => selectWorkoutTemplate('Pull Day')}
              className={`p-3 rounded-lg text-sm md:text-base font-semibold transition ${
                workout.workoutName === 'Pull Day'
                  ? 'bg-primary text-background-dark'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              Pull
            </button>
            <button
              type="button"
              onClick={() => selectWorkoutTemplate('Push Day')}
              className={`p-3 rounded-lg text-sm md:text-base font-semibold transition ${
                workout.workoutName === 'Push Day'
                  ? 'bg-primary text-background-dark'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              Push
            </button>
            <button
              type="button"
              onClick={() => selectWorkoutTemplate('Leg Day')}
              className={`p-3 rounded-lg text-sm md:text-base font-semibold transition ${
                workout.workoutName === 'Leg Day'
                  ? 'bg-primary text-background-dark'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              Leg
            </button>
          </div>
        </div>

        <button
          onClick={openExercisePicker}
          className="mb-4 w-full flex items-center justify-center gap-2 py-2.5 md:py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 active:bg-gray-600 transition text-sm md:text-base"
        >
          <span className="material-symbols-outlined text-lg md:text-xl">add</span>
          Egzersiz Ekle
        </button>

        <div className="flex flex-col gap-3 md:gap-4">
          {workout.items.map((item, exerciseIdx) => (
            <div key={exerciseIdx} className="rounded-xl bg-gray-800/30 p-3 md:p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-full min-w-0">
                  <p
                    className={`text-base md:text-lg font-bold truncate ${item.name ? 'text-white' : 'text-gray-500 italic'}`}
                    title={item.name || 'Egzersiz adını düzenle butonuyla belirleyin'}
                  >
                    {item.name || 'Egzersiz adı henüz seçilmedi'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openExerciseEditModal(exerciseIdx)}
                    className="flex size-9 md:size-10 items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                    title="Egzersizi düzenle"
                  >
                    <span className="material-symbols-outlined text-base md:text-lg">edit</span>
                  </button>
                  <button onClick={() => handleDeleteExercise(exerciseIdx)} className="flex size-9 md:size-10 items-center justify-center rounded-lg text-gray-400 hover:text-red-400 active:text-red-300 hover:bg-red-500/10 transition" title="Egzersizi sil">
                    <span className="material-symbols-outlined text-base md:text-lg">delete</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:gap-3">
                {item.sets.map((set, setIdx) => (
                  <div key={setIdx} className="grid grid-cols-12 gap-1.5 md:gap-2 items-center">
                    <span className="col-span-1 text-gray-400 text-xs md:text-sm font-medium">{setIdx + 1}.</span>
                    <div className="col-span-1 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleDuplicateSet(exerciseIdx, setIdx)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 active:bg-primary/40 transition"
                        aria-label="Seti kopyala"
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                      </button>
                    </div>
                    <div className="col-span-4">
                      <label className="text-[10px] md:text-xs text-gray-500 mb-0.5 block">Ağırlık (kg)</label>
                      <div className="flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => handleSetChange(exerciseIdx, setIdx, 'w', adjustWeight(set.w, -2.5))}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900/60 border border-gray-700 text-gray-200 hover:bg-gray-800 active:bg-gray-700 transition"
                          aria-label="Ağırlığı azalt"
                        >
                          <span className="material-symbols-outlined text-base">remove</span>
                        </button>
                        <input
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-2 py-1.5 md:py-2 text-white text-sm md:text-base focus:ring-1 focus:ring-primary text-center"
                          type="text"
                          value={set.w}
                          onChange={(e) => handleSetChange(exerciseIdx, setIdx, 'w', e.target.value)}
                          placeholder="70, BW, BW+10"
                        />
                        <button
                          type="button"
                          onClick={() => handleSetChange(exerciseIdx, setIdx, 'w', adjustWeight(set.w, 2.5))}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900/60 border border-gray-700 text-gray-200 hover:bg-gray-800 active:bg-gray-700 transition"
                          aria-label="Ağırlığı artır"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                        </button>
                      </div>
                    </div>
                    <div className="col-span-5">
                      <label className="text-[10px] md:text-xs text-gray-500 mb-0.5 block">Tekrar</label>
                      <div className="flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => handleSetChange(exerciseIdx, setIdx, 'r', Math.max(0, Number(set.r || 0) - 1))}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900/60 border border-gray-700 text-gray-200 hover:bg-gray-800 active:bg-gray-700 transition"
                          aria-label="Tekrar azalt"
                        >
                          <span className="material-symbols-outlined text-base">remove</span>
                        </button>
                        <input
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-2 py-1.5 md:py-2 text-white text-sm md:text-base focus:ring-1 focus:ring-primary text-center"
                          type="number"
                          min="0"
                          step="1"
                          value={set.r}
                          onChange={(e) => handleSetChange(exerciseIdx, setIdx, 'r', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => handleSetChange(exerciseIdx, setIdx, 'r', Number(set.r || 0) + 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900/60 border border-gray-700 text-gray-200 hover:bg-gray-800 active:bg-gray-700 transition"
                          aria-label="Tekrar artır"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                        </button>
                      </div>
                    </div>
                    <div className="col-span-1 flex items-end h-full justify-center">
                      <button onClick={() => handleDeleteSet(exerciseIdx, setIdx)} className="text-gray-400 hover:text-red-400 active:text-red-300 p-1">
                        <span className="material-symbols-outlined text-sm md:text-base">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleAddSet(exerciseIdx)}
                className="mt-3 w-full py-2 md:py-2.5 bg-primary/20 text-primary rounded-lg font-bold hover:bg-primary/30 active:bg-primary/40 transition text-sm md:text-base"
              >
                Set Ekle
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {/* Antrenman Yakıtı */}
          <div>
            <label className="flex items-center gap-2 text-base md:text-lg font-bold text-white mb-2">
              <span className="text-primary">⚡</span>
              Antrenman Yakıtı
            </label>
            <input
              type="text"
              value={workout.workoutFuel || ''}
              onChange={(e) => setWorkout({ ...workout, workoutFuel: e.target.value })}
              className="w-full p-3 bg-primary/10 border border-primary/30 rounded-xl text-gray-300 text-sm md:text-base focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="örn: 2 Yumurta, 1 Muz, Kafein (200mg)"
            />
          </div>

          {/* Genel Notlar */}
          <div>
            <label className="block text-base md:text-lg font-bold text-white mb-2">
              Antrenman Notları
            </label>
            <textarea
              value={workout.notes || ''}
              onChange={(e) => setWorkout({ ...workout, notes: e.target.value })}
              className="w-full h-28 md:h-32 p-3 bg-gray-800/30 text-gray-300 rounded-xl border-transparent focus:ring-2 focus:ring-primary text-sm md:text-base resize-none"
              placeholder="Bugünkü antrenman nasıl geçti? Enerji seviyen, motivasyonun veya karşılaştığın zorluklar hakkında notlar al."
            />
          </div>
        </div>
      </main>

      {editExerciseModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl bg-background-dark border border-white/10 p-5 md:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-base md:text-lg font-semibold">Egzersizi Düzenle</h2>
              <button
                type="button"
                onClick={closeExerciseEditModal}
                className="text-gray-400 hover:text-white transition"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-300">Egzersiz Adı</span>
                <input
                  value={editExerciseModal.form.name}
                  onChange={(e) => updateExerciseEditForm({ name: e.target.value })}
                  className="rounded-lg border border-gray-700 bg-black/40 px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-300">Etiket / Gün</span>
                <select
                  value={editExerciseModal.form.category}
                  onChange={(e) => updateExerciseEditForm({ category: e.target.value })}
                  className="rounded-lg border border-gray-700 bg-black/40 px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {['push', 'pull', 'leg', 'other'].map((key) => (
                    <option key={key} value={key}>
                      {EXERCISE_CATEGORY_META[key]?.label || key}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-300">Çalışan Kaslar</span>
                <div className="grid grid-cols-2 gap-2">
                  {MUSCLE_OPTIONS.map((option) => {
                    const checked = editExerciseModal.form.muscles.includes(option.key);
                    return (
                      <label
                        key={option.key}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs md:text-sm ${
                          checked
                            ? 'border-primary bg-primary/20 text-white'
                            : 'border-gray-700 bg-black/40 text-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleExerciseEditMuscle(option.key)}
                          className="accent-primary"
                        />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeExerciseEditModal}
                className="rounded-lg border border-gray-700 px-4 py-2 text-sm md:text-base font-semibold text-gray-300 hover:bg-gray-700/40 transition"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleExerciseEditSave}
                disabled={isSavingExerciseEdit}
                className="rounded-lg bg-primary px-4 py-2 text-sm md:text-base font-semibold text-background-dark hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 transition"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {isPickerOpen && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm px-0 md:px-4">
          <div className="w-full md:max-w-3xl bg-background-dark border border-gray-700/60 rounded-t-3xl md:rounded-3xl shadow-2xl shadow-black/50 max-h-[85vh] md:max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between px-4 md:px-6 pt-4 pb-3 border-b border-gray-700/60">
              <div>
                <h3 className="text-white text-lg md:text-xl font-bold">Egzersiz Seç</h3>
                <p className="text-gray-400 text-xs md:text-sm">Kütüphaneden egzersiz seç veya manuel ekle.</p>
              </div>
              <button
                onClick={closeExercisePicker}
                className="text-gray-400 hover:text-white active:text-primary transition p-1"
                aria-label="Egzersiz seçim ekranını kapat"
              >
                <span className="material-symbols-outlined text-xl md:text-2xl">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <div className="sticky top-0 z-10 px-4 md:px-6 pt-3 pb-4 border-b border-gray-700/40 bg-background-dark/95 backdrop-blur">
                  <label className="block text-xs md:text-sm font-medium text-gray-400 mb-2">Egzersiz Ara</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">search</span>
                    <input
                      type="text"
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 md:py-2.5 bg-gray-900/60 border border-gray-700 rounded-xl text-white text-sm md:text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="İsim, kas grubu veya etikete göre ara"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="px-4 md:px-6 py-4 space-y-5">
                  {filteredLibrary.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm md:text-base">
                      Aradığın kriterlere uygun egzersiz bulunamadı. Manuel olarak ekleyebilirsin.
                    </div>
                  ) : (
                    <>
                      {CATEGORY_ORDER.map((category) => {
                        const items = filteredLibrary.filter((entry) => entry.info.category === category);
                        if (!items.length) return null;
                        const meta = EXERCISE_CATEGORY_META[category];
                        return (
                          <section key={category}>
                            <div className="flex items-center justify-between">
                              <h4 className="text-white text-sm md:text-base font-semibold">
                                {meta?.label || 'Diğer'}
                              </h4>
                              {meta?.subtitle ? (
                                <span className="text-gray-500 text-xs md:text-sm">{meta.subtitle}</span>
                              ) : null}
                            </div>
                            <div className="mt-2 flex flex-col gap-2">
                              {items.map(({ displayName, canonical, info }) => (
                                <button
                                  key={canonical}
                                  onClick={() => handleSelectExercise({ displayName, canonical })}
                                  className="w-full text-left bg-gray-800/40 hover:bg-primary/10 active:bg-primary/20 transition rounded-xl px-4 py-3 md:py-3.5 border border-gray-700/40"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-white text-sm md:text-base font-semibold">{displayName}</span>
                                    <span className="text-xs md:text-sm text-primary uppercase tracking-wider font-medium">
                                      {meta?.shortLabel || meta?.label || info.category}
                                    </span>
                                  </div>
                                  {info.muscleLabels.length > 0 ? (
                                    <p className="text-gray-400 text-xs md:text-sm mt-1">
                                      {info.muscleLabels.join(', ')}
                                    </p>
                                  ) : null}
                                </button>
                              ))}
                            </div>
                          </section>
                        );
                      })}
                      {filteredLibrary.filter((entry) => !CATEGORY_ORDER.includes(entry.info.category)).length > 0 && (
                        <section key="misc">
                          <h4 className="text-white text-sm md:text-base font-semibold">Diğer</h4>
                          <div className="mt-2 flex flex-col gap-2">
                            {filteredLibrary
                              .filter((entry) => !CATEGORY_ORDER.includes(entry.info.category))
                              .map(({ displayName, canonical, info }) => (
                                <button
                                  key={canonical}
                                  onClick={() => handleSelectExercise({ displayName, canonical })}
                                  className="w-full text-left bg-gray-800/40 hover:bg-primary/10 active:bg-primary/20 transition rounded-xl px-4 py-3 md:py-3.5 border border-gray-700/40"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-white text-sm md:text-base font-semibold">{displayName}</span>
                                    <span className="text-xs md:text-sm text-primary uppercase tracking-wider font-medium">
                                      {info.category}
                                    </span>
                                  </div>
                                  {info.muscleLabels.length > 0 ? (
                                    <p className="text-gray-400 text-xs md:text-sm mt-1">
                                      {info.muscleLabels.join(', ')}
                                    </p>
                                  ) : null}
                                </button>
                              ))}
                          </div>
                        </section>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="px-4 md:px-6 py-4 border-t border-gray-700/60 bg-background-dark/90">
                <button
                  onClick={handleManualAddExercise}
                  className="w-full py-2.5 md:py-3 border border-dashed border-gray-600 text-gray-200 rounded-xl font-semibold hover:border-primary hover:text-primary active:bg-primary/10 transition text-sm md:text-base"
                >
                  Manuel Egzersiz Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-20">
        <button
          onClick={handleSave}
          className="w-full max-w-4xl mx-auto py-3 md:py-4 bg-primary text-background-dark text-base md:text-lg font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 active:bg-primary/80 transition"
        >
          Değişiklikleri Kaydet
        </button>
      </div>
    </div>
  );
}