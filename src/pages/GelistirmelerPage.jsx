import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { getImprovements, saveImprovement, deleteImprovement, formatDateTRFull } from '../utils/storage';
import { CHANGELOG_ENTRIES } from '../data/changelog';

const changeDateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

export default function GelistirmelerPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState(null);
  const historySectionRef = useRef(null);
  const changelogGroups = useMemo(() => {
    const ordered = [...CHANGELOG_ENTRIES].sort((a, b) => new Date(b.date) - new Date(a.date));
    const grouped = ordered.reduce((acc, entry) => {
      const key = entry.date.slice(0, 10);
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    }, {});
    return Object.keys(grouped)
      .sort((a, b) => (a > b ? -1 : 1))
      .map((date) => ({ date, items: grouped[date] }));
  }, []);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const list = await getImprovements();
      setNotes(list);
    } catch (error) {
      console.error('Geliştirmeler yüklenirken hata:', error);
      alert('Geliştirmeler yüklenemedi. Lütfen bağlantınızı kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedTitle = formState.title.trim();
    const trimmedContent = formState.content.trim();

    if (!trimmedTitle && !trimmedContent) {
      alert('Lütfen en azından bir not içeriği girin.');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveImprovement({
        id: editingId,
        title: trimmedTitle,
        content: trimmedContent,
      });

      setNotes((prev) => {
        const filtered = prev.filter((item) => item.id !== saved.id);
        return [saved, ...filtered].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      });

      setFormState({ title: '', content: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Geliştirme kaydedilirken hata:', error);
      alert('Not kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setFormState({
      title: note.title || '',
      content: note.content || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormState({ title: '', content: '' });
  };

  const handleDelete = async (note) => {
    const confirmed = window.confirm('Bu notu silmek istediğinize emin misiniz?');
    if (!confirmed) return;

    try {
      await deleteImprovement(note.id);
      setNotes((prev) => prev.filter((item) => item.id !== note.id));
      if (editingId === note.id) {
        handleCancelEdit();
      }
    } catch (error) {
      console.error('Geliştirme silinirken hata:', error);
      alert('Not silinemedi. Lütfen tekrar deneyin.');
    }
  };

  const formatTimestamp = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const time = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    return `${formatDateTRFull(date)} • ${time}`;
  };

  const scrollToHistory = () => {
    if (historySectionRef.current) {
      historySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isEditing = Boolean(editingId);

  return (
    <div className="flex min-h-screen flex-col bg-background-dark text-white">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-700/50 bg-background-dark/95 px-4 py-4 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/80"
          aria-label="Geri dön"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">Geliştirmeler</span>
          <h1 className="text-lg font-semibold text-white">Notlar</h1>
        </div>
        <button
          type="button"
          onClick={scrollToHistory}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/80"
          aria-label="Geçmişi göster"
        >
          <span className="material-symbols-outlined text-2xl">history</span>
        </button>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-16">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-surface-dark p-5 shadow-xl shadow-black/20">
          <div className="space-y-4">
            <div>
              <label htmlFor="gelistirme-title" className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
                Başlık (opsiyonel)
              </label>
              <input
                id="gelistirme-title"
                type="text"
                value={formState.title}
                onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-background-dark px-4 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={120}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="gelistirme-content" className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
                Not İçeriği
              </label>
              <textarea
                id="gelistirme-content"
                value={formState.content}
                onChange={(event) => setFormState((prev) => ({ ...prev, content: event.target.value }))}
                className="min-h-[160px] w-full rounded-xl border border-white/10 bg-background-dark px-4 py-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            {isEditing ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
              >
                Düzenlemeyi İptal Et
              </button>
            ) : null}
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-background-dark transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
            >
              <span className="material-symbols-outlined text-base">{isEditing ? 'save' : 'add'}</span>
              {isEditing ? 'Güncelle' : 'Not Ekle'}
            </button>
          </div>
        </form>

        <section className="mt-8 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner message="Notlar yükleniyor..." />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 px-6 py-12 text-center text-gray-400">
              <span className="material-symbols-outlined mb-3 text-4xl text-primary/80">lightbulb</span>
              <p className="text-sm md:text-base">Henüz hiç not eklemediniz. Yukarıdan hemen ilk notunuzu oluşturun.</p>
            </div>
          ) : (
            notes.map((note) => (
              <article key={note.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-primary/60">{formatTimestamp(note.updatedAt)}</p>
                    {note.title ? (
                      <h2 className="mt-1 text-lg font-semibold text-white">{note.title}</h2>
                    ) : (
                      <h2 className="mt-1 text-lg font-semibold text-white">İsimsiz Not</h2>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-start">
                    <button
                      type="button"
                      onClick={() => handleEdit(note)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-primary/80"
                      aria-label="Notu düzenle"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(note)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-red-300 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label="Notu sil"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
                {note.content ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-gray-100">{note.content}</p>
                ) : (
                  <p className="mt-3 text-sm italic text-gray-400">İçerik bulunmuyor.</p>
                )}
              </article>
            ))
          )}
        </section>

        <section className="mt-12" ref={historySectionRef}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">Geçmiş</p>
            <h2 className="text-lg font-semibold text-white">Değişiklik Kaydı</h2>
          </div>

          <div className="mt-6 space-y-6">
            {changelogGroups.map((group) => (
              <article key={group.date} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                  <h3 className="text-base font-semibold text-white">{changeDateFormatter.format(new Date(group.date))}</h3>
                </div>
                <div className="space-y-4">
                  {group.items.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-lg font-semibold text-white">{entry.title}</h4>
                          <time className="text-xs text-gray-400">{new Date(entry.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</time>
                        </div>
                        <p className="text-sm text-gray-200 whitespace-pre-wrap">{entry.description}</p>
                        {Array.isArray(entry.tags) && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {entry.tags.map((tag) => (
                              <span key={`${entry.id}-${tag}`} className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-[11px] uppercase tracking-wide text-primary/80">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
