import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, Moon, X } from 'lucide-react';
import { toISODate, getWorkouts } from '../utils/storage-client';
import { detectWorkoutType } from '../utils/workoutTypes';
import { MONTHS_LONG, formatDateLongEN } from '../utils/datetime';
import { WORKOUT_TYPE_COLORS } from '../ds/components/data-display/WorkoutTypeBadge';
import { IconButton } from '../ds/components/buttons/IconButton';
import { Button } from '../ds/components/buttons/Button';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TYPE_KEY = { push: 'push', pull: 'pull', leg: 'leg', 'pull-push': 'upper', 'leg-push': 'legPush', 'leg-pull': 'legPull', 'leg-pull-push': 'full' };
const typeColor = (type) => {
  const key = type ? (TYPE_KEY[type] || 'other') : null;
  return key ? (WORKOUT_TYPE_COLORS[key] || WORKOUT_TYPE_COLORS.other) : null;
};

export default function CalendarModal({ isOpen, onClose, onSelectDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [allWorkouts, setAllWorkouts] = useState({});
  const [selectedPreviewDate, setSelectedPreviewDate] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    if (isOpen) { loadWorkouts(); setSelectedPreviewDate(null); }
  }, [isOpen]);

  const loadWorkouts = async () => {
    try {
      const workouts = await getWorkouts();
      setAllWorkouts(workouts || {});
    } catch (error) {
      console.error('CalendarModal: error loading workouts:', error);
    }
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const stats = useMemo(() => {
    let total = 0;
    const byType = { push: 0, pull: 0, leg: 0, other: 0 };
    for (let d = 1; d <= daysInMonth; d++) {
      const dateISO = toISODate(new Date(year, month, d));
      const workout = allWorkouts[dateISO];
      if (workout) {
        total++;
        const type = detectWorkoutType(workout);
        if (type && byType[type] !== undefined) byType[type]++;
        else byType.other++;
      }
    }
    return { total, byType };
  }, [year, month, daysInMonth, allWorkouts]);

  if (!isOpen) return null;

  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  while (days.length < 42) days.push(null);

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentMonth(new Date());
  const handleDayClick = (day) => setSelectedPreviewDate(toISODate(new Date(year, month, day)));
  const handleGoToDetail = () => { if (selectedPreviewDate) { onSelectDate(selectedPreviewDate); onClose(); } };

  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) handleNextMonth();
    else if (distance < -50) handlePrevMonth();
  };

  const todayISO = toISODate(new Date());
  const previewWorkout = selectedPreviewDate ? allWorkouts[selectedPreviewDate] : null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(31,41,55,0.34)', animation: 'sd-fade-in var(--dur-base) var(--ease-standard)' }} />
      <div
        className="sd-no-scrollbar"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ position: 'relative', width: '100%', maxWidth: 460, maxHeight: '88%', overflowY: 'auto', background: 'var(--surface-card)', borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0', boxShadow: 'var(--shadow-xl)', padding: '16px 18px 18px', animation: 'sd-sheet-up var(--dur-slow) var(--ease-out)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><div style={{ width: 38, height: 4, borderRadius: 2, background: 'var(--gray-200)' }} /></div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 800, letterSpacing: '-.01em', color: 'var(--text-primary)' }}>{MONTHS_LONG[month]} {year}</h2>
            <Button variant="secondary" size="sm" onClick={handleToday}>Today</Button>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <IconButton ariaLabel="Previous month" variant="soft" onClick={handlePrevMonth}><ChevronLeft size={18} /></IconButton>
            <IconButton ariaLabel="Next month" variant="soft" onClick={handleNextMonth}><ChevronRight size={18} /></IconButton>
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginBottom: 16, padding: 12, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: stats.total > 0 ? 10 : 0 }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 600 }}>Monthly summary</span>
            <span className="sd-tnum" style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>{stats.total} workouts</span>
          </div>
          {stats.total > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['push', 'pull', 'leg', 'other'].filter((k) => stats.byType[k] > 0).map((k) => {
                const c = WORKOUT_TYPE_COLORS[k];
                return (
                  <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-2xs)', fontWeight: 700, color: c.fg }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot }} />{c.label} {stats.byType[k]}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {WEEKDAYS.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 'var(--text-3xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: 4 }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {days.map((day, idx) => {
            if (day === null) return <div key={idx} style={{ aspectRatio: '1' }} aria-hidden />;
            const dateISO = toISODate(new Date(year, month, day));
            const workout = allWorkouts[dateISO];
            const type = workout ? detectWorkoutType(workout) : null;
            const c = typeColor(type);
            const isToday = dateISO === todayISO;
            const isSelected = dateISO === selectedPreviewDate;
            return (
              <button
                key={idx}
                onClick={() => handleDayClick(day)}
                style={{
                  aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                  borderRadius: 'var(--radius-md)', cursor: 'pointer', padding: 0,
                  border: `1.5px solid ${isSelected ? 'var(--accent)' : isToday ? 'var(--border-strong)' : 'transparent'}`,
                  background: c ? c.tint : isSelected ? 'var(--accent-tint)' : 'transparent',
                  animation: `sd-rise ${160 + idx * 10}ms var(--ease-out) both`,
                }}
              >
                <span className="sd-tnum" style={{ fontSize: 'var(--text-sm)', fontWeight: isSelected || isToday ? 800 : 500, color: c ? c.fg : isSelected ? 'var(--accent-hover)' : 'var(--text-primary)' }}>{day}</span>
                {(c || workout) && <span style={{ width: 5, height: 5, borderRadius: '50%', background: c ? c.dot : 'var(--text-tertiary)' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview sheet */}
      {selectedPreviewDate && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(31,41,55,0.4)' }} onClick={() => setSelectedPreviewDate(null)} />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 70, background: 'var(--surface-card)', borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0', boxShadow: 'var(--shadow-xl)', padding: '22px 18px 18px', display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '62vh', animation: 'sd-sheet-up var(--dur-slow) var(--ease-out)' }}
          >
            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 38, height: 4, borderRadius: 2, background: 'var(--gray-200)' }} />
            <h3 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>{formatDateLongEN(selectedPreviewDate)}</h3>

            {previewWorkout ? (
              <>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-lg)', padding: 14, border: '1px solid var(--border-subtle)' }}>
                  {(() => { const c = typeColor(detectWorkoutType(previewWorkout)); return c ? (
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: c.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: c.dot }} />
                    </div>
                  ) : null; })()}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>{previewWorkout.workoutName || 'Workout'}</h4>
                    {(() => {
                      const vol = (previewWorkout.items || []).reduce((t, it) => t + (it.sets || []).reduce((s, set) => s + (Number(set.w) || 0) * (Number(set.r) || 0), 0), 0);
                      return vol > 0 ? <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><Dumbbell size={13} />{Math.round(vol).toLocaleString()} kg volume</p> : null;
                    })()}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p className="sd-eyebrow" style={{ margin: 0 }}>Exercises</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {previewWorkout.items.slice(0, 4).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 'var(--text-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <span style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', background: 'var(--surface-sunken)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-3xs)', fontWeight: 700, color: 'var(--text-tertiary)', flexShrink: 0 }}>{idx + 1}</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--text-primary)' }}>{item.displayName || item.name}</span>
                        </div>
                        <span style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{item.sets.length} sets</span>
                      </div>
                    ))}
                    {previewWorkout.items.length > 4 && <p style={{ margin: 0, paddingLeft: 34, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>+ {previewWorkout.items.length - 4} more</p>}
                  </div>
                </div>

                <Button variant="primary" fullWidth size="lg" onClick={handleGoToDetail} style={{ marginTop: 'auto' }}>Go to workout</Button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0', gap: 14, textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-xl)', background: 'var(--surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}><Moon size={26} /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>Rest day</h4>
                  <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>No workout logged for this day.</p>
                </div>
                <Button variant="secondary" fullWidth size="lg" onClick={handleGoToDetail}>Start one</Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
