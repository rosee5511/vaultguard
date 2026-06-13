'use client';

import React, { useState } from 'react';
import { VaultAccount } from '@/types';
import { Card } from '@/components/ui/Card';
import { copyToClipboard, maskPassword } from '@/utils/clipboard';
import { getCategoryColor, getCategoryName } from '@/utils/categories';
import { getStrengthColor, getStrengthLabel } from '@/utils/password-strength';
import { motion } from 'framer-motion';
import { Copy, Eye, EyeOff, Star, Archive, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AccountCardProps {
  account: VaultAccount;
  onEdit: (account: VaultAccount) => void;
  onDelete: (id: string, name: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onToggleArchive: (id: string, current: boolean) => void;
}

export function AccountCard({
  account,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleArchive,
}: AccountCardProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(`${label} copied to clipboard`);
    }
  };

  const categoryColor = getCategoryColor(account.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card glass className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: categoryColor }}
            >
              {account.platformName[0].toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{account.platformName}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{getCategoryName(account.category)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(account.id, account.isFavorite)}
              className={`p-1.5 rounded-lg transition-colors ${account.isFavorite ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}
            >
              <Star className="h-4 w-4" fill={account.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => onToggleArchive(account.id, account.isArchived)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Archive className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {account.email && (
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-xs font-medium w-16">Email</span>
                <span className="truncate max-w-[180px]">{account.email}</span>
              </div>
              <button
                onClick={() => handleCopy(account.email, 'Email')}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-vault-600 transition-all"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="text-xs font-medium w-16">Password</span>
              <span className="font-mono">{showPassword ? account.password : maskPassword(account.password)}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 rounded text-gray-400 hover:text-vault-600"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => handleCopy(account.password, 'Password')}
                className="p-1 rounded text-gray-400 hover:text-vault-600"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div
              className="h-1.5 w-16 rounded-full"
              style={{ backgroundColor: getStrengthColor(account.passwordStrength) }}
            />
            <span className="text-xs" style={{ color: getStrengthColor(account.passwordStrength) }}>
              {getStrengthLabel(account.passwordStrength)}
            </span>
            <span className="text-xs text-gray-400">{account.passwordEntropy} bits</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-dark-border">
          {account.websiteUrl && (
            <a
              href={account.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-vault-600 hover:text-vault-700 font-medium"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </a>
          )}
          <button
            onClick={() => onEdit(account)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium ml-auto"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={() => onDelete(account.id, account.platformName)}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </Card>
    </motion.div>
  );
}