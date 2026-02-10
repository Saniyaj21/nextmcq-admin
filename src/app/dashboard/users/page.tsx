'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUsers, useToggleUserStatus } from '@/hooks/use-users';
import { DataTable, type Column } from '@/components/data-table';
import { SearchInput } from '@/components/search-input';
import { StatusBadge } from '@/components/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { User } from '@/types';

export default function UsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useUsers({ page, search, role: role || undefined, status: status || undefined });
  const toggleStatus = useToggleUserStatus();

  const columns: Column<User>[] = [
    { key: 'name', label: 'Name', render: (u) => u.name || 'Unnamed' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (u) => <StatusBadge status={u.role} /> },
    {
      key: 'institute',
      label: 'Institute',
      render: (u) => (typeof u.institute === 'object' && u.institute ? u.institute.name : '-'),
    },
    { key: 'level', label: 'Level', render: (u) => u.rewards?.level ?? 1 },
    {
      key: 'isActive',
      label: 'Status',
      render: (u) => <StatusBadge status={u.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (u) => new Date(u.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (u) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleStatus.mutate(u._id, {
              onSuccess: () => toast.success(`User ${u.isActive ? 'deactivated' : 'activated'}`),
              onError: () => toast.error('Failed to update status'),
            });
          }}
        >
          {u.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users</h1>

      <div className="flex flex-wrap gap-4">
        <div className="w-64">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search users..." />
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.users ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
        onRowClick={(u) => router.push(`/dashboard/users/${u._id}`)}
      />
    </div>
  );
}
