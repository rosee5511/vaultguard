import { Category, CategoryType } from '@/types';

export const CATEGORIES: Category[] = [
  { id: 'gmail', name: 'Gmail', icon: 'Mail', color: '#EA4335', count: 0 },
  { id: 'google', name: 'Google', icon: 'Chrome', color: '#4285F4', count: 0 },
  { id: 'facebook', name: 'Facebook', icon: 'Facebook', color: '#1877F2', count: 0 },
  { id: 'instagram', name: 'Instagram', icon: 'Instagram', color: '#E4405F', count: 0 },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle', color: '#25D366', count: 0 },
  { id: 'youtube', name: 'YouTube', icon: 'Youtube', color: '#FF0000', count: 0 },
  { id: 'tiktok', name: 'TikTok', icon: 'Music', color: '#000000', count: 0 },
  { id: 'x', name: 'X / Twitter', icon: 'Twitter', color: '#000000', count: 0 },
  { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', color: '#0A66C2', count: 0 },
  { id: 'hosting', name: 'Hosting', icon: 'Server', color: '#FF6B35', count: 0 },
  { id: 'banking', name: 'Banking', icon: 'Landmark', color: '#00A86B', count: 0 },
  { id: 'crypto', name: 'Crypto', icon: 'Bitcoin', color: '#F7931A', count: 0 },
  { id: 'gaming', name: 'Gaming', icon: 'Gamepad2', color: '#9146FF', count: 0 },
  { id: 'wifi', name: 'WiFi', icon: 'Wifi', color: '#00BCD4', count: 0 },
  { id: 'custom', name: 'Custom', icon: 'Shield', color: '#6366F1', count: 0 },
];

export function getCategoryById(id: CategoryType): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryName(id: CategoryType): string {
  return getCategoryById(id)?.name || 'Custom';
}

export function getCategoryColor(id: CategoryType): string {
  return getCategoryById(id)?.color || '#6366F1';
}