import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { ADMIN_EMAIL, auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, UserRole, UserStatus } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isOwner: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isApproved: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateProfile = useCallback(async (firebaseUser: User) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      setUserProfile({ uid: firebaseUser.uid, ...(snap.data() as Omit<UserProfile, 'uid'>) });
    } else {
      const isOwnerUser = firebaseUser.email === ADMIN_EMAIL; // Admin email becomes owner by default here
      const newProfile: Omit<UserProfile, 'uid'> = {
        email: firebaseUser.email || '',
        role: (isOwnerUser ? 'owner' : 'user') as UserRole,
        status: (isOwnerUser ? 'approved' : 'pending') as UserStatus,
        display_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
        photo_url: firebaseUser.photoURL || '',
        has_global_access: isOwnerUser,
        approved_platforms: [],
        followers: [],
        following: [],
        post_count: 0,
        created_at: new Date().toISOString(),
      };
      await setDoc(userRef, newProfile);
      setUserProfile({ uid: firebaseUser.uid, ...newProfile });
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchOrCreateProfile(user);
  }, [user, fetchOrCreateProfile]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchOrCreateProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [fetchOrCreateProfile]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(newUser, { displayName });
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const { uid, ...rest } = data as UserProfile;
    await updateDoc(userRef, { ...rest });
    setUserProfile((prev) => (prev ? { ...prev, ...data } : prev));
  };

  const isOwner = userProfile?.role === 'owner';
  const isAdmin = userProfile?.role === 'admin' || isOwner;
  const isModerator = userProfile?.role === 'admin' || userProfile?.role === 'moderator' || isOwner;
  const isApproved = userProfile?.status === 'approved';

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        updateUserProfile,
        refreshProfile,
        isOwner,
        isAdmin,
        isModerator,
        isApproved,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
