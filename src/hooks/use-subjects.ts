import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Subject } from '@/types';

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await api.get('/subjects');
      return res.data.subjects as Subject[];
    },
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await api.post('/subjects', data);
      return res.data.subject;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ subjectId, data }: { subjectId: string; data: { name: string } }) => {
      const res = await api.put(`/subjects/${subjectId}`, data);
      return res.data.subject;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (subjectId: string) => {
      await api.delete(`/subjects/${subjectId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

export function useToggleSubjectStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (subjectId: string) => {
      const res = await api.patch(`/subjects/${subjectId}/status`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}
