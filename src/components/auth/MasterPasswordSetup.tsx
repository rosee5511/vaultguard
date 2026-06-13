'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { Lock, Shield, Check, AlertTriangle } from 'lucide-react';
import { analyzePasswordStrength } from '@/utils/password-strength';
import toast from 'react-hot-toast';

export function MasterPasswordSetup() {
  const { setMasterPassword } = useAuthContext();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const strength = analyzePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (strength.score < 50) {
      toast.error('Master password is too weak. Use a stronger password.');
      return;
    }

    setIsLoading(true);
    const result = await setMasterPassword(password);
    setIsLoading(false);

    if (result.success) {
      toast.success('Master password set successfully!');
    } else {
      toast.error(result.error || 'Failed to set master password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-vault-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card glass className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/30 mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set Master Password</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              This password encrypts all your vault data. Never forget it!
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-semibold mb-1">Important Warning</p>
                <p>We cannot recover your master password. If you forget it, all your encrypted data will be permanently lost.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Master Password"
              type="password"
              placeholder="Create a strong master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              isPassword
              required
            />

            {/* Strength Meter */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-dark-elevated overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: strength.score >= 75 ? '#22c55e' : strength.score >= 50 ? '#eab308' : '#ef4444' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${strength.score}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color: strength.score >= 75 ? '#22c55e' : strength.score >= 50 ? '#eab308' : '#ef4444' }}>
                    {strength.strength}
                  </span>
                </div>
                {strength.feedback.length > 0 && (
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    {strength.feedback.map((f, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <Input
              label="Confirm Master Password"
              type="password"
              placeholder="Repeat your master password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Check className="h-4 w-4" />}
              isPassword
              required
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Set Master Password
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}