import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getWorkoutByDate, getWorkouts, saveWorkout, deleteWorkout, formatDateTRFull, resolveWeightValue, getExercises, saveExercises, renameExerciseEverywhere, normalizeExerciseName } from '../utils/storage';
import { getExerciseInfo, EXERCISE_CATEGORY_META, MUSCLE_OPTIONS } from '../utils/exerciseMetadata';

const CATEGORY_ORDER = ['push', 'pull', 'leg', 'other'];
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
    },
  });
  const [isSavingExerciseEdit, setIsSavingExerciseEdit] = useState(false);
  const [focusTarget, setFocusTarget] = useState(null); // { exerciseIdx, setIdx, field: 'w' | 'r' }

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
    setWorkout((prev) => ({
      ...prev,
      items: [...prev.items, { name: '', displayName: '', canonicalName: '', sets: [{ w: '', r: '' }] }],
    }));
    setFocusTarget({ exerciseIdx: workout.items.length, setIdx: 0, field: 'w' });
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
      <div className="flex items-center p-4 pb-2 justify-between sticky top-0 z-10 bg-background-dark/95 backdrop-blur-sm border-b border-white/5">
        <button onClick={() => navigate(-1)} className="flex size-10 md:size-12 items-center justify-center hover:bg-white/5 active:bg-white/10 rounded-xl transition -ml-2">
          <span className="material-symbols-outlined text-white text-xl md:text-2xl">arrow_back</span>
        </button>
        <h2 className="text-white text-base md:text-lg font-bold flex-1 text-center px-2">Antrenman Detayı</h2>
        <button 
          onClick={handleDelete}
          className="flex size-10 md:size-12 items-center justify-center hover:bg-red-500/10 active:bg-red-500/20 rounded-xl transition text-red-400"
          aria-label="Antrenmanı sil"
        >
          <span className="material-symbols-outlined text-xl md:text-2xl">delete</span>
        </button>
      </div>

      <main className="flex-grow px-4 pb-24 md:pb-8 max-w-4xl mx-auto w-full">
        <h1 className="text-white text-xl md:text-[28px] font-bold pb-3 pt-4">{formatDateTRFull(date)}</h1>

        {/* Antrenman Adı */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => selectWorkoutTemplate('Pull Day')}
              className={`p-3 rounded-xl text-sm font-bold transition border tracking-wide ${
                workout.workoutName === 'Pull Day'
                  ? 'bg-primary text-background-dark border-primary shadow-[0_0_15px_rgba(13,242,147,0.3)]'
                  : 'bg-[#1C1C1E] border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              PULL
            </button>
            <button
              type="button"
              onClick={() => selectWorkoutTemplate('Push Day')}
              className={`p-3 rounded-xl text-sm font-bold transition border tracking-wide ${
                workout.workoutName === 'Push Day'
                  ? 'bg-primary text-background-dark border-primary shadow-[0_0_15px_rgba(13,242,147,0.3)]'
                  : 'bg-[#1C1C1E] border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              PUSH
            </button>
            <button
              type="button"
              onClick={() => selectWorkoutTemplate('Leg Day')}
              className={`p-3 rounded-xl text-sm font-bold transition border tracking-wide ${
                workout.workoutName === 'Leg Day'
                  ? 'bg-primary text-background-dark border-primary shadow-[0_0_15px_rgba(13,242,147,0.3)]'
                  : 'bg-[#1C1C1E] border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              LEG
            </button>
          </div>
        </div>

        <button
          onClick={openExercisePicker}
          className="mb-6 w-full flex items-center justify-center gap-2 py-3 bg-primary text-background-dark rounded-xl font-bold hover:bg-primary/90 active:bg-primary/80 transition text-sm shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Egzersiz Ekle
        </button>

        <div className="flex flex-col gap-4 md:gap-6">
          {workout.items.map((item, exerciseIdx) => (
            <div key={exerciseIdx} className="rounded-3xl bg-[#1C1C1E] p-5 shadow-lg border border-white/5">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">
                    EGZERSİZ {exerciseIdx + 1}
                  </p>
                  <div className="flex items-center gap-2">
                    <h3 
                      className="text-xl md:text-2xl font-bold text-white cursor-pointer hover:text-primary transition"
                      onClick={() => {
                        if (item.name) {
                          navigate(`/exercise/${encodeURIComponent(item.name)}`);
                        }
                      }}
                    >
                      {item.name || 'İsimsiz Egzersiz'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => openExerciseEditModal(exerciseIdx)}
                      className="text-gray-500 hover:text-white transition"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteExercise(exerciseIdx)}
                  className="text-gray-500 hover:text-red-500 transition p-2 hover:bg-white/5 rounded-full"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>

              {/* Sets */}
              <div className="space-y-2">
                {item.sets.map((set, setIdx) => (
                  <div key={setIdx} className="flex items-end gap-2">
                    {/* Set Number & Duplicate */}
                    <div className="flex flex-col items-center gap-1 pb-0.5 w-8 shrink-0">
                      <span className="text-gray-500 font-bold text-xs">{setIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleDuplicateSet(exerciseIdx, setIdx)}
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
                          onClick={() => handleSetChange(exerciseIdx, setIdx, 'w', adjustWeight(set.w, -2.5))}
                          className="flex items-center justify-center w-7 h-8 rounded-md bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition"
                        >
                          <span className="material-symbols-outlined text-base">remove</span>
                        </button>
                        <div className="flex-1 h-8 bg-black/40 flex items-center justify-center rounded-md border border-white/5">
                          <input
                            type="text"
                            value={set.w}
                            onChange={(e) => handleSetChange(exerciseIdx, setIdx, 'w', e.target.value)}
                            className="w-full bg-transparent text-center text-white font-bold text-base focus:outline-none"
                            placeholder="0"
                            autoFocus={focusTarget?.exerciseIdx === exerciseIdx && focusTarget?.setIdx === setIdx && focusTarget?.field === 'w'}
                            onFocus={(e) => e.target.select()}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSetChange(exerciseIdx, setIdx, 'w', adjustWeight(set.w, 2.5))}
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
                          onClick={() => handleSetChange(exerciseIdx, setIdx, 'r', Math.max(0, Number(set.r || 0) - 1))}
                          className="flex items-center justify-center w-7 h-8 rounded-md bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition"
                        >
                          <span className="material-symbols-outlined text-base">remove</span>
                        </button>
                        <div className="flex-1 h-8 bg-black/40 flex items-center justify-center rounded-md border border-white/5">
                          <input
                            type="number"
                            value={set.r}
                            onChange={(e) => handleSetChange(exerciseIdx, setIdx, 'r', e.target.value)}
                            className="w-full bg-transparent text-center text-white font-bold text-base focus:outline-none"
                            placeholder="0"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSetChange(exerciseIdx, setIdx, 'r', Number(set.r || 0) + 1)}
                          className="flex items-center justify-center w-7 h-8 rounded-md bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                        </button>
                      </div>
                    </div>

                    {/* Delete */}
                    <div className="pb-0.5">
                      <button
                        onClick={() => handleDeleteSet(exerciseIdx, setIdx)}
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
                onClick={() => handleAddSet(exerciseIdx)}
                className="mt-4 w-full py-3 rounded-xl border border-dashed border-white/10 bg-transparent text-gray-500 font-bold hover:bg-white/5 hover:text-gray-300 hover:border-white/20 transition flex items-center justify-center gap-2 text-xs"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Yeni Set Ekle
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-6">
          {/* Antrenman Yakıtı */}
          <div className="rounded-3xl bg-[#1C1C1E] p-5 shadow-lg border border-white/5">
            <label className="flex items-center gap-2 text-lg font-bold text-white mb-3">
              <span className="text-primary">⚡</span>
              Antrenman Yakıtı
            </label>
            <input
              type="text"
              value={workout.workoutFuel || ''}
              onChange={(e) => setWorkout({ ...workout, workoutFuel: e.target.value })}
              className="w-full p-4 bg-black/40 border border-white/5 rounded-2xl text-white text-base focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-600"
              placeholder="örn: 2 Yumurta, 1 Muz, Kafein (200mg)"
            />
          </div>

          {/* Genel Notlar */}
          <div className="rounded-3xl bg-[#1C1C1E] p-5 shadow-lg border border-white/5">
            <label className="block text-lg font-bold text-white mb-3">
              Antrenman Notları
            </label>
            <textarea
              value={workout.notes || ''}
              onChange={(e) => setWorkout({ ...workout, notes: e.target.value })}
              className="w-full h-32 p-4 bg-black/40 text-white rounded-2xl border border-white/5 focus:ring-2 focus:ring-primary text-base resize-none placeholder:text-gray-600"
              placeholder="Bugünkü antrenman nasıl geçti? Enerji seviyen, motivasyonun veya karşılaştığın zorluklar hakkında notlar al."
            />
          </div>
        </div>
      </main>

      {editExerciseModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-[#1C1C1E] border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">Egzersizi Düzenle</h2>
              <button
                type="button"
                onClick={closeExerciseEditModal}
                className="text-gray-400 hover:text-white transition p-1 hover:bg-white/5 rounded-full"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Egzersiz Adı</span>
                <input
                  value={editExerciseModal.form.name}
                  onChange={(e) => updateExerciseEditForm({ name: e.target.value })}
                  className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-600"
                  placeholder="Egzersiz adı girin"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Etiket / Gün</span>
                <div className="relative">
                  <select
                    value={editExerciseModal.form.category}
                    onChange={(e) => updateExerciseEditForm({ category: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {['push', 'pull', 'leg', 'other'].map((key) => (
                      <option key={key} value={key} className="bg-[#1C1C1E]">
                        {EXERCISE_CATEGORY_META[key]?.label || key}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </label>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Çalışan Kaslar</span>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {MUSCLE_OPTIONS.map((option) => {
                    const checked = editExerciseModal.form.muscles.includes(option.key);
                    return (
                      <label
                        key={option.key}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm cursor-pointer transition ${
                          checked
                            ? 'border-primary bg-primary/10 text-white'
                            : 'border-white/5 bg-black/40 text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <div className={`flex items-center justify-center size-5 rounded border ${
                          checked ? 'bg-primary border-primary' : 'border-gray-600 bg-transparent'
                        }`}>
                          {checked && <span className="material-symbols-outlined text-sm text-black font-bold">check</span>}
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleExerciseEditMuscle(option.key)}
                          className="hidden"
                        />
                        <span className="font-medium">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeExerciseEditModal}
                className="rounded-xl border border-white/10 px-6 py-3 text-sm font-bold text-gray-300 hover:bg-white/5 transition"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleExerciseEditSave}
                disabled={isSavingExerciseEdit}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-background-dark hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 transition shadow-lg shadow-primary/20"
              >
                {isSavingExerciseEdit ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1C1C1E] border border-white/10 rounded-3xl shadow-2xl shadow-black/50 h-[80vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/5">
              <div>
                <h3 className="text-white text-lg font-bold uppercase tracking-wide">EGZERSİZ SEÇ</h3>
                <p className="text-gray-400 text-xs">Listeden seç veya yeni ekle</p>
              </div>
              <button
                onClick={closeExercisePicker}
                className="flex items-center justify-center size-8 rounded-full bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition"
                aria-label="Kapat"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-white/5 bg-[#1C1C1E]">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl">search</span>
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-gray-600 transition"
                  placeholder="Egzersiz ara..."
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredLibrary.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-400 text-sm mb-4">Aradığın kriterlere uygun egzersiz bulunamadı.</p>
                  <button
                     onClick={handleManualAddExercise}
                     className="text-primary text-sm font-bold hover:underline"
                  >
                    Manuel Ekle
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredLibrary.map(({ displayName, canonical, info }) => (
                    <button
                      key={canonical}
                      onClick={() => handleSelectExercise({ displayName, canonical })}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition text-left group"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-white text-base font-bold group-hover:text-primary transition">{displayName}</span>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="uppercase font-bold tracking-wider">{info.category}</span>
                          {info.muscleLabels.length > 0 && (
                            <>
                              <span className="size-1 rounded-full bg-gray-600"></span>
                              <span>{info.muscleLabels.join(', ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-center size-8 rounded-full border border-white/10 text-gray-400 group-hover:border-primary group-hover:text-primary transition">
                        <span className="material-symbols-outlined text-xl">add</span>
                      </div>
                    </button>
                  ))}
                  
                  {/* Manual Add Button at the end of list */}
                   <button
                    onClick={handleManualAddExercise}
                    className="w-full flex items-center justify-center gap-2 px-5 py-4 text-primary hover:bg-white/5 transition font-semibold text-sm"
                  >
                    <span className="material-symbols-outlined">add</span>
                    Yeni Egzersiz Ekle
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-20">
        <button
          onClick={handleSave}
          className="w-full max-w-4xl mx-auto py-4 bg-primary text-background-dark text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 active:bg-primary/80 transition"
        >
          Antrenmanı Kaydet
        </button>
      </div>
    </div>
  );
}