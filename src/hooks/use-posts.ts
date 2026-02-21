import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Post, Pagination } from '@/types';

export function usePosts(params: { page?: number; type?: string } = {}) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: async () => {
      const res = await api.get('/posts', { params });
      return res.data as { posts: Post[]; pagination: Pagination };
    },
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const res = await api.post('/posts', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      await api.delete(`/posts/${postId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
