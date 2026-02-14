import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { AuditLog, Pagination } from '@/types';

interface AuditLogsParams {
  page?: number;
  adminId?: string;
  resource?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useAuditLogs(params: AuditLogsParams = {}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async () => {
      const res = await api.get('/audit-logs', { params });
      return res.data as { logs: AuditLog[]; pagination: Pagination };
    },
  });
}
