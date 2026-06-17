import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getWorkouts,
  getExercises,
  saveExercises,
  renameExerciseEverywhere,
  fromISO,
  normalizeExerciseName,
  getBodyWeightCollection,
} from '../utils/storage-client';
import { getExerciseInfo, MUSCLE_OPTIONS } from '../utils/exerciseMetadata';
import { WEEKDAYS_SHORT, MONTHS_SHORT } from '../utils/datetime';
import { Area, AreaChart, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis, ReferenceLine } from 'recharts';
import ExerciseEditModal from '../components/ExerciseEditModal';
import { ArrowLeft, Pencil, Trophy, TrendingUp } from 'lucide-react';
import { IconButton } from '../ds/components/buttons/IconButton';
import { StatCard } from '../ds/components/data-display/StatCard';
import { SetChip } from '../ds/components/data-display/SetChip';
import { AnimatedNumber } from '../ds/components/data-display/AnimatedNumber';
import { SegmentedControl } from '../ds/components/forms/SegmentedControl';

const METRIC_COLOR = { weight: '#3b82f6', oneRm: '#6366f1', volume: '#64748b' };
const fmtHistoryDate = (iso) => {
  const d = new Date(iso);
  return `${WEEKDAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};

const BODYWEIGHT_KEYWORDS = ['pull up', 'pull-up', 'chin up', 'chin-up', 'dip', 'dips', 'muscle up', 'muscle-up', 'barfix'];

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
  const [chartMetric, setChartMetric] = useState('oneRm'); // 'weight' | 'volume' | 'oneRm'
  const [timeRange, setTimeRange] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly' | 'all'

  // Edit Modal State
  const [editForm, setEditForm] = useState({ name: '', category: 'other', muscles: [], weightStep: 2.5 });
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
      weightStep: matchedExercise?.weightStep ?? 2.5,
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
    setEditForm({ name: '', category: 'other', muscles: [], weightStep: 2.5 });
    setIsSavingEdit(false);
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
    const nextWeightStep = editForm.weightStep ?? 2.5;

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
          weightStep: nextWeightStep,
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
            weightStep: nextWeightStep,
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
            weightStep: nextWeightStep,
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

    const estimateOneRepMax = (weight, reps, dateISO) => {
      let w = Number(weight);
      const r = Number(reps);
      
      if (!Number.isFinite(w) || w < 0 || !Number.isFinite(r) || r <= 0) return 0;
      
      // Removed double-counting bodyweight logic. 
      // getSetWeight already returns the Total Mass (Weight + BW if applicable), so we shouldn't add it again.

      if (w === 0) return 0;
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

        const isBodyWeight = BODYWEIGHT_KEYWORDS.some(kw => canonicalName.toLowerCase().includes(kw));
        const validSets = setsData.filter(s => s.reps > 0 && (isBodyWeight ? s.weight >= 0 : s.weight > 0));
        
        if (validSets.length === 0) return;

        const maxWeight = Math.max(...validSets.map(s => s.weight));
        const sessionVolume = validSets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
        
        // OLD: Max 1RM of the session
        // const sessionPeakOneRm = Math.max(...validSets.map(s => estimateOneRepMax(s.weight, s.reps, iso)));
        
        // NEW: Average 1RM of the session (Sum of all sets' 1RM / Set count)
        const allOneRms = validSets.map(s => estimateOneRepMax(s.weight, s.reps, iso));
        const sessionAvgOneRm = allOneRms.reduce((a, b) => a + b, 0) / allOneRms.length;

        // For display consistency, we use the AVERAGED 1RM as the day's representative value
        const sessionOneRmValue = Number(sessionAvgOneRm.toFixed(1));

        // Note: For "Personal Record" (Hall of Fame), we might still want the PEAK performance? 
        // User asked to determine "that day's 1RM", which usually implies the chart data points.
        // However, usually PRs are "Peak" efforts.
        // If we want to keep "Best Ever 1RM" as a PEAK value, we should calculate peak separately for the hall of fame.
        const sessionPeakOneRm = Math.max(...allOneRms);

        // Check for PR

        let prStatus = 'none'; // 'new', 'equal', 'none'
        if (maxWeight > runningMaxWeight) {
          prStatus = 'new';
          runningMaxWeight = maxWeight;
        } else if (maxWeight === runningMaxWeight && runningMaxWeight > 0) {
          prStatus = 'equal';
        }

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
          oneRm: sessionOneRmValue, // Using AVERAGE for charts & history list
          prStatus,
          sets: setsData,
          previousMax: runningMaxWeight // Snapshot of max before this workout (approx)
        });
      }
    });

    // Calculate 1RM Trend (Last workout vs Avg of previous 3)
    let oneRmTrend = null;
    if (historyData.length > 0) {
        const current = historyData[historyData.length - 1];
        const prevWorkouts = [];
        // Get up to 3 previous workouts
        for (let i = 2; i <= 4; i++) {
            if (historyData.length >= i) {
                prevWorkouts.push(historyData[historyData.length - i]);
            }
        }
        
        if (prevWorkouts.length > 0) {
             const avgOneRm = prevWorkouts.reduce((sum, w) => sum + (w.oneRm || 0), 0) / prevWorkouts.length;
             if (avgOneRm > 0) {
                 const diff = (current.oneRm || 0) - avgOneRm;
                 const percent = (diff / avgOneRm) * 100;
                 oneRmTrend = {
                     percent: Math.round(percent),
                     currentOneRm: current.oneRm,
                     avgOneRm: Math.round(avgOneRm)
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
        // "1H" (Weekly) now shows LAST 3 WORKOUTS regardless of date
        filteredHistoryForChart = historyData.slice(-3);
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
      volume: Math.round(h.totalVolume),
      oneRm: Math.round(h.oneRm || 0)
    }));

    return {
      history: reversedHistory,
      hallOfFame: {
        oneRm: max1RM,
        volume: maxVolume,
        maxWeight: maxWeightRecord,
        oneRmTrend
      },
      chartData
    };
  }, [workouts, canonicalName, resolveBodyWeight, timeRange]);

  const currentViewMax = useMemo(() => {
    if (!chartData || chartData.length === 0) return 0;
    return Math.max(...chartData.map(d => Number(d[chartMetric] || 0)));
  }, [chartData, chartMetric]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent)', animation: 'sd-spin 0.8s linear infinite' }} />
        <style>{`@keyframes sd-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const muscleLabels = exerciseInfo.muscles.map(m => {
    const found = MUSCLE_OPTIONS.find(opt => opt.key === m);
    return found ? found.label : m;
  }).join(', ');

  const isBodyweightExercise = BODYWEIGHT_KEYWORDS.some((kw) => canonicalName.toLowerCase().includes(kw));
  const metricColor = METRIC_COLOR[chartMetric];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)', paddingBottom: 40 }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(247,248,250,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <IconButton ariaLabel="Back" variant="ghost" onClick={() => navigate(-1)}><ArrowLeft size={20} /></IconButton>
        <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
          {muscleLabels && <div className="sd-eyebrow" style={{ marginTop: 1 }}>{muscleLabels}</div>}
        </div>
        <IconButton ariaLabel="Edit exercise" variant="ghost" onClick={openEditModal}><Pencil size={18} /></IconButton>
      </header>

      <main style={{ padding: '16px 16px 32px', maxWidth: 560, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <StatCard
            tone="gold"
            icon={<Trophy size={16} />}
            label="Best"
            value={<><AnimatedNumber value={hallOfFame.maxWeight.value} /> kg</>}
            sub={hallOfFame.maxWeight.date ? `${hallOfFame.maxWeight.date.getDate()} ${MONTHS_SHORT[hallOfFame.maxWeight.date.getMonth()]} ${hallOfFame.maxWeight.date.getFullYear()}` : undefined}
          />
          <StatCard
            icon={<TrendingUp size={16} />}
            label="Strength change"
            value={hallOfFame.oneRmTrend ? <><AnimatedNumber value={hallOfFame.oneRmTrend.percent} prefix={hallOfFame.oneRmTrend.percent > 0 ? '+' : ''} />%</> : '—'}
            sub={hallOfFame.oneRmTrend ? 'vs last 3 sessions' : 'Not enough data'}
            trend={hallOfFame.oneRmTrend ? (hallOfFame.oneRmTrend.percent >= 0 ? 'up' : 'down') : null}
          />
        </div>

        {/* Chart */}
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-sm)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>Progress</span>
            <SegmentedControl
              size="sm"
              fill={false}
              accent={metricColor}
              options={[{ value: 'weight', label: 'Weight' }, { value: 'oneRm', label: '1RM' }, { value: 'volume', label: 'Volume' }]}
              value={chartMetric}
              onChange={setChartMetric}
            />
          </div>
          {chartMetric === 'oneRm' && isBodyweightExercise && (
            <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>*Includes body weight</span>
          )}

          <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricColor} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={metricColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="label" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                  domain={[(dataMin) => (chartMetric === 'volume' ? 0 : Math.max(0, Math.floor(dataMin - 5))), 'auto']}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', borderRadius: 12, boxShadow: 'var(--shadow-lg)' }}
                  itemStyle={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 'bold' }}
                  labelStyle={{ color: 'var(--text-tertiary)', fontSize: 10, marginBottom: 4 }}
                />
                <Area type="monotone" dataKey={chartMetric} stroke={metricColor} strokeWidth={2.5} fillOpacity={1} fill="url(#colorMetric)" />
                {currentViewMax > 0 && (
                  <ReferenceLine
                    y={currentViewMax}
                    stroke={metricColor}
                    strokeDasharray="3 3"
                    label={{ value: timeRange === 'all' ? 'All-time max' : 'Period max', position: 'right', fill: metricColor, fontSize: 10 }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Time range */}
          <SegmentedControl
            size="sm"
            options={[{ value: 'weekly', label: '1W' }, { value: 'monthly', label: '1M' }, { value: 'yearly', label: '1Y' }, { value: 'all', label: 'All' }]}
            value={timeRange}
            onChange={setTimeRange}
          />
        </div>

        {/* History */}
        <div>
          <div className="sd-eyebrow" style={{ marginBottom: 10, paddingLeft: 2 }}>History</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {history.map((entry) => (
              <button
                key={entry.iso}
                type="button"
                onClick={() => navigate('/', { state: { date: entry.iso } })}
                style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 8px', border: 'none', borderBottom: '1px solid var(--border-subtle)', background: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)' }}>{fmtHistoryDate(entry.iso)}</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                  <span className="sd-tnum" style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>Vol {Math.round(entry.totalVolume).toLocaleString()} kg</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {entry.sets.map((set, sIdx) => {
                    const isMaxSet = set.weight === entry.maxWeight;
                    const pr = isMaxSet && entry.prStatus === 'new' ? 'new' : isMaxSet && entry.prStatus === 'equal' ? 'tied' : 'none';
                    return <SetChip key={sIdx} reps={set.reps} weight={set.weight} pr={pr} trophy={pr !== 'none' ? <Trophy size={11} /> : null} />;
                  })}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <ExerciseEditModal
        isOpen={editModalState.isOpen}
        title={editModalState.isNew ? 'New exercise' : 'Edit exercise'}
        form={editForm}
        onChange={(partial) => setEditForm((prev) => ({ ...prev, ...partial }))}
        onClose={closeEditModal}
        onSave={handleExerciseEditSave}
        onDelete={editModalState.isNew ? undefined : handleExerciseDelete}
        isSaving={isSavingEdit}
      />
    </div>
  );
}
