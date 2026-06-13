import { PasswordStrength } from '@/types';

export function analyzePasswordStrength(password: string): {
  strength: PasswordStrength;
  score: number; // 0-100
  entropy: number;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  if (!password) {
    return { strength: 'weak', score: 0, entropy: 0, feedback: ['Password is empty'] };
  }

  // Length scoring
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 15;
  if (password.length >= 20) score += 10;
  if (password.length < 8) feedback.push('Use at least 8 characters');

  // Character variety
  if (/[a-z]/.test(password)) score += 10;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 10;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 10;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  else feedback.push('Add special characters');

  // Complexity patterns
  if (/[a-z].*[A-Z]|[A-Z].*[a-z]/.test(password)) score += 5;
  if (/[0-9].*[^a-zA-Z0-9]|[^a-zA-Z0-9].*[0-9]/.test(password)) score += 5;

  // Common patterns penalty
  if (/^[a-zA-Z]+$/.test(password)) {
    score -= 20;
    feedback.push('Avoid using only letters');
  }
  if (/^[0-9]+$/.test(password)) {
    score -= 30;
    feedback.push('Avoid using only numbers');
  }
  if (/(.+)\1{2,}/.test(password)) {
    score -= 15;
    feedback.push('Avoid repeating characters');
  }
  if (/^(password|123456|qwerty|abc123|letmein|welcome|admin|login)$/i.test(password)) {
    score = 0;
    feedback.push('This is a commonly used password');
  }

  // Calculate entropy
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;
  const entropy = Math.round(password.length * Math.log2(Math.max(charsetSize, 1)));

  score = Math.max(0, Math.min(100, score));

  let strength: PasswordStrength;
  if (score >= 90) strength = 'excellent';
  else if (score >= 75) strength = 'strong';
  else if (score >= 50) strength = 'good';
  else if (score >= 25) strength = 'fair';
  else strength = 'weak';

  return { strength, score, entropy, feedback };
}

export function getStrengthColor(strength: PasswordStrength): string {
  const colors = {
    weak: '#ef4444',
    fair: '#f97316',
    good: '#eab308',
    strong: '#22c55e',
    excellent: '#10b981',
  };
  return colors[strength];
}

export function getStrengthLabel(strength: PasswordStrength): string {
  const labels = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
    excellent: 'Excellent',
  };
  return labels[strength];
}

export function checkDuplicatePasswords(passwords: string[]): {
  duplicates: Map<string, number[]>;
  hasDuplicates: boolean;
} {
  const passwordMap = new Map<string, number[]>();

  passwords.forEach((pwd, index) => {
    if (passwordMap.has(pwd)) {
      passwordMap.get(pwd)!.push(index);
    } else {
      passwordMap.set(pwd, [index]);
    }
  });

  const duplicates = new Map<string, number[]>();
  passwordMap.forEach((indices, pwd) => {
    if (indices.length > 1) {
      duplicates.set(pwd, indices);
    }
  });

  return { duplicates, hasDuplicates: duplicates.size > 0 };
}