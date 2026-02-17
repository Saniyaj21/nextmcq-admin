'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTests, useDeleteTest, useTestsAnalytics } from '@/hooks/use-tests';
import { useExportBulkTests, useExportTest } from '@/hooks/use-test-import-export';
import { generateTemplateXLSX } from '@/lib/xlsx-utils';
import { DataTable, type Column } from '@/components/data-table';
import { SearchInput } from '@/components/search-input';
import { TestImportDialog } from '@/components/test-import-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';
import type { Test } from '@/types';
import { Trash2, Upload, Download, FileDown } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

const SUBJECT_COLOR = '#3b82f6';
const VISIBILITY_COLORS = ['#22c55e', '#f59e0b'];

export default function TestsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedTestIds, setSelectedTestIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useTests({ page, search });
  const { data: analytics, isLoading: analyticsLoading } = useTestsAnalytics(period);
  const deleteTest = useDeleteTest();
  const exportBulk = useExportBulkTests();
  const exportSingle = useExportTest();

  const columns: Column<Test>[] = [
    { key: 'title', label: 'Title' },
    { key: 'subject', label: 'Subject' },
    {
      key: 'createdBy',
      label: 'Creator',
      render: (t) => {
        const c = t.createdBy;
        return typeof c === 'object' ? c.name || c.email : '-';
      },
    },
    { key: 'questions', label: 'Questions', render: (t) => Array.isArray(t.questions) ? t.questions.length : 0 },
    { key: 'attemptsCount', label: 'Attempts' },
    { key: 'averageRating', label: 'Rating', render: (t) => t.averageRating?.toFixed(1) || '0.0' },
    { key: 'isPublic', label: 'Visibility', render: (t) => (t.isPublic ? 'Public' : 'Private') },
    {
      key: 'actions',
      label: '',
      render: (t) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              exportSingle.mutate(t._id, {
                onSuccess: () => toast.success('Test exported'),
                onError: () => toast.error('Export failed'),
              });
            }}
          >
            <Download className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); setDeleteId(t._id); }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tests</h1>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tests Created</CardTitle>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as '7d' | '30d' | '90d')}>
              <TabsList>
                <TabsTrigger value="7d">7d</TabsTrigger>
                <TabsTrigger value="30d">30d</TabsTrigger>
                <TabsTrigger value="90d">90d</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.testGrowth ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="New Tests" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics?.subjectDistribution ?? []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="_id" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill={SUBJECT_COLOR} name="Tests" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Public vs Private</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analytics?.visibilityDistribution?.map(v => ({ name: v._id, value: v.count })) ?? []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label
                    >
                      {analytics?.visibilityDistribution?.map((_, i) => (
                        <Cell key={i} fill={VISIBILITY_COLORS[i % VISIBILITY_COLORS.length]} />
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
      </div>

      {/* Toolbar: search + actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search tests..." />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={() => generateTemplateXLSX()}>
            <FileDown className="h-4 w-4 mr-2" />
            Template
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          {selectedTestIds.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={exportBulk.isPending}
              onClick={() => {
                exportBulk.mutate([...selectedTestIds], {
                  onSuccess: () => { toast.success('Tests exported'); setSelectedTestIds(new Set()); },
                  onError: () => toast.error('Export failed'),
                });
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Selected ({selectedTestIds.size})
            </Button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.tests ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
        onRowClick={(t) => router.push(`/dashboard/tests/${t._id}`)}
        selectable
        selectedIds={selectedTestIds}
        onSelectionChange={setSelectedTestIds}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Test"
        description="This will permanently delete the test and all related attempts. This action cannot be undone."
        loading={deleteTest.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteTest.mutate(deleteId, {
              onSuccess: () => { toast.success('Test deleted'); setDeleteId(null); },
              onError: () => toast.error('Failed to delete test'),
            });
          }
        }}
      />

      <TestImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </div>
  );
}
