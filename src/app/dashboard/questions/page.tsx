'use client';

import { useState } from 'react';
import { useQuestions, useDeleteQuestion, useQuestionsAnalytics } from '@/hooks/use-questions';
import { DataTable, type Column } from '@/components/data-table';
import { SearchInput } from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';
import type { Question } from '@/types';
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

const CREATOR_COLOR = '#a855f7';
const OPTION_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function QuestionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const { data, isLoading } = useQuestions({ page, search });
  const { data: analytics, isLoading: analyticsLoading } = useQuestionsAnalytics(period);
  const deleteQuestion = useDeleteQuestion();

  const columns: Column<Question>[] = [
    {
      key: 'expand',
      label: '',
      render: (q) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === q._id ? null : q._id); }}
        >
          {expandedId === q._id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      ),
    },
    {
      key: 'question',
      label: 'Question',
      render: (q) => (
        <div>
          <p className="truncate max-w-md">{q.question}</p>
          {expandedId === q._id && (
            <div className="mt-2 space-y-1 text-sm">
              {q.options.map((opt, i) => (
                <div key={i} className={i === q.correctAnswer ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                  {String.fromCharCode(65 + i)}. {opt} {i === q.correctAnswer && '(correct)'}
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    { key: 'options', label: 'Options', render: (q) => q.options.length },
    { key: 'tests', label: 'Tests', render: (q) => q.tests?.length ?? 0 },
    {
      key: 'createdBy',
      label: 'Creator',
      render: (q) => {
        const c = q.createdBy;
        return typeof c === 'object' ? c.name || c.email : '-';
      },
    },
    { key: 'createdAt', label: 'Created', render: (q) => new Date(q.createdAt).toLocaleDateString() },
    {
      key: 'actions',
      label: '',
      render: (q) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); setDeleteId(q._id); }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Questions</h1>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Questions Created</CardTitle>
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
                <LineChart data={analytics?.questionGrowth ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="New Questions" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Creators</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics?.topCreators ?? []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill={CREATOR_COLOR} name="Questions" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Options per Question</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analytics?.optionCountDistribution?.map(o => ({ name: `${o._id} options`, value: o.count })) ?? []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label
                    >
                      {analytics?.optionCountDistribution?.map((_, i) => (
                        <Cell key={i} fill={OPTION_COLORS[i % OPTION_COLORS.length]} />
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

      <div className="w-64">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search questions..." />
      </div>

      <DataTable
        columns={columns}
        data={data?.questions ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Question"
        description="This will permanently delete the question and remove it from any tests. This action cannot be undone."
        loading={deleteQuestion.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteQuestion.mutate(deleteId, {
              onSuccess: () => { toast.success('Question deleted'); setDeleteId(null); },
              onError: () => toast.error('Failed to delete question'),
            });
          }
        }}
      />
    </div>
  );
}
