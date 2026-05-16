import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toISODate, formatDateTRFull, getWorkoutByDate, getBodyWeightInfo, saveBodyWeight, clearBodyWeight, exportAllData } from '../utils/storage-client';
import WeekStrip from '../components/WeekStrip';
import CalendarModal from '../components/CalendarModal';
import ImportWorkoutModal from '../components/ImportWorkoutModal';

const LAST_SELECTED_DATE_KEY = 'main_last_selected_date';

export default function MainPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    const todayISO = toISODate(new Date());
    if (typeof window === 'undefined') return todayISO;
    try {
      const stored = window.localStorage.getItem(LAST_SELECTED_DATE_KEY);
      return stored || todayISO;
    } catch (err) {
      console.warn('Son seçilen tarih okunamadı', err);
      return todayISO;
    }
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bodyWeightInput, setBodyWeightInput] = useState('');
  const [bodyWeightMeta, setBodyWeightMeta] = useState({ value: null, isFallback: false, sourceDate: null });

  const handleSelectDate = (iso) => {
    setSelectedDate(iso);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LAST_SELECTED_DATE_KEY, iso);
      } catch (err) {
        console.warn('Son seçilen tarih kaydedilemedi', err);
      }
    }
  };

  const workout = getWorkoutByDate(selectedDate);
  const dateHuman = formatDateTRFull(selectedDate);

  const handleExerciseClick = (exerciseName) => {
    navigate(`/exercise/${encodeURIComponent(exerciseName)}`);
  };

  // Sayfa focus aldığında refresh et
  useEffect(() => {
    const handleFocus = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const info = getBodyWeightInfo(selectedDate);
    setBodyWeightInput(info.value !== null ? String(info.value) : '');
    setBodyWeightMeta(info);
  }, [selectedDate, refreshKey]);

  const commitBodyWeight = (nextValue = bodyWeightInput) => {
    const trimmed = (nextValue ?? '').trim().replace(',', '.');

    if (!trimmed) {
      clearBodyWeight(selectedDate);
      const latest = getBodyWeightInfo(selectedDate);
      setBodyWeightInput(latest.value !== null ? String(Number(latest.value.toFixed(1))) : '');
      setBodyWeightMeta(latest);
      return;
    }

    const numeric = parseFloat(trimmed);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      alert('Lütfen geçerli bir ağırlık değeri girin.');
      return;
    }

    saveBodyWeight(selectedDate, numeric);
    const latest = getBodyWeightInfo(selectedDate);
    setBodyWeightInput(latest.value !== null ? String(Number(latest.value.toFixed(1))) : '');
    setBodyWeightMeta({ ...latest, isFallback: false, sourceDate: selectedDate });
  };

  const handleBodyWeightKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitBodyWeight();
      event.currentTarget.blur();
    }
  };

  const handleClearBodyWeight = () => {
    commitBodyWeight('');
  };

  const handleExportData = () => {
    const payload = exportAllData();
    if (!payload) {
      alert('Veriler dışa aktarılamadı. Lütfen tekrar deneyin.');
      return;
    }

    const fileName = `gym-tracker-export-${payload.exportedAt.replace(/[:.]/g, '-')}.json`;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderBodyWeightCard = () => (
    <div className="rounded-xl bg-white/5 border border-primary/20 p-3 md:p-4 flex flex-col gap-3 w-full md:w-48 lg:w-56">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm md:text-base font-semibold text-white">Vücut Ağırlığı</p>
          {bodyWeightMeta.isFallback && bodyWeightMeta.value !== null && bodyWeightMeta.sourceDate && (
            <p className="text-[11px] md:text-xs text-primary/70 mt-1 leading-snug">
              {formatDateTRFull(bodyWeightMeta.sourceDate)} değerini kullanıyor
            </p>
          )}
          {!bodyWeightMeta.isFallback && bodyWeightMeta.value === null && (
            <p className="text-[11px] md:text-xs text-gray-400 mt-1 leading-snug">
              Henüz kayıt yok. Boş bırakırsanız önceki günün değeri kullanılır.
            </p>
          )}
        </div>
        <button
          onClick={handleClearBodyWeight}
          className="px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold bg-transparent text-primary hover:bg-primary/10 transition"
        >
          Sıfırla
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        <div className="flex items-center gap-2">
          <input
            value={bodyWeightInput}
            onChange={(e) => setBodyWeightInput(e.target.value)}
            onBlur={() => commitBodyWeight()}
            onKeyDown={handleBodyWeightKeyDown}
            inputMode="decimal"
            className="w-full rounded-lg bg-background-dark/70 border border-primary/40 px-2.5 py-1.5 text-base md:text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary text-center"
            placeholder="kg"
          />
          <span className="text-sm md:text-base text-gray-300 whitespace-nowrap">kg</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark" key={refreshKey}>
      {/* Header */}
      <header className="flex items-center bg-background-dark p-4 pb-2 justify-between sticky top-0 z-20 border-b border-gray-700/50 backdrop-blur-sm">
        <div className="flex size-10 md:size-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined text-white text-2xl md:text-3xl">fitness_center</span>
        </div>
        <div className="flex flex-col items-center flex-1 px-2">
          <h1 className="text-base md:text-lg font-bold leading-tight tracking-tight text-white">
            Antrenman Takibi
          </h1>
          <p className="text-xs md:text-sm text-gray-400 truncate max-w-full">{dateHuman}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportData}
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 md:h-12 md:w-12 bg-transparent text-primary hover:bg-gray-700 transition"
            aria-label="JSON dışa aktar"
            title="Verileri dışa aktar (JSON)"
          >
            <span className="material-symbols-outlined text-xl md:text-2xl">download</span>
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 md:h-12 md:w-12 bg-transparent text-primary hover:bg-gray-700 transition"
            aria-label="JSON import"
            title="Antrenman ekle (JSON)"
          >
            <span className="material-symbols-outlined text-xl md:text-2xl">upload_file</span>
          </button>
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 md:h-12 md:w-12 bg-transparent text-white hover:bg-gray-700 transition"
            aria-label="Takvimi aç"
          >
            <span className="material-symbols-outlined text-xl md:text-2xl">calendar_month</span>
          </button>
        </div>
      </header>

      {/* Week Strip */}
  <WeekStrip selectedDate={selectedDate} onDateSelect={handleSelectDate} />

      {/* Main Content */}
      <main className="flex-grow p-4 pb-24 md:pb-8 max-w-4xl mx-auto w-full">
        {workout ? (
          <div className="grid md:grid-cols-[minmax(0,1fr)_auto] gap-4 lg:gap-6 items-start animate-slide-in">
            <div className="rounded-xl bg-surface-dark p-4 md:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-base md:text-lg">
                    {workout.workoutName || (selectedDate === toISODate(new Date()) ? 'Bugünkü Antrenman' : 'Antrenman')}
                  </h3>
                  {workout.workoutFocus && workout.workoutFocus.length > 0 && (
                    <p className="text-xs md:text-sm text-primary/70 mt-1">
                      {workout.workoutFocus.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-xs md:text-sm text-gray-400">
                    {workout.items.reduce((acc, it) => acc + it.sets.length, 0)} set
                  </span>
                  <button
                    onClick={() => navigate(`/workout/${selectedDate}`)}
                    className="text-primary hover:text-primary/80 transition p-1"
                    aria-label="Düzenle"
                  >
                    <span className="material-symbols-outlined text-lg md:text-xl">edit</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 md:space-y-3">
                {workout.items.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleExerciseClick(item.displayName || item.name)}
                    className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg hover:bg-background-dark/50 active:bg-background-dark/70 cursor-pointer transition"
                  >
                    <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-background-dark flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-xl md:text-2xl">fitness_center</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm md:text-base truncate">{item.displayName || item.name}</p>
                      <p className="text-xs md:text-sm text-gray-400 truncate">
                        {item.sets.length} set · {item.sets.map((s) => {
                          const numericWeight = Number(s?.w || 0);
                          const label = s?.wDisplay && s.wDisplay.length > 0
                            ? s.wDisplay
                            : (Number.isFinite(numericWeight) && numericWeight > 0 ? `${numericWeight} kg` : '—');
                          return `${s.r}×${label}`;
                        }).join(', ')}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-gray-500 text-lg md:text-xl flex-shrink-0">chevron_right</span>
                  </div>
                ))}
              </div>

              {workout.workoutFuel && (
                <div className="mt-4 p-3 md:p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-xs md:text-sm font-semibold text-primary mb-1">⚡ Antrenman Yakıtı</p>
                  <p className="text-xs md:text-sm text-gray-300">{workout.workoutFuel}</p>
                </div>
              )}

              {workout.notes && (
                <div className="mt-4 p-3 md:p-4 bg-background-dark/50 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-300 whitespace-pre-wrap">{workout.notes}</p>
                </div>
              )}
            </div>

            <div className="md:flex md:justify-end">
              {renderBodyWeightCard()}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-[minmax(0,1fr)_auto] gap-4 lg:gap-6 items-start animate-slide-in">
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 border border-white/10 py-12 md:py-16 px-6 text-center">
              <div className="text-gray-500 mb-4">
                <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>
                  fitness_center
                </span>
              </div>
              <p className="text-gray-400 mb-6 text-sm md:text-base">Bu gün için antrenman kaydı yok</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(`/workout/${selectedDate}`)}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 md:px-6 py-2.5 md:py-3 font-semibold text-background-dark hover:bg-primary/90 active:bg-primary/80 transition text-sm md:text-base"
                >
                  <span className="material-symbols-outlined text-lg md:text-xl">add</span>
                  Manuel Ekle
                </button>
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-gray-800 px-5 md:px-6 py-2.5 md:py-3 font-semibold text-white hover:bg-gray-700 active:bg-gray-600 transition text-sm md:text-base"
                >
                  <span className="material-symbols-outlined text-lg md:text-xl">upload_file</span>
                  JSON ile Ekle
                </button>
              </div>
            </div>

            <div className="md:flex md:justify-end">
              {renderBodyWeightCard()}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav - Mobile Only */}
      <nav className="fixed bottom-4 right-4 z-20 md:bottom-6 md:right-6">
        <button
          onClick={() => navigate('/exercises')}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 md:px-6 py-2.5 md:py-3 font-semibold text-background-dark shadow-lg shadow-primary/30 hover:bg-primary/90 active:bg-primary/80 transition text-sm md:text-base"
        >
          <span className="material-symbols-outlined text-lg md:text-xl">list</span>
          <span className="hidden sm:inline">Egzersizlerim</span>
          <span className="sm:hidden">Egzersizler</span>
        </button>
      </nav>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => {
          setIsCalendarOpen(false);
          setRefreshKey(prev => prev + 1); // Takvim kapanınca refresh
        }}
  onSelectDate={handleSelectDate}
      />

      {/* Import Modal */}
      <ImportWorkoutModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        selectedDate={selectedDate}
        onSuccess={() => {
          setIsImportOpen(false);
          setRefreshKey(prev => prev + 1); // Import sonrası refresh
        }}
      />
    </div>
  );
}