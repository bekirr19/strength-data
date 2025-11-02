import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExercises, saveExercises, getWorkouts, normalizeExerciseName, renameExerciseEverywhere } from '../utils/storage';
import {
  EXERCISE_CATEGORY_META,
  getExerciseInfo,
  MUSCLE_FILTERS,
  SUGGESTED_EXERCISES,
  exerciseMatchesMuscle,
  MUSCLE_OPTIONS,
} from '../utils/exerciseMetadata';

export default function ExercisesPage() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState(getExercises());
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('az');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [workouts, setWorkouts] = useState(() => getWorkouts());
  const [editingKey, setEditingKey] = useState(null);
  const [editingOriginalName, setEditingOriginalName] = useState('');
  const [editForm, setEditForm] = useState({ name: '', category: 'other', muscles: [] });

  const LIBRARY_SEEDED_KEY = 'exercise_library_seed_v2';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(LIBRARY_SEEDED_KEY)) return;

    setExercises((current) => {
      const existingKeys = new Set(
        current.map((exercise) => (exercise.canonicalName || normalizeExerciseName(exercise.name)).toLowerCase())
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
        const updated = [...current, ...missing];
        saveExercises(updated);
        localStorage.setItem(LIBRARY_SEEDED_KEY, '1');
        return updated;
      }

      localStorage.setItem(LIBRARY_SEEDED_KEY, '1');
      return current;
    });
  }, []);

  const addExerciseByName = (rawName) => {
    if (!rawName) return;
    const canonical = normalizeExerciseName(rawName);
    if (!canonical) return;

    if (exercises.some((e) => (e.canonicalName || normalizeExerciseName(e.name)).toLowerCase() === canonical.toLowerCase())) {
      alert('Bu isimde bir egzersiz zaten var.');
      return;
    }
    const updated = [...exercises, { name: canonical, displayName: canonical, canonicalName: canonical, createdAt: Date.now(), used: 0 }];
    saveExercises(updated);
    setExercises(getExercises());
  };

  const handleAddExercise = () => {
    const name = prompt('Yeni egzersiz adı:');
    if (!name) return;
    addExerciseByName(name);
  };

  const handleAddTemplate = () => {
    if (!selectedTemplate) return;
    addExerciseByName(selectedTemplate);
    setSelectedTemplate('');
  };

  const closeEditor = () => {
    setEditingKey(null);
    setEditingOriginalName('');
    setEditForm({ name: '', category: 'other', muscles: [] });
  };

  const openEditor = (exercise) => {
    const key = (exercise.canonicalName || normalizeExerciseName(exercise.name)).toLowerCase();
    const info = getExerciseInfo(exercise.name, exercise);
    setEditingKey(key);
    setEditingOriginalName(exercise.displayName || exercise.name);
    setEditForm({
      name: exercise.displayName || exercise.name,
      category: exercise.customCategory || info.category,
      muscles:
        Array.isArray(exercise.customMuscles) && exercise.customMuscles.length > 0
          ? exercise.customMuscles
          : info.muscles,
    });
  };

  const toggleMuscle = (muscleKey) => {
    setEditForm((prev) => {
      const exists = prev.muscles.includes(muscleKey);
      return {
        ...prev,
        muscles: exists
          ? prev.muscles.filter((m) => m !== muscleKey)
          : [...prev.muscles, muscleKey],
      };
    });
  };

  const handleEditSave = () => {
    const trimmedName = editForm.name.trim();
    if (!trimmedName) {
      alert('Lütfen geçerli bir egzersiz adı girin.');
      return;
    }

    const normalizedNew = normalizeExerciseName(trimmedName);
    const newKey = normalizedNew.toLowerCase();

    if (editingKey && newKey !== editingKey) {
      const exists = exercises.some((ex) => {
        const key = (ex.canonicalName || normalizeExerciseName(ex.name)).toLowerCase();
        return key === newKey && key !== editingKey;
      });
      if (exists) {
        alert('Bu isim başka bir egzersiz tarafından kullanılıyor.');
        return;
      }
    }

    const nextCategory = editForm.category || 'other';
    const nextMuscles = Array.isArray(editForm.muscles)
      ? editForm.muscles.filter((m) => m)
      : [];

    const updatedList = exercises.map((ex) => {
      const key = (ex.canonicalName || normalizeExerciseName(ex.name)).toLowerCase();
      if (key !== editingKey) return ex;
      return {
        ...ex,
        name: trimmedName,
        displayName: trimmedName,
        canonicalName: normalizedNew,
        customCategory: nextCategory,
        customMuscles: nextMuscles,
      };
    });

  saveExercises(updatedList);
  setExercises(getExercises());

    if (editingOriginalName) {
      const originalCanonical = normalizeExerciseName(editingOriginalName);
      renameExerciseEverywhere(editingOriginalName, trimmedName, normalizedNew);
      if (originalCanonical !== normalizedNew) {
        setWorkouts(getWorkouts());
      }
    }

    closeEditor();
  };

  const exerciseStats = useMemo(() => {
    const stats = {};
    Object.values(workouts).forEach((workoutEntry) => {
      if (!workoutEntry || !Array.isArray(workoutEntry.items)) return;

      workoutEntry.items.forEach((item) => {
        if (!item || !item.name || !Array.isArray(item.sets)) return;

        const key = (item.canonicalName || normalizeExerciseName(item.name)).toLowerCase();
        const maxWeightInSets = item.sets.reduce((max, set) => {
          const weight = Number(set?.w || 0);
          return Number.isFinite(weight) && weight > max ? weight : max;
        }, 0);

        const maxRepsInSets = item.sets.reduce((max, set) => {
          const reps = Number(set?.r || 0);
          return Number.isFinite(reps) && reps > max ? reps : max;
        }, 0);

        if (!stats[key]) {
          stats[key] = { weight: 0, reps: 0 };
        }

        stats[key].weight = Math.max(stats[key].weight, maxWeightInSets);
        stats[key].reps = Math.max(stats[key].reps, maxRepsInSets);
      });
    });
    return stats;
  }, [workouts]);

  const filteredExercises = useMemo(() => {
    const normalizedSearch = normalizeExerciseName(search);
    const searchLower = search.toLowerCase();
    const normalizedSearchLower = normalizedSearch.toLowerCase();

    let list = exercises.filter((e) => {
      if (!searchLower) return true;
      const nameLower = (e.displayName || e.name || '').toLowerCase();
      const canonicalLower = (e.canonicalName || normalizeExerciseName(e.name)).toLowerCase();
      if (nameLower.includes(searchLower)) return true;
      if (canonicalLower.includes(searchLower)) return true;
      if (normalizedSearchLower !== searchLower) {
        return nameLower.includes(normalizedSearchLower) || canonicalLower.includes(normalizedSearchLower);
      }
      return false;
    });

    if (sortBy === 'az') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    } else if (sortBy === 'recent') {
      list = [...list].sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
    } else if (sortBy === 'freq') {
      list = [...list].sort((a, b) => (b.used || 0) - (a.used || 0));
    }

    return list;
  }, [exercises, search, sortBy]);

  const enrichedExercises = useMemo(() => {
    return filteredExercises
      .map((exercise) => ({ exercise, info: getExerciseInfo(exercise.name, exercise) }))
      .filter(({ info }) => exerciseMatchesMuscle(info, selectedMuscle));
  }, [filteredExercises, selectedMuscle]);

  const categoryOrder = ['push', 'pull', 'leg', 'other'];
  const categorized = categoryOrder.map((categoryKey) => {
    const meta = EXERCISE_CATEGORY_META[categoryKey];
    const items = enrichedExercises.filter(({ info }) => info.category === categoryKey);
    return { categoryKey, meta, items };
  });

  const muscleFilterChips = MUSCLE_FILTERS;

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background-dark/95 backdrop-blur-sm p-4 pb-2 border-b border-gray-700/50">
        <button onClick={() => navigate(-1)} className="flex size-10 md:size-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined text-white text-xl md:text-2xl">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-base md:text-lg font-bold tracking-tight text-white">
          Egzersizlerim
        </h1>
        <button
          onClick={handleAddExercise}
          className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center text-white hover:bg-gray-700 active:bg-gray-600 rounded-lg transition"
          aria-label="Egzersiz ekle"
        >
          <span className="material-symbols-outlined text-xl md:text-2xl">add</span>
        </button>
      </header>

      <main className="flex-1 px-4 pb-4 max-w-4xl mx-auto w-full">
        {/* Search */}
        <div className="py-3">
          <label className="flex h-11 md:h-12 w-full">
            <div className="flex h-full w-full items-stretch rounded-xl overflow-hidden">
              <div className="flex items-center justify-center border border-r-0 border-zinc-700 bg-[#1a382a] pl-3 md:pl-4 text-primary/70">
                <span className="material-symbols-outlined text-lg md:text-xl">search</span>
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input h-full min-w-0 flex-1 border border-l-0 border-zinc-700 bg-[#1a382a] px-3 md:px-4 text-sm md:text-base text-white placeholder:text-primary/70 focus:outline-0 focus:ring-2 focus:ring-primary"
                placeholder="Egzersiz ara..."
              />
            </div>
          </label>
        </div>

        {/* Sort Chips */}
        <div className="flex gap-2 md:gap-3 overflow-x-auto py-3 no-scrollbar">
          {[
            { key: 'az', label: 'A-Z' },
            { key: 'recent', label: 'Son Yapılan' },
            { key: 'freq', label: 'Sıklık' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`
                flex h-7 md:h-8 shrink-0 items-center justify-center rounded-full px-3 md:px-4 text-xs md:text-sm font-medium transition
                ${
                  sortBy === s.key
                    ? 'bg-primary text-background-dark'
                    : 'bg-primary/20 text-primary hover:bg-primary/30 active:bg-primary/40'
                }
              `}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Muscle Filters */}
        <div className="flex gap-2 md:gap-3 overflow-x-auto py-2 no-scrollbar">
          {muscleFilterChips.map((filter) => {
            const isActive = selectedMuscle === filter.key;
            return (
              <button
                key={filter.key}
                onClick={() => setSelectedMuscle(filter.key)}
                className={`
                  flex h-7 md:h-8 shrink-0 items-center justify-center rounded-full px-3 md:px-4 text-xs md:text-sm font-medium transition
                  ${
                    isActive
                      ? 'bg-white/90 text-background-dark'
                      : 'bg-white/10 text-gray-200 hover:bg-white/20'
                  }
                `}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Quick Add */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3 py-3">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="flex-1 md:flex-none md:w-60 bg-gray-900/70 border border-gray-700 rounded-lg px-3 py-2 text-sm md:text-base text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Hazır Egzersiz Seç</option>
              {SUGGESTED_EXERCISES.map((option) => (
                <option key={option.name} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddTemplate}
              disabled={!selectedTemplate}
              className="px-3 py-2 rounded-lg bg-primary text-background-dark text-sm md:text-base font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:bg-primary/80"
            >
              Seçili Egzersizi Ekle
            </button>
          </div>
          <button
            onClick={handleAddExercise}
            className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-gray-800 text-white text-sm md:text-base font-semibold hover:bg-gray-700 active:bg-gray-600 transition"
          >
            <span className="material-symbols-outlined text-base md:text-lg">add</span>
            Manuel Egzersiz
          </button>
        </div>

        {/* Exercise List */}
        <div className="flex flex-col gap-4 py-2 md:py-4">
          {categorized.map(({ categoryKey, meta, items }) => {
            if (items.length === 0) return null;

            return (
              <section key={categoryKey} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex flex-col">
                    <h2 className="text-white text-sm md:text-base font-semibold">
                      {meta.label} Gün
                    </h2>
                    {meta.subtitle && (
                      <p className="text-[11px] md:text-xs text-gray-400 mt-0.5">
                        {meta.subtitle}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{items.length} egzersiz</span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map(({ exercise, info }) => {
                    const displayName = exercise.displayName || exercise.name;
                    const canonicalName = exercise.canonicalName || normalizeExerciseName(exercise.name);
                    const statsKey = canonicalName.toLowerCase();
                    const stat = exerciseStats[statsKey] || {};
                    const maxWeight = stat.weight || exercise.pr || 0;
                    const maxReps = stat.reps || exercise.prReps || 0;
                    const statLabel = maxWeight > 0
                      ? `En Yüksek Ağırlık: ${maxWeight} kg`
                      : maxReps > 0
                      ? `En Yüksek Tekrar: ${maxReps}`
                      : '—';

                    return (
                      <div
                        key={canonicalName}
                        onClick={() => navigate(`/exercise/${encodeURIComponent(displayName)}`)}
                        className={`flex cursor-pointer items-start justify-between gap-3 md:gap-4 rounded-xl p-3 md:p-4 transition hover:translate-x-0.5 ${meta.cardClass}`}
                      >
                        <div className="flex items-start gap-3 md:gap-4 min-w-0">
                          <div className="flex size-10 md:size-12 shrink-0 items-center justify-center rounded-lg bg-black/20 text-white/90">
                            <span className="material-symbols-outlined text-lg md:text-xl">fitness_center</span>
                          </div>
                          <div className="flex flex-col min-w-0 gap-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white text-sm md:text-base truncate">{displayName}</p>
                              <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full ${meta.badgeClass}`}>
                                {meta.label}
                              </span>
                            </div>
                            <p className="text-xs md:text-sm text-gray-300 truncate">{statLabel}</p>
                            {info.muscleLabels.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {info.muscleLabels.map((label) => (
                                  <span
                                    key={label}
                                    className="text-[10px] md:text-[11px] px-2 py-0.5 rounded-full bg-black/30 text-gray-200"
                                  >
                                    {label}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditor(exercise);
                            }}
                            className="flex items-center justify-center rounded-md bg-white/10 px-2 py-1 text-[11px] md:text-xs font-semibold text-white hover:bg-white/20 transition"
                          >
                            Düzenle
                          </button>
                          <span className="material-symbols-outlined text-gray-200 text-lg md:text-xl flex-shrink-0">
                            chevron_right
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {enrichedExercises.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm md:text-base">Egzersiz bulunamadı</p>
            </div>
          )}
        </div>
      </main>

      {editingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl bg-background-dark border border-white/10 p-5 md:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-base md:text-lg font-semibold">Egzersizi Düzenle</h2>
              <button onClick={closeEditor} className="text-gray-400 hover:text-white transition">
                <span className="material-symbols-outlined text-xl">close</span>
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
                          checked
                            ? 'border-primary bg-primary/20 text-white'
                            : 'border-gray-700 bg-black/40 text-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMuscle(option.key)}
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
                onClick={closeEditor}
                className="rounded-lg border border-gray-700 px-4 py-2 text-sm md:text-base font-semibold text-gray-300 hover:bg-gray-700/40 transition"
              >
                İptal
              </button>
              <button
                onClick={handleEditSave}
                className="rounded-lg bg-primary px-4 py-2 text-sm md:text-base font-semibold text-background-dark hover:bg-primary/90 transition"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}