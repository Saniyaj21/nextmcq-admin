import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Institute, Pagination } from '@/types';

export function useInstitutes(params: { page?: number; search?: string } = {}) {
  return useQuery({
    queryKey: ['institutes', params],
    queryFn: async () => {
      const res = await api.get('/institutes', { params });
      return res.data as { institutes: Institute[]; pagination: Pagination };
    },
  });
}

export function useCreateInstitute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; location?: string; type?: string }) => {
      const res = await api.post('/institutes', data);
      return res.data.institute;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institutes'] });
    },
  });
}

export function useUpdateInstitute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ instituteId, data }: { instituteId: string; data: Partial<Institute> }) => {
      const res = await api.put(`/institutes/${instituteId}`, data);
      return res.data.institute;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institutes'] });
    },
  });
}

export function useToggleInstituteStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (instituteId: string) => {
      const res = await api.patch(`/institutes/${instituteId}/status`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institutes'] });
    },
  });
}
