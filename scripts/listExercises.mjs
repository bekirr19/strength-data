import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

async function loadEnv() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootDir = path.resolve(__dirname, '..');
  const envPath = path.join(rootDir, '.env');
  try {
    const raw = await readFile(envPath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      if (!line || line.trim().startsWith('#')) return;
      const eqIndex = line.indexOf('=');
      if (eqIndex === -1) return;
      const key = line.slice(0, eqIndex).trim();
      const value = line.slice(eqIndex + 1).trim();
      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    });
  } catch (error) {
    console.warn('Uyarı: .env dosyası okunamadı, ortam değişkenleri yüklenemedi.');
  }
}

await loadEnv();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error(`Firebase yapılandırması eksik: ${missingKeys.join(', ')}`);
  process.exitCode = 1;
  throw new Error('Firebase yapılandırması tamamlanamadı.');
}

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function listExercises() {
  const exercisesRef = ref(database, 'gym_exercises_v1');
  const snapshot = await get(exercisesRef);
  if (!snapshot.exists()) {
    console.log('[]');
    return;
  }
  const data = snapshot.val();
  console.log(JSON.stringify(data, null, 2));
}

await listExercises();
