'use client';

import { useState, useCallback, useMemo } from 'react';
import { VaultAccount, SecurityAnalysis, SecurityRecommendation } from '@/types';
import { checkDuplicatePasswords } from '@/utils/password-strength';

export function useSecurity(accounts: VaultAccount[]) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analysis = useMemo((): SecurityAnalysis => {
    if (!accounts.length) {
      return {
        totalAccounts: 0,
        weakPasswords: 0,
        strongPasswords: 0,
        duplicatePasswords: 0,
        securityScore: 0,
        recommendations: [],
      };
    }

    const activeAccounts = accounts.filter((a) => !a.isArchived);
    const total = activeAccounts.length;

    const weakCount = activeAccounts.filter(
      (a) => a.passwordStrength === 'weak' || a.passwordStrength === 'fair'
    ).length;

    const strongCount = activeAccounts.filter(
      (a) => a.passwordStrength === 'strong' || a.passwordStrength === 'excellent'
    ).length;

    const passwords = activeAccounts.map((a) => a.password);
    const { duplicates, hasDuplicates } = checkDuplicatePasswords(passwords);
    const duplicateCount = Array.from(duplicates.values()).reduce(
      (sum, indices) => sum + indices.length,
      0
    );

    // Calculate security score (0-100)
    let score = 100;
    if (total > 0) {
      score -= (weakCount / total) * 40; // Weak passwords penalty
      score -= (duplicateCount / total) * 30; // Duplicate penalty
      score -= activeAccounts.filter((a) => a.passwordEntropy < 50).length * 5; // Low entropy penalty
    }
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Generate recommendations
    const recommendations: SecurityRecommendation[] = [];

    if (weakCount > 0) {
      recommendations.push({
        id: 'weak-passwords',
        type: 'weak',
        severity: 'high',
        title: 'Weak Passwords Detected',
        description: `${weakCount} account(s) have weak or fair strength passwords.`,
        action: 'Update weak passwords using the password generator',
      });
    }

    if (hasDuplicates) {
      recommendations.push({
        id: 'duplicate-passwords',
        type: 'duplicate',
        severity: 'critical',
        title: 'Duplicate Passwords Found',
        description: `${duplicateCount} account(s) share passwords with other accounts.`,
        action: 'Use unique passwords for each account',
      });
    }

    const oldPasswords = activeAccounts.filter((a) => {
      const daysSinceUpdate = Math.floor(
        (Date.now() - a.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceUpdate > 180;
    });

    if (oldPasswords.length > 0) {
      recommendations.push({
        id: 'old-passwords',
        type: 'old',
        severity: 'medium',
        title: 'Passwords Need Rotation',
        description: `${oldPasswords.length} account(s) haven't been updated in 6+ months.`,
        action: 'Rotate passwords older than 6 months',
      });
    }

    const missing2FA = activeAccounts.filter(
      (a) => a.category === 'banking' || a.category === 'crypto'
    );
    if (missing2FA.length > 0) {
      recommendations.push({
        id: 'enable-2fa',
        type: 'missing',
        severity: 'high',
        title: 'Enable Two-Factor Authentication',
        description: 'Banking and crypto accounts should have 2FA enabled.',
        action: 'Enable 2FA on all financial accounts',
      });
    }

    return {
      totalAccounts: total,
      weakPasswords: weakCount,
      strongPasswords: strongCount,
      duplicatePasswords: duplicateCount,
      securityScore: score,
      recommendations,
    };
  }, [accounts]);

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    // Analysis is already computed via useMemo, this is for UX
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsAnalyzing(false);
  }, []);

  return {
    analysis,
    isAnalyzing,
    runAnalysis,
  };
}