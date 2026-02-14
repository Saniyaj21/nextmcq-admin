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
  // Test attempt status
  in_progress: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  abandoned: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  timed_out: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  // Notification status
  draft: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  sent: 'bg-green-100 text-green-800 hover:bg-green-100',
  // Notification types
  announcement: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  update: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
  promotion: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  maintenance: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  reward: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  // Moderation status
  reviewing: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  dismissed: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  // Report reasons
  inappropriate: 'bg-red-100 text-red-800 hover:bg-red-100',
  spam: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  copyright: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  incorrect: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  offensive: 'bg-red-100 text-red-800 hover:bg-red-100',
  other: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  // Content types
  test: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  question: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
  post: 'bg-green-100 text-green-800 hover:bg-green-100',
  user: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  // Resolution actions
  none: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  warned: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  content_removed: 'bg-red-100 text-red-800 hover:bg-red-100',
  user_banned: 'bg-red-100 text-red-800 hover:bg-red-100',
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
