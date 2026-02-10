import { Badge } from '@/components/ui/badge';

const statusColors: Record<string, string> = {
  // Feedback/general status
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  reviewed: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  resolved: 'bg-green-100 text-green-800 hover:bg-green-100',
  closed: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  // Priority
  low: 'bg-slate-100 text-slate-800 hover:bg-slate-100',
  medium: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  high: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  critical: 'bg-red-100 text-red-800 hover:bg-red-100',
  // Roles
  student: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  teacher: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  admin: 'bg-red-100 text-red-800 hover:bg-red-100',
  // Active/inactive
  active: 'bg-green-100 text-green-800 hover:bg-green-100',
  inactive: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  // Job status
  processing: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  completed: 'bg-green-100 text-green-800 hover:bg-green-100',
  failed: 'bg-red-100 text-red-800 hover:bg-red-100',
  // Reward tiers
  CHAMPION: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  ELITE: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  ACHIEVER: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  PERFORMER: 'bg-green-100 text-green-800 hover:bg-green-100',
  UNPLACED: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="secondary" className={statusColors[status] || ''}>
      {status}
    </Badge>
  );
}
