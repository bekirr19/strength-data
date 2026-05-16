import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { isUserAdmin } from '../utils/admin';
import { upsertUserMeta } from '../utils/userMeta';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import { clearCache } from '../utils/storage-client';
import { deleteUserData } from '../utils/storage-firebase';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      currentUser: null,
      isAdmin: false,
      loading: true,
      loginWithGoogle: async () => { throw new Error('AuthProvider not mounted'); },
      signup: async () => { throw new Error('AuthProvider not mounted'); },
      login: async () => { throw new Error('AuthProvider not mounted'); },
      logout: async () => { throw new Error('AuthProvider not mounted'); },
      deleteAccount: async () => { throw new Error('AuthProvider not mounted'); },
      updateUserPassword: async () => { throw new Error('AuthProvider not mounted'); },
    };
  }
  return ctx;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
      setIsAdmin(isUserAdmin(user));
      setLoading(false);

      if (user) {
        upsertUserMeta(user).catch((err) => {
          console.warn('Kullanıcı meta verisi güncellenemedi:', err);
        });
      }
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
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
