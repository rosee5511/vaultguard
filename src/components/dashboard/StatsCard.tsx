'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  trend?: string;
  delay?: number;
}

export function StatsCard({ title, value, subtitle, icon: Icon, color, trend, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card hover glass>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
            {subtitle && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">{trend}</p>
            )}
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}