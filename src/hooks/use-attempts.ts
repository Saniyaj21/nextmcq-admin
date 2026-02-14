import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { TestAttempt, Pagination, AttemptsAnalytics } from '@/types';

interface AttemptsParams {
  page?: number;
  userId?: string;
  testId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useAttempts(params: AttemptsParams = {}) {
  return useQuery({
    queryKey: ['attempts', params],
    queryFn: async () => {
      const res = await api.get('/attempts', { params });
      return res.data as { attempts: TestAttempt[]; pagination: Pagination };
    },
  });
}

export function useAttempt(attemptId: string) {
  return useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: async () => {
      const res = await api.get(`/attempts/${attemptId}`);
      return res.data.attempt as TestAttempt;
    },
    enabled: !!attemptId,
  });
}

export function useAttemptsAnalytics(period: '7d' | '30d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['attempts-analytics', period],
    queryFn: async () => {
      const res = await api.get('/attempts/analytics', { params: { period } });
      return res.data as AttemptsAnalytics;
    },
  });
}
