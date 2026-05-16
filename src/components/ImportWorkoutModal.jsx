import { useState, useRef } from 'react';
import { saveWorkout, toISODate, ensureExercise, resolveWeightValue, saveExercises, saveBodyWeight, clearCache, importAllData } from '../utils/storage-client';
import { X, Upload, AlertTriangle, FileText } from 'lucide-react';

export default function ImportWorkoutModal({ isOpen, onClose, selectedDate, onSuccess }) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [copyInfo, setCopyInfo] = useState('');
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const parseDate = (dateStr) => {
    // "2 Kasım 2025" formatını parse et
    const months = {
      'Ocak': 0, 'Şubat': 1, 'Mart': 2, 'Nisan': 3, 'Mayıs': 4, 'Haziran': 5,
      'Temmuz': 6, 'Ağustos': 7, 'Eylül': 8, 'Ekim': 9, 'Kasım': 10, 'Aralık': 11
    };

    const parts = dateStr.trim().split(' ');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = months[parts[1]];
      const year = parseInt(parts[2]);
      
      if (day && month !== undefined && year) {
        return toISODate(new Date(year, month, day));
      }
    }
    
    return selectedDate; // Fallback
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setJsonText(e.target.result);
      setError('');
    };
    reader.onerror = () => {
      setError('Dosya okunurken bir hata oluştu.');
    };
    reader.readAsText(file);
    
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleImport = async () => {
    setError('');

    // Step 1: Parse JSON
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (err) {
      setError('JSON formatı hatalı. Lütfen geçerli bir JSON yapısı girin.\n\nHata: ' + err.message);
      return;
    }

    // Step 2: Import
    try {
      if (data && typeof data === 'object' && data.version && data.workouts) {
        const confirmed = confirm('DİKKAT: Bu işlem mevcut TÜM verileri (antrenmanlar, egzersizler, vücut ağırlığı, geliştirmeler) silebilecek ve yedek dosyasındaki verilerle değiştirecektir. Devam edilsin mi?');
        if (!confirmed) return;

        await importAllData(data);

        alert('✅ Tüm veriler başarıyla içe aktarıldı ve senkronize edildi.');

        clearCache();

        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem('firebase_cache_workouts');
            window.localStorage.removeItem('firebase_cache_exercises');
            window.localStorage.removeItem('firebase_cache_bodyWeight');
          } catch (e) {
            console.warn('LocalStorage cache temizlenemedi:', e);
          }
        }

        if (onSuccess) onSuccess();

        setTimeout(() => {
          if (typeof window !== 'undefined') window.location.reload();
        }, 500);
        return;
      }

      const targetDate = data.tarih ? parseDate(data.tarih) : selectedDate;

      const itemsPromises = (data.egzersizler || []).map(async (ex) => {
        const sets = (ex.setler || []).map((s) => {
          let reps = 0;

          if (typeof s.tekrar === 'number') {
            reps = s.tekrar;
          } else if (typeof s.tekrar === 'string') {
            const firstNum = parseInt(s.tekrar);
            reps = Number.isNaN(firstNum) ? 0 : firstNum;
          }

          const rawWeight = typeof s.agirlik_kg === 'number' || typeof s.agirlik_kg === 'string'
            ? s.agirlik_kg
            : (s.agirlik || s.weight || '');
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

      if (items.length === 0) {
        setError('Geçerli egzersiz bulunamadı. Lütfen JSON formatını kontrol edin.');
        return;
      }

      let fuelText = '';
      if (data.antrenman_yakiti && Array.isArray(data.antrenman_yakiti)) {
        fuelText = data.antrenman_yakiti.join(', ');
      }

      const workout = {
        dateISO: targetDate,
        workoutName: data.antrenman_adi || '',
        workoutFocus: data.antrenman_odagi || [],
        workoutFuel: fuelText,
        items,
        notes: typeof data.genel_yorum === 'string' ? data.genel_yorum.trim() : '',
      };

      await saveWorkout(workout);

      alert(`✅ Antrenman başarıyla ${targetDate} tarihine eklendi!\n\n${items.length} egzersiz, ${items.reduce((acc, it) => acc + it.sets.length, 0)} set kaydedildi.`);

      if (onSuccess) onSuccess();

    } catch (err) {
      console.error('Import hatası:', err);
      setError('İçe aktarma sırasında bir hata oluştu. Lütfen tekrar deneyin.\n\nHata: ' + err.message);
    }
  };

  const singleWorkoutExample = `{
  "tarih": "2 Kasım 2025",
  "antrenman_adi": "Push 2",
  "antrenman_odagi": ["Göğüs", "Omuz", "Arka Kol"],
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
    "2025-11-02": {
      "items": [...],
      "notes": "",
      "workoutName": "Push 2"
    }
  },
  "exercises": [
    {"name": "Bench Press", "createdAt": "2025-01-01T10:00:00.000Z"}
  ],
  "bodyWeight": {
    "2025-11-02": 82.5
  },
  "improvements": {
    "goals": {}
  }
}`;

  const copyExample = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyInfo('JSON formatı panoya kopyalandı.');
    } catch (err) {
      console.error('Copy failed', err);
      setCopyInfo('Kopyalanamadı, lütfen metni elle seçin.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#1C1C1E] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Veri İçe Aktar</h2>
              <p className="text-xs text-gray-400">
                JSON dosyasını yükleyin veya metni yapıştırın
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto custom-scrollbar">
          
          {/* File Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="mb-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 p-8 transition hover:bg-white/10 hover:border-purple-500/50 cursor-pointer group"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <div className="mb-3 rounded-full bg-purple-500/10 p-4 text-purple-400 transition group-hover:scale-110 group-hover:bg-purple-500/20 shadow-lg shadow-purple-500/5">
              <FileText className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-gray-200">
              JSON Dosyası Seçin
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Bilgisayarınızdan bir yedek dosyası yükleyin
            </p>
          </div>

          <div className="relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1C1C1E] px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              VEYA METİN YAPIŞTIRIN
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full h-48 p-4 bg-black/20 border border-white/10 rounded-xl text-sm font-mono text-gray-300 placeholder-gray-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:outline-none resize-none transition mt-2"
              placeholder={singleWorkoutExample}
              spellCheck="false"
            />
          </div>

          {/* JSON format helper (toggle) */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 text-xs text-gray-200">
            <button
              type="button"
              onClick={() => setIsFormatOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 font-semibold text-gray-100 hover:bg-white/10"
              aria-expanded={isFormatOpen}
            >
              <span>Beklenen JSON formatı</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400">{isFormatOpen ? 'Gizle' : 'Göster'}</span>
            </button>

            {isFormatOpen && (
              <div className="p-4 space-y-3 border-t border-white/10">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Tam yedek (tüm veriler):</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => copyExample(fullBackupExample)}
                        className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-gray-200 hover:bg-white/10"
                      >
                        Kopyala
                      </button>
                      <button
                        type="button"
                        onClick={() => setJsonText(fullBackupExample)}
                        className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-gray-200 hover:bg-white/10"
                      >
                        Metne ekle
                      </button>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap break-words bg-black/30 border border-white/5 rounded-lg p-3 font-mono text-[11px] leading-5 text-gray-100">
{fullBackupExample}
                  </pre>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Tek antrenman ekleme:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => copyExample(singleWorkoutExample)}
                        className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-gray-200 hover:bg-white/10"
                      >
                        Kopyala
                      </button>
                      <button
                        type="button"
                        onClick={() => setJsonText(singleWorkoutExample)}
                        className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-gray-200 hover:bg-white/10"
                      >
                        Metne ekle
                      </button>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap break-words bg-black/30 border border-white/5 rounded-lg p-3 font-mono text-[11px] leading-5 text-gray-100">
{singleWorkoutExample}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {copyInfo && (
            <div className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-gray-200">
              {copyInfo}
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-red-500/10 p-4 text-red-400 border border-red-500/20 animate-in slide-in-from-top-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-white/5 bg-white/[0.02] shrink-0">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-white/5 py-3 font-medium text-white hover:bg-white/10 transition"
          >
            İptal
          </button>
          <button
            onClick={handleImport}
            disabled={!jsonText.trim()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-purple-500 py-3 font-bold text-white hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
          >
            <Upload className="h-4 w-4" />
            İçe Aktar
          </button>
        </div>
      </div>
    </div>
  );
}