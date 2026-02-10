import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Question, Pagination } from '@/types';

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
