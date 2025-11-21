import { useState } from 'react';
import { saveWorkout, toISODate, ensureExercise, resolveWeightValue, saveExercises, saveBodyWeight, clearCache, exportAllData } from '../utils/storage';

export default function ImportWorkoutModal({ isOpen, onClose, selectedDate, onSuccess }) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');

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

  const handleExportAll = async () => {
    try {
      const payload = await exportAllData();
      if (!payload) {
        alert('Veriler dışa aktarılamadı. Lütfen tekrar deneyin.');
        return;
      }

      const fileName = `strength-data-export-${payload.exportedAt.replace(/[:.]/g, '-')}.json`;
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export işlemi sırasında hata:', err);
      alert('Veriler dışa aktarılamadı. Lütfen tekrar deneyin.');
    }
  };

  const handleImport = async () => {
    setError('');
    
    try {
      console.log('Import başlıyor...');
      const data = JSON.parse(jsonText);
      console.log('JSON parse başarılı, data:', data);

      if (data && typeof data === 'object' && data.version && data.workouts) {
        console.log('Bulk import modu - workouts sayısı:', Object.keys(data.workouts).length);
        if (!data.workouts || typeof data.workouts !== 'object') {
          throw new Error('Geçersiz workouts yapısı.');
        }

        const entries = Object.entries(data.workouts).filter(([dateISO, workoutPayload]) => {
          return typeof dateISO === 'string' && dateISO && workoutPayload && typeof workoutPayload === 'object';
        });

        if (entries.length === 0) {
          setError('Aktarılacak antrenman bulunamadı.');
          return;
        }

        const confirmed = confirm('Bu işlem içe aktarılan günlerdeki mevcut antrenmanları siler ve yerlerine yeni verileri ekler. Egzersiz listesi ve varsa vücut ağırlığı kayıtları da güncellenecek. Devam edilsin mi?');
        if (!confirmed) {
          console.log('Kullanıcı import işlemini iptal etti');
          return;
        }

        console.log('Import onaylandı, işlem başlıyor...');

        if (Array.isArray(data.exercises)) {
          console.log('Exercises kaydediliyor:', data.exercises.length);
          await saveExercises(data.exercises);
        }

        if (data.bodyWeight && typeof data.bodyWeight === 'object') {
          console.log('Body weight kaydediliyor:', Object.keys(data.bodyWeight).length, 'gün');
          for (const [dateISO, value] of Object.entries(data.bodyWeight)) {
            if (!dateISO) continue;
            await saveBodyWeight(dateISO, value);
          }
        }

        let workoutCount = 0;
        let setCount = 0;

        console.log('Workouts kaydediliyor...');
        for (const [dateISO, workoutPayload] of entries) {
          const mergedWorkout = {
            ...workoutPayload,
            dateISO,
          };

          if (Array.isArray(mergedWorkout.items)) {
            setCount += mergedWorkout.items.reduce((total, item) => {
              if (!item || !Array.isArray(item.sets)) return total;
              return total + item.sets.length;
            }, 0);
          }

          console.log(`Kaydediliyor: ${dateISO}`, mergedWorkout);
          const result = await saveWorkout(mergedWorkout);
          console.log(`Kaydedildi: ${dateISO}`, result);
          workoutCount += 1;
        }

        console.log(`Import tamamlandı: ${workoutCount} workout, ${setCount} set`);

        const extraMessages = [];
        if (Array.isArray(data.exercises)) {
          extraMessages.push(`${data.exercises.length} egzersiz kaydı güncellendi`);
        }
        if (data.bodyWeight && typeof data.bodyWeight === 'object') {
          const bwCount = Object.keys(data.bodyWeight).length;
          if (bwCount > 0) {
            extraMessages.push(`${bwCount} gün için vücut ağırlığı kaydı güncellendi`);
          }
        }

        const extraText = extraMessages.length > 0 ? `\n${extraMessages.join('\n')}` : '';
        alert(`✅ ${workoutCount} gün güncellendi. Toplam ${setCount} set içe aktarıldı.${extraText}`);
        
        // Cache'i temizle
        console.log('Import tamamlandı, cache temizleniyor...');
        clearCache();
        
        if (typeof window !== 'undefined') {
          // LocalStorage cache'i de temizle
          try {
            window.localStorage.removeItem('firebase_cache_workouts');
            window.localStorage.removeItem('firebase_cache_exercises');
            window.localStorage.removeItem('firebase_cache_bodyWeight');
          } catch (e) {
            console.warn('LocalStorage cache temizlenemedi:', e);
          }
        }
        
        if (onSuccess) {
          onSuccess();
        }
        
        // Biraz bekle ki Firebase yazma işlemi kesinlikle tamamlansın
        console.log('500ms sonra sayfa yenilenecek...');
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            console.log('Sayfa yenileniyor...');
            window.location.reload();
          }
        }, 500);
        return;
      }
      
      // Tarih parse
      const targetDate = data.tarih ? parseDate(data.tarih) : selectedDate;
      
      // Egzersizleri dönüştür
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

          // Tekrar kontrolü
          if (!Number.isFinite(reps) || reps <= 0) {
            console.warn(`Set atlandı (geçersiz tekrar): ${ex.isim}`, s);
            return null;
          }

          // Ağırlık kontrolü - Body Weight (display var ama value = 0) veya geçerli sayı olmalı
          const isBodyWeight = display && (display === 'Body Weight' || display.startsWith('BW'));
          const hasValidWeight = Number.isFinite(value) && value > 0;
          
          if (!isBodyWeight && !hasValidWeight) {
            console.warn(`Set atlandı (geçersiz ağırlık): ${ex.isim}`, s, { value, display });
            return null;
          }

          return {
            w: value,
            wDisplay: display,
            r: reps,
            note: s.not || '',
          };
        }).filter(Boolean);
        
        if (sets.length > 0) {
          await ensureExercise(ex.isim);
          return {
            name: ex.isim,
            sets: sets
          };
        }
        
        return null;
      });
      
      const items = (await Promise.all(itemsPromises)).filter(Boolean);
      
      if (items.length === 0) {
        setError('Geçerli egzersiz bulunamadı. Lütfen JSON formatını kontrol edin.');
        return;
      }
      
      // Antrenman yakıtı
      let fuelText = '';
      if (data.antrenman_yakiti && Array.isArray(data.antrenman_yakiti)) {
        fuelText = data.antrenman_yakiti.join(', ');
      }
      
      // Notlar
      const notesText = typeof data.genel_yorum === 'string' ? data.genel_yorum.trim() : '';
      
      // Workout objesini oluştur
      const workout = {
        dateISO: targetDate,
        workoutName: data.antrenman_adi || '',
        workoutFocus: data.antrenman_odagi || [],
        workoutFuel: fuelText,
        items: items,
        notes: notesText
      };
      
      // Kaydet
      await saveWorkout(workout);
      
      alert(`✅ Antrenman başarıyla ${targetDate} tarihine eklendi!\n\n${items.length} egzersiz, ${items.reduce((acc, it) => acc + it.sets.length, 0)} set kaydedildi.`);
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (err) {
      console.error('JSON parse error:', err);
      console.error('Error stack:', err.stack);
      setError('JSON formatı hatalı. Lütfen geçerli bir JSON yapısı girin.\n\nHata: ' + err.message);
    }
  };

  const exampleJSON = `{
  "tarih": "2 Kasım 2025",
  "antrenman_adi": "Push 2",
  "antrenman_odagi": ["Göğüs", "Omuz", "Arka Kol"],
  "antrenman_yakiti": ["2 Yumurta", "1 Muz", "Kafein (200mg)"],
  "egzersizler": [
    {
      "isim": "Bench Press",
      "setler": [
        {"set": 1, "tekrar": 6, "agirlik_kg": 60},
        {"set": 2, "tekrar": 8, "agirlik_kg": 65}
      ]
    }
  ],
  "genel_yorum": "İyi bir antrenman günüydü."
}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-slide-in overflow-y-auto" 
      onClick={onClose}
    >
      <div
        className="bg-background-dark border border-gray-700 rounded-2xl p-4 md:p-6 max-w-2xl w-full shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">JSON ile Antrenman Ekle</h2>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              Seçili tarih: {selectedDate}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAll}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-transparent text-primary border border-primary/40 text-xs md:text-sm font-semibold hover:bg-primary/10 transition"
            >
              <span className="material-symbols-outlined text-sm align-middle">download</span>
              Dışa Aktar
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 active:bg-gray-700 rounded-lg transition">
              <span className="material-symbols-outlined text-gray-400">close</span>
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            JSON Verisi
          </label>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-64 md:h-80 p-3 bg-gray-900/80 border border-gray-700 rounded-lg text-white text-xs md:text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder={exampleJSON}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs md:text-sm text-red-400 whitespace-pre-wrap">{error}</p>
          </div>
        )}

        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-xs md:text-sm text-primary font-semibold mb-2">💡 İpuçları:</p>
          <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
            <li>JSON formatına dikkat edin (tırnak işaretleri, virgüller)</li>
            <li>Export dosyalarını buraya yapıştırdığınızda ilgili günler güncellenir</li>
            <li>tarih: "2 Kasım 2025" formatında olmalı (manuel giriş için)</li>
            <li>agirlik_kg: sayı veya "Vücut Ağırlığı" olabilir</li>
            <li>tekrar: sayı veya "5 + 7" gibi metin olabilir</li>
            <li>antrenman_yakiti: dizi formatında olmalı</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={!jsonText.trim()}
            className="flex-1 py-2.5 md:py-3 bg-primary text-background-dark rounded-lg font-semibold transition hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            İçeri Aktar
          </button>
          <button
            onClick={onClose}
            className="px-4 md:px-6 py-2.5 md:py-3 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white rounded-lg font-semibold transition text-sm md:text-base"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}