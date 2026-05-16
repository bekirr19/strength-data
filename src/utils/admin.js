import { database } from '../firebase';
import { ref, get } from 'firebase/database';

export async function checkIsAdmin(uid) {
  if (!uid) return false;
  try {
    const adminRef = ref(database, `admins/${uid}`);
    const snapshot = await get(adminRef);
    return snapshot.val() === true;
  } catch {
    return false;
  }
}
