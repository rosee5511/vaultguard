'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';

interface PasswordHealthProps {
  weak: number;
  fair: number;
  good: number;
  strong: number;
  excellent: number;
}

export function PasswordHealth({ weak, fair, good, strong, excellent }: PasswordHealthProps) {
  const total = weak + fair + good + strong + excellent;

  const data = [
    { label: 'Weak', value: weak, color: '#ef4444' },
    { label: 'Fair', value: fair, color: '#f97316' },
    { label: 'Good', value: good, color: '#eab308' },
    { label: 'Strong', value: strong, color: '#22c55e' },
    { label: 'Excellent', value: excellent, color: '#10b981' },
  ];

  return (
    <Card glass className="p-5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Password Health</h3>
      <div className="space-y-3">
        {data.map((item) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.value} ({Math.round(percentage)}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-dark-elevated overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {total === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
          No accounts to analyze yet
        </p>
      )}
    </Card>
  );
}