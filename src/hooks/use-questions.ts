import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Question, Pagination, GrowthData } from '@/types';

export interface QuestionsAnalytics {
  questionGrowth: GrowthData[];
  optionCountDistribution: { _id: number; count: number }[];
  topCreators: { _id: string; count: number; name: string }[];
}

export function useQuestionsAnalytics(period: '7d' | '30d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['questions-analytics', period],
    queryFn: async () => {
      const res = await api.get('/questions/analytics', { params: { period } });
      return res.data as QuestionsAnalytics;
    },
  });
}

export function useQuestions(params: { page?: number; search?: string } = {}) {
  return useQuery({
    queryKey: ['questions', params],
    queryFn: async () => {
      const res = await api.get('/questions', { params });
      return res.data as { questions: Question[]; pagination: Pagination };
    },
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (questionId: string) => {
      await api.delete(`/questions/${questionId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}
