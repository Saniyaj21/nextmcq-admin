import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { DashboardStats, GrowthData, User, Test } from '@/types';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data.stats as DashboardStats;
    },
  });
}

export function useDashboardGrowth(period: '7d' | '30d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['dashboard-growth', period],
    queryFn: async () => {
      const res = await api.get('/dashboard/growth', { params: { period } });
      return res.data as {
        userGrowth: GrowthData[];
        attemptGrowth: GrowthData[];
        roleDistribution: { _id: string; count: number }[];
        recentUsers: User[];
        recentTests: Test[];
      };
    },
  });
}
