import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { RatingEntry, RatingStats, Pagination } from '@/types';

interface RatingsParams {
  page?: number;
  testId?: string;
  minRating?: number;
  maxRating?: number;
}

export function useRatings(params: RatingsParams = {}) {
  return useQuery({
    queryKey: ['ratings', params],
    queryFn: async () => {
      const res = await api.get('/ratings', { params });
      return res.data as { ratings: RatingEntry[]; pagination: Pagination };
    },
  });
}

export function useRatingStats() {
  return useQuery({
    queryKey: ['rating-stats'],
    queryFn: async () => {
      const res = await api.get('/ratings/stats');
      return res.data as RatingStats;
    },
  });
}
