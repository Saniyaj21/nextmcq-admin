import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { User, Pagination, GrowthData } from '@/types';

export interface UsersAnalytics {
  signupGrowth: GrowthData[];
  roleDistribution: { _id: string; count: number }[];
  statusDistribution: { _id: string; count: number }[];
}

export function useUsersAnalytics(period: '7d' | '30d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['users-analytics', period],
    queryFn: async () => {
      const res = await api.get('/users/analytics', { params: { period } });
      return res.data as UsersAnalytics;
    },
  });
}

interface UsersParams {
  page?: number;
  search?: string;
  role?: string;
  status?: string;
}

export function useUsers(params: UsersParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const res = await api.get('/users', { params });
      return res.data as { users: User[]; pagination: Pagination };
    },
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}`);
      return res.data.user as User;
    },
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<User> }) => {
      const res = await api.put(`/users/${userId}`, data);
      return res.data.user;
    },
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ['user', userId] });
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.patch(`/users/${userId}/status`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useChangeUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await api.patch(`/users/${userId}/role`, { role });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
