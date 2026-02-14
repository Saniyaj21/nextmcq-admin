'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAttempts, useAttemptsAnalytics } from '@/hooks/use-attempts';
import { DataTable, type Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { StatCard } from '@/components/stat-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ClipboardList, Target, Clock, TrendingUp } from 'lucide-react';
import type { TestAttempt } from '@/types';

export default function AttemptsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useAttempts({
    page,
    status: status || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });
  const { data: analytics } = useAttemptsAnalytics();

  const columns: Column<TestAttempt>[] = [
    {
      key: 'userId',
      label: 'User',
      render: (a) => {
        const u = a.userId as Record<string, string>;
        return typeof u === 'object' ? u.name || u.email : '-';
      },
    },
    {
      key: 'testId',
      label: 'Test',
      render: (a) => {
        const t = a.testId as Record<string, string>;
        return typeof t === 'object' ? t.title : '-';
      },
    },
    { key: 'status', label: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'score',
      label: 'Score',
      render: (a) => a.score ? `${a.score.correct}/${a.score.total} (${a.score.percentage}%)` : '-',
    },
    { key: 'timeSpent', label: 'Time', render: (a) => a.timeSpent ? `${Math.round(a.timeSpent / 60)}m` : '-' },
    { key: 'createdAt', label: 'Date', render: (a) => new Date(a.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Test Attempts</h1>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Completed" value={analytics.totalCompleted} icon={ClipboardList} />
          <StatCard title="Pass Rate" value={`${analytics.passRate}%`} icon={Target} />
          <StatCard title="Avg Score" value={`${analytics.avgScore}%`} icon={TrendingUp} />
          <StatCard title="Avg Time" value={`${Math.round(analytics.avgTime / 60)}m`} icon={Clock} />
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <Select value={status || 'all'} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="abandoned">Abandoned</SelectItem>
            <SelectItem value="timed_out">Timed Out</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="w-40"
          placeholder="From date"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="w-40"
          placeholder="To date"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.attempts ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
        onRowClick={(a) => router.push(`/dashboard/attempts/${a._id}`)}
      />
    </div>
  );
}
