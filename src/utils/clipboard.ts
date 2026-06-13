/**
 * Secure clipboard operations with auto-clear
 */

let clearTimeoutId: NodeJS.Timeout | null = null;

export async function copyToClipboard(
  text: string,
  autoClearSeconds: number = 30
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);

    // Clear previous timeout if exists
    if (clearTimeoutId) {
      clearTimeout(clearTimeoutId);
    }

    // Auto-clear clipboard after specified seconds
    if (autoClearSeconds > 0) {
      clearTimeoutId = setTimeout(() => {
        navigator.clipboard.writeText('').catch(() => {});
      }, autoClearSeconds * 1000);
    }

    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

export function clearClipboard(): void {
  if (clearTimeoutId) {
    clearTimeout(clearTimeoutId);
    clearTimeoutId = null;
  }
  navigator.clipboard.writeText('').catch(() => {});
}

// Mask password for display
export function maskPassword(password: string): string {
  return '•'.repeat(Math.min(password.length, 16));
}

// Format date for display
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format relative time
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}