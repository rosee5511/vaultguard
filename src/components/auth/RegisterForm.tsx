'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Chrome, ArrowRight, Shield, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export function RegisterForm() {
  const { signUpWithEmail, signInWithGoogle } = useAuthContext();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    const result = await signInWithGoogle();
    setIsLoading(false);
    if (!result.success) {
      toast.error(result.error || 'Failed to sign up');
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setIsLoading(true);
    const result = await signUpWithEmail(email, password, displayName);
    setIsLoading(false);
    if (!result.success) {
      toast.error(result.error || 'Failed to create account');
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
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Start securing your passwords today
            </p>
          </div>

          <Button
            variant="secondary"
            fullWidth
            onClick={handleGoogleSignUp}
            isLoading={isLoading}
            leftIcon={<Chrome className="h-5 w-5" />}
            className="mb-4"
          >
            Sign up with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-dark-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-dark-surface text-gray-500 dark:text-gray-400">
                or use email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              leftIcon={<User className="h-4 w-4" />}
              required
            />
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
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              isPassword
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Check className="h-4 w-4" />}
              isPassword
              required
            />
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-vault-600 hover:text-vault-700 font-medium">
              Sign in
            </a>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}