import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getWorkouts,
  getExercises,
  saveExercises,
  renameExerciseEverywhere,
  formatDateTRFull,
  fromISO,
  normalizeExerciseName,
  turkishMonths,
  getBodyWeightCollection,
} from '../utils/storage';
import { getExerciseInfo, EXERCISE_CATEGORY_META, MUSCLE_OPTIONS } from '../utils/exerciseMetadata';
import { Area, AreaChart, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const canonicalKeyFromParts = (canonical, name) => {
  const normalized = normalizeExerciseName(canonical || name || '');
  return (normalized || '').toLowerCase();
};

export default function ExerciseDetailPage() {
  const navigate = useNavigate();
  const { exerciseName } = useParams();
  const decodedName = decodeURIComponent(exerciseName);
  const canonicalName = normalizeExerciseName(decodedName) || decodedName;
  
  const [exercises, setExercises] = useState([]);
  const [workouts, setWorkouts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [monthSelection, setMonthSelection] = useState('rolling');
  const [bodyWeights, setBodyWeights] = useState({});
  const [editForm, setEditForm] = useState({ name: '', category: 'other', muscles: [] });
  const [editModalState, setEditModalState] = useState({
    isOpen: false,
    isNew: true,
    editingKey: '',
    originalName: '',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [exercisesData, workoutsData, bodyWeightData] = await Promise.all([
          getExercises(),
          getWorkouts(),
          getBodyWeightCollection()
        ]);
        setExercises(exercisesData);
        setWorkouts(workoutsData);
        setBodyWeights(bodyWeightData || {});
        console.log('ExerciseDetailPage - Loaded data:', {
          exercisesCount: exercisesData?.length || 0,
          workoutsCount: Object.keys(workoutsData || {}).length,
          canonicalName
        });
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);
  
  const matchedExercise = exercises.find((exercise) => {
    const key = normalizeExerciseName(exercise.canonicalName || exercise.name).toLowerCase();
    return key === canonicalName.toLowerCase();
  });
  const displayName = matchedExercise?.displayName || decodedName;

  const openEditModal = () => {
    const baseName = matchedExercise?.displayName || matchedExercise?.name || decodedName;
    const info = getExerciseInfo(baseName, matchedExercise);
    setEditForm({
      name: baseName,
      category: matchedExercise?.customCategory || info.category || 'other',
      muscles:
        (Array.isArray(matchedExercise?.customMuscles) && matchedExercise.customMuscles.length > 0
          ? matchedExercise.customMuscles
          : info.muscles) || [],
    });
    setEditModalState({
      isOpen: true,
      isNew: !matchedExercise,
      editingKey: matchedExercise ? canonicalKeyFromParts(matchedExercise.canonicalName, matchedExercise.name) : '',
      originalName: baseName,
    });
  };

  const closeEditModal = () => {
    setEditModalState({ isOpen: false, isNew: true, editingKey: '', originalName: '' });
    setEditForm({ name: '', category: 'other', muscles: [] });
    setIsSavingEdit(false);
  };

  const toggleEditMuscle = (muscleKey) => {
    setEditForm((prev) => {
      const exists = prev.muscles.includes(muscleKey);
      return {
        ...prev,
        muscles: exists ? prev.muscles.filter((m) => m !== muscleKey) : [...prev.muscles, muscleKey],
      };
    });
  };

  const handleExerciseEditSave = async () => {
    const trimmedName = editForm.name.trim();
    if (!trimmedName) {
      alert('Lütfen geçerli bir egzersiz adı girin.');
      return;
    }

    const normalizedNew = normalizeExerciseName(trimmedName);
    if (!normalizedNew) {
      alert('Egzersiz adı geçersiz.');
      return;
    }

    const newKey = normalizedNew.toLowerCase();
    const nextCategory = editForm.category || 'other';
    const nextMuscles = Array.isArray(editForm.muscles) ? editForm.muscles.filter(Boolean) : [];

    try {
      setIsSavingEdit(true);
      const exercisesData = await getExercises();

      const hasConflict = exercisesData.some((exercise) => {
        const key = canonicalKeyFromParts(exercise.canonicalName, exercise.name);
        if (editModalState.isNew || !editModalState.editingKey) {
          return key === newKey;
        }
        return key === newKey && key !== editModalState.editingKey;
      });

      if (hasConflict) {
        alert('Bu isim başka bir egzersiz tarafından kullanılıyor.');
        setIsSavingEdit(false);
        return;
      }

      let updatedList = [...exercisesData];
      if (editModalState.isNew || !editModalState.editingKey) {
        updatedList.push({
          name: trimmedName,
          displayName: trimmedName,
          canonicalName: normalizedNew,
          customCategory: nextCategory,
          customMuscles: nextMuscles,
          createdAt: Date.now(),
          used: 0,
        });
      } else {
        const idx = updatedList.findIndex(
          (exercise) => canonicalKeyFromParts(exercise.canonicalName, exercise.name) === editModalState.editingKey
        );
        if (idx === -1) {
          updatedList.push({
            name: trimmedName,
            displayName: trimmedName,
            canonicalName: normalizedNew,
            customCategory: nextCategory,
            customMuscles: nextMuscles,
            createdAt: Date.now(),
            used: 0,
          });
        } else {
          updatedList[idx] = {
            ...updatedList[idx],
            name: trimmedName,
            displayName: trimmedName,
            canonicalName: normalizedNew,
            customCategory: nextCategory,
            customMuscles: nextMuscles,
          };
        }
      }

      await saveExercises(updatedList);
      const refreshed = await getExercises();
      setExercises(refreshed);

      const didRename =
        !editModalState.isNew &&
        editModalState.originalName &&
        editModalState.originalName.toLowerCase() !== trimmedName.toLowerCase();

      if (didRename) {
        await renameExerciseEverywhere(editModalState.originalName, trimmedName, normalizedNew);
        const refreshedWorkouts = await getWorkouts();
        setWorkouts(refreshedWorkouts || {});
      }

      if (canonicalName.toLowerCase() !== normalizedNew.toLowerCase()) {
        navigate(`/exercise/${encodeURIComponent(trimmedName)}`, { replace: true });
      }

      closeEditModal();
    } catch (error) {
      console.error('Egzersiz düzenlenirken hata:', error);
      alert('Egzersiz güncellenemedi. Lütfen tekrar deneyin.');
      setIsSavingEdit(false);
    }
  };

  const handleExerciseDelete = async () => {
    if (editModalState.isNew || !editModalState.editingKey) {
      return;
    }

    const confirmed = confirm('Bu egzersizi silmek istediğinizden emin misiniz?');
    if (!confirmed) {
      return;
    }

    try {
      setIsSavingEdit(true);
      const exercisesData = await getExercises();
      const updatedList = exercisesData.filter(
        (exercise) => canonicalKeyFromParts(exercise.canonicalName, exercise.name) !== editModalState.editingKey
      );
      await saveExercises(updatedList);
      const refreshed = await getExercises();
      setExercises(refreshed);
      closeEditModal();
      alert('Egzersiz silindi.');
      navigate('/exercises');
    } catch (error) {
      console.error('Egzersiz silinirken hata:', error);
      alert('Egzersiz silinemedi. Lütfen tekrar deneyin.');
      setIsSavingEdit(false);
    }
  };

  const resolveBodyWeight = useMemo(() => {
    const entries = Object.entries(bodyWeights || {})
      .map(([iso, value]) => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric) || numeric <= 0) return null;
        return [iso, numeric];
      })
      .filter(Boolean)
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

    return (iso) => {
      if (!iso || entries.length === 0) return null;
      let latest = null;
      for (let i = 0; i < entries.length; i += 1) {
        const [dateISO, weight] = entries[i];
        if (dateISO === iso) {
          return weight;
        }
        if (dateISO < iso) {
          latest = weight;
        }
        if (dateISO > iso) {
          break;
        }
      }
      return latest;
    };
  }, [bodyWeights]);

  // Calculate history data
  const formatWeightValue = (value) => {
    if (!Number.isFinite(value) || value <= 0) return 0;
    const rounded = Number(value.toFixed(1));
    return rounded;
  };

  const formatWeightLabel = (set, iso, weightValue) => {
    if (Number.isFinite(weightValue) && weightValue > 0) {
      const lowerDisplay = typeof set?.wDisplay === 'string' ? set.wDisplay.toLowerCase() : '';
      if (lowerDisplay === 'body weight' || lowerDisplay === 'bodyweight' || lowerDisplay === 'bw') {
        return `${formatWeightValue(weightValue)} kg`;
      }
      if (lowerDisplay.startsWith('bw+')) {
        return `${formatWeightValue(weightValue)} kg`;
      }
      if (set?.wDisplay && set.wDisplay.length > 0) {
        return set.wDisplay;
      }
      return `${formatWeightValue(weightValue)} kg`;
    }

    if (set?.wDisplay && set.wDisplay.length > 0) {
      return set.wDisplay;
    }
    return '—';
  };

  const parseAdditionalFromDisplay = (display) => {
    if (!display) return 0;
    const normalized = display.replace(/kg/gi, '');
    const match = normalized.match(/bw\s*\+\s*([\d.,]+)/i);
    if (!match) return 0;
    const parsed = parseFloat(match[1].replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getSetWeight = (set, iso) => {
    if (!set) return 0;
    const numericWeight = Number(set.w);
    const hasNumeric = Number.isFinite(numericWeight) && numericWeight > 0;
    const lowerDisplay = typeof set.wDisplay === 'string' ? set.wDisplay.toLowerCase() : '';
    const fallback = resolveBodyWeight(iso);

    if (lowerDisplay.startsWith('bw+')) {
      const additional = parseAdditionalFromDisplay(set.wDisplay);
      if (Number.isFinite(fallback) && fallback > 0) {
        return formatWeightValue(fallback + additional);
      }
      if (hasNumeric) {
        return formatWeightValue(numericWeight);
      }
      return formatWeightValue(additional);
    }

    if (lowerDisplay === 'body weight' || lowerDisplay === 'bodyweight' || lowerDisplay === 'bw') {
      if (Number.isFinite(fallback) && fallback > 0) {
        return formatWeightValue(fallback);
      }
      if (hasNumeric) {
        return formatWeightValue(numericWeight);
      }
      return 0;
    }

    if (hasNumeric) {
      return formatWeightValue(numericWeight);
    }

    if (Number.isFinite(fallback) && fallback > 0) {
      return formatWeightValue(fallback);
    }

    return 0;
  };

  const { history, pr } = useMemo(() => {
    const historyData = [];
    let prValue = 0;

    const isBenchPressView = canonicalName.toLowerCase() === normalizeExerciseName('Bench Press').toLowerCase();

    const estimateOneRepMax = (weight, reps) => {
      const w = Number(weight);
      const r = Number(reps);
      if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(r) || r <= 0) {
        return 0;
      }
      return Number((w * (1 + r / 30)).toFixed(1));
    };

    Object.keys(workouts).forEach((iso) => {
      const w = workouts[iso];
      if (!w || !Array.isArray(w.items)) return;
      
      const when = fromISO(iso);
      const entry = w.items.find((it) => {
        const canonical = normalizeExerciseName(it.canonicalName || it.name);
        return canonical.toLowerCase() === canonicalName.toLowerCase();
      });

      if (entry && Array.isArray(entry.sets) && entry.sets.length > 0) {
        const weightValues = entry.sets
          .map((s) => getSetWeight(s, iso))
          .filter((val) => Number.isFinite(val) && val > 0);

        const maxWeight = weightValues.length > 0 ? Math.max(...weightValues) : 0;

        const oneRmValues = entry.sets
          .map((s) => estimateOneRepMax(getSetWeight(s, iso), s.r))
          .filter((val) => Number.isFinite(val) && val > 0);
        const sessionPeakOneRm = oneRmValues.length > 0 ? Math.max(...oneRmValues) : 0;
        const sessionTotalOneRm = oneRmValues.reduce((acc, val) => acc + val, 0);
        const totalVolume = entry.sets.reduce((acc, s) => {
          const weight = getSetWeight(s, iso);
          const reps = Number(s.r || 0);
          if (isBenchPressView) {
            return acc + estimateOneRepMax(weight, reps);
          }
          if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(reps) || reps <= 0) {
            return acc;
          }
          return acc + weight * reps;
        }, 0);

        prValue = Math.max(prValue, maxWeight);

        historyData.push({
          iso,
          when,
          maxWeight,
          totalVolume,
          peakOneRm: sessionPeakOneRm,
          totalOneRm: sessionTotalOneRm,
          text: entry.sets
            .map((s, i) => {
              const weightValue = getSetWeight(s, iso);
              const weightLabel = formatWeightLabel(s, iso, weightValue);
              const estimated = estimateOneRepMax(weightValue, Number(s.r || 0));
              return `Set ${i + 1}: ${s.r} tekrar @ ${weightLabel}${estimated > 0 ? ` (1RM≈${estimated} kg)` : ''}`;
            })
            .join('<br/>'),
        });
      }
    });

    historyData.sort((a, b) => a.when - b.when);

    return { history: historyData, pr: prValue };
  }, [workouts, canonicalName, resolveBodyWeight]);

  const now = new Date();
  const focusYear = 2025;
  const startOfYear = new Date(focusYear, 0, 1);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIdx) => {
      const start = new Date(focusYear, monthIdx, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(focusYear, monthIdx + 1, 0);
      end.setHours(23, 59, 59, 999);

      return {
        key: `${focusYear}-${String(monthIdx + 1).padStart(2, '0')}`,
        label: turkishMonths[monthIdx],
        shortLabel: turkishMonths[monthIdx],
        start,
        end,
      };
    });
  }, [focusYear]);

  const isBenchPressView = canonicalName.toLowerCase() === normalizeExerciseName('Bench Press').toLowerCase();

  const { filteredHistory, rangeLabel, currentPR, weightChartData, oneRmChartData, volumeChartData } = useMemo(() => {
    let filtered = history;
    let label = '';

    if (monthSelection !== 'rolling') {
      const selectedMonth = monthOptions.find((opt) => opt.key === monthSelection);
      if (selectedMonth) {
        filtered = history.filter((h) => h.when >= selectedMonth.start && h.when <= selectedMonth.end);
        label = selectedMonth.label;
      } else {
        filtered = [];
        label = 'Seçili ay verisi yok';
      }
    } else if (timeRange === 'weekly') {
      const ms7 = 7 * 24 * 3600 * 1000;
      filtered = history.filter((h) => (now - h.when) <= ms7);
      label = 'Son 7 gün';
    } else if (timeRange === 'monthly') {
      const ms30 = 30 * 24 * 3600 * 1000;
      filtered = history.filter((h) => (now - h.when) <= ms30);
      label = 'Son 30 gün';
    } else if (timeRange === 'yearly') {
      const currentYearHistory = history.filter((h) => h.when >= startOfYear);
      if (currentYearHistory.length > 0) {
        filtered = currentYearHistory;
        label = `Bu yıl (${now.getFullYear()})`;
      } else {
        filtered = history;
        label = 'Tüm zamanlar';
      }
    } else {
      label = 'Tüm zamanlar';
    }

    const weights = filtered.map(h => ({
      date: h.iso,
      label: new Date(h.iso).getDate() + '/' + (new Date(h.iso).getMonth() + 1),
      weight: h.maxWeight,
    }));

    const oneRms = filtered.map(h => ({
      date: h.iso,
      label: new Date(h.iso).getDate() + '/' + (new Date(h.iso).getMonth() + 1),
      oneRm: Number(Number(h.totalOneRm || 0).toFixed(1)),
    }));

    const volumes = filtered.map(h => ({
      date: h.iso,
      label: new Date(h.iso).getDate() + '/' + (new Date(h.iso).getMonth() + 1),
      volume: Number(isBenchPressView ? Number(h.totalVolume.toFixed(1)) : Math.round(h.totalVolume)),
    }));

    const pr = filtered.length > 0 ? Math.max(...filtered.map(h => h.maxWeight)) : 0;

    return {
      filteredHistory: filtered,
      rangeLabel: label,
      currentPR: pr,
      weightChartData: weights,
      oneRmChartData: oneRms,
      volumeChartData: volumes
    };
  }, [history, monthSelection, monthOptions, timeRange, now, startOfYear, isBenchPressView]);

  if (isLoading) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-primary"></div>
          <p className="text-sm text-gray-400">Egzersiz verileri yükleniyor...</p>
        </div>
      </div>
    );
  }
  const currentVolume = filteredHistory.reduce((acc, h) => acc + h.totalVolume, 0);
  const formattedCurrentVolume = Number.isFinite(currentVolume)
    ? (isBenchPressView ? Number(currentVolume.toFixed(1)) : Math.round(currentVolume))
    : 0;
  const highestOneRm = filteredHistory.length > 0 ? Math.max(...filteredHistory.map((h) => h.peakOneRm || 0)) : 0;
  const totalOneRmSum = filteredHistory.reduce((acc, h) => acc + (h.totalOneRm || 0), 0);
  const formattedTotalOneRm = Number.isFinite(totalOneRmSum) ? Number(totalOneRmSum.toFixed(1)) : 0;

  const calculateFirstToLastDelta = (entries, valueSelector) => {
    if (!entries || entries.length < 2) {
      return null;
    }

    const firstValue = Number(valueSelector(entries[0]) || 0);
    const lastValue = Number(valueSelector(entries[entries.length - 1]) || 0);

    if (!Number.isFinite(firstValue) || !Number.isFinite(lastValue) || firstValue <= 0) {
      return null;
    }

    const change = ((lastValue - firstValue) / firstValue) * 100;
    return Number.isFinite(change) ? Number(change.toFixed(1)) : null;
  };

  const calculateFirstToMaxDelta = (entries, valueSelector) => {
    if (!entries || entries.length < 2) {
      return null;
    }

    const firstValue = Number(valueSelector(entries[0]) || 0);
    if (!Number.isFinite(firstValue) || firstValue <= 0) {
      return null;
    }

    const maxValue = entries.reduce((max, entry) => {
      const v = Number(valueSelector(entry) || 0);
      return Number.isFinite(v) && v > max ? v : max;
    }, 0);

    if (maxValue <= 0) {
      return null;
    }

    const change = ((maxValue - firstValue) / firstValue) * 100;
    return Number.isFinite(change) ? Number(change.toFixed(1)) : null;
  };

  const prDelta = calculateFirstToMaxDelta(filteredHistory, (entry) => entry.maxWeight);
  const volumeDelta = calculateFirstToLastDelta(filteredHistory, (entry) => entry.totalVolume);
  const oneRmDelta = calculateFirstToLastDelta(filteredHistory, (entry) => entry.totalOneRm);

  const createTooltip = (suffix) => ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const rawValue = payload[0].value;
    const value = Number.isFinite(rawValue) ? rawValue : Number(rawValue);
    return (
      <div className="bg-background-dark border border-primary/30 rounded-lg p-2 shadow-lg">
        <p className="text-white text-xs md:text-sm font-semibold">{label}</p>
        <p className="text-primary text-xs md:text-sm">{value} {suffix}</p>
      </div>
    );
  };

  const weightTooltip = createTooltip('kg');
  const oneRmTooltip = createTooltip('kg (toplam 1RM)');
  const volumeTooltip = createTooltip(isBenchPressView ? 'kg (1RM toplamı)' : 'kg');

  const effectiveRangeLabel = rangeLabel || 'Tüm zamanlar';

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark">
      <div className="flex items-center bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-gray-700/50 backdrop-blur-sm">
        <button
          onClick={() => navigate(-1)}
          className="text-white flex size-10 md:size-12 shrink-0 items-center justify-center -ml-2 md:-ml-3 hover:bg-gray-700 active:bg-gray-600 rounded-lg transition"
        >
          <span className="material-symbols-outlined text-xl md:text-2xl">arrow_back</span>
        </button>
        <h1 className="text-white text-base md:text-lg font-bold leading-tight flex-1 text-center px-2 truncate">
          {displayName}
        </h1>
        <button
          type="button"
          onClick={openEditModal}
          disabled={isLoading}
          className="flex size-10 md:size-12 shrink-0 items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Egzersizi düzenle"
        >
          <span className="material-symbols-outlined text-xl md:text-2xl">edit</span>
        </button>
      </div>

      <div className="flex px-4 py-3 max-w-4xl mx-auto w-full">
        <div className="flex h-9 md:h-10 flex-1 items-center justify-center rounded-lg bg-white/5 p-1">
          <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 md:px-3 has-[:checked]:bg-white dark:has-[:checked]:bg-[#1d382c] has-[:checked]:shadow text-slate-400 text-xs md:text-sm font-medium transition">
            <span>Haftalık</span>
            <input
              className="invisible w-0"
              name="time-range"
              type="radio"
              checked={timeRange === 'weekly'}
              onChange={() => setTimeRange('weekly')}
            />
          </label>
          <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 md:px-3 has-[:checked]:bg-white dark:has-[:checked]:bg-[#1d382c] has-[:checked]:shadow text-slate-400 text-xs md:text-sm font-medium transition">
            <span>Aylık</span>
            <input
              className="invisible w-0"
              name="time-range"
              type="radio"
              checked={timeRange === 'monthly'}
              onChange={() => setTimeRange('monthly')}
            />
          </label>
          <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 md:px-3 has-[:checked]:bg-white dark:has-[:checked]:bg-[#1d382c] has-[:checked]:shadow text-slate-400 text-xs md:text-sm font-medium transition">
            <span>Yıllık</span>
            <input
              className="invisible w-0"
              name="time-range"
              type="radio"
              checked={timeRange === 'yearly'}
              onChange={() => setTimeRange('yearly')}
            />
          </label>
        </div>
      </div>

      {timeRange === 'yearly' && (
        <div className="flex px-4 pb-2 md:pb-3 max-w-4xl mx-auto w-full">
          <div className="flex w-full flex-wrap items-center justify-center gap-1 md:gap-2 rounded-lg bg-white/5 p-1">
            <button
              onClick={() => setMonthSelection('rolling')}
              className={`flex-1 min-w-[4.5rem] px-3 py-1.5 text-center text-xs md:text-sm rounded-full border transition ${monthSelection === 'rolling' ? 'bg-primary text-background-dark border-primary' : 'bg-gray-900/60 text-gray-200 border-gray-700 hover:border-primary/60 hover:text-primary'}`}
            >
              Son 1 Ay
            </button>
            {monthOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setMonthSelection(opt.key)}
                className={`flex-1 min-w-[4.5rem] px-3 py-1.5 text-center text-xs md:text-sm rounded-full border transition ${monthSelection === opt.key ? 'bg-primary/80 text-background-dark border-primary' : 'bg-gray-900/60 text-gray-200 border-gray-700 hover:border-primary/60 hover:text-primary'}`}
              >
                {opt.shortLabel}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 md:gap-4 px-4 py-2 md:py-3 pb-24 md:pb-8 max-w-4xl mx-auto w-full">
        {/* Maksimum Ağırlık */}
        <div className="flex flex-col gap-2 rounded-xl bg-white/5 p-4 md:p-5">
          <p className="text-white text-sm md:text-base font-medium">Maksimum Ağırlık (kg)</p>
          <p className="text-white tracking-tight text-2xl md:text-[32px] font-bold">
            {currentPR ? `${currentPR} kg` : '—'}
          </p>
          <div className="flex gap-2 items-center flex-wrap">
            <p className="text-slate-400 text-xs md:text-sm">{effectiveRangeLabel}</p>
            {prDelta !== null && Number(prDelta) !== 0 && (
              <div className={`flex items-center gap-1 text-xs md:text-sm font-medium ${Number(prDelta) > 0 ? 'text-primary' : 'text-red-400'}`}>
                <span className="material-symbols-outlined text-sm md:text-base">
                  {Number(prDelta) > 0 ? 'trending_up' : 'trending_down'}
                </span>
                <span>{prDelta > 0 ? '+' : ''}{prDelta}%</span>
              </div>
            )}
          </div>

          {weightChartData.length > 0 ? (
            <div className="h-32 md:h-40 mt-2 md:mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightChartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0df293" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0df293" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis
                    dataKey="label"
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickLine={false}
                    domain={[0, (dataMax) => (Number.isFinite(dataMax) ? dataMax + 5 : 10)]}
                  />
                  <Tooltip content={weightTooltip} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#0df293"
                    strokeWidth={2}
                    fill="url(#colorWeight)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-32 md:h-40 mt-2 md:mt-4 flex items-center justify-center text-gray-500 text-xs md:text-sm">
              Bu dönemde veri yok
            </div>
          )}
        </div>

        {/* Tahmini 1RM */}
        <div className="flex flex-col gap-2 rounded-xl bg-white/5 p-4 md:p-5">
          <p className="text-white text-sm md:text-base font-medium">Toplam Tahmini 1RM (kg)</p>
          <p className="text-white tracking-tight text-2xl md:text-[32px] font-bold">
            {formattedTotalOneRm ? `${formattedTotalOneRm} kg` : '—'}
          </p>
          <p className="text-slate-400 text-xs md:text-sm">En yüksek 1RM: {highestOneRm ? `${Number(highestOneRm.toFixed(1))} kg` : '—'}</p>
          <div className="flex gap-2 items-center flex-wrap">
            <p className="text-slate-400 text-xs md:text-sm">{effectiveRangeLabel}</p>
            {oneRmDelta !== null && Number(oneRmDelta) !== 0 && (
              <div className={`flex items-center gap-1 text-xs md:text-sm font-medium ${Number(oneRmDelta) > 0 ? 'text-primary' : 'text-red-400'}`}>
                <span className="material-symbols-outlined text-sm md:text-base">
                  {Number(oneRmDelta) > 0 ? 'trending_up' : 'trending_down'}
                </span>
                <span>{oneRmDelta > 0 ? '+' : ''}{oneRmDelta}%</span>
              </div>
            )}
          </div>

          {oneRmChartData.length > 0 ? (
            <div className="h-32 md:h-40 mt-2 md:mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={oneRmChartData}>
                  <defs>
                    <linearGradient id="colorOneRm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis
                    dataKey="label"
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickLine={false}
                    domain={[0, (dataMax) => (Number.isFinite(dataMax) ? dataMax + 5 : 10)]}
                  />
                  <Tooltip content={oneRmTooltip} />
                  <Area
                    type="monotone"
                    dataKey="oneRm"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    fill="url(#colorOneRm)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-32 md:h-40 mt-2 md:mt-4 flex items-center justify-center text-gray-500 text-xs md:text-sm">
              Bu dönemde veri yok
            </div>
          )}
        </div>

        {/* Toplam Tonaj */}
        <div className="flex flex-col gap-2 rounded-xl bg-white/5 p-4 md:p-5">
          <p className="text-white text-sm md:text-base font-medium">
            Toplam {isBenchPressView ? 'Tahmini 1RM Toplamı' : 'Tonaj'} (kg)
          </p>
          <p className="text-white tracking-tight text-2xl md:text-[32px] font-bold">
            {formattedCurrentVolume} kg
          </p>
          <div className="flex gap-2 items-center flex-wrap">
            <p className="text-slate-400 text-xs md:text-sm">{effectiveRangeLabel}</p>
            {volumeDelta !== null && Number(volumeDelta) !== 0 && (
              <div className={`flex items-center gap-1 text-xs md:text-sm font-medium ${Number(volumeDelta) > 0 ? 'text-primary' : 'text-red-400'}`}>
                <span className="material-symbols-outlined text-sm md:text-base">
                  {Number(volumeDelta) > 0 ? 'trending_up' : 'trending_down'}
                </span>
                <span>{volumeDelta > 0 ? '+' : ''}{volumeDelta}%</span>
              </div>
            )}
          </div>

          {volumeChartData.length > 0 ? (
            <div className="h-32 md:h-40 mt-2 md:mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeChartData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0df293" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0df293" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis
                    dataKey="label"
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickLine={false}
                    domain={[0, (dataMax) => (Number.isFinite(dataMax) && dataMax > 0 ? dataMax * 1.1 : 10)]}
                  />
                  <Tooltip content={volumeTooltip} />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#0df293"
                    strokeWidth={2}
                    fill="url(#colorVolume)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-32 md:h-40 mt-2 md:mt-4 flex items-center justify-center text-gray-500 text-xs md:text-sm">
              Bu dönemde veri yok
            </div>
          )}
        </div>
      </div>

      <h2 className="text-white text-base md:text-lg font-bold px-4 pb-2 pt-4 max-w-4xl mx-auto w-full">Antrenman Geçmişi</h2>
      <div className="flex flex-col pb-24 md:pb-8 max-w-4xl mx-auto w-full">
        {history.length > 0 ? (
          history.reverse().map((h, idx) => {
            const isPR = h.maxWeight === pr;
            return (
              <div
                key={idx}
                className="flex flex-col gap-2 px-4 py-3 md:py-4 border-b border-white/5"
              >
                <p className="text-white text-sm md:text-base font-medium">
                  {formatDateTRFull(h.iso)}
                  {isPR && <span className="text-[10px] md:text-xs text-primary font-semibold ml-2 align-middle">PR!</span>}
                </p>
                <p
                  className="text-slate-400 text-xs md:text-sm"
                  dangerouslySetInnerHTML={{ __html: h.text }}
                />
              </div>
            );
          })
        ) : (
          <div className="px-4 py-6 text-slate-400 text-center text-sm md:text-base">Bu egzersiz için henüz kayıt yok.</div>
        )}
      </div>

      {editModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl bg-background-dark border border-white/10 p-5 md:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-primary/70">Egzersiz Ayarları</p>
                <h2 className="text-white text-lg md:text-xl font-semibold">
                  {editModalState.isNew ? 'Egzersiz Oluştur' : 'Egzersizi Düzenle'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-gray-400 hover:text-white transition rounded-full p-1"
                aria-label="Düzenleme penceresini kapat"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-300">Egzersiz Adı</span>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="rounded-lg border border-gray-700 bg-black/40 px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-300">Etiket / Gün</span>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="rounded-lg border border-gray-700 bg-black/40 px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {['push', 'pull', 'leg', 'other'].map((key) => (
                    <option key={key} value={key}>
                      {EXERCISE_CATEGORY_META[key].label} — {EXERCISE_CATEGORY_META[key].subtitle}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-300">Çalışan Kaslar</span>
                <div className="grid grid-cols-2 gap-2">
                  {MUSCLE_OPTIONS.map((option) => {
                    const checked = editForm.muscles.includes(option.key);
                    return (
                      <label
                        key={option.key}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs md:text-sm ${
                          checked ? 'border-primary bg-primary/20 text-white' : 'border-gray-700 bg-black/40 text-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEditMuscle(option.key)}
                          className="accent-primary"
                        />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {!editModalState.isNew && (
                <button
                  type="button"
                  onClick={handleExerciseDelete}
                  className="rounded-lg border border-red-500/50 px-4 py-2 text-sm md:text-base font-semibold text-red-300 hover:bg-red-500/10 transition"
                  disabled={isSavingEdit}
                >
                  Egzersizi Sil
                </button>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-sm md:text-base font-semibold text-gray-300 hover:bg-gray-700/40 transition"
                  disabled={isSavingEdit}
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleExerciseEditSave}
                  className="rounded-lg bg-primary px-4 py-2 text-sm md:text-base font-semibold text-background-dark hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  disabled={isSavingEdit}
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}