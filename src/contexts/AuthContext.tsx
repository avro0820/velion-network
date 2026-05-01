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
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { ADMIN_EMAIL, auth, db, googleProvider } from '../lib/firebase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
      const profileData = { uid: firebaseUser.uid, ...(snap.data() as Omit<UserProfile, 'uid'>) };
      setUserProfile(profileData);
      
      // Background Sync to Supabase
      if (isSupabaseConfigured && supabase) {
        supabase.from('users').upsert({
          uid: profileData.uid,
          email: profileData.email,
          display_name: profileData.display_name,
          role: profileData.role,
          status: profileData.status,
          photo_url: profileData.photo_url,
          created_at: profileData.created_at
        }).then(({ error }) => {
          if (error) console.warn('[Supabase Sync Error]:', error.message);
        });
      }
    } else {
      const isOwnerUser = firebaseUser.email === ADMIN_EMAIL;
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

      // Sync new user to Supabase
      if (isSupabaseConfigured && supabase) {
        await supabase.from('users').insert({
          uid: firebaseUser.uid,
          email: newProfile.email,
          display_name: newProfile.display_name,
          role: newProfile.role,
          status: newProfile.status,
          photo_url: newProfile.photo_url,
          created_at: newProfile.created_at
        });
      }
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
    
    // Background Sync Profile Update to Supabase
    if (isSupabaseConfigured && supabase) {
      const syncData: any = {};
      if (data.display_name) syncData.display_name = data.display_name;
      if (data.photo_url) syncData.photo_url = data.photo_url;
      if (data.role) syncData.role = data.role;
      if (data.status) syncData.status = data.status;
      
      if (Object.keys(syncData).length > 0) {
        await supabase.from('users').update(syncData).eq('uid', user.uid);
      }
    }
    
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
