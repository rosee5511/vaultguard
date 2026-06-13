'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { VaultAccount, AccountFormData, VaultFilters, ActivityAction } from '@/types';
import { encryptData, decryptData } from '@/lib/encryption';
import { generateId } from '@/utils/helpers';
import { analyzePasswordStrength } from '@/utils/password-strength';

export function useVault(masterPassword: string) {
  const [accounts, setAccounts] = useState<VaultAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to vault changes
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'vault'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const decryptedAccounts: VaultAccount[] = [];

        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data();

          try {
            const decryptedPassword = await decryptData(data.password, masterPassword);
            const decryptedNotes = data.notes ? await decryptData(data.notes, masterPassword) : '';

            const securityQuestions = data.securityQuestions || [];
            const decryptedQuestions = await Promise.all(
              securityQuestions.map(async (sq: any) => ({
                question: sq.question,
                answer: await decryptData(sq.answer, masterPassword),
              }))
            );

            const strength = analyzePasswordStrength(decryptedPassword);

            decryptedAccounts.push({
              id: docSnapshot.id,
              userId: data.userId,
              platformName: data.platformName,
              category: data.category,
              email: data.email,
              username: data.username,
              password: decryptedPassword,
              websiteUrl: data.websiteUrl || '',
              notes: decryptedNotes,
              recoveryEmail: data.recoveryEmail || '',
              recoveryPhone: data.recoveryPhone || '',
              securityQuestions: decryptedQuestions,
              isFavorite: data.isFavorite || false,
              isArchived: data.isArchived || false,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              lastAccessedAt: data.lastAccessedAt?.toDate() || null,
              passwordStrength: strength.strength,
              passwordEntropy: strength.entropy,
            });
          } catch (decryptError) {
            console.error('Failed to decrypt account:', docSnapshot.id, decryptError);
            // Skip corrupted/undecryptable accounts
          }
        }

        setAccounts(decryptedAccounts);
        setIsLoading(false);
        setError(null);
      } catch (err: any) {
        setError('Failed to load vault data');
        setIsLoading(false);
      }
    }, (err) => {
      setError('Failed to sync vault data');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [masterPassword]);

  // Add account
  const addAccount = useCallback(async (formData: AccountFormData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const strength = analyzePasswordStrength(formData.password);

      const encryptedPassword = await encryptData(formData.password, masterPassword);
      const encryptedNotes = formData.notes ? await encryptData(formData.notes, masterPassword) : '';

      const encryptedQuestions = await Promise.all(
        formData.securityQuestions.map(async (sq) => ({
          question: sq.question,
          answer: await encryptData(sq.answer, masterPassword),
        }))
      );

      const newAccount = {
        userId: user.uid,
        platformName: formData.platformName,
        category: formData.category,
        email: formData.email,
        username: formData.username,
        password: encryptedPassword,
        websiteUrl: formData.websiteUrl,
        notes: encryptedNotes,
        recoveryEmail: formData.recoveryEmail,
        recoveryPhone: formData.recoveryPhone,
        securityQuestions: encryptedQuestions,
        isFavorite: formData.isFavorite,
        isArchived: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastAccessedAt: null,
        passwordStrength: strength.strength,
        passwordEntropy: strength.entropy,
      };

      const docRef = await addDoc(collection(db, 'vault'), newAccount);

      // Log activity
      await addDoc(collection(db, 'activity_logs'), {
        userId: user.uid,
        action: 'account_created' as ActivityAction,
        details: `Added ${formData.platformName} account`,
        timestamp: Timestamp.now(),
      });

      return { success: true, id: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to add account' };
    }
  }, [masterPassword]);

  // Update account
  const updateAccount = useCallback(async (id: string, formData: AccountFormData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const strength = analyzePasswordStrength(formData.password);

      const encryptedPassword = await encryptData(formData.password, masterPassword);
      const encryptedNotes = formData.notes ? await encryptData(formData.notes, masterPassword) : '';

      const encryptedQuestions = await Promise.all(
        formData.securityQuestions.map(async (sq) => ({
          question: sq.question,
          answer: await encryptData(sq.answer, masterPassword),
        }))
      );

      await updateDoc(doc(db, 'vault', id), {
        platformName: formData.platformName,
        category: formData.category,
        email: formData.email,
        username: formData.username,
        password: encryptedPassword,
        websiteUrl: formData.websiteUrl,
        notes: encryptedNotes,
        recoveryEmail: formData.recoveryEmail,
        recoveryPhone: formData.recoveryPhone,
        securityQuestions: encryptedQuestions,
        isFavorite: formData.isFavorite,
        updatedAt: Timestamp.now(),
        passwordStrength: strength.strength,
        passwordEntropy: strength.entropy,
      });

      await addDoc(collection(db, 'activity_logs'), {
        userId: user.uid,
        action: 'account_updated' as ActivityAction,
        details: `Updated ${formData.platformName} account`,
        timestamp: Timestamp.now(),
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update account' };
    }
  }, [masterPassword]);

  // Delete account
  const deleteAccount = useCallback(async (id: string, platformName: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      await deleteDoc(doc(db, 'vault', id));

      await addDoc(collection(db, 'activity_logs'), {
        userId: user.uid,
        action: 'account_deleted' as ActivityAction,
        details: `Deleted ${platformName} account`,
        timestamp: Timestamp.now(),
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete account' };
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (id: string, currentValue: boolean) => {
    try {
      await updateDoc(doc(db, 'vault', id), {
        isFavorite: !currentValue,
        updatedAt: Timestamp.now(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  // Toggle archive
  const toggleArchive = useCallback(async (id: string, currentValue: boolean) => {
    try {
      await updateDoc(doc(db, 'vault', id), {
        isArchived: !currentValue,
        updatedAt: Timestamp.now(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  // Filter accounts
  const filterAccounts = useCallback((filters: VaultFilters): VaultAccount[] => {
    let filtered = [...accounts];

    // Search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (acc) =>
          acc.platformName.toLowerCase().includes(query) ||
          acc.email.toLowerCase().includes(query) ||
          acc.username.toLowerCase().includes(query) ||
          acc.websiteUrl.toLowerCase().includes(query)
      );
    }

    // Category
    if (filters.category !== 'all') {
      filtered = filtered.filter((acc) => acc.category === filters.category);
    }

    // Favorites
    if (filters.showFavorites) {
      filtered = filtered.filter((acc) => acc.isFavorite);
    }

    // Archive
    if (!filters.showArchived) {
      filtered = filtered.filter((acc) => !acc.isArchived);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'name':
          comparison = a.platformName.localeCompare(b.platformName);
          break;
        case 'date':
          comparison = b.updatedAt.getTime() - a.updatedAt.getTime();
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'strength':
          const strengthOrder = { weak: 0, fair: 1, good: 2, strong: 3, excellent: 4 };
          comparison = strengthOrder[a.passwordStrength] - strengthOrder[b.passwordStrength];
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [accounts]);

  return {
    accounts,
    isLoading,
    error,
    addAccount,
    updateAccount,
    deleteAccount,
    toggleFavorite,
    toggleArchive,
    filterAccounts,
  };
}