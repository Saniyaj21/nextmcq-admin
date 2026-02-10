'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFeedbackList } from '@/hooks/use-feedback';
import { DataTable, type Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Feedback } from '@/types';

export default function FeedbackPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [priority, setPriority] = useState('');

  const { data, isLoading } = useFeedbackList({
    page,
    status: status || undefined,
    type: type || undefined,
    priority: priority || undefined,
  });

  const columns: Column<Feedback>[] = [
    { key: 'subject', label: 'Subject' },
    { key: 'type', label: 'Type', render: (f) => <StatusBadge status={f.type} /> },
    {
      key: 'userId',
      label: 'User',
      render: (f) => {
        const u = f.userId;
        return typeof u === 'object' ? u.name || u.email : '-';
      },
    },
    { key: 'status', label: 'Status', render: (f) => <StatusBadge status={f.status} /> },
    { key: 'priority', label: 'Priority', render: (f) => <StatusBadge status={f.priority} /> },
    { key: 'createdAt', label: 'Created', render: (f) => new Date(f.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Feedback</h1>

      <div className="flex flex-wrap gap-4">
        <Tabs value={status || 'all'} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={type || 'all'} onValueChange={(v) => { setType(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
            <SelectItem value="question">Question</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priority || 'all'} onValueChange={(v) => { setPriority(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.feedback ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
        onRowClick={(f) => router.push(`/dashboard/feedback/${f._id}`)}
      />
    </div>
  );
}
