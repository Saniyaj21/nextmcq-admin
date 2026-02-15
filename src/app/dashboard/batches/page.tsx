'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBatches, useDeleteBatch } from '@/hooks/use-batches';
import { DataTable, type Column } from '@/components/data-table';
import { SearchInput } from '@/components/search-input';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Batch } from '@/hooks/use-batches';

export default function BatchesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useBatches({ page, search: search || undefined });
  const deleteBatch = useDeleteBatch();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteBatch.mutate(deleteId, {
      onSuccess: () => { toast.success('Batch deleted'); setDeleteId(null); },
      onError: () => toast.error('Failed to delete batch'),
    });
  };

  const columns: Column<Batch>[] = [
    { key: 'name', label: 'Name' },
    {
      key: 'createdBy',
      label: 'Teacher',
      render: (b) => {
        const u = b.createdBy;
        return typeof u === 'object' ? u.name || u.email : '-';
      },
    },
    { key: 'studentCount', label: 'Students', render: (b) => b.students?.length || b.studentCount || 0 },
    { key: 'createdAt', label: 'Created', render: (b) => new Date(b.createdAt).toLocaleDateString() },
    {
      key: 'actions',
      label: '',
      render: (b) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); setDeleteId(b._id); }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Batches</h1>

      <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search batches..." />

      <DataTable
        columns={columns}
        data={data?.batches ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
        onRowClick={(b) => router.push(`/dashboard/batches/${b._id}`)}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Batch"
        description="Are you sure you want to delete this batch? This action cannot be undone."
        loading={deleteBatch.isPending}
      />
    </div>
  );
}
