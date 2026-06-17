import { useState, useRef } from 'react';
import { saveWorkout, toISODate, ensureExercise, resolveWeightValue, saveExercises, saveBodyWeight, clearCache, importAllData } from '../utils/storage-client';
import { X, Upload, AlertTriangle, FileText } from 'lucide-react';
import { Modal } from '../ds/components/feedback/Modal';
import { Button } from '../ds/components/buttons/Button';
import { IconButton } from '../ds/components/buttons/IconButton';

export default function ImportWorkoutModal({ isOpen, onClose, selectedDate, onSuccess }) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [copyInfo, setCopyInfo] = useState('');
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const parseDate = (dateStr) => {
    const months = {
      'Ocak': 0, 'Şubat': 1, 'Mart': 2, 'Nisan': 3, 'Mayıs': 4, 'Haziran': 5,
      'Temmuz': 6, 'Ağustos': 7, 'Eylül': 8, 'Ekim': 9, 'Kasım': 10, 'Aralık': 11,
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11,
    };
    const parts = dateStr.trim().split(' ');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = months[parts[1]];
      const year = parseInt(parts[2]);
      if (day && month !== undefined && year) return toISODate(new Date(year, month, day));
    }
    return selectedDate;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { setJsonText(e.target.result); setError(''); };
    reader.onerror = () => { setError('Could not read the file.'); };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleImport = async () => {
    setError('');
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (err) {
      setError('Invalid JSON. Please paste a valid structure.\n\nError: ' + err.message);
      return;
    }

    try {
      if (data && typeof data === 'object' && data.version && data.workouts) {
        const confirmed = confirm('WARNING: This may replace ALL current data (workouts, exercises, body weight, feedback) with the contents of this backup. Continue?');
        if (!confirmed) return;
        await importAllData(data);
        alert('✅ All data imported and synced.');
        clearCache();
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem('firebase_cache_workouts');
            window.localStorage.removeItem('firebase_cache_exercises');
            window.localStorage.removeItem('firebase_cache_bodyWeight');
          } catch (e) {
            console.warn('Could not clear localStorage cache:', e);
          }
        }
        if (onSuccess) onSuccess();
        setTimeout(() => { if (typeof window !== 'undefined') window.location.reload(); }, 500);
        return;
      }

      const targetDate = data.tarih ? parseDate(data.tarih) : selectedDate;

      const itemsPromises = (data.egzersizler || []).map(async (ex) => {
        const sets = (ex.setler || []).map((s) => {
          let reps = 0;
          if (typeof s.tekrar === 'number') reps = s.tekrar;
          else if (typeof s.tekrar === 'string') { const firstNum = parseInt(s.tekrar); reps = Number.isNaN(firstNum) ? 0 : firstNum; }
          const rawWeight = typeof s.agirlik_kg === 'number' || typeof s.agirlik_kg === 'string' ? s.agirlik_kg : (s.agirlik || s.weight || '');
          const { value, display } = resolveWeightValue(rawWeight, ex.isim, targetDate);
          if (!Number.isFinite(reps) || reps <= 0) return null;
          const isBodyWeight = display && (display === 'Body Weight' || display.startsWith('BW'));
          const hasValidWeight = Number.isFinite(value) && value > 0;
          if (!isBodyWeight && !hasValidWeight) return null;
          return { w: value, wDisplay: display, r: reps, note: s.not || '' };
        }).filter(Boolean);
        if (sets.length > 0) {
          await ensureExercise(ex.isim);
          return { name: ex.isim, sets };
        }
        return null;
      });

      const items = (await Promise.all(itemsPromises)).filter(Boolean);
      if (items.length === 0) { setError('No valid exercises found. Please check the JSON format.'); return; }

      let fuelText = '';
      if (data.antrenman_yakiti && Array.isArray(data.antrenman_yakiti)) fuelText = data.antrenman_yakiti.join(', ');

      const workout = {
        dateISO: targetDate,
        workoutName: data.antrenman_adi || '',
        workoutFocus: data.antrenman_odagi || [],
        workoutFuel: fuelText,
        items,
        notes: typeof data.genel_yorum === 'string' ? data.genel_yorum.trim() : '',
      };

      await saveWorkout(workout);
      alert(`✅ Workout added to ${targetDate}.\n\n${items.length} exercises, ${items.reduce((acc, it) => acc + it.sets.length, 0)} sets saved.`);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Import error:', err);
      setError('Something went wrong during import. Please try again.\n\nError: ' + err.message);
    }
  };

  const singleWorkoutExample = `{
  "tarih": "2 November 2025",
  "antrenman_adi": "Push 2",
  "antrenman_odagi": ["Chest", "Shoulders", "Triceps"],
  "egzersizler": [
    {
      "isim": "Bench Press",
      "setler": [
        {"set": 1, "tekrar": 6, "agirlik_kg": 60}
      ]
    }
  ]
}`;

  const fullBackupExample = `{
  "version": 2,
  "exportedAt": "2026-01-12T12:00:00.000Z",
  "workouts": {
    "2025-11-02": { "items": [], "notes": "", "workoutName": "Push 2" }
  },
  "exercises": [
    {"name": "Bench Press", "createdAt": "2025-01-01T10:00:00.000Z"}
  ],
  "bodyWeight": { "2025-11-02": 82.5 },
  "improvements": { "goals": {} }
}`;

  const copyExample = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyInfo('JSON format copied to clipboard.');
    } catch (err) {
      console.error('Copy failed', err);
      setCopyInfo('Could not copy — please select the text manually.');
    }
  };

  const smallBtn = { borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', padding: '4px 8px', fontSize: 'var(--text-2xs)', color: 'var(--text-secondary)', background: 'var(--surface-card)', cursor: 'pointer' };
  const pre = { whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 12, fontFamily: 'monospace', fontSize: 'var(--text-2xs)', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      variant="dialog"
      contained={false}
      maxWidth={640}
      eyebrow="Import data"
      title="Restore from JSON"
      headerRight={<IconButton ariaLabel="Close" variant="soft" onClick={onClose}><X size={18} /></IconButton>}
      footer={
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button variant="primary" fullWidth icon={<Upload size={16} />} disabled={!jsonText.trim()} onClick={handleImport}>Import</Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 4 }}>
        {/* Dropzone */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24, borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border-strong)', background: 'var(--surface-sunken)', cursor: 'pointer', width: '100%' }}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" style={{ display: 'none' }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--accent-tint)', color: 'var(--accent-hover)' }}><FileText size={22} /></span>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>Select a JSON file</span>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>Upload a backup from your device</span>
        </button>

        <div>
          <div className="sd-eyebrow" style={{ marginBottom: 8 }}>Or paste text</div>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={singleWorkoutExample}
            spellCheck="false"
            style={{ width: '100%', height: 180, padding: 14, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-xs)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        {/* Format helper */}
        <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <button type="button" onClick={() => setIsFormatOpen((v) => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: 'none', background: 'var(--surface-card)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }} aria-expanded={isFormatOpen}>
            <span>Expected JSON format</span>
            <span style={{ fontSize: 'var(--text-2xs)', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{isFormatOpen ? 'Hide' : 'Show'}</span>
          </button>
          {isFormatOpen && (
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-2xs)', color: 'var(--text-secondary)' }}>
                  <span>Full backup (all data):</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => copyExample(fullBackupExample)} style={smallBtn}>Copy</button>
                    <button type="button" onClick={() => setJsonText(fullBackupExample)} style={smallBtn}>Insert</button>
                  </div>
                </div>
                <pre style={pre}>{fullBackupExample}</pre>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-2xs)', color: 'var(--text-secondary)' }}>
                  <span>Single workout:</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => copyExample(singleWorkoutExample)} style={smallBtn}>Copy</button>
                    <button type="button" onClick={() => setJsonText(singleWorkoutExample)} style={smallBtn}>Insert</button>
                  </div>
                </div>
                <pre style={pre}>{singleWorkoutExample}</pre>
              </div>
            </div>
          )}
        </div>

        {copyInfo && (
          <div style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--surface-sunken)', padding: '8px 12px', fontSize: 'var(--text-2xs)', color: 'var(--text-secondary)' }}>{copyInfo}</div>
        )}

        {error && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, borderRadius: 'var(--radius-md)', background: 'var(--red-tint)', border: '1px solid var(--red-500)', padding: 12, color: 'var(--red-600)' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap' }}>{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
