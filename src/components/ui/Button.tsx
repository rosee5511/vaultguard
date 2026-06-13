'use client';

import React from 'react';
import { cn } from '@/utils/helpers';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-vault-600 text-white hover:bg-vault-700 active:bg-vault-800 shadow-lg shadow-vault-600/25',
    secondary: 'bg-white dark:bg-dark-elevated text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-dark-surface border border-gray-200 dark:border-dark-border',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-lg shadow-red-600/25',
    ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-elevated hover:text-gray-900 dark:hover:text-white',
    outline: 'border-2 border-vault-600 text-vault-600 hover:bg-vault-50 dark:hover:bg-vault-900/20',
    glass: 'bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 dark:hover:bg-white/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-vault-500/50 focus:ring-offset-2 dark:focus:ring-offset-dark-bg',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        'active:scale-[0.98] hover:scale-[1.02]',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}