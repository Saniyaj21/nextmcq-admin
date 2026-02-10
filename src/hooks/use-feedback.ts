import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Feedback, Pagination } from '@/types';

interface FeedbackParams {
  page?: number;
  status?: string;
  type?: string;
  priority?: string;
}

export function useFeedbackList(params: FeedbackParams = {}) {
  return useQuery({
    queryKey: ['feedback', params],
    queryFn: async () => {
      const res = await api.get('/feedback', { params });
      return res.data as { feedback: Feedback[]; pagination: Pagination };
    },
  });
}

export function useFeedbackDetail(feedbackId: string) {
  return useQuery({
    queryKey: ['feedback', feedbackId],
    queryFn: async () => {
      const res = await api.get(`/feedback/${feedbackId}`);
      return res.data.feedback as Feedback;
    },
    enabled: !!feedbackId,
  });
}

export function useRespondToFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ feedbackId, adminResponse }: { feedbackId: string; adminResponse: string }) => {
      const res = await api.put(`/feedback/${feedbackId}/respond`, { adminResponse });
      return res.data.feedback;
    },
    onSuccess: (_, { feedbackId }) => {
      qc.invalidateQueries({ queryKey: ['feedback', feedbackId] });
      qc.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}

export function useUpdateFeedbackStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ feedbackId, status }: { feedbackId: string; status: string }) => {
      const res = await api.patch(`/feedback/${feedbackId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}

export function useUpdateFeedbackPriority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ feedbackId, priority }: { feedbackId: string; priority: string }) => {
      const res = await api.patch(`/feedback/${feedbackId}/priority`, { priority });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}
