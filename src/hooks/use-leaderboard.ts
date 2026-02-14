import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { LeaderboardEntry, Pagination } from '@/types';

interface LeaderboardParams {
  category?: string;
  instituteId?: string;
  page?: number;
  limit?: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  pagination: Pagination;
}

export function useLeaderboard(params: LeaderboardParams = {}) {
  return useQuery({
    queryKey: ['leaderboard', params],
    queryFn: async () => {
      const res = await api.get('/leaderboard', { params });
      return res.data as LeaderboardResponse;
    },
  });
}
