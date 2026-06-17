/* ExerciseEdit modal + BodyWeight modal for the Strength Data UI kit */
const DS_M = window.StrengthDataDesignSystem_5c629b;

// Inline fallbacks until bundle recompiles
const FilterChip = DS_M.FilterChip || function({ label, active, onClick, accent, style = {} }) {
  const fill = accent || 'var(--accent)';
  return (
    <button type="button" onClick={onClick}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, height: 34, padding: '0 16px', border: `1px solid ${active ? fill : 'var(--border-subtle)'}`, borderRadius: 'var(--radius-full)', background: active ? fill : 'var(--surface-card)', color: active ? '#fff' : 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 700, cursor: 'pointer', ...style }}>
      {label}
    </button>
  );
};

const Switch = DS_M.Switch || function({ checked, onChange, ariaLabel, size = 'md' }) {
  const w = size === 'sm' ? 38 : 46, h = size === 'sm' ? 22 : 28, k = size === 'sm' ? 16 : 22;
  const pad = (h - k) / 2;
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={ariaLabel} onClick={() => onChange && onChange(!checked)}
      style={{ position: 'relative', width: w, height: h, padding: 0, border: 'none', borderRadius: 999, background: checked ? 'var(--accent)' : 'var(--gray-300)', cursor: 'pointer', transition: 'background var(--dur-base) var(--ease-standard)', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: pad, left: checked ? w - k - pad : pad, width: k, height: k, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-sm)', transition: 'left var(--dur-base) var(--ease-spring)' }} />
    </button>
  );
};

// ==================== EXERCISE EDIT MODAL ====================
function ExerciseEditModal({ exercise = null, onClose, onSave }) {
  const { Input, Button, IconButton } = DS_M;
  const isEdit = !!exercise;
  const [name, setName] = React.useState(exercise?.name || '');
  const [cat, setCat] = React.useState(exercise?.category || 'push');
  const [muscles, setMuscles] = React.useState(new Set(exercise?.muscles || []));
  const [step, setStep] = React.useState(exercise?.weightStep || 2.5);
  const [showDelete, setShowDelete] = React.useState(false);

  const togMuscle = m => setMuscles(s => { const n = new Set(s); n.has(m) ? n.delete(m) : n.add(m); return n; });

  const ALL_MUSCLES = ['Chest','Shoulders','Triceps','Biceps','Back','Lats','Rear Delts','Legs','Quads','Hamstrings','Glutes','Calves','Core','Abs','Forearms','Hip Flexors'];
  const CAT_COLORS = { push: 'var(--push-500)', pull: 'var(--pull-500)', leg: 'var(--leg-500)', other: 'var(--other-500)' };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(31,41,55,0.34)', animation: 'sd-fade-in var(--dur-base) var(--ease-standard)' }} />
      <div className="sd-no-scrollbar" style={{ position: 'relative', width: '100%', maxHeight: '88%', overflowY: 'auto', background: 'var(--surface-card)', borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0', boxShadow: 'var(--shadow-xl)', paddingBottom: 24, animation: 'sd-sheet-up var(--dur-slow) var(--ease-out)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
          <div style={{ width: 38, height: 4, borderRadius: 2, background: 'var(--gray-200)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 0' }}>
          <div>
            <div className="sd-eyebrow" style={{ color: 'var(--accent)', marginBottom: 3 }}>{isEdit ? 'Edit exercise' : 'New exercise'}</div>
            <h3 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
              {isEdit ? (name || exercise.name) : 'Add exercise'}
            </h3>
            {isEdit && <p style={{ margin: '3px 0 0', fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>Renaming updates all historical records</p>}
          </div>
          <IconButton ariaLabel="Close" variant="soft" onClick={onClose}><LIcon name="X" size={18} /></IconButton>
        </div>

        <div style={{ padding: '16px 18px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <SLabel>Exercise name</SLabel>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Incline Bench Press" icon={<LIcon name="Pencil" size={18} />} />
          </div>
          <div>
            <SLabel>Category</SLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              {['push','pull','leg','other'].map(k => (
                <FilterChip key={k} label={k.charAt(0).toUpperCase()+k.slice(1)} active={cat===k}
                  accent={CAT_COLORS[k]} onClick={() => setCat(k)}
                  style={{ flex: 1, justifyContent: 'center' }} />
              ))}
            </div>
          </div>
          <div>
            <SLabel>Target muscles</SLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALL_MUSCLES.map(m => (
                <FilterChip key={m} label={m} size="sm" active={muscles.has(m)} onClick={() => togMuscle(m)} />
              ))}
            </div>
          </div>
          <div>
            <SLabel>Weight increment</SLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2.5, 5].map(v => (
                <FilterChip key={v} label={`${v} kg`} active={step === v} onClick={() => setStep(v)} style={{ flex: 1, justifyContent: 'center' }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
            <Button variant="primary" fullWidth size="lg" onClick={() => { onSave && onSave({ name, category: cat, muscles: [...muscles], weightStep: step }); onClose(); }}>
              {isEdit ? 'Save changes' : 'Add exercise'}
            </Button>
            {isEdit && (
              showDelete
                ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--red-600)', fontWeight: 600 }}>This will remove the exercise from your history everywhere.</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="secondary" fullWidth onClick={() => setShowDelete(false)}>Cancel</Button>
                      <Button variant="danger" fullWidth onClick={onClose}>Delete everywhere</Button>
                    </div>
                  </div>
                : <Button variant="danger" fullWidth icon={<LIcon name="Trash2" size={16} />} onClick={() => setShowDelete(true)}>Delete exercise</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== BODY WEIGHT MODAL ====================
function BodyWeightModal({ current = 78.5, isFallback = false, date = 'Mon 15 Jun', onClose, onSave }) {
  const { Button, IconButton, Stepper } = DS_M;
  const [val, setVal] = React.useState(String(current));

  const save = () => { onSave && onSave(parseFloat(val) || current); onClose(); };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(31,41,55,0.34)', animation: 'sd-fade-in var(--dur-base) var(--ease-standard)' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 340, background: 'var(--surface-card)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-xl)', padding: '22px 20px 20px', animation: 'sd-pop-in var(--dur-slow) var(--ease-spring)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div className="sd-eyebrow" style={{ color: 'var(--accent)', marginBottom: 3 }}>Body weight</div>
            <h3 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>{date}</h3>
          </div>
          <IconButton ariaLabel="Close" variant="soft" onClick={onClose}><LIcon name="X" size={18} /></IconButton>
        </div>

        {isFallback && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', marginBottom: 14 }}>
            <LIcon name="Info" size={14} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Showing <span style={{ fontWeight: 700 }}>{current} kg*</span> — carried over from a previous day
            </span>
          </div>
        )}

        <Stepper label="kg" value={val}
          onDecrement={() => setVal(v => (Math.max(20, parseFloat(v) - 0.5)).toFixed(1))}
          onIncrement={() => setVal(v => (parseFloat(v) + 0.5).toFixed(1))}
          onChange={e => setVal(e.target.value)} />

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button variant="primary" fullWidth onClick={save}>Save</Button>
        </div>
      </div>
    </div>
  );
}

// ==================== DEMO SCREEN ====================
function ModalsScreen({ nav }) {
  const [show, setShow] = React.useState('none');
  const BENCH = { name: 'Bench Press', category: 'push', muscles: ['Chest','Shoulders','Triceps'], weightStep: 2.5 };

  return (
    <div style={{ height: '100%', background: 'var(--surface-page)', overflowY: 'auto', position: 'relative' }}>
      <TopBar2 title="Modals" onBack={() => nav.go('today')} />
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionCard title="Exercise Edit" sub="Opened from FAB, per-exercise edit, or quick-edit">
          <div style={{ display: 'flex', gap: 10 }}>
            <DS_M.Button variant="secondary" fullWidth onClick={() => setShow('exerciseNew')}>New exercise</DS_M.Button>
            <DS_M.Button variant="secondary" fullWidth onClick={() => setShow('exerciseEdit')}>Edit existing</DS_M.Button>
          </div>
        </SectionCard>
        <SectionCard title="Body Weight" sub="Tap the BW badge on Today">
          <DS_M.Button variant="secondary" fullWidth onClick={() => setShow('bw')}>Open body weight</DS_M.Button>
        </SectionCard>
        <SectionCard title="Body Weight — fallback" sub="Value carried over from a prior day (shows *)">
          <DS_M.Button variant="secondary" fullWidth onClick={() => setShow('bwFallback')}>Open with fallback</DS_M.Button>
        </SectionCard>
      </div>

      {show === 'exerciseNew' && <ExerciseEditModal onClose={() => setShow('none')} />}
      {show === 'exerciseEdit' && <ExerciseEditModal exercise={BENCH} onClose={() => setShow('none')} />}
      {show === 'bw' && <BodyWeightModal date="Mon 15 Jun" current={78.5} onClose={() => setShow('none')} />}
      {show === 'bwFallback' && <BodyWeightModal date="Tue 16 Jun" current={78.5} isFallback onClose={() => setShow('none')} />}
    </div>
  );
}

function SectionCard({ title, sub, children }) {
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
        {sub && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function SLabel({ children }) {
  return <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</div>;
}

function TopBar2({ title, onBack, right }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(247,248,250,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-subtle)' }}>
      <DS_M.IconButton ariaLabel="Back" variant="ghost" onClick={onBack}><LIcon name="ArrowLeft" size={20} /></DS_M.IconButton>
      <h1 style={{ flex: 1, margin: 0, textAlign: 'center', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h1>
      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>{right || null}</div>
    </header>
  );
}

function LIcon({ name, size = 20, style = {} }) {
  const n = window.lucide && window.lucide[name];
  let svg = '';
  if (n && Array.isArray(n)) {
    const a = { ...n[1], width: size, height: size, 'stroke-width': 2 };
    const at = Object.entries(a).map(([k, v]) => k + '="' + v + '"').join(' ');
    const kids = (n[2] || []).map(c => '<' + c[0] + ' ' + Object.entries(c[1]).map(([k, v]) => k + '="' + v + '"').join(' ') + '/>').join('');
    svg = '<svg ' + at + '>' + kids + '</svg>';
  }
  return <span style={{ display: 'inline-flex', alignItems: 'center', ...style }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

Object.assign(window, { ModalsScreen, ExerciseEditModal, BodyWeightModal, TopBar2, SectionCard, SLabel, LIcon });
