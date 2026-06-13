'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useMasterPassword } from '@/context/MasterPasswordContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export function MasterPasswordVerify() {
  const { verifyMasterPassword } = useAuthContext();
  const { setMasterPassword } = useMasterPassword();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter your master password');
      return;
    }

    setIsLoading(true);
    const result = await verifyMasterPassword(password);
    setIsLoading(false);

    if (result.success) {
      setMasterPassword(password);
      toast.success('Vault unlocked successfully');
    } else {
      toast.error(result.error || 'Incorrect master password');
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
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-vault-500 to-vault-700 flex items-center justify-center shadow-xl shadow-vault-500/30 mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Unlock Vault</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter your master password to decrypt your data
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Master Password"
              type="password"
              placeholder="Enter your master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Shield className="h-4 w-4" />}
              isPassword
              required
              autoFocus
            />
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Unlock Vault
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}