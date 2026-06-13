'use client';

import React from 'react';
import { cn } from '@/utils/helpers';
import { useAuthContext } from '@/context/AuthContext';
import { useMasterPassword } from '@/context/MasterPasswordContext';
import { Shield, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export function Header() {
  const { user } = useAuthContext();
  const { isVerified, isRequired } = useMasterPassword();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-xl border-b border-gray-100 dark:border-dark-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vault-500 to-vault-700 flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">VaultGuard</span>
        </div>

        {/* Security Status */}
        <div className="hidden lg:flex items-center gap-2">
          {isRequired && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
                isVerified
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
              )}
            >
              <Lock className="h-3 w-3" />
              {isVerified ? 'Vault Unlocked' : 'Vault Locked'}
            </motion.div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vault-400 to-vault-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.displayName?.[0] || user?.email?.[0] || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}