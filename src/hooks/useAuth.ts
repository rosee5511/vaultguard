'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { User, AuthState } from '@/types';
import { hashMasterPassword } from '@/lib/encryption';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Convert Firebase user to our User type
  const convertUser = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const userData = userDoc.data();

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      createdAt: userData?.createdAt?.toDate() || new Date(),
      lastLoginAt: new Date(),
      hasMasterPassword: userData?.hasMasterPassword || false,
      masterPasswordHash: userData?.masterPasswordHash || null,
      preferredAuthMethod: userData?.preferredAuthMethod || 'google',
    };
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await convertUser(firebaseUser);
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
        } catch (error) {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: 'Failed to load user data',
          });
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Google Sign In
  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          hasMasterPassword: false,
          masterPasswordHash: null,
          preferredAuthMethod: 'google',
        });
      } else {
        // Update last login
        await updateDoc(userDocRef, {
          lastLoginAt: new Date(),
        });
      }

      const user = await convertUser(firebaseUser);
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.code === 'auth/popup-closed-by-user'
        ? 'Sign-in cancelled'
        : error.message || 'Failed to sign in with Google';

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Email/Password Sign In
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLoginAt: new Date(),
      });

      const user = await convertUser(firebaseUser);
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : error.code === 'auth/user-not-found'
        ? 'Account not found'
        : error.message || 'Failed to sign in';

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Email/Password Sign Up
  const signUpWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      // Update profile with display name
      await updateProfile(firebaseUser, { displayName });

      // Create user document
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName,
        photoURL: null,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        hasMasterPassword: false,
        masterPasswordHash: null,
        preferredAuthMethod: 'email',
      });

      const user = await convertUser(firebaseUser);
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.code === 'auth/email-already-in-use'
        ? 'Email already registered'
        : error.code === 'auth/weak-password'
        ? 'Password is too weak'
        : error.message || 'Failed to create account';

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Set Master Password
  const setMasterPassword = useCallback(async (password: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user logged in');

      const hash = await hashMasterPassword(password);

      await updateDoc(doc(db, 'users', currentUser.uid), {
        hasMasterPassword: true,
        masterPasswordHash: hash,
      });

      setAuthState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, hasMasterPassword: true, masterPasswordHash: hash } : null,
      }));

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to set master password' };
    }
  }, []);

  // Verify Master Password
  const verifyMasterPassword = useCallback(async (password: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user logged in');

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const storedHash = userDoc.data()?.masterPasswordHash;

      if (!storedHash) return { success: false, error: 'Master password not set' };

      const inputHash = await hashMasterPassword(password);

      if (inputHash === storedHash) {
        return { success: true };
      } else {
        return { success: false, error: 'Incorrect master password' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Verification failed' };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to logout' };
    }
  }, []);

  return {
    ...authState,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    setMasterPassword,
    verifyMasterPassword,
    logout,
  };
}