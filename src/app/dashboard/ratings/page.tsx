'use client';

import { useState } from 'react';
import { useRatings, useRatingStats } from '@/hooks/use-ratings';
import { DataTable, type Column } from '@/components/data-table';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Hash, TrendingDown } from 'lucide-react';
import type { RatingEntry } from '@/types';

export default function RatingsPage() {
  const [page, setPage] = useState(1);
  const { data: stats } = useRatingStats();
  const { data, isLoading } = useRatings({ page });

  const columns: Column<RatingEntry>[] = [
    {
      key: 'testId',
      label: 'Test',
      render: (r) => {
        const t = r.testId;
        return typeof t === 'object' ? (t as Record<string, string>).title : '-';
      },
    },
    {
      key: 'userId',
      label: 'User',
      render: (r) => {
        const u = r.userId;
        return typeof u === 'object' ? (u as Record<string, string>).name || (u as Record<string, string>).email : '-';
      },
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (r) => (
        <span className="flex items-center gap-1">
          {'★'.repeat(Math.floor(r.rating))}{'☆'.repeat(5 - Math.floor(r.rating))}
          <span className="ml-1 text-sm text-muted-foreground">{r.rating}</span>
        </span>
      ),
    },
    { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Ratings</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Average Rating" value={stats.averageRating} icon={Star} />
          <StatCard title="Total Ratings" value={stats.totalRatings} icon={Hash} />
          <StatCard
            title="Lowest Rated"
            value={stats.lowestRated?.[0]?.title || '-'}
            icon={TrendingDown}
            description={stats.lowestRated?.[0] ? `${stats.lowestRated[0].averageRating} avg` : ''}
          />
        </div>
      )}

      {stats?.distribution && stats.distribution.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Rating Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const entry = stats.distribution.find((d) => d._id === star);
                const count = entry?.count || 0;
                const maxCount = Math.max(...stats.distribution.map((d) => d.count), 1);
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="w-8">{star} ★</span>
                    <div className="flex-1 bg-muted rounded-full h-4">
                      <div
                        className="bg-yellow-400 h-4 rounded-full"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={data?.ratings ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
