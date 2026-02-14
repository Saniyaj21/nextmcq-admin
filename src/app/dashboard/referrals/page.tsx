'use client';

import { useState } from 'react';
import { useReferralStats, useReferrals } from '@/hooks/use-referrals';
import { DataTable, type Column } from '@/components/data-table';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { UserPlus, Users, Award } from 'lucide-react';
import type { ReferralEntry } from '@/types';

export default function ReferralsPage() {
  const [page, setPage] = useState(1);
  const { data: stats } = useReferralStats();
  const { data, isLoading } = useReferrals({ page });

  const columns: Column<ReferralEntry>[] = [
    { key: 'name', label: 'User', render: (r) => r.name || 'Unnamed' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r) => <StatusBadge status={r.role} /> },
    {
      key: 'referredBy',
      label: 'Referred By',
      render: (r) => {
        const ref = r.referredBy;
        if (!ref || typeof ref !== 'object') return '-';
        return `${ref.name || ref.email} (${ref.referralCode || ''})`;
      },
    },
    { key: 'createdAt', label: 'Joined', render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Referrals</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Referrers" value={stats.totalReferrers} icon={Users} />
          <StatCard title="Total Referred Users" value={stats.totalReferred} icon={UserPlus} />
          <StatCard title="Top Referrer" value={stats.topReferrers?.[0]?.name || '-'} icon={Award} description={stats.topReferrers?.[0] ? `${stats.topReferrers[0].count} referrals` : ''} />
        </div>
      )}

      {stats?.topReferrers && stats.topReferrers.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Top Referrers</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topReferrers.map((r, i) => (
                <div key={r._id} className="flex justify-between items-center text-sm">
                  <span>#{i + 1} {r.name} ({r.email})</span>
                  <span className="font-medium">{r.count} referrals</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={data?.referrals ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
