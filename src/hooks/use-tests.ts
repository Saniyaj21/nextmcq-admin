import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Test, Pagination } from '@/types';

export function useTests(params: { page?: number; search?: string } = {}) {
  return useQuery({
    queryKey: ['tests', params],
    queryFn: async () => {
      const res = await api.get('/tests', { params });
      return res.data as { tests: Test[]; pagination: Pagination };
    },
  });
}

export function useTest(testId: string) {
  return useQuery({
    queryKey: ['test', testId],
    queryFn: async () => {
      const res = await api.get(`/tests/${testId}`);
      return res.data as {
        test: Test;
        attemptStats: { totalAttempts: number; avgScore: number; avgTime: number } | null;
      };
    },
    enabled: !!testId,
  });
}

export function useDeleteTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (testId: string) => {
      await api.delete(`/tests/${testId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tests'] });
    },
  });
}
