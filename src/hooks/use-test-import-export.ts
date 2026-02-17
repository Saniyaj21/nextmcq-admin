import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { parseXLSX, generateTestXLSX, generateBulkTestXLSX } from '@/lib/xlsx-utils';
import type { Test, Question } from '@/types';

export function useImportTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, teacherId }: { file: File; teacherId: string }) => {
      const parsed = await parseXLSX(file);
      const res = await api.post('/tests/import', {
        teacherId,
        test: parsed.test,
        questions: parsed.questions,
      });
      return res.data as { test: Test };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tests'] });
    },
  });
}

export function useExportTest() {
  return useMutation({
    mutationFn: async (testId: string) => {
      const res = await api.get(`/tests/${testId}`);
      const { test } = res.data as { test: Test };
      const questions = (test.questions as Question[]) || [];
      generateTestXLSX(test, questions);
    },
  });
}

export function useExportBulkTests() {
  return useMutation({
    mutationFn: async (testIds: string[]) => {
      const results = await Promise.all(
        testIds.map(async (id) => {
          const res = await api.get(`/tests/${id}`);
          const { test } = res.data as { test: Test };
          const questions = (test.questions as Question[]) || [];
          return { test, questions };
        })
      );
      generateBulkTestXLSX(results);
    },
  });
}
