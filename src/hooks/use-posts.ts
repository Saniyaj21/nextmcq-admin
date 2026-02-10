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
