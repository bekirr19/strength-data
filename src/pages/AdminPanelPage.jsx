import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, X, ChevronDown, ChevronUp, Check, RotateCcw, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { listenAllFeedback, updateFeedbackStatus, deleteFeedback, FEEDBACK_STATUS } from '../utils/feedback';
import { listenAllUsersMeta } from '../utils/userMeta';
import { formatDateShortEN } from '../utils/datetime';
import { IconButton } from '../ds/components/buttons/IconButton';
import { Button } from '../ds/components/buttons/Button';
import { Avatar } from '../ds/components/layout/Avatar';

function AdminPanelPage() {
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usersMeta, setUsersMeta] = useState([]);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(true);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isDoneSectionOpen, setIsDoneSectionOpen] = useState(false);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = listenAllFeedback((list) => { setFeedbacks(list); setIsLoading(false); });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setIsMetaLoading(true);
    const unsubscribe = listenAllUsersMeta(
      (list) => { setUsersMeta(list); setMetaError(null); setIsMetaLoading(false); },
      (error) => { console.error('Could not read users:', error); setMetaError('Could not load the users list'); setIsMetaLoading(false); }
    );
    return unsubscribe;
  }, []);

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === FEEDBACK_STATUS.DONE ? FEEDBACK_STATUS.OPEN : FEEDBACK_STATUS.DONE;
    await updateFeedbackStatus({ uid: item.userId, feedbackId: item.id, status: nextStatus });
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this feedback?')) return;
    await deleteFeedback({ uid: item.userId, feedbackId: item.id });
  };

  const openFeedbacks = feedbacks.filter((f) => f.status !== FEEDBACK_STATUS.DONE);
  const doneFeedbacks = feedbacks.filter((f) => f.status === FEEDBACK_STATUS.DONE);

  const sectionStyle = { background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-sm)', padding: 14 };
  const sectionBtnStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)', padding: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, maxWidth: 560, margin: '0 auto 16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--accent-tint)', color: 'var(--accent-hover)', flexShrink: 0 }}>
          <ShieldCheck size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>Admin</h1>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email || 'Admin'}</p>
        </div>
        <IconButton ariaLabel="Close panel" variant="soft" onClick={() => navigate(-1)}><X size={18} /></IconButton>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560, margin: '0 auto' }}>
        {/* Feedback */}
        <section style={sectionStyle}>
          <button style={sectionBtnStyle} onClick={() => setIsFeedbackOpen((v) => !v)}>
            <div>
              <h2 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>Feedback</h2>
              <p style={{ margin: '2px 0 0', fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>Open: {openFeedbacks.length} · Done: {doneFeedbacks.length}</p>
            </div>
            {isFeedbackOpen ? <ChevronUp size={18} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-tertiary)' }} />}
          </button>

          {isFeedbackOpen && (
            <div style={{ marginTop: 12 }}>
              {openFeedbacks.length === 0 && doneFeedbacks.length === 0 && !isLoading && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>No feedback yet.</p>
              )}

              {openFeedbacks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  <div className="sd-eyebrow">Open</div>
                  {openFeedbacks.map((item) => (
                    <FeedbackCard key={item.id} item={item} onToggle={handleToggleStatus} onDelete={handleDelete} />
                  ))}
                </div>
              )}

              {doneFeedbacks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button style={{ ...sectionBtnStyle, padding: '8px 12px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)' }} onClick={() => setIsDoneSectionOpen((v) => !v)}>
                    <span className="sd-eyebrow">Done · {doneFeedbacks.length}</span>
                    {isDoneSectionOpen ? <ChevronUp size={16} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-tertiary)' }} />}
                  </button>
                  {isDoneSectionOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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

        {/* Users */}
        <section style={sectionStyle}>
          <button style={sectionBtnStyle} onClick={() => setIsUsersOpen((v) => !v)}>
            <div>
              <h2 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>Users</h2>
              <p style={{ margin: '2px 0 0', fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>Total: {usersMeta.length}</p>
            </div>
            {isUsersOpen ? <ChevronUp size={18} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-tertiary)' }} />}
          </button>

          {isUsersOpen && (
            <div style={{ marginTop: 12 }}>
              {metaError && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--red-600)', marginBottom: 8 }}>{metaError}</p>}
              {!isMetaLoading && usersMeta.length === 0 && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>No user data yet.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {usersMeta.map((user) => (
                  <div key={user.uid} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)' }}>
                    <Avatar name={user.displayName || user.email} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName || user.email || user.uid}</p>
                      <p style={{ margin: 0, fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email || user.uid}</p>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>
                      <p style={{ margin: 0 }}>Last login</p>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: 600 }}>{user.lastLogin ? formatDateShortEN(new Date(user.lastLogin)) : '—'}</p>
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
  const isDone = item.status === FEEDBACK_STATUS.DONE;
  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)', padding: 12 }}>
      <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{item.content || item.title || 'Feedback'}</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>
        <span>{item.createdAt ? formatDateShortEN(new Date(item.createdAt)) : ''}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{item.userEmail || item.userId}</span>
      </div>
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="secondary" size="sm" icon={isDone ? <RotateCcw size={14} /> : <Check size={14} />} onClick={() => onToggle(item)}>{isDone ? 'Reopen' : 'Done'}</Button>
        <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => onDelete(item)}>Delete</Button>
      </div>
    </div>
  );
}

export default AdminPanelPage;
