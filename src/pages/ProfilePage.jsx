import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { exportAllData, getLastSyncAt } from '../utils/storage-client';
import { LogOut, ArrowLeft, User, Lock, Check, Trash2, AlertTriangle, Download, ChevronRight, Upload, Database, Sparkles } from 'lucide-react';
import ImportWorkoutModal from '../components/ImportWorkoutModal';
import Wrapped2025Modal from '../components/Wrapped2025Modal';

export default function ProfilePage() {
  const { currentUser, logout, updateUserPassword, deleteAccount } = useAuth();
  const navigate = useNavigate();
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDataActions, setShowDataActions] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reauthRequired, setReauthRequired] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(getLastSyncAt());

  const handleExportData = async () => {
    try {
      const data = await exportAllData();
      if (!data) {
        setMessage({ type: 'error', text: 'İndirilecek veri bulunamadı.' });
        return;
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workout-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Veri dışa aktarma hatası:', error);
      setMessage({ type: 'error', text: 'Veriler dışa aktarılırken bir hata oluştu.' });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
      navigate('/login');
    } catch (error) {
      console.error('Hesap silme hatası:', error);
      if (error.code === 'auth/requires-recent-login') {
        setReauthRequired(true);
      } else {
        setMessage({ type: 'error', text: 'Hesap silinirken bir hata oluştu.' });
        setShowDeleteModal(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Şifre en az 6 karakter olmalıdır.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      await updateUserPassword(newPassword);
      setMessage({ type: 'success', text: 'Şifreniz başarıyla güncellendi.' });
      setNewPassword('');
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Şifre güncelleme hatası:', error);
      if (error.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'Güvenlik nedeniyle yeniden giriş yapmanız gerekiyor.' });
      } else {
        setMessage({ type: 'error', text: 'Şifre güncellenemedi. Lütfen tekrar deneyin.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  // Kullanıcının şifre sağlayıcısı var mı kontrol et
  const hasPasswordProvider = currentUser.providerData.some(
    (provider) => provider.providerId === 'password'
  );

  return (
    <div className="min-h-screen bg-background-dark p-6 text-white font-sans bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(11,17,33,0))]">
      {/* Header / Nav */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Profile & Sync Section */}
      <div className="mb-8 rounded-2xl bg-surface-dark/50 border border-white/5 p-4 md:p-5 flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-3 md:w-1/3">
          <div className="relative">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="h-24 w-24 rounded-full object-cover border-4 border-background-dark shadow-xl"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-dark border-4 border-background-dark shadow-xl">
                <User className="h-10 w-10 text-primary" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white leading-tight">{currentUser.displayName}</h1>
            <p className="text-sm text-gray-400">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex-1 flex items-center">
          <p className="text-[11px] text-gray-500">Verileriniz bulutta yedekleniyor</p>
        </div>
      </div>

      {/* Settings List */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-surface-dark/50 backdrop-blur-sm border border-white/5">
        {/* Wrapped 2025 Item */}
        <div className="border-b border-white/5 last:border-0">
          <button 
            onClick={() => setIsWrappedOpen(true)}
            className="flex w-full items-center justify-between p-4 transition hover:bg-white/5 group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500/20 transition-colors">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium text-white">2025 Özeti</span>
                <span className="text-xs text-gray-400">Yıllık antrenman raporunu görüntüle</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Password Item */}
        <div className="border-b border-white/5 last:border-0">
          <button 
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex w-full items-center justify-between p-4 transition hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lock className="h-4 w-4" />
              </div>
              <span className="font-medium">Güvenlik & Şifre</span>
            </div>
            <ChevronRight className={`h-5 w-5 text-gray-500 transition-transform ${showPasswordForm ? 'rotate-90' : ''}`} />
          </button>
          
          {/* Expandable Form */}
          {showPasswordForm && (
            <div className="bg-black/20 p-4 pt-0">
              <form onSubmit={handleUpdatePassword} className="mt-3 space-y-3">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-lg border border-white/10 bg-black/20 py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 transition focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Yeni şifreniz"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setNewPassword('');
                      setMessage({ type: '', text: '' });
                    }}
                    className="flex-1 rounded-lg bg-white/5 py-2 text-xs font-bold text-gray-400 transition hover:bg-white/10"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-primary py-2 text-xs font-bold text-background-dark transition hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </form>
              
              {!hasPasswordProvider && (
                <p className="mt-3 text-xs text-gray-500">
                  Hesabınıza şifre ekleyerek e-posta ile de giriş yapabilirsiniz.
                </p>
              )}

              {message.text && (
                <div className={`mt-3 flex items-center gap-2 rounded-lg p-2 text-xs ${message.type === 'success' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-400'}`}>
                  {message.type === 'success' ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  {message.text}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Data Management Item */}
        <div className="border-b border-white/5 last:border-0">
          <button 
            onClick={() => setShowDataActions(!showDataActions)}
            className="flex w-full items-center justify-between p-4 transition hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
                <Database className="h-4 w-4" />
              </div>
              <span className="font-medium">Veri İçe & Dışa Aktar</span>
            </div>
            <ChevronRight className={`h-5 w-5 text-gray-500 transition-transform ${showDataActions ? 'rotate-90' : ''}`} />
          </button>

          {showDataActions && (
            <div className="bg-black/20 p-4 pt-0">
              <p className="mt-3 mb-4 text-xs text-gray-500">
                Verilerinizi yedekleyebilir veya başka bir cihazdan aldığınız yedeği geri yükleyebilirsiniz.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white/5 py-3 text-xs font-bold text-white hover:bg-white/10 transition border border-white/5"
                >
                  <Upload className="h-4 w-4 text-purple-400" />
                  İçe Aktar
                </button>
                <button
                  onClick={handleExportData}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white/5 py-3 text-xs font-bold text-white hover:bg-white/10 transition border border-white/5"
                >
                  <Download className="h-4 w-4 text-blue-400" />
                  Dışa Aktar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-surface-dark/50 p-4 font-medium text-gray-200 transition hover:bg-surface-dark border border-white/5"
      >
        <LogOut className="h-5 w-5" />
        Çıkış Yap
      </button>

      {/* Delete Account - Text Only */}
      <button 
        onClick={() => setShowDeleteModal(true)}
        className="flex w-full items-center justify-center gap-2 text-sm font-medium text-red-500 opacity-80 transition hover:text-red-400 hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
        Hesabımı Sil
      </button>

      {/* Hesap Silme Modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-surface-dark p-6 border border-white/10 shadow-2xl">
            {reauthRequired ? (
              <>
                <div className="mb-4 flex items-center gap-3 text-yellow-500">
                  <AlertTriangle className="h-8 w-8" />
                  <h2 className="text-xl font-bold">Yeniden Giriş Gerekli</h2>
                </div>
                
                <p className="mb-6 text-gray-300">
                  Güvenlik nedeniyle, hesabınızı silmek için kimliğinizi doğrulamanız gerekmektedir. Lütfen çıkış yapıp tekrar giriş yaptıktan sonra bu işlemi tekrar deneyin.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setReauthRequired(false);
                    }}
                    className="flex-1 rounded-xl bg-white/5 py-3 font-medium text-white hover:bg-white/10 transition"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 rounded-xl bg-yellow-500 py-3 font-medium text-black hover:bg-yellow-400 transition flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap ve Tekrar Dene
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-3 text-red-500">
                  <AlertTriangle className="h-8 w-8" />
                  <h2 className="text-xl font-bold">Hesabınızı Silmek Üzeresiniz</h2>
                </div>
                
                <p className="mb-6 text-gray-300">
                  Bu işlem geri alınamaz. Tüm antrenman verileriniz, vücut ölçüleriniz ve hesap bilgileriniz kalıcı olarak silinecektir.
                </p>

                <div className="mb-6 rounded-xl bg-primary/10 p-4 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Download className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-primary mb-1">Verilerinizi Yedekleyin</h4>
                      <p className="text-xs text-gray-400 mb-3">
                        Hesabınızı silmeden önce verilerinizi indirmenizi öneririz.
                      </p>
                      <button
                        onClick={handleExportData}
                        className="text-xs bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-lg transition"
                      >
                        Verileri İndir (JSON)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 rounded-xl bg-white/5 py-3 font-medium text-white hover:bg-white/10 transition"
                    disabled={isDeleting}
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 rounded-xl bg-red-500 py-3 font-medium text-white hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Siliniyor...' : 'Evet, Hesabımı Sil'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <ImportWorkoutModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => {
          setIsImportOpen(false);
          setMessage({ type: 'success', text: 'Veriler başarıyla içe aktarıldı.' });
        }}
      />
      
      <Wrapped2025Modal isOpen={isWrappedOpen} onClose={() => setIsWrappedOpen(false)} />
    </div>
  );
}
