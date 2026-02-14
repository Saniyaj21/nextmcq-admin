import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ReferralStats, ReferralEntry, Pagination } from '@/types';

interface ReferralsParams {
  page?: number;
}

export function useReferralStats() {
  return useQuery({
    queryKey: ['referral-stats'],
    queryFn: async () => {
      const res = await api.get('/referrals/stats');
      return res.data as ReferralStats;
    },
  });
}

export function useReferrals(params: ReferralsParams = {}) {
  return useQuery({
    queryKey: ['referrals', params],
    queryFn: async () => {
      const res = await api.get('/referrals', { params });
      return res.data as { referrals: ReferralEntry[]; pagination: Pagination };
    },
  });
}
