'use client';

import { useState } from 'react';
import { useLeaderboard } from '@/hooks/use-leaderboard';
import { DataTable, type Column } from '@/components/data-table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/status-badge';
import type { LeaderboardEntry } from '@/types';

export default function LeaderboardPage() {
  const [category, setCategory] = useState('students');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useLeaderboard({ category, page, limit: 200 });

  const leaderboard = data?.leaderboard;
  const pagination = data?.pagination;

  const columns: Column<LeaderboardEntry>[] = [
    {
      key: 'rank',
      label: '#',
      render: (_e: LeaderboardEntry) => {
        const idx = (leaderboard || []).indexOf(_e);
        return idx >= 0 ? ((pagination?.page ?? 1) - 1) * (pagination?.limit ?? 200) + idx + 1 : '-';
      },
    },
    { key: 'name', label: 'Name', render: (e) => e.name || 'Unnamed' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (e) => <StatusBadge status={e.role} /> },
    { key: 'rankingScore', label: 'Score', render: (e) => e.rankingScore?.toLocaleString() ?? '0' },
    { key: 'level', label: 'Level', render: (e) => e.rewards?.level ?? 1 },
    {
      key: 'stats',
      label: 'Stats',
      render: (e) => {
        if (e.role === 'student') return `${e.student?.totalTests ?? 0} tests, ${e.student?.correctAnswers ?? 0} correct`;
        if (e.role === 'teacher') return `${e.teacher?.testsCreated ?? 0} tests, ${e.teacher?.totalAttemptsOfStudents ?? 0} attempts`;
        return '-';
      },
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Leaderboard</h1>

      <Tabs value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="global">Global</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable
        columns={columns}
        data={leaderboard ?? []}
        pagination={pagination}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
