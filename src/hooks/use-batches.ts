import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Pagination } from '@/types';

export interface Batch {
  _id: string;
  name: string;
  createdBy: { _id: string; name: string; email: string } | string;
  students: { _id: string; name: string; email: string; role: string }[] | string[];
  studentCount: number;
  createdAt: string;
}

interface BatchesParams {
  page?: number;
  search?: string;
}

export function useBatches(params: BatchesParams = {}) {
  return useQuery({
    queryKey: ['batches', params],
    queryFn: async () => {
      const res = await api.get('/batches', { params });
      return res.data as { batches: Batch[]; pagination: Pagination };
    },
  });
}

export function useBatch(batchId: string) {
  return useQuery({
    queryKey: ['batch', batchId],
    queryFn: async () => {
      const res = await api.get(`/batches/${batchId}`);
      return res.data.batch as Batch;
    },
    enabled: !!batchId,
  });
}

export function useDeleteBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (batchId: string) => {
      const res = await api.delete(`/batches/${batchId}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['batches'] });
    },
  });
}
