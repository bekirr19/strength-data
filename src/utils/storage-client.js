import * as remote from './storage';
import * as local from './storage-localstorage-backup';

const SYNC_PREF_KEY = 'syncEnabled';
const LAST_SYNC_KEY = 'lastSyncAt';

// Senkronizasyon kalıcı olarak açık. Eskiden kullanılan anahtarları
// okuyoruz ama değeri artık zorunlu olarak true döndürüyoruz.

function markSynced() {
  const now = Date.now();
  localStorage.setItem(LAST_SYNC_KEY, String(now));
  return now;
}

export function getLastSyncAt() {
  const raw = localStorage.getItem(LAST_SYNC_KEY);
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

export function isSyncEnabled() {
  // Her zaman açık; olası eski değeri temizleyelim ki UI ve diğer
  // kontroller doğru kalsın.
  localStorage.setItem(SYNC_PREF_KEY, 'true');
  return true;
}

export async function setSyncEnabled(enabled) {
  // Geçici devre dışı modu kaldırıldı; her çağrıda senkronu açık tut.
  try {
    localStorage.setItem(SYNC_PREF_KEY, 'true');
    // Güvenlik için mevcut lokal veriyi buluta itelim.
    const payload = await local.exportAllData();
    if (payload) {
      await remote.importAllData(payload);
      markSynced();
    }
  } catch (err) {
    console.error('Senkron kalıcı açma hatası:', err);
    throw err;
  }
}

function backend() {
  // Artık her zaman Firebase kullanılıyor.
  return remote;
}

// Helper to wrap write operations and güncelle last sync
async function runWrite(fn, ...args) {
  const impl = backend();
  const result = await fn(...args);
  if (impl === remote) {
    markSynced();
  }
  return result;
}

// Re-exports (read)
export const toISODate = (...a) => backend().toISODate(...a);
export const fromISO = (...a) => backend().fromISO(...a);
export const turkishWeekdays = remote.turkishWeekdays;
export const turkishWeekdaysShort = remote.turkishWeekdaysShort;
export const turkishMonths = remote.turkishMonths;
export const formatDateTRFull = (...a) => backend().formatDateTRFull(...a);
export const formatDateTRShort = (...a) => backend().formatDateTRShort(...a);
export const getWorkouts = (...a) => backend().getWorkouts(...a);
export const getWorkoutByDate = (...a) => backend().getWorkoutByDate(...a);
export const getBodyWeightCollection = (...a) => backend().getBodyWeightCollection(...a);
export const getBodyWeightInfo = (...a) => backend().getBodyWeightInfo(...a);
export const getExercises = (...a) => backend().getExercises(...a);
export const normalizeExerciseName = (...a) => backend().normalizeExerciseName(...a);
export const exportAllData = (...a) => backend().exportAllData(...a);

// Re-exports (write) with sync stamp on remote
export const saveBodyWeight = (...a) => runWrite(backend().saveBodyWeight, ...a);
export const clearBodyWeight = (...a) => runWrite(backend().clearBodyWeight, ...a);
export const saveWorkout = (...a) => runWrite(backend().saveWorkout, ...a);
export const deleteWorkout = (...a) => runWrite(backend().deleteWorkout, ...a);
export const saveExercises = (...a) => runWrite(backend().saveExercises, ...a);
export const renameExerciseEverywhere = (...a) => runWrite(backend().renameExerciseEverywhere, ...a);
export const ensureExercise = (...a) => runWrite(backend().ensureExercise, ...a);
export const updateExercisePR = (...a) => runWrite(backend().updateExercisePR, ...a);
export const importAllData = (...a) => runWrite(backend().importAllData, ...a);
export const resolveWeightValue = (...a) => backend().resolveWeightValue(...a);

// Realtime dinleyiciler: Lokal modda no-op döner
export function subscribeToExercises(cb) {
  if (typeof backend().subscribeToExercises !== 'function') return () => {};
  return backend().subscribeToExercises(cb);
}

export function subscribeToWorkouts(cb) {
  if (typeof backend().subscribeToWorkouts !== 'function') return () => {};
  return backend().subscribeToWorkouts(cb);
}

export function subscribeToBodyWeight(cb) {
  if (typeof backend().subscribeToBodyWeight !== 'function') return () => {};
  return backend().subscribeToBodyWeight(cb);
}

export function subscribeToImprovements(cb) {
  if (typeof backend().subscribeToImprovements !== 'function') return () => {};
  return backend().subscribeToImprovements(cb);
}

// Cache temizleme (yalnızca remote için anlamlı)
export function clearCache() {
  if (typeof remote.clearCache === 'function') remote.clearCache();
}
