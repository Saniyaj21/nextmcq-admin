import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { MonthlyReward, MonthlyRewardJob } from '@/types';

export function useMonthlyRewards(params: { month?: number; year?: number; category?: string } = {}) {
  return useQuery({
    queryKey: ['monthly-rewards', params],
    queryFn: async () => {
      const res = await api.get('/monthly-rewards', { params });
      return res.data.rewards as MonthlyReward[];
    },
  });
}

export function useMonthlyRewardJobs() {
  return useQuery({
    queryKey: ['monthly-reward-jobs'],
    queryFn: async () => {
      const res = await api.get('/monthly-rewards/jobs');
      return res.data.jobs as MonthlyRewardJob[];
    },
  });
}

export function useTriggerMonthlyRewards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data?: { month?: number; year?: number }) => {
      const res = await api.post('/monthly-rewards/trigger', data || {});
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['monthly-reward-jobs'] });
    },
  });
}
