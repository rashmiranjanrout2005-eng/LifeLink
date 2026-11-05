import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import api from '../services/api';
import { auth, isFirebaseConfigured } from '../firebase';

const AuthContext = createContext(null);

function getAuthError(error) {
  const messages = {
    'auth/configuration-not-found': 'Firebase Authentication is not set up for this project. In Firebase Console, open Authentication, click Get started, then enable Google under Sign-in method.',
    'auth/operation-not-allowed': 'Google sign-in is disabled for this Firebase project. Enable Google under Firebase Console → Authentication → Sign-in method.',
    'auth/unauthorized-domain': `This site is not authorized for Firebase sign-in. Add ${window.location.hostname} under Firebase Console → Authentication → Settings → Authorized domains.`
  };
  return messages[error.code] || error.message || 'Firebase authentication failed.';
}

async function loadProfile(firebaseUser, profileIntent) {
  const response = profileIntent
    ? await api.post('/auth/profile', profileIntent)
    : await api.get('/auth/me');
  return { ...firebaseUser, role: response.data.user?.role || 'donor' };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileIntentRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const profileUser = await loadProfile(firebaseUser, profileIntentRef.current);
        setUser(profileUser);
      } catch (error) {
        console.error('Unable to load the Firebase user profile:', error.message);
        setUser({ ...firebaseUser, role: 'donor' });
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const signIn = async ({ email, password }) => {
    if (!isFirebaseConfigured) throw new Error('Configure Firebase in frontend/.env to enable accounts.');
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      const profileUser = await loadProfile(firebaseUser, null);
      setUser(profileUser);
      return { user: profileUser };
    } catch (error) {
      throw new Error(getAuthError(error), { cause: error });
    }
  };

  const signUp = async ({ email, password, full_name, role }) => {
    if (!isFirebaseConfigured) throw new Error('Configure Firebase in frontend/.env to enable accounts.');
    const profileIntent = { full_name, role };
    profileIntentRef.current = profileIntent;
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(firebaseUser, { displayName: full_name });
      const profileUser = await loadProfile(firebaseUser, profileIntent);
      setUser(profileUser);
      return { user: profileUser };
    } catch (error) {
      throw new Error(getAuthError(error), { cause: error });
    } finally {
      profileIntentRef.current = null;
    }
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) throw new Error('Configure Firebase in frontend/.env to enable accounts.');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const { user: firebaseUser } = await signInWithPopup(auth, provider);
      const profileUser = await loadProfile(firebaseUser, null);
      setUser(profileUser);
      return profileUser;
    } catch (error) {
      throw new Error(getAuthError(error), { cause: error });
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signInWithGoogle, signOut }),
    [user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
