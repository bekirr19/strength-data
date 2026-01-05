import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import { clearCache } from '../utils/storage';
import { deleteUserData } from '../utils/storage-firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  function signup(email, password, name) {
    return createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
      return updateProfile(userCredential.user, {
        displayName: name
      });
    });
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function updateUserPassword(password) {
    return updatePassword(auth.currentUser, password);
  }

  function logout() {
    clearCache();
    return signOut(auth);
  }

  async function deleteAccount() {
    if (!auth.currentUser) return;
    await deleteUserData();
    await auth.currentUser.delete();
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loginWithGoogle,
    signup,
    login,
    logout,
    deleteAccount,
    updateUserPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
