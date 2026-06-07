import { MUSCLE_OPTIONS, EXERCISE_CATEGORY_META } from '../utils/exerciseMetadata';

const CATEGORY_KEYS = ['push', 'pull', 'leg', 'other'];
const WEIGHT_STEPS = [1, 2.5, 5, 6, 10];

/**
 * Tek bir egzersiz düzenleme/oluşturma modalı.
 * Kontrollü bileşendir: form state'i parent tutar, onChange ile kısmi güncelleme alır.
 *
 * Props:
 *  - isOpen
 *  - title
 *  - form: { name, category, muscles, weightStep }
 *  - onChange(partial)  -> form'a partial'i merge eder
 *  - onClose()
 *  - onSave()
 *  - onDelete()         -> verilirse Sil butonu gösterilir
 *  - isSaving
 *  - saveLabel
 */
export default function ExerciseEditModal({
  isOpen,
  title = 'Egzersizi Düzenle',
  form,
  onChange,
  onClose,
  onSave,
  onDelete,
  isSaving = false,
  saveLabel = 'Kaydet',
}) {
  if (!isOpen || !form) return null;

  const muscles = Array.isArray(form.muscles) ? form.muscles : [];

  const toggleMuscle = (key) => {
    const exists = muscles.includes(key);
    onChange({ muscles: exists ? muscles.filter((m) => m !== key) : [...muscles, key] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-3xl bg-[#1C1C1E] border border-white/10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1 hover:bg-white/5 rounded-full"
            aria-label="Kapat"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Egzersiz Adı */}
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Egzersiz Adı</span>
            <input
              value={form.name || ''}
              onChange={(e) => onChange({ name: e.target.value })}
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-600"
              placeholder="Egzersiz adı girin"
            />
          </label>

          {/* Etiket / Gün */}
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Etiket / Gün</span>
            <div className="relative">
              <select
                value={form.category || 'other'}
                onChange={(e) => onChange({ category: e.target.value })}
                className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORY_KEYS.map((key) => (
                  <option key={key} value={key} className="bg-[#1C1C1E]">
                    {EXERCISE_CATEGORY_META[key]?.label || key}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                expand_more
              </span>
            </div>
          </label>

          {/* Çalışan Kaslar */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Çalışan Kaslar</span>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_OPTIONS.map((option) => {
                const isSelected = muscles.includes(option.key);
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => toggleMuscle(option.key)}
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

          {/* Kg Artış Adımı */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Kg Artış Adımı</span>
            <div className="flex gap-2">
              {WEIGHT_STEPS.map((step) => {
                const active = form.weightStep === step;
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => onChange({ weightStep: step })}
                    className={`flex-1 py-2 rounded-xl border text-sm font-bold transition ${
                      active
                        ? 'bg-primary border-primary text-background-dark'
                        : 'border-white/10 bg-black/40 text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {step}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-8 flex gap-3 ${onDelete ? 'justify-between' : 'justify-end'}`}>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isSaving}
              className="flex items-center justify-center rounded-xl bg-red-500/10 px-4 py-3 text-red-400 font-bold hover:bg-red-500/20 disabled:opacity-60 transition"
              aria-label="Egzersizi sil"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-6 py-3 text-sm font-bold text-gray-300 hover:bg-white/5 transition"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-background-dark hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 transition shadow-lg shadow-primary/20"
            >
              {isSaving ? 'Kaydediliyor...' : saveLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
