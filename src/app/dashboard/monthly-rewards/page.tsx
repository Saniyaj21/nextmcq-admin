'use client';

import { useState } from 'react';
import { useMonthlyRewards, useMonthlyRewardJobs } from '@/hooks/use-monthly-rewards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/status-badge';
import { DataTable, type Column } from '@/components/data-table';
import type { MonthlyReward, MonthlyRewardJob } from '@/types';

export default function MonthlyRewardsPage() {
  const [category, setCategory] = useState('');

  const { data: rewards, isLoading: rewardsLoading } = useMonthlyRewards({
    category: category || undefined,
  });
  const { data: jobs, isLoading: jobsLoading } = useMonthlyRewardJobs();

  const rewardColumns: Column<MonthlyReward>[] = [
    { key: 'rank', label: 'Rank', render: (r) => `#${r.rank}` },
    {
      key: 'userId',
      label: 'User',
      render: (r) => {
        const u = r.userId;
        return typeof u === 'object' ? u.name || u.email : '-';
      },
    },
    { key: 'category', label: 'Category' },
    { key: 'tier', label: 'Tier', render: (r) => <StatusBadge status={r.tier} /> },
    { key: 'coinsAwarded', label: 'Coins' },
    { key: 'xpAwarded', label: 'XP' },
    { key: 'month', label: 'Period', render: (r) => `${r.month}/${r.year}` },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const jobColumns: Column<MonthlyRewardJob>[] = [
    { key: 'category', label: 'Category' },
    { key: 'period', label: 'Period', render: (j) => `${j.month}/${j.year}` },
    { key: 'status', label: 'Status', render: (j) => <StatusBadge status={j.status} /> },
    { key: 'totalUsers', label: 'Total' },
    { key: 'processedUsers', label: 'Processed' },
    { key: 'failedUsers', label: 'Failed' },
    {
      key: 'startedAt',
      label: 'Started',
      render: (j) => j.startedAt ? new Date(j.startedAt).toLocaleString() : '-',
    },
    {
      key: 'completedAt',
      label: 'Completed',
      render: (j) => j.completedAt ? new Date(j.completedAt).toLocaleString() : '-',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Monthly Rewards</h1>
      </div>

      {/* Jobs */}
      <Card>
        <CardHeader><CardTitle>Reward Jobs</CardTitle></CardHeader>
        <CardContent>
          <DataTable
            columns={jobColumns}
            data={jobs ?? []}
            isLoading={jobsLoading}
          />
        </CardContent>
      </Card>

      {/* Rewards history */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reward History</CardTitle>
          <Select value={category || 'all'} onValueChange={(v) => setCategory(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="global">Global</SelectItem>
              <SelectItem value="students">Students</SelectItem>
              <SelectItem value="teachers">Teachers</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={rewardColumns}
            data={rewards ?? []}
            isLoading={rewardsLoading}
          />
        </CardContent>
      </Card>

    </div>
  );
}
