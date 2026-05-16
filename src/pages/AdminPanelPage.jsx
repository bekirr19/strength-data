import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listenAllFeedback, updateFeedbackStatus, deleteFeedback, FEEDBACK_STATUS } from '../utils/feedback';
import { listenAllUsersMeta } from '../utils/userMeta';

function AdminPanelPage() {
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usersMeta, setUsersMeta] = useState([]);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isDoneSectionOpen, setIsDoneSectionOpen] = useState(false);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = listenAllFeedback((list) => {
      setFeedbacks(list);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setIsMetaLoading(true);
    const unsubscribe = listenAllUsersMeta(
      (list) => {
        setUsersMeta(list);
        setMetaError(null);
        setIsMetaLoading(false);
      },
      (error) => {
        console.error('Kullanıcı listesi okunamadı:', error);
        setMetaError('Kullanıcı listesi alınamadı');
        setIsMetaLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === FEEDBACK_STATUS.DONE ? FEEDBACK_STATUS.OPEN : FEEDBACK_STATUS.DONE;
    await updateFeedbackStatus({ uid: item.userId, feedbackId: item.id, status: nextStatus });
  };

  const handleDelete = async (item) => {
    const ok = confirm('Bu geri bildirimi silmek istediğine emin misin?');
    if (!ok) return;
    await deleteFeedback({ uid: item.userId, feedbackId: item.id });
  };

  const openFeedbacks = feedbacks.filter((f) => f.status !== FEEDBACK_STATUS.DONE);
  const doneFeedbacks = feedbacks.filter((f) => f.status === FEEDBACK_STATUS.DONE);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="mb-4 flex items-center gap-3 relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
          <span className="material-symbols-outlined">shield_person</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Paneli</h1>
          <p className="text-sm text-gray-400">{currentUser?.email || 'Admin'}</p>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition absolute right-0 top-1"
          aria-label="Paneli kapat"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <div className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-[#1C1C1E] p-3">
          <button
            className="w-full flex items-center justify-between text-left"
            onClick={() => setIsFeedbackOpen((v) => !v)}
          >
            <div>
              <h2 className="text-lg font-semibold">Geri Bildirimler</h2>
              <p className="text-xs text-gray-400">Aktif: {openFeedbacks.length} · Tamamlanan: {doneFeedbacks.length}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {isLoading && <span>Yükleniyor...</span>}
              <span className="material-symbols-outlined text-base">
                {isFeedbackOpen ? 'expand_less' : 'expand_more'}
              </span>
            </div>
          </button>

          {isFeedbackOpen && (
            <div className="mt-3">
              {openFeedbacks.length === 0 && doneFeedbacks.length === 0 && !isLoading && (
                <p className="text-sm text-gray-500">Hiç geri bildirim yok.</p>
              )}

              {openFeedbacks.length > 0 && (
                <div className="mb-5 space-y-3">
                  <h3 className="text-xs font-bold tracking-wider text-gray-500">AKTİF</h3>
                  {openFeedbacks.map((item) => (
                    <FeedbackCard key={item.id} item={item} onToggle={handleToggleStatus} onDelete={handleDelete} />
                  ))}
                </div>
              )}

              {doneFeedbacks.length > 0 && (
                <div className="space-y-2">
                  <button
                    className="w-full flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-left"
                    onClick={() => setIsDoneSectionOpen((v) => !v)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold tracking-wider text-gray-400">TAMAMLANAN</span>
                      <span className="text-[11px] text-gray-500">{doneFeedbacks.length}</span>
                    </div>
                    <span className="material-symbols-outlined text-base text-gray-400">
                      {isDoneSectionOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {isDoneSectionOpen && (
                    <div className="space-y-3">
                      {doneFeedbacks.map((item) => (
                        <FeedbackCard key={item.id} item={item} onToggle={handleToggleStatus} onDelete={handleDelete} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#1C1C1E] p-3">
          <button
            className="w-full flex items-center justify-between text-left"
            onClick={() => setIsUsersOpen((v) => !v)}
          >
            <div>
              <h2 className="text-lg font-semibold">Kullanıcılar</h2>
              <p className="text-xs text-gray-400">Toplam: {usersMeta.length}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {isMetaLoading && <span>Yükleniyor...</span>}
              <span className="material-symbols-outlined text-base">
                {isUsersOpen ? 'expand_less' : 'expand_more'}
              </span>
            </div>
          </button>

          {isUsersOpen && (
            <div className="mt-3">
              {metaError && (
                <p className="text-sm text-red-400 mb-2">{metaError}</p>
              )}

              {!isMetaLoading && usersMeta.length === 0 && (
                <p className="text-sm text-gray-500">Henüz meta verisi yok.</p>
              )}

              <div className="space-y-2">
                {usersMeta.map((user) => (
                  <div key={user.uid} className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.displayName || user.email || user.uid}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email || user.uid}</p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <p>Son giriş</p>
                      <p className="text-white">{user.lastLogin ? new Date(user.lastLogin).toLocaleString('tr-TR') : '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FeedbackCard({ item, onToggle, onDelete }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="flex flex-col gap-1.5">
        <p className="text-sm text-gray-200 leading-snug whitespace-pre-wrap">{item.content || item.title || 'Geri bildirim'}</p>
        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
          <span className="text-gray-400 truncate">{item.userEmail || item.userId}</span>
        </div>
      </div>
      <div className="mt-2 flex justify-end gap-1.5 text-[11px]">
        <button
          onClick={() => onToggle(item)}
          className="rounded-md border border-white/15 px-2.5 py-1 font-semibold text-white hover:bg-white/10 transition"
        >
          {item.status === FEEDBACK_STATUS.DONE ? 'Tekrar aç' : 'Tamamlandı'}
        </button>
        <button
          onClick={() => onDelete(item)}
          className="rounded-md border border-red-400/40 px-2.5 py-1 font-semibold text-red-200 hover:bg-red-500/10 transition"
        >
          Sil
        </button>
      </div>
    </div>
  );
}

export default AdminPanelPage;
