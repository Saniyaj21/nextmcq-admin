'use client';

import { useState } from 'react';
import { useDashboardStats, useDashboardGrowth } from '@/hooks/use-dashboard';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, ClipboardList, MessageSquare, Activity } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#a855f7', '#ef4444'];

export default function DashboardPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: growth, isLoading: growthLoading } = useDashboardGrowth(period);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Users" value={stats?.totalUsers ?? '...'} icon={Users} />
        <StatCard title="Total Tests" value={stats?.totalTests ?? '...'} icon={FileText} />
        <StatCard title="Test Attempts" value={stats?.totalAttempts ?? '...'} icon={ClipboardList} />
        <StatCard title="Pending Feedback" value={stats?.pendingFeedback ?? '...'} icon={MessageSquare} />
        <StatCard title="Active Today" value={stats?.activeUsers24h ?? '...'} icon={Activity} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Growth</CardTitle>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as '7d' | '30d' | '90d')}>
              <TabsList>
                <TabsTrigger value="7d">7d</TabsTrigger>
                <TabsTrigger value="30d">30d</TabsTrigger>
                <TabsTrigger value="90d">90d</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {growthLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growth?.userGrowth ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {growthLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={growth?.roleDistribution?.map(r => ({ name: r._id, value: r.count })) ?? []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {growth?.roleDistribution?.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            {growth?.recentUsers?.length === 0 && <p className="text-muted-foreground text-sm">No recent signups</p>}
            <div className="space-y-3">
              {growth?.recentUsers?.map((u) => (
                <div key={u._id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{u.name || 'Unnamed'}</p>
                    <p className="text-muted-foreground text-xs">{u.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tests</CardTitle>
          </CardHeader>
          <CardContent>
            {growth?.recentTests?.length === 0 && <p className="text-muted-foreground text-sm">No recent tests</p>}
            <div className="space-y-3">
              {growth?.recentTests?.map((t) => (
                <div key={t._id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-muted-foreground text-xs">{t.subject}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {t.attemptsCount} attempts
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
