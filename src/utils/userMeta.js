import { ref, update, onValue } from 'firebase/database';
import { database } from '../firebase';

/**
 * Kullanıcının temel profil bilgisini ve son giriş zamanını Realtime DB'de günceller.
 * Admin paneli için listelenebilir hale getirir.
 */
export async function upsertUserMeta(user) {
  if (!user?.uid) return;

  const metaRef = ref(database, `usersMeta/${user.uid}`);
  const now = Date.now();
  const payload = {
    displayName: user.displayName || null,
    email: user.email || null,
    photoURL: user.photoURL || null,
    lastLogin: now,
  };

  await update(metaRef, payload);
}

/**
 * Admin için tüm kullanıcı meta verisini dinler.
 */
export function listenAllUsersMeta(callback, onError) {
  const metaRef = ref(database, 'usersMeta');
  const unsubscribe = onValue(
    metaRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      const raw = snapshot.val();
      const list = Object.entries(raw).map(([uid, value]) => ({
        uid,
        ...(value || {}),
      })).sort((a, b) => (b.lastLogin || 0) - (a.lastLogin || 0));
      callback(list);
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  return () => unsubscribe();
}
