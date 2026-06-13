'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { generateSecurePassword, calculateEntropy } from '@/lib/encryption';
import { analyzePasswordStrength } from '@/utils/password-strength';
import { copyToClipboard } from '@/utils/clipboard';
import { motion } from 'framer-motion';
import { RefreshCw, Copy, Check, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';

export function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);

  const strength = password ? analyzePasswordStrength(password) : null;

  const generate = useCallback(() => {
    const pwd = generateSecurePassword(length, options);
    setPassword(pwd);
    setCopied(false);
  }, [length, options]);

  const handleCopy = async () => {
    if (!password) return;
    const success = await copyToClipboard(password);
    if (success) {
      setCopied(true);
      toast.success('Password copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card glass className="p-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-vault-500 to-vault-700 flex items-center justify-center shadow-lg shadow-vault-500/30 mb-3">
          <Sliders className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Password Generator</h2>
      </div>

      <div className="relative mb-6">
        <div className="bg-gray-900 dark:bg-black rounded-xl p-4 font-mono text-lg text-white break-all text-center min-h-[60px] flex items-center justify-center">
          {password || 'Click generate to create password'}
        </div>
        <button
          onClick={handleCopy}
          disabled={!password}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-30"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      {strength && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Strength</span>
            <span className="text-sm font-medium" style={{ color: strength.score >= 75 ? '#22c55e' : strength.score >= 50 ? '#eab308' : '#ef4444' }}>
              {strength.strength} • {strength.entropy} bits
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-dark-elevated overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: strength.score >= 75 ? '#22c55e' : strength.score >= 50 ? '#eab308' : '#ef4444' }}
              initial={{ width: 0 }}
              animate={{ width: `${strength.score}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Length</label>
          <span className="text-sm font-bold text-vault-600">{length}</span>
        </div>
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full h-2 rounded-full bg-gray-200 dark:bg-dark-elevated appearance-none cursor-pointer accent-vault-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>8</span>
          <span>64</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { key: 'uppercase' as const, label: 'Uppercase (A-Z)' },
          { key: 'lowercase' as const, label: 'Lowercase (a-z)' },
          { key: 'numbers' as const, label: 'Numbers (0-9)' },
          { key: 'symbols' as const, label: 'Symbols (!@#$)' },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => toggleOption(opt.key)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              options[opt.key]
                ? 'bg-vault-50 dark:bg-vault-900/20 text-vault-700 dark:text-vault-400 border-2 border-vault-200 dark:border-vault-800'
                : 'bg-gray-50 dark:bg-dark-elevated text-gray-500 dark:text-gray-400 border-2 border-transparent'
            }`}
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${options[opt.key] ? 'bg-vault-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
              {options[opt.key] && <Check className="h-3 w-3 text-white" />}
            </div>
            {opt.label}
          </button>
        ))}
      </div>

      <Button
        onClick={generate}
        variant="primary"
        fullWidth
        leftIcon={<RefreshCw className="h-4 w-4" />}
      >
        Generate Password
      </Button>
    </Card>
  );
}