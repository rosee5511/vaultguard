'use client';

import React, { useState, useEffect } from 'react';
import { AccountFormData, CategoryType, VaultAccount } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { CATEGORIES } from '@/utils/categories';
import { generateSecurePassword } from '@/lib/encryption';
import { analyzePasswordStrength } from '@/utils/password-strength';
import { Plus, Minus, RefreshCw, KeyRound } from 'lucide-react';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AccountFormData) => Promise<{ success: boolean }>;
  initialData?: VaultAccount | null;
}

const emptyForm: AccountFormData = {
  platformName: '',
  category: 'custom',
  email: '',
  username: '',
  password: '',
  websiteUrl: '',
  notes: '',
  recoveryEmail: '',
  recoveryPhone: '',
  securityQuestions: [],
  isFavorite: false,
};

export function AccountForm({ isOpen, onClose, onSubmit, initialData }: AccountFormProps) {
  const [form, setForm] = useState<AccountFormData>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(analyzePasswordStrength(''));

  useEffect(() => {
    if (initialData) {
      setForm({
        platformName: initialData.platformName,
        category: initialData.category,
        email: initialData.email,
        username: initialData.username,
        password: initialData.password,
        websiteUrl: initialData.websiteUrl,
        notes: initialData.notes,
        recoveryEmail: initialData.recoveryEmail,
        recoveryPhone: initialData.recoveryPhone,
        securityQuestions: initialData.securityQuestions.map((sq) => ({
          question: sq.question,
          answer: sq.answer,
        })),
        isFavorite: initialData.isFavorite,
      });
      setPasswordStrength(analyzePasswordStrength(initialData.password));
    } else {
      setForm(emptyForm);
      setPasswordStrength(analyzePasswordStrength(''));
    }
  }, [initialData, isOpen]);

  const updateField = (field: keyof AccountFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'password') {
      setPasswordStrength(analyzePasswordStrength(value));
    }
  };

  const generatePassword = () => {
    const pwd = generateSecurePassword(16, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    updateField('password', pwd);
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      securityQuestions: [...prev.securityQuestions, { question: '', answer: '' }],
    }));
  };

  const removeQuestion = (index: number) => {
    setForm((prev) => ({
      ...prev,
      securityQuestions: prev.securityQuestions.filter((_, i) => i !== index),
    }));
  };

  const updateQuestion = (index: number, field: 'question' | 'answer', value: string) => {
    setForm((prev) => ({
      ...prev,
      securityQuestions: prev.securityQuestions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.platformName || !form.password) return;

    setIsLoading(true);
    const result = await onSubmit(form);
    setIsLoading(false);

    if (result.success) {
      onClose();
      setForm(emptyForm);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Account' : 'Add Account'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Platform Name *"
            placeholder="e.g. Netflix"
            value={form.platformName}
            onChange={(e) => updateField('platformName', e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => updateField('category', e.target.value as CategoryType)}
              className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-elevated px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-vault-500/50"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="account@example.com"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
          <Input
            label="Username"
            placeholder="username"
            value={form.username}
            onChange={(e) => updateField('username', e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password *</label>
            <button
              type="button"
              onClick={generatePassword}
              className="flex items-center gap-1 text-xs text-vault-600 hover:text-vault-700 font-medium"
            >
              <RefreshCw className="h-3 w-3" />
              Generate
            </button>
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter or generate password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              required
            />
            <button
              type="button"
              onClick={generatePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-vault-600 hover:bg-vault-50 dark:hover:bg-vault-900/20 transition-all"
            >
              <KeyRound className="h-4 w-4" />
            </button>
          </div>
          {form.password && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-dark-elevated overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${passwordStrength.score}%`,
                    backgroundColor: passwordStrength.score >= 75 ? '#22c55e' : passwordStrength.score >= 50 ? '#eab308' : '#ef4444',
                  }}
                />
              </div>
              <span className="text-xs font-medium" style={{ color: passwordStrength.score >= 75 ? '#22c55e' : passwordStrength.score >= 50 ? '#eab308' : '#ef4444' }}>
                {passwordStrength.strength}
              </span>
              <span className="text-xs text-gray-400">{passwordStrength.entropy} bits</span>
            </div>
          )}
        </div>

        <Input
          label="Website URL"
          type="url"
          placeholder="https://example.com"
          value={form.websiteUrl}
          onChange={(e) => updateField('websiteUrl', e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-elevated px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-vault-500/50 resize-none"
            placeholder="Additional notes (encrypted)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Recovery Email"
            type="email"
            placeholder="backup@example.com"
            value={form.recoveryEmail}
            onChange={(e) => updateField('recoveryEmail', e.target.value)}
          />
          <Input
            label="Recovery Phone"
            type="tel"
            placeholder="+1 234 567 8900"
            value={form.recoveryPhone}
            onChange={(e) => updateField('recoveryPhone', e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Security Questions</label>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-1 text-xs text-vault-600 hover:text-vault-700 font-medium"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
          <div className="space-y-2">
            {form.securityQuestions.map((q, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Question"
                    value={q.question}
                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Answer"
                    value={q.answer}
                    onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="p-2 mt-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isFavorite"
            checked={form.isFavorite}
            onChange={(e) => updateField('isFavorite', e.target.checked)}
            className="rounded border-gray-300 text-vault-600 focus:ring-vault-500"
          />
          <label htmlFor="isFavorite" className="text-sm text-gray-600 dark:text-gray-400">
            Add to favorites
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
            {initialData ? 'Update' : 'Add'} Account
          </Button>
        </div>
      </form>
    </Modal>
  );
}