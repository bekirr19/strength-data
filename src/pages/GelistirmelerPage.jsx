import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createFeedback, listenUserFeedback } from '../utils/feedback';
import { formatDateShortEN } from '../utils/datetime';
import { IconButton } from '../ds/components/buttons/IconButton';
import { Button } from '../ds/components/buttons/Button';
import { SegmentedControl } from '../ds/components/forms/SegmentedControl';
import { EmptyState } from '../ds/components/feedback/EmptyState';
import { useToasts } from '../ds/components/feedback/Toast';

export default function GelistirmelerPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { push, ToastDock } = useToasts();
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newFeedback, setNewFeedback] = useState('');
  const [category, setCategory] = useState('idea');

  useEffect(() => {
    if (!currentUser?.uid) {
      setFeedbacks([]);
      setIsLoading(false);
      return undefined;
    }
    setIsLoading(true);
    const unsubscribe = listenUserFeedback(
      currentUser.uid,
      (list) => { setFeedbacks(list); setIsLoading(false); },
      (error) => { console.error('Error reading feedback:', error); setFeedbacks([]); setIsLoading(false); }
    );
    return unsubscribe;
  }, [currentUser?.uid]);

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!newFeedback.trim()) { push({ tone: 'error', title: 'Empty message', message: 'Write something before sending.' }); return; }
    try {
      await createFeedback({ title: category, content: newFeedback.trim() });
      setNewFeedback('');
      push({ tone: 'success', title: 'Sent!', message: 'Thanks for your feedback.' });
    } catch (error) {
      console.error('Error sending feedback:', error);
      push({ tone: 'error', title: 'Could not send', message: 'Please try again.' });
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--surface-page)' }}>
      <ToastDock renderIcon={() => <MessageSquare size={16} />} />
      <header style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(247,248,250,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <IconButton ariaLabel="Back" variant="ghost" onClick={() => navigate(-1)}><ArrowLeft size={20} /></IconButton>
        <h1 style={{ flex: 1, margin: 0, textAlign: 'center', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>Feedback</h1>
        <div style={{ width: 40 }} />
      </header>

      <main style={{ padding: '20px 16px 40px', maxWidth: 560, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Found a bug, have an idea, or just want to say hi? We'd love to hear from you.
        </p>

        <form onSubmit={handleAddFeedback} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div className="sd-eyebrow" style={{ marginBottom: 8 }}>Category</div>
            <SegmentedControl
              options={[{ value: 'bug', label: 'Bug' }, { value: 'idea', label: 'Idea' }, { value: 'other', label: 'Other' }]}
              value={category}
              onChange={setCategory}
            />
          </div>
          <div>
            <div className="sd-eyebrow" style={{ marginBottom: 8 }}>Message</div>
            <textarea
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              rows={5}
              placeholder={category === 'bug' ? 'Describe the bug and steps to reproduce…' : category === 'idea' ? 'What would you like to see?' : 'Your message…'}
              style={{ width: '100%', resize: 'vertical', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--surface-card)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-xs)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <Button type="submit" variant="primary" fullWidth size="lg" icon={<Send size={18} />}>Send feedback</Button>
        </form>

        {!isLoading && (
          <section>
            <div className="sd-eyebrow" style={{ marginBottom: 10 }}>Sent</div>
            {feedbacks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {feedbacks.map((item) => (
                  <div key={item.id} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xs)', padding: 14 }}>
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.content || 'Feedback'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>
                      <span>{item.createdAt ? formatDateShortEN(new Date(item.createdAt)) : ''}</span>
                      <span>Sent</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<MessageSquare size={24} />} title="No feedback yet" subtitle="Your sent messages will appear here." />
            )}
          </section>
        )}
      </main>
    </div>
  );
}
