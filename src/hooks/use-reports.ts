import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

interface ExportParams {
  dateFrom?: string;
  dateTo?: string;
  role?: string;
  testId?: string;
}

function downloadBlob(data: string, filename: string) {
  const blob = new Blob([data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function useExportUsers() {
  return useMutation({
    mutationFn: async (params: ExportParams = {}) => {
      const res = await api.get('/export/users', { params, responseType: 'text' });
      downloadBlob(res.data, 'users-export.csv');
    },
  });
}

export function useExportAttempts() {
  return useMutation({
    mutationFn: async (params: ExportParams = {}) => {
      const res = await api.get('/export/attempts', { params, responseType: 'text' });
      downloadBlob(res.data, 'attempts-export.csv');
    },
  });
}

export function useExportTests() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.get('/export/tests', { responseType: 'text' });
      downloadBlob(res.data, 'tests-export.csv');
    },
  });
}
