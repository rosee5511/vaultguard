'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';

interface SecurityScoreProps {
  score: number;
}

export function SecurityScore({ score }: SecurityScoreProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getLabel = () => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Weak';
  };

  return (
    <Card glass className="flex flex-col items-center justify-center p-6">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Security Score</h3>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-100 dark:text-dark-elevated"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{score}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">/100</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium" style={{ color: getColor() }}>
        {getLabel()}
      </p>
    </Card>
  );
}