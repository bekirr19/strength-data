import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createFeedback, listenUserFeedback } from '../utils/feedback';
import LoadingSpinner from '../components/LoadingSpinner';

export default function GelistirmelerPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newFeedback, setNewFeedback] = useState('');

  useEffect(() => {
    if (!currentUser?.uid) {
      setFeedbacks([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    const unsubscribe = listenUserFeedback(
      currentUser.uid,
      (list) => {
        setFeedbacks(list);
        setIsLoading(false);
      },
      (error) => {
        console.error('Geri bildirim okunurken hata:', error);
        setFeedbacks([]);
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, [currentUser?.uid]);

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!newFeedback.trim()) return;

    try {
      const text = newFeedback.trim();
      await createFeedback({
        title: '',
        content: text,
      });
      setNewFeedback('');
    } catch (error) {
      console.error('Geri bildirim eklenirken hata:', error);
      alert('Geri bildirim gönderilemedi.');
    }
  };

  const FeedbackItem = ({ item }) => (
    <div className='mb-3 overflow-hidden rounded-xl bg-[#1E1E1E]'>
      <div className='flex flex-col gap-2 p-4'>
        <p className='text-base break-words text-white whitespace-pre-wrap'>
          {item.content || item.title || 'Geri bildirim'}
        </p>
        <div className='flex items-center justify-between text-xs text-gray-400'>
          <span>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
          <span className='flex items-center gap-1 text-gray-300'>Gönderildi</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-black text-white pb-20'>
      {/* Header */}
      <header className='sticky top-0 z-10 flex items-center gap-4 bg-black/80 px-4 py-4 backdrop-blur-md'>
        <button onClick={() => navigate(-1)} className='text-gray-400 hover:text-white'>
          <span className='material-symbols-outlined text-3xl'>arrow_back</span>
        </button>
        <h1 className='text-xl font-bold'>Geri Bildirim</h1>
      </header>

      <main className='px-4 pt-2'>
        {/* Input Area */}
        <form onSubmit={handleAddFeedback} className='mb-8 relative'>
          <textarea
            value={newFeedback}
            onChange={(e) => setNewFeedback(e.target.value)}
            placeholder='Geliştiriciye geri bildirimde bulun...'
            rows={1}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            className='block w-full resize-none rounded-3xl bg-[#1E1E1E] py-4 pl-6 pr-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 overflow-hidden'
            style={{ minHeight: '56px' }}
          />
          <button
            type='submit'
            disabled={!newFeedback.trim()}
            className='absolute right-2 bottom-2 rounded-full bg-primary p-2 text-black transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100'
          >
            <span className='material-symbols-outlined text-xl'>arrow_upward</span>
          </button>
        </form>

        {isLoading ? (
          <div className='flex justify-center py-10'>
            <LoadingSpinner />
          </div>
        ) : (
          <div className='space-y-8'>
            <section>
              <h2 className='mb-4 text-sm font-bold tracking-wider text-gray-500'>GÖNDERİLENLER</h2>
              {feedbacks.length > 0 ? (
                feedbacks.map(item => (
                  <FeedbackItem key={item.id} item={item} />
                ))
              ) : (
                <p className='text-center text-gray-600 py-4'>Henüz gönderilen geri bildirim yok</p>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
