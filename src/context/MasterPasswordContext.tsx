'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';

interface MasterPasswordContextType {
  masterPassword: string | null;
  isVerified: boolean;
  isRequired: boolean;
  lastVerifiedAt: Date | null;
  autoLockMinutes: number;
  rememberDevice: boolean;
  setMasterPassword: (password: string) => void;
  clearMasterPassword: () => void;
  verifyMasterPassword: (password: string) => Promise<boolean>;
  setAutoLockMinutes: (minutes: number) => void;
  setRememberDevice: (remember: boolean) => void;
}

const MasterPasswordContext = createContext<MasterPasswordContextType | undefined>(undefined);

const AUTO_LOCK_KEY = 'vault-auto-lock';
const REMEMBER_KEY = 'vault-remember-device';
const MP_STORAGE_KEY = 'vault-mp-session'; // Only stores if rememberDevice is true

export function MasterPasswordProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthContext();
  const [masterPassword, setMasterPasswordState] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [lastVerifiedAt, setLastVerifiedAt] = useState<Date | null>(null);
  const [autoLockMinutes, setAutoLockMinutesState] = useState(15);
  const [rememberDevice, setRememberDeviceState] = useState(false);
  const [isRequired, setIsRequired] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedAutoLock = localStorage.getItem(AUTO_LOCK_KEY);
    const savedRemember = localStorage.getItem(REMEMBER_KEY);

    if (savedAutoLock) setAutoLockMinutesState(parseInt(savedAutoLock, 10));
    if (savedRemember) setRememberDeviceState(savedRemember === 'true');
  }, []);

  // Check if master password is required
  useEffect(() => {
    if (isAuthenticated && user) {
      setIsRequired(user.hasMasterPassword);

      // Try to restore from session if remember device
      if (rememberDevice) {
        const saved = sessionStorage.getItem(MP_STORAGE_KEY);
        if (saved) {
          setMasterPasswordState(saved);
          setIsVerified(true);
          setLastVerifiedAt(new Date());
        }
      }
    } else {
      setIsRequired(false);
      setMasterPasswordState(null);
      setIsVerified(false);
      setLastVerifiedAt(null);
    }
  }, [isAuthenticated, user, rememberDevice]);

  // Auto-lock timer
  useEffect(() => {
    if (!isVerified || !masterPassword || autoLockMinutes <= 0) return;

    const interval = setInterval(() => {
      if (lastVerifiedAt) {
        const minutesSince = (Date.now() - lastVerifiedAt.getTime()) / (1000 * 60);
        if (minutesSince >= autoLockMinutes) {
          clearMasterPassword();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isVerified, masterPassword, autoLockMinutes, lastVerifiedAt]);

  // Activity tracking for auto-lock
  useEffect(() => {
    if (!isVerified) return;

    const resetTimer = () => {
      setLastVerifiedAt(new Date());
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [isVerified]);

  const setMasterPassword = useCallback((password: string) => {
    setMasterPasswordState(password);
    setIsVerified(true);
    setLastVerifiedAt(new Date());

    if (rememberDevice) {
      sessionStorage.setItem(MP_STORAGE_KEY, password);
    }
  }, [rememberDevice]);

  const clearMasterPassword = useCallback(() => {
    setMasterPasswordState(null);
    setIsVerified(false);
    setLastVerifiedAt(null);
    sessionStorage.removeItem(MP_STORAGE_KEY);
  }, []);

  const verifyMasterPassword = useCallback(async (password: string): Promise<boolean> => {
    const { verifyMasterPassword: verify } = useAuthContext();
    const result = await verify(password);

    if (result.success) {
      setMasterPassword(password);
      return true;
    }
    return false;
  }, []);

  const setAutoLockMinutes = useCallback((minutes: number) => {
    setAutoLockMinutesState(minutes);
    localStorage.setItem(AUTO_LOCK_KEY, minutes.toString());
  }, []);

  const setRememberDevice = useCallback((remember: boolean) => {
    setRememberDeviceState(remember);
    localStorage.setItem(REMEMBER_KEY, remember.toString());

    if (!remember) {
      sessionStorage.removeItem(MP_STORAGE_KEY);
    }
  }, []);

  return (
    <MasterPasswordContext.Provider
      value={{
        masterPassword,
        isVerified,
        isRequired,
        lastVerifiedAt,
        autoLockMinutes,
        rememberDevice,
        setMasterPassword,
        clearMasterPassword,
        verifyMasterPassword,
        setAutoLockMinutes,
        setRememberDevice,
      }}
    >
      {children}
    </MasterPasswordContext.Provider>
  );
}

export function useMasterPassword() {
  const context = useContext(MasterPasswordContext);
  if (context === undefined) {
    throw new Error('useMasterPassword must be used within a MasterPasswordProvider');
  }
  return context;
}