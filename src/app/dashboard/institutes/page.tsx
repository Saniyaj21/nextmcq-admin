'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInstitutes, useToggleInstituteStatus } from '@/hooks/use-institutes';
import { DataTable, type Column } from '@/components/data-table';
import { SearchInput } from '@/components/search-input';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Institute } from '@/types';
import { Plus } from 'lucide-react';

export default function InstitutesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useInstitutes({ page, search });
  const toggleStatus = useToggleInstituteStatus();

  const columns: Column<Institute>[] = [
    { key: 'name', label: 'Name' },
    { key: 'location', label: 'Location', render: (i) => i.location || '-' },
    { key: 'type', label: 'Type', render: (i) => i.type.charAt(0).toUpperCase() + i.type.slice(1) },
    { key: 'studentCount', label: 'Students' },
    { key: 'teacherCount', label: 'Teachers' },
    {
      key: 'isActive',
      label: 'Status',
      render: (i) => <StatusBadge status={i.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (i) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleStatus.mutate(i._id, {
              onSuccess: () => toast.success(`Institute ${i.isActive ? 'deactivated' : 'activated'}`),
              onError: () => toast.error('Failed to toggle status'),
            });
          }}
        >
          {i.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Institutes</h1>
        <Button onClick={() => router.push('/dashboard/institutes/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Institute
        </Button>
      </div>

      <div className="w-64">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search institutes..." />
      </div>

      <DataTable
        columns={columns}
        data={data?.institutes ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
        onRowClick={(i) => router.push(`/dashboard/institutes/${i._id}`)}
      />
    </div>
  );
}
