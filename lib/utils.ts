import clsx, { type ClassValue } from 'clsx';

/**
 * Combines classnames with clsx
 */
export function cn(...classes: ClassValue[]): string {
  return clsx(...classes);
}

/**
 * Formats a number as USD currency
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Converts text to URL slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Returns Tailwind color class for quote status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'quoted':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'accepted':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Returns human-readable status label
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    quoted: 'Quoted',
    accepted: 'Accepted',
    rejected: 'Rejected',
    completed: 'Completed',
  };
  return labels[status] || status;
}

/**
 * Maps category icon string to lucide-react icon name
 */
export function getCategoryIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    'heart': 'Heart',
    'smile': 'Smile',
    'eye': 'Eye',
    'tooth': 'Tooth',
    'brain': 'Brain',
    'activity': 'Activity',
    'stethoscope': 'Stethoscope',
    'capsule': 'Capsule',
    'user-md': 'User2',
    'clinic': 'Building2',
    'hospital': 'Building',
    'wellness': 'Leaf',
    'fitness': 'Dumbbell',
    'therapy': 'Hand',
    'surgery': 'Scalpel',
    'beauty': 'Sparkles',
    'dental': 'Tooth',
    'hair': 'Scissors',
    'skin': 'Droplet',
    'general': 'Pill',
  };
  return iconMap[icon] || 'Heart';
}
