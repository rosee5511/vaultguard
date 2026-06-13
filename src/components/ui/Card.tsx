'use client';

import React from 'react';
import { cn } from '@/utils/helpers';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
  animate?: boolean;
}

export function Card({ children, className, hover = true, glass = false, onClick, animate = true }: CardProps) {
  const Component = animate ? motion.div : 'div';

  const baseClasses = cn(
    'rounded-2xl p-5 transition-all duration-300',
    glass
      ? 'bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-xl shadow-black/5'
      : 'bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border shadow-sm',
    hover && 'hover:shadow-lg hover:shadow-vault-500/10 dark:hover:shadow-vault-500/5',
    onClick && 'cursor-pointer',
    className
  );

  if (animate) {
    return (
      <Component
        className={baseClasses}
        onClick={onClick}
        whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </Component>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );
}