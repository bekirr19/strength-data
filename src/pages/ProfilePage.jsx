import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { exportAllData, getLastSyncAt } from '../utils/storage-client';
import { ArrowLeft, Lock, Trash2, Download, Upload, ChevronRight, ChevronUp, Sparkles, LogOut, ShieldCheck, CircleCheck, CircleAlert } from 'lucide-react';
import ImportWorkoutModal from '../components/ImportWorkoutModal';
import Wrapped2025Modal from '../components/Wrapped2025Modal';
import { IconButton } from '../ds/components/buttons/IconButton';
import { Button } from '../ds/components/buttons/Button';
import { Input } from '../ds/components/forms/Input';
import { Avatar } from '../ds/components/layout/Avatar';
import { Modal } from '../ds/components/feedback/Modal';
import { useToasts } from '../ds/components/feedback/Toast';

export default function ProfilePage() {
  const { currentUser, logout, updateUserPassword, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const { push, ToastDock } = useToasts();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reauthRequired, setReauthRequired] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);

  const handleExportData = async () => {
    try {
      const data = await exportAllData();
      if (!data) { push({ tone: 'error', title: 'Nothing to export', message: 'No data found.' }); return; }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workout-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      push({ tone: 'success', title: 'Export ready', message: 'Your backup was downloaded.' });
    } catch (error) {
      console.error('Export error:', error);
      push({ tone: 'error', title: 'Export failed', message: 'Something went wrong exporting.' });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
      navigate('/login');
    } catch (error) {
      console.error('Delete account error:', error);
      if (error.code === 'auth/requires-recent-login') {
        setReauthRequired(true);
      } else {
        push({ tone: 'error', title: 'Could not delete', message: 'Something went wrong.' });
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
      console.error('Logout error:', error);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { push({ tone: 'error', title: 'Too short', message: 'Password must be at least 6 characters.' }); return; }
    try {
      setLoading(true);
      await updateUserPassword(newPassword);
      push({ tone: 'success', title: 'Password updated', message: 'Your new password is saved.' });
      setNewPassword('');
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Password update error:', error);
      if (error.code === 'auth/requires-recent-login') {
        push({ tone: 'error', title: 'Re-auth required', message: 'Please log in again to change your password.' });
      } else {
        push({ tone: 'error', title: 'Could not update', message: 'Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  const Row = ({ icon, label, sub, accent, danger, onClick, chevronOpen }) => (
    <button
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 16px', border: 'none', background: 'var(--surface-card)', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 'var(--radius-md)', background: danger ? 'var(--red-tint)' : accent ? 'var(--accent-tint)' : 'var(--surface-sunken)', color: danger ? 'var(--red-600)' : accent ? 'var(--accent-hover)' : 'var(--text-secondary)', flexShrink: 0 }}>
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: danger ? 'var(--red-600)' : 'var(--text-primary)' }}>{label}</div>
        {sub && <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>{sub}</div>}
      </div>
      {chevronOpen ? <ChevronUp size={18} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />}
    </button>
  );

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--surface-page)' }}>
      <ToastDock renderIcon={(t) => (t.tone === 'success' ? <CircleCheck size={16} /> : <CircleAlert size={16} />)} />

      <header style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(247,248,250,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <IconButton ariaLabel="Back" variant="ghost" onClick={() => navigate(-1)}><ArrowLeft size={20} /></IconButton>
        <h1 style={{ flex: 1, margin: 0, textAlign: 'center', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>Profile</h1>
        <div style={{ width: 40 }} />
      </header>

      <main style={{ padding: '16px 16px 40px', maxWidth: 560, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)', padding: 18, boxShadow: 'var(--shadow-sm)' }}>
          <Avatar src={currentUser.photoURL} name={currentUser.displayName} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-.01em' }}>{currentUser.displayName || 'Athlete'}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
              <ShieldCheck size={13} style={{ color: 'var(--green-500)' }} />
              <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>Your data is backed up in the cloud</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <Row icon={<Sparkles size={18} />} label="Year in Review" sub="Your training, wrapped" accent onClick={() => setIsWrappedOpen(true)} />

          <Row icon={<Lock size={18} />} label="Security & Password" sub="Change your password" chevronOpen={showPasswordForm} onClick={() => setShowPasswordForm((o) => !o)} />
          {showPasswordForm && (
            <form onSubmit={handleUpdatePassword} style={{ padding: '4px 16px 16px', background: 'var(--surface-card)', display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid var(--border-subtle)' }}>
              <Input type="password" icon={<Lock size={18} />} placeholder="New password (min 6 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Button type="submit" variant="primary" size="sm" disabled={loading} style={{ alignSelf: 'flex-start' }}>{loading ? 'Saving…' : 'Update password'}</Button>
            </form>
          )}

          <Row icon={<Download size={18} />} label="Export data" sub="Download all data as JSON" onClick={handleExportData} />
          <Row icon={<Upload size={18} />} label="Import data" sub="Restore from a backup JSON" onClick={() => setIsImportOpen(true)} />
          <Row icon={<Trash2 size={18} />} label="Delete account" sub="Permanently delete all data" danger onClick={() => { setReauthRequired(false); setShowDeleteModal(true); }} />
        </div>

        <Button variant="secondary" fullWidth size="lg" icon={<LogOut size={18} />} onClick={handleLogout}>Log out</Button>
      </main>

      {/* Delete account modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setReauthRequired(false); }}
        variant="dialog"
        contained={false}
        title={reauthRequired ? 'Re-authentication required' : 'Delete account'}
        footer={
          reauthRequired ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" fullWidth onClick={() => { setShowDeleteModal(false); setReauthRequired(false); }}>Cancel</Button>
              <Button variant="danger" fullWidth icon={<LogOut size={16} />} onClick={handleLogout}>Log out &amp; retry</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button variant="secondary" fullWidth icon={<Download size={16} />} onClick={handleExportData}>Export backup first</Button>
              <Button variant="danger" fullWidth disabled={isDeleting} onClick={handleDeleteAccount}>{isDeleting ? 'Deleting…' : 'Delete my account'}</Button>
            </div>
          )
        }
      >
        {reauthRequired ? (
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>For security, Firebase requires a recent login before deleting your account. Log out and sign in again, then retry.</p>
        ) : (
          <>
            <div style={{ background: 'var(--red-tint)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 12, fontSize: 'var(--text-xs)', color: 'var(--red-600)', fontWeight: 600 }}>
              This permanently deletes all your workouts, exercise history, and account. This cannot be undone.
            </div>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>We recommend exporting a backup first.</p>
          </>
        )}
      </Modal>

      <ImportWorkoutModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => { setIsImportOpen(false); push({ tone: 'success', title: 'Imported', message: 'Your data was restored.' }); }}
      />

      <Wrapped2025Modal isOpen={isWrappedOpen} onClose={() => setIsWrappedOpen(false)} />
    </div>
  );
}
