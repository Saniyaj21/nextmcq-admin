'use client';

import { useState } from 'react';
import { useQuestions, useDeleteQuestion } from '@/hooks/use-questions';
import { DataTable, type Column } from '@/components/data-table';
import { SearchInput } from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';
import type { Question } from '@/types';
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';

export default function QuestionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuestions({ page, search });
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
