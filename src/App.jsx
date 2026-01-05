import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainPage from './pages/MainPage';
import ExercisesPage from './pages/ExercisesPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import WorkoutDetailPage from './pages/WorkoutDetailPage';
import GelistirmelerPage from './pages/GelistirmelerPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/gelistirmeler"
          element={
            <PrivateRoute>
              <GelistirmelerPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/exercises"
          element={
            <PrivateRoute>
              <ExercisesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/exercise/:exerciseName"
          element={
            <PrivateRoute>
              <ExerciseDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/workout/:date"
          element={
            <PrivateRoute>
              <WorkoutDetailPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;