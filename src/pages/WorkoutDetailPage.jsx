import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWorkoutByDate, saveWorkout, deleteWorkout, formatDateTRFull, resolveWeightValue, getExercises, normalizeExerciseName } from '../utils/storage';
import { getExerciseInfo, EXERCISE_CATEGORY_META } from '../utils/exerciseMetadata';

const CATEGORY_ORDER = ['push', 'pull', 'leg', 'other'];

export default function WorkoutDetailPage() {
  const navigate = useNavigate();
  const { date } = useParams();
  const [workout, setWorkout] = useState({ dateISO: date, items: [], notes: '', workoutFuel: '', workoutName: '', workoutFocus: [] });
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [existingWorkout, exercises] = await Promise.all([
        getWorkoutByDate(date),
        getExercises()
      ]);
      setExerciseLibrary(exercises);

      if (existingWorkout) {
        setWorkout({
          ...existingWorkout,
          workoutFocus: Array.isArray(existingWorkout.workoutFocus) ? existingWorkout.workoutFocus : [],
          items: (existingWorkout.items || []).map((item) => ({
            ...item,
            name: item.displayName || item.name,
            displayName: item.displayName || item.name,
            canonicalName: item.canonicalName || normalizeExerciseName(item.displayName || item.name),
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
        setWorkout({
          dateISO: date,
          workoutName: '',
          workoutFocus: [],
          workoutFuel: '',
          items: [
            {
              name: 'Bench Press',
              displayName: 'Bench Press',
              canonicalName: normalizeExerciseName('Bench Press'),
              sets: [{ w: '80', r: 10 }, { w: '85', r: 8 }],
            },
            {
              name: 'Squat',
              displayName: 'Squat',
              canonicalName: normalizeExerciseName('Squat'),
              sets: [{ w: '100', r: 12 }],
            },
          ],
          notes: '',
        });
      }
    };

    fetchData();
  }, [date]);

  const filteredLibrary = useMemo(() => {
    const query = pickerSearch.trim().toLowerCase();

    return exerciseLibrary
      .map((exercise) => {
        const displayName = exercise.displayName || exercise.name;
        const canonical = exercise.canonicalName || normalizeExerciseName(displayName);
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

  const openExercisePicker = async () => {
    const exercises = await getExercises();
    setExerciseLibrary(exercises);
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

  const handleExerciseNameChange = (idx, name) => {
    const updated = [...workout.items];
    updated[idx].name = name;
    updated[idx].displayName = name;
    updated[idx].canonicalName = normalizeExerciseName(name);
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
    if (normalized.toLowerCase().startsWith('body')) {
      return normalized;
    }

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
    
    const cleanedItems = await Promise.all(workout.items.map(async (it, exerciseIdx) => {
      const trimmedName = (it.displayName || it.name || '').trim();
      const exerciseLabel = trimmedName || `Egzersiz ${exerciseIdx + 1}`;

      if (!trimmedName) {
        issues.push(`${exerciseLabel} için bir isim girin.`);
        return null;
      }

      const canonical = it.canonicalName || normalizeExerciseName(trimmedName);
      if (!canonical) {
        issues.push(`${exerciseLabel} adı geçerli değil.`);
        return null;
      }

      const sets = Array.isArray(it.sets) ? it.sets : [];
      if (sets.length === 0) {
        issues.push(`${exerciseLabel} için en az bir set ekleyin.`);
        return null;
      }

      const cleanedSets = await Promise.all(sets.map(async (set, setIdx) => {
        const reps = Number(set.r);
        if (!Number.isFinite(reps) || reps <= 0) {
          issues.push(`${exerciseLabel} set ${setIdx + 1} için geçerli tekrar sayısı girin.`);
          return null;
        }

        const { value, display } = await resolveWeightValue(set.w, trimmedName, workout.dateISO);
        if (!Number.isFinite(value) || value <= 0) {
          issues.push(`${exerciseLabel} set ${setIdx + 1} için geçerli ağırlık girin: "${set.w}"`);
          return null;
        }

        return {
          w: value,
          wDisplay: display || String(value),
          r: reps,
        };
      }));

      const finalSets = cleanedSets.filter(Boolean);
      if(finalSets.length !== sets.length) { // Check if any sets were invalid
        return null;
      }

      return {
        ...it,
        name: trimmedName,
        displayName: trimmedName,
        canonicalName: canonical,
        sets: finalSets,
      };
    }));

    const finalItems = cleanedItems.filter(Boolean);

    if (issues.length > 0) {
      alert(issues.join('\n'));
      return;
    }
    
    if (finalItems.length !== workout.items.length) {
        // This case handles where an entire item becomes invalid due to set issues.
        return;
    }

    if (finalItems.length === 0) {
      alert('Kaydetmek için en az bir geçerli egzersiz ve set girin.');
      return;
    }

    const cleaned = {
      ...workout,
      workoutFocus: Array.isArray(workout.workoutFocus) ? workout.workoutFocus : [],
      items: finalItems,
    };

    await saveWorkout(cleaned);
    alert('Antrenman kaydedildi!');
    navigate('/');
  };

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
          <label className="block text-sm font-medium text-gray-300 mb-2">Antrenman Adı (Opsiyonel)</label>
          <input
            type="text"
            value={workout.workoutName || ''}
            onChange={(e) => setWorkout({ ...workout, workoutName: e.target.value })}
            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm md:text-base focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="örn: Push Day, Pull Day, Leg Day"
          />
        </div>

        {/* Antrenman Odağı */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Antrenman Odağı (Opsiyonel)</label>
          <input
            type="text"
            value={Array.isArray(workout.workoutFocus) ? workout.workoutFocus.join(', ') : ''}
            onChange={(e) => setWorkout({ ...workout, workoutFocus: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm md:text-base focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="örn: Göğüs, Omuz, Arka Kol (virgülle ayırın)"
          />
        </div>

        <div className="flex flex-col gap-3 md:gap-4">
          {workout.items.map((item, exerciseIdx) => (
            <div key={exerciseIdx} className="rounded-xl bg-gray-800/30 p-3 md:p-4">
              <div className="flex items-center justify-between mb-3">
                <input
                  className="text-white text-base md:text-lg font-bold bg-transparent border-0 p-0 focus:ring-0 w-full"
                  placeholder="Egzersiz Adı"
                  value={item.name}
                  onChange={(e) => handleExerciseNameChange(exerciseIdx, e.target.value)}
                />
                <button onClick={() => handleDeleteExercise(exerciseIdx)} className="text-gray-400 hover:text-red-400 active:text-red-300 p-1">
                  <span className="material-symbols-outlined text-lg md:text-xl">delete</span>
                </button>
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
                      <label className="text-[10px] md:text-xs text-gray-500 mb-0.5 block">Ağırlık (kg veya Body Weight)</label>
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
                          placeholder="70 veya Body Weight +10"
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

        <button
          onClick={openExercisePicker}
          className="mt-3 md:mt-4 w-full flex items-center justify-center gap-2 py-2.5 md:py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 active:bg-gray-600 transition text-sm md:text-base"
        >
          <span className="material-symbols-outlined text-lg md:text-xl">add</span>
          Egzersiz Ekle
        </button>

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

            <div className="px-4 md:px-6 pt-3 pb-4 border-b border-gray-700/40">
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

            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-5">
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

            <div className="px-4 md:px-6 py-4 border-t border-gray-700/60 bg-background-dark/80">
              <button
                onClick={handleManualAddExercise}
                className="w-full py-2.5 md:py-3 border border-dashed border-gray-600 text-gray-200 rounded-xl font-semibold hover:border-primary hover:text-primary active:bg-primary/10 transition text-sm md:text-base"
              >
                Manuel Egzersiz Ekle
              </button>
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
