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
  getBodyWeightCollection,
} from '../utils/storage';
import { getExerciseInfo, MUSCLE_OPTIONS } from '../utils/exerciseMetadata';
import { Area, AreaChart, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis, ReferenceLine } from 'recharts';

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
  const [bodyWeights, setBodyWeights] = useState({});
  
  // Chart State
  const [chartMetric, setChartMetric] = useState('weight'); // 'weight' | 'volume'
  const [timeRange, setTimeRange] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly' | 'all'

  // Edit Modal State
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
  const exerciseInfo = getExerciseInfo(displayName, matchedExercise);

  // --- Edit Modal Functions ---
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
    if (editModalState.isNew || !editModalState.editingKey) return;
    if (!confirm('Bu egzersizi silmek istediğinizden emin misiniz?')) return;

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

  // --- Data Processing ---
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
        if (dateISO === iso) return weight;
        if (dateISO < iso) latest = weight;
        if (dateISO > iso) break;
      }
      return latest;
    };
  }, [bodyWeights]);

  const { history, hallOfFame, chartData } = useMemo(() => {
    const historyData = [];
    let runningMaxWeight = 0;
    
    // Hall of Fame Trackers
    let max1RM = { value: 0, date: null };
    let maxVolume = { value: 0, date: null };
    let maxWeightRecord = { value: 0, date: null };

    // Helper to parse weight
    const getSetWeight = (set, iso) => {
      if (!set) return 0;
      const numericWeight = Number(set.w);
      const hasNumeric = Number.isFinite(numericWeight) && numericWeight > 0;
      const lowerDisplay = typeof set.wDisplay === 'string' ? set.wDisplay.toLowerCase() : '';
      const fallback = resolveBodyWeight(iso);

      if (lowerDisplay.startsWith('bw+')) {
        const match = lowerDisplay.match(/bw\s*\+\s*([\d.,]+)/i);
        const additional = match ? parseFloat(match[1].replace(',', '.')) : 0;
        if (Number.isFinite(fallback) && fallback > 0) return fallback + additional;
        if (hasNumeric) return numericWeight;
        return additional;
      }

      if (['body weight', 'bodyweight', 'bw'].includes(lowerDisplay)) {
        if (Number.isFinite(fallback) && fallback > 0) return fallback;
        if (hasNumeric) return numericWeight;
        return 0;
      }

      if (hasNumeric) return numericWeight;
      if (Number.isFinite(fallback) && fallback > 0) return fallback;
      return 0;
    };

    const estimateOneRepMax = (weight, reps) => {
      const w = Number(weight);
      const r = Number(reps);
      if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(r) || r <= 0) return 0;
      return Number((w * (1 + r / 30)).toFixed(1));
    };

    // Sort workouts chronologically first
    const sortedIsos = Object.keys(workouts).sort();

    sortedIsos.forEach((iso) => {
      const w = workouts[iso];
      if (!w || !Array.isArray(w.items)) return;
      
      const when = fromISO(iso);
      const entry = w.items.find((it) => {
        const canonical = normalizeExerciseName(it.canonicalName || it.name);
        return canonical.toLowerCase() === canonicalName.toLowerCase();
      });

      if (entry && Array.isArray(entry.sets) && entry.sets.length > 0) {
        const setsData = entry.sets.map(s => ({
          reps: Number(s.r || 0),
          weight: getSetWeight(s, iso),
          originalSet: s
        }));

        const validSets = setsData.filter(s => s.weight > 0 && s.reps > 0);
        if (validSets.length === 0) return;

        const maxWeight = Math.max(...validSets.map(s => s.weight));
        const sessionVolume = validSets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
        const sessionPeakOneRm = Math.max(...validSets.map(s => estimateOneRepMax(s.weight, s.reps)));

        // Check for PR
        const isPr = maxWeight > runningMaxWeight;
        if (isPr) runningMaxWeight = maxWeight;

        // Update Hall of Fame
        if (sessionPeakOneRm > max1RM.value) {
          max1RM = { value: sessionPeakOneRm, date: when };
        }
        if (sessionVolume > maxVolume.value) {
          maxVolume = { value: sessionVolume, date: when };
        }
        if (maxWeight > maxWeightRecord.value) {
          maxWeightRecord = { value: maxWeight, date: when };
        }
        
        historyData.push({
          iso,
          when,
          maxWeight,
          totalVolume: sessionVolume,
          isPr,
          sets: setsData,
          previousMax: runningMaxWeight // Snapshot of max before this workout (approx)
        });
      }
    });

    // Calculate Volume Trend (Last workout vs Avg of previous 2)
    let volumeTrend = null;
    if (historyData.length > 0) {
        const current = historyData[historyData.length - 1];
        const prevWorkouts = [];
        if (historyData.length >= 2) prevWorkouts.push(historyData[historyData.length - 2]);
        if (historyData.length >= 3) prevWorkouts.push(historyData[historyData.length - 3]);
        
        if (prevWorkouts.length > 0) {
             const avgVol = prevWorkouts.reduce((sum, w) => sum + w.totalVolume, 0) / prevWorkouts.length;
             if (avgVol > 0) {
                 const diff = current.totalVolume - avgVol;
                 const percent = (diff / avgVol) * 100;
                 volumeTrend = {
                     percent: Math.round(percent),
                     currentVolume: current.totalVolume,
                     avgVolume: Math.round(avgVol)
                 };
             }
        }
    }

    // Reverse history for display (Newest first)
    const reversedHistory = [...historyData].reverse();

    // Filter for Chart
    let filteredHistoryForChart = historyData;
    const now = new Date();
    if (timeRange === 'weekly') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredHistoryForChart = historyData.filter(h => h.when >= oneWeekAgo);
    } else if (timeRange === 'monthly') {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredHistoryForChart = historyData.filter(h => h.when >= oneMonthAgo);
    } else if (timeRange === 'yearly') {
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filteredHistoryForChart = historyData.filter(h => h.when >= oneYearAgo);
    }

    // Chart Data (Chronological)
    const chartData = filteredHistoryForChart.map(h => ({
      date: h.iso,
      label: new Date(h.iso).getDate() + '/' + (new Date(h.iso).getMonth() + 1),
      weight: h.maxWeight,
      volume: Math.round(h.totalVolume)
    }));

    return {
      history: reversedHistory,
      hallOfFame: {
        oneRm: max1RM,
        volume: maxVolume,
        maxWeight: maxWeightRecord,
        volumeTrend
      },
      chartData
    };
  }, [workouts, canonicalName, resolveBodyWeight, timeRange]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-dark">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-yellow-400"></div>
      </div>
    );
  }

  const muscleLabels = exerciseInfo.muscles.map(m => {
    const found = MUSCLE_OPTIONS.find(opt => opt.key === m);
    return found ? found.label : m;
  }).join(', ');

  return (
    <div className="min-h-screen bg-background-dark text-white pb-10">
      {/* 1. Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between bg-background-dark/95 px-4 py-4 backdrop-blur border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-bold text-white capitalize">{displayName}</h1>
          {muscleLabels && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {muscleLabels}
            </span>
          )}
        </div>

        <button
          onClick={openEditModal}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition"
        >
          <span className="material-symbols-outlined text-xl">edit</span>
        </button>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* 2. Mini Stats Strip */}
        <section className="grid grid-cols-2 gap-3">
            {/* Max Weight Card */}
            <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-transparent p-3">
                 <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-400 text-lg">emoji_events</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-200/70">En İyi (KG)</span>
                 </div>
                 <p className="mt-1 text-xl font-bold text-yellow-400">{hallOfFame.maxWeight.value} kg</p>
                 {hallOfFame.maxWeight.date && (
                    <p className="text-[10px] text-yellow-500/50 mt-0.5">
                        {hallOfFame.maxWeight.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                 )}
            </div>
            {/* Volume Trend Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3">
                 <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-300 text-lg">trending_up</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Hacim Değişimi</span>
                 </div>
                 {hallOfFame.volumeTrend ? (
                    <>
                        <p className={`mt-1 text-xl font-bold ${hallOfFame.volumeTrend.percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {hallOfFame.volumeTrend.percent > 0 ? '+' : ''}{hallOfFame.volumeTrend.percent}%
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Son 2 antrenman ort.</p>
                    </>
                 ) : (
                    <p className="mt-1 text-sm text-gray-500">Yeterli veri yok</p>
                 )}
            </div>
        </section>

        {/* 3. Smart Chart */}
        <section className="rounded-3xl border border-white/5 bg-[#161618] p-5 shadow-xl">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-300">İlerleme</h3>
                 {/* Metric Toggle */}
                <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                  <button 
                    onClick={() => setChartMetric('weight')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${chartMetric === 'weight' ? 'bg-yellow-400 text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Ağırlık
                  </button>
                  <button 
                    onClick={() => setChartMetric('volume')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${chartMetric === 'volume' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Hacim
                  </button>
                </div>
            </div>
            
            {/* Time Range Tabs */}
            <div className="flex bg-white/5 rounded-lg p-1 self-start">
                {['weekly', 'monthly', 'yearly', 'all'].map(range => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition ${timeRange === range ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {range === 'weekly' ? '1H' : range === 'monthly' ? '1A' : range === 'yearly' ? '1Y' : 'Tümü'}
                    </button>
                ))}
            </div>
          </div>
          
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartMetric === 'weight' ? '#FACC15' : '#FFFFFF'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartMetric === 'weight' ? '#FACC15' : '#FFFFFF'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#666" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  minTickGap={20}
                />
                <YAxis 
                  stroke="#666" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                  domain={[(min) => Math.floor(min * 0.75), 'auto']}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#333', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#888', fontSize: '10px', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={chartMetric} 
                  stroke={chartMetric === 'weight' ? '#FACC15' : '#FFFFFF'} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMetric)" 
                />
                {/* Reference Lines */}
                {chartMetric === 'weight' && hallOfFame.maxWeight.value > 0 && (
                  <ReferenceLine 
                    y={hallOfFame.maxWeight.value} 
                    stroke="#FACC15" 
                    strokeDasharray="3 3" 
                    label={{ value: 'Max Kilo', position: 'right', fill: '#FACC15', fontSize: 10 }} 
                  />
                )}
                {chartMetric === 'volume' && hallOfFame.volume.value > 0 && (
                  <ReferenceLine 
                    y={hallOfFame.volume.value} 
                    stroke="#FFFFFF" 
                    strokeDasharray="3 3" 
                    label={{ value: 'Max Hacim', position: 'right', fill: '#FFFFFF', fontSize: 10 }} 
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 4. Logbook History */}
        <section>
          <h3 className="text-sm font-bold text-gray-400 mb-4 px-1 uppercase tracking-wider">Geçmiş Antrenmanlar</h3>
          <div className="space-y-1">
            {history.map((entry) => (
              <div key={entry.iso} className="group relative flex flex-col py-3 border-b border-white/5 last:border-0">
                {/* Row Header: Date & Total Volume */}
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-400 w-24 shrink-0">
                        {new Date(entry.iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' })}
                    </span>
                    <div className="h-[1px] flex-1 bg-white/5 mx-3"></div>
                    <span className="text-[10px] font-medium text-gray-600">Top: {Math.round(entry.totalVolume).toLocaleString()}kg</span>
                </div>

                {/* Sets Row */}
                <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 pl-8">
                    {entry.sets.map((set, sIdx) => {
                        const isPrSet = entry.isPr && set.weight === entry.maxWeight;
                        return (
                            <div key={sIdx} className="flex items-baseline gap-1">
                                <span className={`text-sm font-bold ${isPrSet ? 'text-yellow-400' : 'text-white'}`}>{set.weight}</span>
                                <span className="text-xs font-medium text-gray-400">x{set.reps}</span>
                                {isPrSet && <span className="material-symbols-outlined text-[10px] text-yellow-500">trophy</span>}
                                {sIdx < entry.sets.length - 1 && <span className="text-gray-700 text-xs mx-1">/</span>}
                            </div>
                        );
                    })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Edit Modal */}
      {editModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-[#1C1C1E] border border-white/10 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Egzersizi Düzenle</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">İsim</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kas Grupları</label>
                <div className="flex flex-wrap gap-2">
                  {MUSCLE_OPTIONS.map((option) => {
                    const isSelected = editForm.muscles.includes(option.key);
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => toggleEditMuscle(option.key)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition border ${
                          isSelected
                            ? 'bg-primary text-background-dark border-primary'
                            : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              {!editModalState.isNew && (
                <button
                  onClick={handleExerciseDelete}
                  className="flex items-center justify-center rounded-xl bg-red-500/10 px-4 py-3 text-red-400 font-bold hover:bg-red-500/20 transition"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              )}
              <button
                onClick={closeEditModal}
                className="flex-1 rounded-xl bg-white/5 px-4 py-3 font-bold text-white hover:bg-white/10 transition"
              >
                İptal
              </button>
              <button
                onClick={handleExerciseEditSave}
                disabled={isSavingEdit}
                className="flex-1 rounded-xl bg-primary px-4 py-3 font-bold text-background-dark hover:bg-primary/90 transition"
              >
                {isSavingEdit ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
