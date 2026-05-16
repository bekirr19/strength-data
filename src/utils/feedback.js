import { database, auth } from '../firebase';
import { ref, push, onValue, update, remove } from 'firebase/database';

export const FEEDBACK_STATUS = {
  OPEN: 'open',
  DONE: 'done',
};

function toFeedbackList(snapshot) {
  if (!snapshot.exists()) return [];
  const raw = snapshot.val();
  return Object.entries(raw).flatMap(([uid, feedbacksById]) => {
    if (!feedbacksById || typeof feedbacksById !== 'object') return [];
    return Object.entries(feedbacksById).map(([id, value]) => ({
      id,
      userId: uid,
      ...value,
    }));
  });
}

function toUserFeedbackList(snapshot) {
  if (!snapshot.exists()) return [];
  const raw = snapshot.val();
  return Object.entries(raw).map(([id, value]) => ({ id, ...value }));
}

export async function createFeedback({ title, content }) {
  const user = auth.currentUser;
  if (!user) throw new Error('Giriş yapmış kullanıcı bulunamadı');
  const feedbackRef = ref(database, `feedback/${user.uid}`);
  const now = Date.now();
  const data = {
    title: (title || '').trim(),
    content: (content || '').trim(),
    status: FEEDBACK_STATUS.OPEN,
    createdAt: now,
    updatedAt: now,
    userId: user.uid,
    userEmail: user.email || null,
  };
  const newRef = await push(feedbackRef, data);
  return { id: newRef.key, ...data };
}

export function listenUserFeedback(uid, callback, onError) {
  if (!uid) return () => {};
  const feedbackRef = ref(database, `feedback/${uid}`);
  const unsubscribe = onValue(
    feedbackRef,
    (snapshot) => {
      const list = toUserFeedbackList(snapshot)
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      callback(list);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
  return () => unsubscribe();
}

export function listenAllFeedback(callback) {
  const feedbackRef = ref(database, 'feedback');
  const unsubscribe = onValue(feedbackRef, (snapshot) => {
    const list = toFeedbackList(snapshot)
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    callback(list);
  });
  return () => unsubscribe();
}

export async function updateFeedbackStatus({ uid, feedbackId, status }) {
  if (!uid || !feedbackId) return;
  const now = Date.now();
  const targetStatus = status === FEEDBACK_STATUS.DONE ? FEEDBACK_STATUS.DONE : FEEDBACK_STATUS.OPEN;
  const feedbackRef = ref(database, `feedback/${uid}/${feedbackId}`);
  await update(feedbackRef, { status: targetStatus, updatedAt: now });
}

export async function deleteFeedback({ uid, feedbackId }) {
  if (!uid || !feedbackId) return;
  const feedbackRef = ref(database, `feedback/${uid}/${feedbackId}`);
  await remove(feedbackRef);
}
