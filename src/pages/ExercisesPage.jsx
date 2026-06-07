import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExercises, saveExercises, getWorkouts, normalizeExerciseName, renameExerciseEverywhere } from '../utils/storage-client';
import {
  EXERCISE_CATEGORY_META,
  getExerciseInfo,
  SUGGESTED_EXERCISES,
} from '../utils/exerciseMetadata';
import ExerciseEditModal from '../components/ExerciseEditModal';

const canonicalNameFromParts = (canonical, name) => normalizeExerciseName(canonical || name || '');
const canonicalKeyFromParts = (canonical, name) => canonicalNameFromParts(canonical, name).toLowerCase();
const formatDateShort = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
};

export default function ExercisesPage() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [workouts, setWorkouts] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [editingOriginalName, setEditingOriginalName] = useState('');
  const [editForm, setEditForm] = useState({ name: '', category: 'other', muscles: [], weightStep: 2.5 });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const LIBRARY_SEEDED_KEY = 'exercise_library_seed_v3';

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [exercisesData, workoutsData] = await Promise.all([
          getExercises(),
          getWorkouts()
        ]);
        
        setExercises(exercisesData);
        setWorkouts(workoutsData);

        // Seed suggested exercises if needed
        if (typeof window !== 'undefined' && !localStorage.getItem(LIBRARY_SEEDED_KEY)) {
          const existingKeys = new Set(
            exercisesData.map((exercise) => canonicalKeyFromParts(exercise.canonicalName, exercise.name))
          );

          const missing = SUGGESTED_EXERCISES.filter((option) => {
            const key = normalizeExerciseName(option.name).toLowerCase();
            return !existingKeys.has(key);
          }).map((option) => {
            const canonicalOption = normalizeExerciseName(option.name);
            return {
              name: canonicalOption,
              displayName: canonicalOption,
              canonicalName: canonicalOption,
              createdAt: Date.now(),
              used: 0,
            };
          });

          if (missing.length > 0) {
            const updated = [...exercisesData, ...missing];
            await saveExercises(updated);
            localStorage.setItem(LIBRARY_SEEDED_KEY, '1');
            setExercises(updated);
          } else {
            localStorage.setItem(LIBRARY_SEEDED_KEY, '1');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  const closeEditor = () => {
    setEditingKey(null);
    setEditingOriginalName('');
    setEditForm({ name: '', category: 'other', muscles: [], weightStep: 2.5 });
    setIsCreatingNew(false);
  };

  const openNewExerciseModal = () => {
    setIsCreatingNew(true);
    setEditingKey(null);
    setEditingOriginalName('');
    setEditForm({ name: '', category: 'other', muscles: [], weightStep: 2.5 });
  };

  const handleEditSave = async () => {
    const trimmedName = editForm.name.trim();
    if (!trimmedName) {
      alert('Lütfen geçerli bir egzersiz adı girin.');
      return;
    }

    const normalizedNew = normalizeExerciseName(trimmedName);
    const newKey = normalizedNew.toLowerCase();

    const hasConflict = exercises.some((ex) => {
      const key = canonicalKeyFromParts(ex.canonicalName, ex.name);
      if (isCreatingNew) {
        return key === newKey;
      }
      return key === newKey && key !== editingKey;
    });
    if (hasConflict) {
      alert('Bu isim başka bir egzersiz tarafından kullanılıyor.');
      return;
    }

    const nextCategory = editForm.category || 'other';
    const nextMuscles = Array.isArray(editForm.muscles)
      ? editForm.muscles.filter((m) => m)
      : [];
    const nextWeightStep = editForm.weightStep ?? 2.5;

    if (isCreatingNew) {
      const newEntry = {
        name: trimmedName,
        displayName: trimmedName,
        canonicalName: normalizedNew,
        customCategory: nextCategory,
        customMuscles: nextMuscles,
        weightStep: nextWeightStep,
        createdAt: Date.now(),
        used: 0,
      };
      await saveExercises([...exercises, newEntry]);
      const refreshedExercises = await getExercises();
      setExercises(refreshedExercises);
    } else {
      const updatedList = exercises.map((ex) => {
        const key = canonicalKeyFromParts(ex.canonicalName, ex.name);
        if (key !== editingKey) return ex;
        return {
          ...ex,
          name: trimmedName,
          displayName: trimmedName,
          canonicalName: normalizedNew,
          customCategory: nextCategory,
          customMuscles: nextMuscles,
          weightStep: nextWeightStep,
        };
      });

      await saveExercises(updatedList);
      const refreshedExercises = await getExercises();
      setExercises(refreshedExercises);

      if (editingOriginalName) {
        const originalCanonical = normalizeExerciseName(editingOriginalName);
        await renameExerciseEverywhere(editingOriginalName, trimmedName, normalizedNew);
        if (originalCanonical !== normalizedNew) {
          const refreshedWorkouts = await getWorkouts();
          setWorkouts(refreshedWorkouts);
        }
      }
    }

    closeEditor();
  };

  const handleDeleteExercise = async () => {
    if (isCreatingNew || !editingKey) {
      return;
    }

    const targetName = editingOriginalName || editForm.name;
    const confirmed = confirm(
      `${targetName || 'Bu egzersizi'} silmek istediğinize emin misiniz? Bu işlem egzersiz listesinden kaldırır.`
    );
    if (!confirmed) {
      return;
    }

    try {
      const updatedList = exercises.filter((ex) => {
        const key = canonicalKeyFromParts(ex.canonicalName, ex.name);
        return key !== editingKey;
      });

      await saveExercises(updatedList);
      const refreshedExercises = await getExercises();
      setExercises(refreshedExercises);
      closeEditor();
    } catch (error) {
      console.error('Egzersiz silinirken hata:', error);
      alert('Egzersiz silinemedi. Lütfen tekrar deneyin.');
    }
  };

  const exerciseStats = useMemo(() => {
    const stats = {};
    Object.entries(workouts || {}).forEach(([dateISO, workoutEntry]) => {
      if (!workoutEntry || !Array.isArray(workoutEntry.items)) return;

      workoutEntry.items.forEach((item) => {
        if (!item || !item.name || !Array.isArray(item.sets)) return;

        const key = canonicalKeyFromParts(item.canonicalName, item.name);
        const maxWeightInSets = item.sets.reduce((max, set) => {
          const weight = Number(set?.w || 0);
          return Number.isFinite(weight) && weight > max ? weight : max;
        }, 0);

        const maxRepsInSets = item.sets.reduce((max, set) => {
          const reps = Number(set?.r || 0);
          return Number.isFinite(reps) && reps > max ? reps : max;
        }, 0);

        if (!stats[key]) {
          stats[key] = { weight: 0, reps: 0, count: 0, lastPerformed: null };
        }

        stats[key].weight = Math.max(stats[key].weight, maxWeightInSets);
        stats[key].reps = Math.max(stats[key].reps, maxRepsInSets);
        stats[key].count = (stats[key].count || 0) + 1;
        if (!stats[key].lastPerformed || stats[key].lastPerformed < dateISO) {
          stats[key].lastPerformed = dateISO;
        }
      });
    });
    return stats;
  }, [workouts]);

  const getExerciseUsageScore = (exercise) => {
    const key = canonicalKeyFromParts(exercise.canonicalName, exercise.name);
    const stat = exerciseStats[key] || {};
    const used = exercise.used || 0;
    return Math.max(used, stat.count || 0);
  };

  const filteredExercises = useMemo(() => {
    const normalizedSearch = normalizeExerciseName(search);
    const searchLower = search.toLowerCase();
    const normalizedSearchLower = normalizedSearch.toLowerCase();

    return exercises.filter((e) => {
      if (!searchLower) return true;
      const nameLower = (e.displayName || e.name || '').toLowerCase();
      const canonicalLower = canonicalKeyFromParts(e.canonicalName, e.name);
      if (nameLower.includes(searchLower)) return true;
      if (canonicalLower.includes(searchLower)) return true;
      if (normalizedSearchLower !== searchLower) {
        return (
          nameLower.includes(normalizedSearchLower) ||
          canonicalLower.includes(normalizedSearchLower)
        );
      }
      return false;
    });
  }, [exercises, search]);

  const orderedExercises = useMemo(() => {
    return filteredExercises
      .map((exercise) => {
        const info = getExerciseInfo(exercise.name, exercise);
        const usageScore = getExerciseUsageScore(exercise);
        return { exercise, info, usageScore };
      })
      .filter(({ info }) => selectedCategoryFilter === 'all' || info.category === selectedCategoryFilter)
      .sort((a, b) => {
        if (b.usageScore === a.usageScore) {
          return (b.exercise.used || 0) - (a.exercise.used || 0);
        }
        return b.usageScore - a.usageScore;
      });
  }, [filteredExercises, selectedCategoryFilter, exerciseStats]);

  const categoryFilterChips = [
    { key: 'all', label: 'Tümü' },
    { key: 'push', label: 'Push' },
    { key: 'pull', label: 'Pull' },
    { key: 'leg', label: 'Leg' },
    { key: 'other', label: 'Diğer' },
  ];

  if (isLoading) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-primary"></div>
          <p className="text-sm text-gray-400">Egzersizler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(11,17,33,0))]">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-background-dark/50 backdrop-blur-md px-4 py-3 border-b border-white/5">
        <button type="button" onClick={() => navigate(-1)} className="flex size-10 md:size-12 shrink-0 items-center justify-start rounded-lg hover:bg-white/5">
          <span className="material-symbols-outlined text-white text-xl md:text-2xl">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-base md:text-xl font-semibold tracking-tight text-white">
          Egzersizlerim
        </h1>
        <div className="size-10 md:size-12" />
      </header>

      <main className="flex-1 px-4 pb-28 md:pb-8 max-w-4xl mx-auto w-full">
        {/* Sticky search & filters */}
        <div className="sticky top-[64px] z-10 -mx-4 px-4 py-3 bg-background-dark/50 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 transition-all focus-within:border-primary/50 focus-within:bg-white/10 focus-within:shadow-lg focus-within:shadow-primary/10">
            <span className="material-symbols-outlined text-white/50 text-lg md:text-xl">search</span>
            <input
              value={search}
              autoComplete="off"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Egzersiz ara..."
              className="flex-1 bg-transparent text-sm md:text-base text-white placeholder:text-white/40 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="flex size-8 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10"
                aria-label="Aramayı temizle"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categoryFilterChips.map((filter) => {
              const isActive = selectedCategoryFilter === filter.key;
              return (
                <button
                  type="button"
                  key={filter.key}
                  onClick={() => setSelectedCategoryFilter(filter.key)}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all border ${isActive
                    ? 'bg-primary border-primary text-background-dark shadow-lg shadow-primary/20'
                    : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex flex-col gap-2 py-4">
          {orderedExercises.map(({ exercise, info }) => {
            const displayName = exercise.displayName || exercise.name;
            const canonicalName = canonicalNameFromParts(exercise.canonicalName, exercise.name);
            const statsKey = canonicalName.toLowerCase();
            const stat = exerciseStats[statsKey] || {};
            const meta = EXERCISE_CATEGORY_META[info.category] || EXERCISE_CATEGORY_META.other;
            const lastPerformedLabel = stat.lastPerformed
              ? formatDateShort(stat.lastPerformed)
              : null;
            const usageLabel = stat.count > 0 ? `${stat.count} kayıt` : 'İlk kaydı ekle';
            const metaParts = [usageLabel];
            if (lastPerformedLabel) metaParts.push(`Son ${lastPerformedLabel}`);

            return (
              <button
                type="button"
                key={canonicalName}
                onClick={() => navigate(`/exercise/${encodeURIComponent(displayName)}`)}
                className="group flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3.5 text-left transition hover:border-white/10 hover:bg-white/[0.06]"
              >
                <div className="flex flex-1 flex-col min-w-0 gap-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-sm md:text-base truncate">{displayName}</p>
                    <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${meta.badgeClass}`}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-[11px] md:text-xs text-white/40 truncate">
                    {metaParts.join(' · ')}
                    {info.muscleLabels.length > 0 && (
                      <span className="text-white/30"> · {info.muscleLabels.join(', ')}</span>
                    )}
                  </p>
                </div>

                <span className="material-symbols-outlined text-white/30 text-xl shrink-0 transition group-hover:translate-x-0.5 group-hover:text-white/60">
                  chevron_right
                </span>
              </button>
            );
          })}

          {orderedExercises.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="material-symbols-outlined text-2xl text-white/30">search_off</span>
              </div>
              <p className="mt-4 text-sm text-white/60">Egzersiz bulunamadı</p>
              <p className="mt-1 text-xs text-white/30">Farklı bir arama veya filtre dene</p>
            </div>
          )}
        </div>
      </main>

      <button
        type="button"
        onClick={openNewExerciseModal}
        className="fixed bottom-5 right-4 md:right-6 md:bottom-6 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-background-dark shadow-xl shadow-primary/30 hover:bg-primary/90 active:scale-[0.97] transition"
      >
        <span className="material-symbols-outlined text-lg">add</span>
        Yeni Egzersiz
      </button>

      <ExerciseEditModal
        isOpen={Boolean(editingKey || isCreatingNew)}
        title={isCreatingNew ? 'Yeni Egzersiz' : 'Egzersizi Düzenle'}
        form={editForm}
        onChange={(partial) => setEditForm((prev) => ({ ...prev, ...partial }))}
        onClose={closeEditor}
        onSave={handleEditSave}
        onDelete={isCreatingNew ? undefined : handleDeleteExercise}
      />
    </div>
  );
}