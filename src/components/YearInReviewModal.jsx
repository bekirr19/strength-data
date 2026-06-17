import React, { useEffect, useMemo, useState } from 'react';
import {
  X, Activity, Dumbbell, Repeat, Layers, Trophy, TrendingUp, Flame,
  CalendarDays, CalendarCheck, Scale, Award, Star, BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  AreaChart, Area, PieChart, Pie,
} from 'recharts';
import { getWorkouts, getBodyWeightCollection } from '../utils/storage-client';
import { computeYearStats, availableYears } from '../utils/yearStats';
import { StatCard } from '../ds/components/data-display/StatCard';
import { AnimatedNumber } from '../ds/components/data-display/AnimatedNumber';
import { SegmentedControl } from '../ds/components/forms/SegmentedControl';
import { Card } from '../ds/components/layout/Card';
import { WorkoutTypeBadge, WORKOUT_TYPE_COLORS } from '../ds/components/data-display/WorkoutTypeBadge';
import { EmptyState } from '../ds/components/feedback/EmptyState';
import { IconButton } from '../ds/components/buttons/IconButton';

const CATEGORY_HEX = { push: '#f97316', pull: '#3b82f6', leg: '#6366f1', other: '#9ca3af' };
const CATEGORY_LABEL = { push: 'Push', pull: 'Pull', leg: 'Leg', other: 'Other' };
const MUSCLE_LABEL_EN = {
  chest: 'Chest', shoulders: 'Shoulders', triceps: 'Triceps', biceps: 'Biceps',
  back: 'Back', lats: 'Lats', rearShoulders: 'Rear Delts', legs: 'Legs',
  quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes', calves: 'Calves',
  core: 'Core', abs: 'Abs', forearms: 'Forearms', hipFlexors: 'Hip Flexors',
};
const WORKOUT_TYPE_ORDER = ['push', 'pull', 'leg', 'upper', 'legPush', 'legPull', 'full', 'other'];

function ChartTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', padding: '8px 12px',
      fontSize: 'var(--text-xs)', color: 'var(--text-primary)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 2 }}>{label}</div>
      <div className="sd-tnum" style={{ color: 'var(--text-secondary)' }}>
        {payload[0].value}{unit}
      </div>
    </div>
  );
}

function SectionTitle({ icon, children, delay = 0 }) {
  return (
    <div className="sd-slide-in" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 2px 2px', animationDelay: `${delay}ms` }}>
      <span style={{ display: 'inline-flex', color: 'var(--accent)' }}>{icon}</span>
      <h3 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{children}</h3>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <Card pad="md" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="sd-eyebrow" style={{ color: 'var(--text-secondary)' }}>{title}</div>
      {children}
    </Card>
  );
}

export default function YearInReviewModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState({});
  const [bodyWeights, setBodyWeights] = useState({});
  const [years, setYears] = useState([]);
  const [year, setYear] = useState('all');

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [w, bw] = await Promise.all([getWorkouts(), getBodyWeightCollection()]);
        if (cancelled) return;
        setWorkouts(w || {});
        setBodyWeights(bw || {});
        const ys = availableYears(w || {});
        setYears(ys);
        // default to the most recent year that has data
        setYear(ys.length ? ys[ys.length - 1] : 'all');
      } catch (e) {
        console.error('Year in Review load failed:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen]);

  // lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [isOpen, onClose]);

  const stats = useMemo(
    () => (loading ? null : computeYearStats(workouts, bodyWeights, year)),
    [loading, workouts, bodyWeights, year]
  );

  const yearOptions = useMemo(() => {
    const opts = years.map((y) => ({ value: y, label: String(y) }));
    opts.push({ value: 'all', label: 'All' });
    return opts;
  }, [years]);

  if (!isOpen) return null;

  const categoryData = stats && !stats.empty
    ? Object.entries(stats.categoryCount).filter(([, v]) => v > 0)
        .map(([k, v]) => ({ name: CATEGORY_LABEL[k], value: v, color: CATEGORY_HEX[k] }))
    : [];
  const muscleData = stats && !stats.empty
    ? Object.entries(stats.muscleCount).map(([k, v]) => ({ name: MUSCLE_LABEL_EN[k] || k, value: v }))
        .sort((a, b) => b.value - a.value).slice(0, 8)
    : [];
  const maxMuscle = muscleData.length ? muscleData[0].value : 1;
  const typeData = stats && !stats.empty
    ? WORKOUT_TYPE_ORDER.filter((k) => stats.workoutTypeCount[k]).map((k) => ({ key: k, count: stats.workoutTypeCount[k] }))
    : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Year in Review"
      style={{
        position: 'fixed', inset: 0, zIndex: 100, background: 'var(--surface-page)',
        display: 'flex', flexDirection: 'column', animation: 'sd-fade-in var(--dur-base) var(--ease-standard)',
      }}
    >
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 5, display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px', background: 'rgba(247,248,250,0.85)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sd-eyebrow" style={{ color: 'var(--accent)' }}>Year in Review</div>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
            {year === 'all' ? 'All time' : year}
          </div>
        </div>
        <IconButton ariaLabel="Close" variant="ghost" onClick={onClose}><X size={20} /></IconButton>
      </header>

      {/* Scroll body */}
      <div className="sd-no-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Year selector */}
          {yearOptions.length > 1 && (
            <SegmentedControl options={yearOptions} value={year} onChange={setYear} size="md" />
          )}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
              <span className="sd-slide-in">Loading your numbers…</span>
            </div>
          )}

          {!loading && stats && stats.empty && (
            <EmptyState
              icon={<Activity size={26} />}
              title="No data for this period"
              subtitle={year === 'all' ? 'Log a workout to see your stats here.' : `You have no workouts logged in ${year}.`}
            />
          )}

          {!loading && stats && !stats.empty && (
            <>
              {/* 1 — Totals */}
              <SectionTitle icon={<BarChart3 size={18} />}>The big numbers</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatCard label="Workouts" icon={<CalendarCheck size={15} />} value={<AnimatedNumber value={stats.totals.workouts} />} />
                <StatCard label="Total sets" icon={<Layers size={15} />} value={<AnimatedNumber value={stats.totals.sets} />} />
                <StatCard label="Total reps" icon={<Repeat size={15} />} value={<AnimatedNumber value={stats.totals.reps} />} />
                <StatCard label="Volume" icon={<Dumbbell size={15} />} value={<><AnimatedNumber value={stats.totals.volumeTonnes} /> t</>} sub={`${stats.totals.volume.toLocaleString()} kg lifted`} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatCard label="Favourite exercise" icon={<Star size={15} />} value={<span style={{ fontSize: 'var(--text-base)' }}>{stats.favorite ? stats.favorite.name : '—'}</span>} sub={stats.favorite ? `${stats.favorite.count} sessions` : undefined} />
                <StatCard label="Most active month" icon={<CalendarDays size={15} />} value={<span style={{ fontSize: 'var(--text-base)' }}>{stats.mostActiveMonth ? stats.mostActiveMonth.name : '—'}</span>} sub={stats.mostActiveMonth ? `${stats.mostActiveMonth.count} workouts` : undefined} />
              </div>

              {/* 2 — PRs & records */}
              <SectionTitle icon={<Trophy size={18} />} delay={40}>PRs &amp; records</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatCard label="New PRs" icon={<Award size={15} />} tone="gold" value={<AnimatedNumber value={stats.prCount} />} sub="1RM beaten" />
                <StatCard label="Heaviest lift" icon={<Dumbbell size={15} />} tone="gold" value={stats.heaviest ? <><AnimatedNumber value={stats.heaviest.weight} decimals={stats.heaviest.weight % 1 ? 1 : 0} /> kg</> : '—'} sub={stats.heaviest ? stats.heaviest.exercise : undefined} />
              </div>
              {stats.gainers.length > 0 && (
                <ChartCard title="Biggest 1RM gains">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {stats.gainers.map((g) => (
                      <div key={g.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</span>
                        <span className="sd-tnum" style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--green-500)', flexShrink: 0 }}>+{g.gain} kg</span>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              )}

              {/* 3 — Consistency & streaks */}
              <SectionTitle icon={<Flame size={18} />} delay={80}>Consistency</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <StatCard label="Longest streak" icon={<Flame size={15} />} value={<><AnimatedNumber value={stats.longestStreak} /></>} sub="days" />
                <StatCard label="Per week" icon={<TrendingUp size={15} />} value={<AnimatedNumber value={stats.perWeek} decimals={1} />} sub="avg" />
                <StatCard label="Best day" icon={<CalendarDays size={15} />} value={<span style={{ fontSize: 'var(--text-base)' }}>{stats.bestDay ? stats.bestDay.name.slice(0, 3) : '—'}</span>} sub={stats.bestDay ? `${stats.bestDay.count}×` : undefined} />
              </div>

              <ChartCard title="Workouts by month">
                <div style={{ height: 170, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthly} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} interval={0} />
                      <YAxis stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={26} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Workouts by weekday">
                <div style={{ height: 150, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.byDow} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} interval={0} />
                      <YAxis stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* 4 — Bodyweight & distribution */}
              <SectionTitle icon={<Scale size={18} />} delay={120}>Bodyweight &amp; split</SectionTitle>

              {stats.bodyweight ? (
                <ChartCard title="Bodyweight trend">
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span className="sd-tnum" style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.bodyweight.end} kg</span>
                    <span className="sd-tnum" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: stats.bodyweight.change > 0 ? 'var(--green-500)' : stats.bodyweight.change < 0 ? 'var(--red-500)' : 'var(--text-tertiary)' }}>
                      {stats.bodyweight.change > 0 ? '+' : ''}{stats.bodyweight.change} kg
                    </span>
                  </div>
                  <div style={{ height: 150, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.bodyweight.series} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                        <defs>
                          <linearGradient id="yir-bw" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.28} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" hide />
                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} width={32} />
                        <Tooltip content={<ChartTooltip unit=" kg" />} />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#yir-bw)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              ) : (
                <ChartCard title="Bodyweight trend">
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>No bodyweight logged in this period.</p>
                </ChartCard>
              )}

              {categoryData.length > 0 && (
                <ChartCard title="Push / Pull / Leg split">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 120, height: 120, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={3} stroke="none">
                            {categoryData.map((e) => <Cell key={e.name} fill={e.color} />)}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {categoryData.map((e) => (
                        <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)' }}>
                          <span style={{ width: 10, height: 10, borderRadius: 3, background: e.color, flexShrink: 0 }} />
                          <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{e.name}</span>
                          <span className="sd-tnum" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{e.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {typeData.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {typeData.map((t) => (
                        <span key={t.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <WorkoutTypeBadge type={t.key} size="sm" />
                          <span className="sd-tnum" style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>{t.count}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </ChartCard>
              )}

              {muscleData.length > 0 && (
                <ChartCard title="Most-trained muscles">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {muscleData.map((m) => (
                      <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 78, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', flexShrink: 0 }}>{m.name}</span>
                        <div style={{ flex: 1, height: 8, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.round((m.value / maxMuscle) * 100)}%`, height: '100%', background: 'var(--accent)', borderRadius: 'var(--radius-full)' }} />
                        </div>
                        <span className="sd-tnum" style={{ width: 28, textAlign: 'right', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              )}

              <p style={{ textAlign: 'center', fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', margin: '8px 0 0' }}>
                Keep your numbers going up.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
