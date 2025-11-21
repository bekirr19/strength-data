import { Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import ExercisesPage from './pages/ExercisesPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import WorkoutDetailPage from './pages/WorkoutDetailPage';
import GelistirmelerPage from './pages/GelistirmelerPage';

function App() {
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