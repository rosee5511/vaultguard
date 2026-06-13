// User & Authentication Types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  hasMasterPassword: boolean;
  masterPasswordHash: string | null;
  preferredAuthMethod: 'google' | 'email';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Master Password Types
export interface MasterPasswordState {
  isVerified: boolean;
  isRequired: boolean;
  lastVerifiedAt: Date | null;
  autoLockMinutes: number;
  rememberDevice: boolean;
}

// Vault Account Types
export interface VaultAccount {
  id: string;
  userId: string;
  platformName: string;
  category: CategoryType;
  email: string;
  username: string;
  password: string; // Encrypted
  websiteUrl: string;
  notes: string; // Encrypted
  recoveryEmail: string;
  recoveryPhone: string;
  securityQuestions: SecurityQuestion[];
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date | null;
  passwordStrength: PasswordStrength;
  passwordEntropy: number;
}

export interface SecurityQuestion {
  question: string;
  answer: string; // Encrypted
}

export type CategoryType =
  | 'gmail'
  | 'google'
  | 'facebook'
  | 'instagram'
  | 'whatsapp'
  | 'youtube'
  | 'tiktok'
  | 'x'
  | 'linkedin'
  | 'hosting'
  | 'banking'
  | 'crypto'
  | 'gaming'
  | 'wifi'
  | 'custom';

export interface Category {
  id: CategoryType;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong' | 'excellent';

// Password Generator Types
export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

// Security Types
export interface SecurityAnalysis {
  totalAccounts: number;
  weakPasswords: number;
  strongPasswords: number;
  duplicatePasswords: number;
  securityScore: number; // 0-100
  recommendations: SecurityRecommendation[];
}

export interface SecurityRecommendation {
  id: string;
  type: 'weak' | 'duplicate' | 'old' | 'missing' | 'reused';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  accountId?: string;
  action: string;
}

// Activity Log Types
export interface ActivityLog {
  id: string;
  userId: string;
  action: ActivityAction;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export type ActivityAction =
  | 'login'
  | 'logout'
  | 'master_password_set'
  | 'master_password_verified'
  | 'account_created'
  | 'account_updated'
  | 'account_deleted'
  | 'account_viewed'
  | 'password_copied'
  | 'password_generated'
  | 'backup_exported'
  | 'backup_imported'
  | 'settings_updated'
  | 'auto_lock_triggered';

// Settings Types
export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  autoLockMinutes: number;
  clearClipboardSeconds: number;
  showPasswordsByDefault: boolean;
  defaultPasswordLength: number;
  defaultPasswordOptions: PasswordGeneratorOptions;
  notifications: NotificationSettings;
  backupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly' | 'manual';
}

export interface NotificationSettings {
  weakPasswordAlerts: boolean;
  duplicatePasswordAlerts: boolean;
  loginAlerts: boolean;
  backupReminders: boolean;
  securityScoreUpdates: boolean;
}

// Dashboard Types
export interface DashboardStats {
  totalAccounts: number;
  recentAccounts: VaultAccount[];
  securityScore: number;
  weakPasswordCount: number;
  strongPasswordCount: number;
  favoriteCount: number;
  archivedCount: number;
  recentActivity: ActivityLog[];
}

// Filter & Search Types
export interface VaultFilters {
  category: CategoryType | 'all';
  searchQuery: string;
  sortBy: 'name' | 'date' | 'category' | 'strength';
  sortOrder: 'asc' | 'desc';
  showFavorites: boolean;
  showArchived: boolean;
}

// UI Types
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface AccountFormData {
  platformName: string;
  category: CategoryType;
  email: string;
  username: string;
  password: string;
  websiteUrl: string;
  notes: string;
  recoveryEmail: string;
  recoveryPhone: string;
  securityQuestions: { question: string; answer: string }[];
  isFavorite: boolean;
}