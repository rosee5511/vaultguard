'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { ActivityLog } from '@/types';
import { formatRelativeTime } from '@/utils/clipboard';
import {
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  KeyRound,
  Copy,
  Download,
  Upload,
  Settings,
  Lock,
} from 'lucide-react';

const actionIcons: Record<string, React.ElementType> = {
  login: LogIn,
  logout: LogOut,
  account_created: Plus,
  account_updated: Pencil,
  account_deleted: Trash2,
  password_generated: KeyRound,
  password_copied: Copy,
  backup_exported: Download,
  backup_imported: Upload,
  settings_updated: Settings,
  master_password_verified: Lock,
};

const actionColors: Record<string, string> = {
  login: '#22c55e',
  logout: '#ef4444',
  account_created: '#3b82f6',
  account_updated: '#f59e0b',
  account_deleted: '#ef4444',
  password_generated: '#8b5cf6',
  password_copied: '#06b6d4',
  backup_exported: '#10b981',
  backup_imported: '#f97316',
  settings_updated: '#6366f1',
  master_password_verified: '#22c55e',
};

interface RecentActivityProps {
  activities: ActivityLog[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card glass className="p-5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            No recent activity
          </p>
        ) : (
          activities.map((activity) => {
            const Icon = actionIcons[activity.action] || LogIn;
            const color = actionColors[activity.action] || '#6b7280';

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-dark-elevated/50 hover:bg-gray-100 dark:hover:bg-dark-elevated transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.details}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}