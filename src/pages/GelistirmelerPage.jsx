import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImprovements, saveImprovement, deleteImprovement, updateImprovement } from '../utils/storage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function GelistirmelerPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [expandedTasks, setExpandedTasks] = useState({});

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const data = await getImprovements();
      // Sort by date descending (newest first)
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotes(sorted);
    } catch (error) {
      console.error('Notlar yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      // Split by first newline to separate title and content
      const firstLineEndIndex = newTask.indexOf('\n');
      let title, content;

      if (firstLineEndIndex === -1) {
        title = newTask;
        content = '';
      } else {
        title = newTask.substring(0, firstLineEndIndex);
        content = newTask.substring(firstLineEndIndex + 1).trim();
      }

      const newNote = {
        title: title.trim(),
        content: content,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const savedNote = await saveImprovement(newNote);
      setNotes((prev) => [savedNote, ...prev]);
      setNewTask('');
    } catch (error) {
      console.error('Not eklenirken hata:', error);
      alert('Not eklenemedi.');
    }
  };

  const handleToggleComplete = async (note) => {
    try {
      const updatedNote = { ...note, isCompleted: !note.isCompleted };
      await updateImprovement(updatedNote);
      setNotes((prev) => prev.map((n) => (n.id === note.id ? updatedNote : n)));
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
    try {
      await deleteImprovement(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Silinirken hata:', error);
    }
  };

  const toggleExpand = (id) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const activeTasks = notes.filter(n => !n.isCompleted);
  const completedTasks = notes.filter(n => n.isCompleted);

  const TaskItem = ({ task }) => (
    <div className='mb-3 overflow-hidden rounded-xl bg-[#1E1E1E]'>
      <div className={`flex p-4 ${expandedTasks[task.id] ? 'items-start' : 'items-center'}`}>
        <button
          onClick={() => handleToggleComplete(task)}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            task.isCompleted
              ? 'border-green-500 bg-green-500'
              : 'border-gray-500 hover:border-gray-400'
          }`}
        >
          {task.isCompleted && <span className='material-symbols-outlined text-sm text-black font-bold'>check</span>}
        </button>
        
        <div 
          className='ml-3 flex-1 cursor-pointer'
          onClick={() => toggleExpand(task.id)}
        >
          <p className={`text-base break-words ${task.isCompleted ? 'text-gray-500 line-through' : 'text-white'} ${expandedTasks[task.id] ? '' : 'line-clamp-1'}`}>
            {task.title}
          </p>
        </div>

        <button
          onClick={() => toggleExpand(task.id)}
          className='ml-2 shrink-0 text-gray-400 hover:text-white'
        >
          <span className='material-symbols-outlined transition-transform duration-200' style={{ transform: expandedTasks[task.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            expand_more
          </span>
        </button>
      </div>

      {expandedTasks[task.id] && (
        <div className='border-t border-white/5 bg-white/5 px-4 py-3'>
          {task.content && (
            <p className="mb-3 text-sm text-gray-300 whitespace-pre-wrap">{task.content}</p>
          )}
          <div className='flex items-center justify-between text-xs text-gray-400'>
            <span>{new Date(task.createdAt).toLocaleDateString('tr-TR')}</span>
            <button
              onClick={() => handleDelete(task.id)}
              className='flex items-center gap-1 text-red-400 hover:text-red-300'
            >
              <span className='material-symbols-outlined text-sm'>delete</span>
              Sil
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className='min-h-screen bg-black text-white pb-20'>
      {/* Header */}
      <header className='sticky top-0 z-10 flex items-center gap-4 bg-black/80 px-4 py-4 backdrop-blur-md'>
        <button onClick={() => navigate(-1)} className='text-gray-400 hover:text-white'>
          <span className='material-symbols-outlined text-3xl'>arrow_back</span>
        </button>
        <h1 className='text-xl font-bold'>Geliştirmeler</h1>
      </header>

      <main className='px-4 pt-2'>
        {/* Input Area */}
        <form onSubmit={handleAddNote} className='mb-8 relative'>
          <textarea
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder='Bir şeyler ekle...'
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
            disabled={!newTask.trim()}
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
            {/* Active Tasks */}
            <section>
              <h2 className='mb-4 text-sm font-bold tracking-wider text-gray-500'>YAPILACAKLAR</h2>
              {activeTasks.length > 0 ? (
                activeTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))
              ) : (
                <p className='text-center text-gray-600 py-4'>Yapılacak görev yok</p>
              )}
            </section>

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <section>
                <h2 className='mb-4 text-sm font-bold tracking-wider text-gray-500'>TAMAMLANANLAR</h2>
                {completedTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
