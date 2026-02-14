'use client';

import { useState } from 'react';
import { useAuditLogs } from '@/hooks/use-audit-logs';
import { DataTable, type Column } from '@/components/data-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/status-badge';
import type { AuditLog } from '@/types';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [resource, setResource] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useAuditLogs({
    page,
    resource: resource || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const columns: Column<AuditLog>[] = [
    {
      key: 'adminId',
      label: 'Admin',
      render: (l) => {
        const a = l.adminId;
        return typeof a === 'object' ? a.name || a.email : '-';
      },
    },
    { key: 'action', label: 'Action', render: (l) => <StatusBadge status={l.action} /> },
    { key: 'resource', label: 'Resource', render: (l) => <StatusBadge status={l.resource} /> },
    { key: 'resourceId', label: 'Resource ID', render: (l) => l.resourceId ? l.resourceId.slice(-8) : '-' },
    { key: 'ipAddress', label: 'IP', render: (l) => l.ipAddress || '-' },
    { key: 'createdAt', label: 'Date', render: (l) => new Date(l.createdAt).toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Audit Logs</h1>

      <div className="flex flex-wrap gap-4">
        <Select value={resource || 'all'} onValueChange={(v) => { setResource(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Resources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="test">Test</SelectItem>
            <SelectItem value="question">Question</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
            <SelectItem value="institute">Institute</SelectItem>
            <SelectItem value="banner">Banner</SelectItem>
            <SelectItem value="subject">Subject</SelectItem>
            <SelectItem value="notification">Notification</SelectItem>
            <SelectItem value="report">Report</SelectItem>
            <SelectItem value="settings">Settings</SelectItem>
            <SelectItem value="batch">Batch</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="w-40"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="w-40"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.logs ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
