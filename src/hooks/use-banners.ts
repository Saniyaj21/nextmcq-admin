import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Banner } from '@/types';

export function useBanners() {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const res = await api.get('/banners');
      return res.data.banners as Banner[];
    },
  });
}

export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; imageURL: string; isActive?: boolean }) => {
      const res = await api.post('/banners', data);
      return res.data.banner;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['banners'] });
    },
  });
}

export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bannerId, data }: { bannerId: string; data: Partial<Banner> }) => {
      const res = await api.put(`/banners/${bannerId}`, data);
      return res.data.banner;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['banners'] });
    },
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bannerId: string) => {
      await api.delete(`/banners/${bannerId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['banners'] });
    },
  });
}

export function useToggleBannerStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bannerId: string) => {
      const res = await api.patch(`/banners/${bannerId}/status`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['banners'] });
    },
  });
}
