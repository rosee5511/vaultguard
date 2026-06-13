'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { Mail, Lock, Chrome, ArrowRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginForm() {
  const { signInWithGoogle, signInWithEmail } = useAuthContext();
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const result = await signInWithGoogle();
    setIsLoading(false);
    if (!result.success) {
      toast.error(result.error || 'Failed to sign in');
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    const result = await signInWithEmail(email, password);
    setIsLoading(false);
    if (!result.success) {
      toast.error(result.error || 'Failed to sign in');
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
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-vault-500 to-vault-700 flex items-center justify-center shadow-xl shadow-vault-500/30 mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sign in to access your secure vault
            </p>
          </div>

          {/* Google Sign In */}
          <Button
            variant="secondary"
            fullWidth
            onClick={handleGoogleSignIn}
            isLoading={isLoading && !isEmailMode}
            leftIcon={<Chrome className="h-5 w-5" />}
            className="mb-4"
          >
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-dark-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-dark-surface text-gray-500 dark:text-gray-400">
                or continue with email
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              isPassword
              required
            />
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading && isEmailMode}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-vault-600 hover:text-vault-700 font-medium">
              Create one
            </a>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}