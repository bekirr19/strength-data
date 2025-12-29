import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';
import MainPage from './pages/MainPage';
import ExercisesPage from './pages/ExercisesPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import WorkoutDetailPage from './pages/WorkoutDetailPage';
import GelistirmelerPage from './pages/GelistirmelerPage';

function App() {
  useEffect(() => {
    // Anonim giriş yap (Firebase kuralları için gerekli)
    signInAnonymously(auth).catch((error) => {
      console.error("Oturum açma hatası:", error);
    });
  }, []);

  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
  <Route path="/gelistirmeler" element={<GelistirmelerPage />} />
      <Route path="/exercises" element={<ExercisesPage />} />
      <Route path="/exercise/:exerciseName" element={<ExerciseDetailPage />} />
      <Route path="/workout/:date" element={<WorkoutDetailPage />} />
    </Routes>
  );
}

export default App;