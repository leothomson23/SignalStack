'use client';

interface BadgeProps {
  variant?: 'severity' | 'status' | 'default';
  value: string;
  size?: 'sm' | 'md';
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-500 border-red-500/20',
  high: 'bg-orange-500/15 text-orange-500 border-orange-500/20',
  medium: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20',
  low: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
  info: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

const statusColors: Record<string, string> = {
  open: 'bg-red-500/15 text-red-500 border-red-500/20',
  confirmed: 'bg-orange-500/15 text-orange-500 border-orange-500/20',
  resolved: 'bg-green-500/15 text-green-500 border-green-500/20',
  false_positive: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  active: 'bg-green-500/15 text-green-500 border-green-500/20',
  inactive: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  monitoring: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
  generating: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/20',
  ready: 'bg-green-500/15 text-green-500 border-green-500/20',
  failed: 'bg-red-500/15 text-red-500 border-red-500/20',
};

export default function Badge({ variant = 'default', value, size = 'sm' }: BadgeProps) {
  let colorClass = 'bg-gray-500/15 text-gray-400 border-gray-500/20';

  if (variant === 'severity') {
    colorClass = severityColors[value.toLowerCase()] || colorClass;
  } else if (variant === 'status') {
    colorClass = statusColors[value.toLowerCase()] || colorClass;
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  const label = value.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border capitalize ${colorClass} ${sizeClass}`}
    >
      {label}
    </span>
  );
}
