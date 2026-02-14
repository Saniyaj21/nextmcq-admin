import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { AppConfig } from '@/types';

export function useSettings(category?: string) {
  return useQuery({
    queryKey: ['settings', category],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (category) params.category = category;
      const res = await api.get('/settings', { params });
      return res.data.settings as AppConfig[];
    },
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const res = await api.put(`/settings/${key}`, { value });
      return res.data.setting;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function useUpdateSettingsBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { key: string; value: unknown }[]) => {
      const res = await api.put('/settings/bulk', { items });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
