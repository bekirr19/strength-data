import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X, ChevronRight, Plus, SearchX } from 'lucide-react';
import { getExercises, saveExercises, getWorkouts, normalizeExerciseName, renameExerciseEverywhere } from '../utils/storage-client';
import { EXERCISE_CATEGORY_META, getExerciseInfo, SUGGESTED_EXERCISES } from '../utils/exerciseMetadata';
import { formatDateShortEN } from '../utils/datetime';
import ExerciseEditModal from '../components/ExerciseEditModal';
import { Input } from '../ds/components/forms/Input';
import { FilterChip } from '../ds/components/forms/FilterChip';
import { Fab } from '../ds/components/buttons/Fab';
import { IconButton } from '../ds/components/buttons/IconButton';
import { CategoryBadge } from '../ds/components/data-display/CategoryBadge';
import { EmptyState } from '../ds/components/feedback/EmptyState';

const canonicalNameFromParts = (canonical, name) => normalizeExerciseName(canonical || name || '');
const canonicalKeyFromParts = (canonical, name) => canonicalNameFromParts(canonical, name).toLowerCase();

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
        const [exercisesData, workoutsData] = await Promise.all([getExercises(), getWorkouts()]);
        setExercises(exercisesData);
        setWorkouts(workoutsData);

        if (typeof window !== 'undefined' && !localStorage.getItem(LIBRARY_SEEDED_KEY)) {
          const existingKeys = new Set(exercisesData.map((exercise) => canonicalKeyFromParts(exercise.canonicalName, exercise.name)));
          const missing = SUGGESTED_EXERCISES.filter((option) => {
            const key = normalizeExerciseName(option.name).toLowerCase();
            return !existingKeys.has(key);
          }).map((option) => {
            const canonicalOption = normalizeExerciseName(option.name);
            return { name: canonicalOption, displayName: canonicalOption, canonicalName: canonicalOption, createdAt: Date.now(), used: 0 };
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

  const openEditExercise = (exercise) => {
    const info = getExerciseInfo(exercise.name, exercise);
    setIsCreatingNew(false);
    setEditingKey(canonicalKeyFromParts(exercise.canonicalName, exercise.name));
    setEditingOriginalName(exercise.displayName || exercise.name);
    setEditForm({
      name: exercise.displayName || exercise.name,
      category: exercise.customCategory || info.category || 'other',
      muscles: Array.isArray(exercise.customMuscles) && exercise.customMuscles.length > 0 ? exercise.customMuscles : (info.muscles || []),
      weightStep: exercise.weightStep ?? 2.5,
    });
  };

  const handleEditSave = async () => {
    const trimmedName = editForm.name.trim();
    if (!trimmedName) { alert('Please enter a valid exercise name.'); return; }

    const normalizedNew = normalizeExerciseName(trimmedName);
    const newKey = normalizedNew.toLowerCase();

    const hasConflict = exercises.some((ex) => {
      const key = canonicalKeyFromParts(ex.canonicalName, ex.name);
      if (isCreatingNew) return key === newKey;
      return key === newKey && key !== editingKey;
    });
    if (hasConflict) { alert('That name is already used by another exercise.'); return; }

    const nextCategory = editForm.category || 'other';
    const nextMuscles = Array.isArray(editForm.muscles) ? editForm.muscles.filter((m) => m) : [];
    const nextWeightStep = editForm.weightStep ?? 2.5;

    if (isCreatingNew) {
      const newEntry = { name: trimmedName, displayName: trimmedName, canonicalName: normalizedNew, customCategory: nextCategory, customMuscles: nextMuscles, weightStep: nextWeightStep, createdAt: Date.now(), used: 0 };
      await saveExercises([...exercises, newEntry]);
      const refreshedExercises = await getExercises();
      setExercises(refreshedExercises);
    } else {
      const updatedList = exercises.map((ex) => {
        const key = canonicalKeyFromParts(ex.canonicalName, ex.name);
        if (key !== editingKey) return ex;
        return { ...ex, name: trimmedName, displayName: trimmedName, canonicalName: normalizedNew, customCategory: nextCategory, customMuscles: nextMuscles, weightStep: nextWeightStep };
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
    if (isCreatingNew || !editingKey) return;
    const targetName = editingOriginalName || editForm.name;
    const confirmed = confirm(`Delete ${targetName || 'this exercise'}? This removes it from your exercise list.`);
    if (!confirmed) return;
    try {
      const updatedList = exercises.filter((ex) => canonicalKeyFromParts(ex.canonicalName, ex.name) !== editingKey);
      await saveExercises(updatedList);
      const refreshedExercises = await getExercises();
      setExercises(refreshedExercises);
      closeEditor();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Could not delete exercise. Please try again.');
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
        if (!stats[key]) stats[key] = { weight: 0, reps: 0, count: 0, lastPerformed: null };
        stats[key].weight = Math.max(stats[key].weight, maxWeightInSets);
        stats[key].reps = Math.max(stats[key].reps, maxRepsInSets);
        stats[key].count = (stats[key].count || 0) + 1;
        if (!stats[key].lastPerformed || stats[key].lastPerformed < dateISO) stats[key].lastPerformed = dateISO;
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
        return nameLower.includes(normalizedSearchLower) || canonicalLower.includes(normalizedSearchLower);
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
        if (b.usageScore === a.usageScore) return (b.exercise.used || 0) - (a.exercise.used || 0);
        return b.usageScore - a.usageScore;
      });
  }, [filteredExercises, selectedCategoryFilter, exerciseStats]);

  const categoryFilterChips = [
    { key: 'all', label: 'All' },
    { key: 'push', label: 'Push' },
    { key: 'pull', label: 'Pull' },
    { key: 'leg', label: 'Leg' },
    { key: 'other', label: 'Other' },
  ];
  const chipAccent = { push: 'var(--push-500)', pull: 'var(--pull-500)', leg: 'var(--leg-500)', other: 'var(--other-500)' };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-page)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent)', animation: 'sd-spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Loading exercises…</p>
        <style>{`@keyframes sd-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-page)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(247,248,250,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <IconButton ariaLabel="Back" variant="ghost" onClick={() => navigate(-1)}><ArrowLeft size={20} /></IconButton>
        <h1 style={{ flex: 1, margin: 0, textAlign: 'center', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>My Exercises</h1>
        <div style={{ width: 40 }} />
      </header>

      {/* sticky search + filters */}
      <div style={{ position: 'sticky', top: 60, zIndex: 10, background: 'rgba(247,248,250,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-subtle)', padding: '12px 16px' }}>
          <Input
            icon={<Search size={18} />}
            placeholder="Search exercises…"
            value={search}
            autoComplete="off"
            onChange={(e) => setSearch(e.target.value)}
            trailing={search ? (
              <IconButton ariaLabel="Clear search" variant="ghost" size="sm" onClick={() => setSearch('')}><X size={16} /></IconButton>
            ) : null}
          />
          <div className="sd-no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 10 }}>
            {categoryFilterChips.map((filter) => (
              <FilterChip
                key={filter.key}
                label={filter.label}
                active={selectedCategoryFilter === filter.key}
                accent={chipAccent[filter.key] || null}
                onClick={() => setSelectedCategoryFilter(filter.key)}
              />
            ))}
          </div>
        </div>

        <main style={{ padding: '12px 16px 96px', display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 560, margin: '0 auto', width: '100%' }}>
          {orderedExercises.map(({ exercise, info }) => {
            const displayName = exercise.displayName || exercise.name;
            const canonicalName = canonicalNameFromParts(exercise.canonicalName, exercise.name);
            const stat = exerciseStats[canonicalName.toLowerCase()] || {};
            const lastPerformedLabel = stat.lastPerformed ? formatDateShortEN(stat.lastPerformed) : null;
            const usageLabel = stat.count > 0 ? `${stat.count} records` : 'No records yet';
            const metaParts = [usageLabel];
            if (lastPerformedLabel) metaParts.push(`Last ${lastPerformedLabel}`);

            return (
              <button
                type="button"
                key={canonicalName}
                onClick={() => navigate(`/exercise/${encodeURIComponent(displayName)}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: 14, border: '1px solid var(--border-subtle)', background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xs)', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{displayName}</span>
                    <CategoryBadge category={info.category} size="sm" />
                  </div>
                  <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>
                    {metaParts.join(' · ')}{info.muscleLabels.length > 0 ? ` · ${info.muscleLabels.join(', ')}` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openEditExercise(exercise); }}
                  aria-label="Edit exercise"
                  style={{ border: 'none', background: 'none', padding: 4, cursor: 'pointer', color: 'var(--text-tertiary)', display: 'inline-flex' }}
                >
                  <ChevronRight size={18} />
                </button>
              </button>
            );
          })}

          {orderedExercises.length === 0 && (
            <EmptyState icon={<SearchX size={26} />} title="No exercises found" subtitle="Try a different search term or add a new exercise." />
          )}
        </main>

      <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 15 }}>
        <Fab extended icon={<Plus size={20} />} onClick={openNewExerciseModal}>New Exercise</Fab>
      </div>

      <ExerciseEditModal
        isOpen={Boolean(editingKey || isCreatingNew)}
        title={isCreatingNew ? 'New exercise' : 'Edit exercise'}
        form={editForm}
        onChange={(partial) => setEditForm((prev) => ({ ...prev, ...partial }))}
        onClose={closeEditor}
        onSave={handleEditSave}
        onDelete={isCreatingNew ? undefined : handleDeleteExercise}
      />
    </div>
  );
}
