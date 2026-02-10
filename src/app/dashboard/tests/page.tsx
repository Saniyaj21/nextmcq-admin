'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTests, useDeleteTest } from '@/hooks/use-tests';
import { DataTable, type Column } from '@/components/data-table';
import { SearchInput } from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';
import type { Test } from '@/types';
import { Trash2 } from 'lucide-react';

export default function TestsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useTests({ page, search });
  const deleteTest = useDeleteTest();

  const columns: Column<Test>[] = [
    { key: 'title', label: 'Title' },
    { key: 'subject', label: 'Subject' },
    {
      key: 'createdBy',
      label: 'Creator',
      render: (t) => {
        const c = t.createdBy;
        return typeof c === 'object' ? c.name || c.email : '-';
      },
    },
    { key: 'questions', label: 'Questions', render: (t) => Array.isArray(t.questions) ? t.questions.length : 0 },
    { key: 'attemptsCount', label: 'Attempts' },
    { key: 'averageRating', label: 'Rating', render: (t) => t.averageRating?.toFixed(1) || '0.0' },
    { key: 'isPublic', label: 'Visibility', render: (t) => (t.isPublic ? 'Public' : 'Private') },
    {
      key: 'actions',
      label: '',
      render: (t) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); setDeleteId(t._id); }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tests</h1>

      <div className="w-64">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search tests..." />
      </div>

      <DataTable
        columns={columns}
        data={data?.tests ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
        onRowClick={(t) => router.push(`/dashboard/tests/${t._id}`)}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Test"
        description="This will permanently delete the test and all related attempts. This action cannot be undone."
        loading={deleteTest.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteTest.mutate(deleteId, {
              onSuccess: () => { toast.success('Test deleted'); setDeleteId(null); },
              onError: () => toast.error('Failed to delete test'),
            });
          }
        }}
      />
    </div>
  );
}
