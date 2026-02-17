'use client';

import { use } from 'react';
import { useTest } from '@/hooks/use-tests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useExportTest } from '@/hooks/use-test-import-export';
import { toast } from 'sonner';
import type { Question } from '@/types';

export default function TestDetailPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = use(params);
  const { data, isLoading } = useTest(testId);
  const router = useRouter();
  const exportTest = useExportTest();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data?.test) return <p>Test not found</p>;

  const { test, attemptStats } = data;
  const creator = typeof test.createdBy === 'object' ? test.createdBy : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{test.title}</h1>
        <Badge variant={test.isPublic ? 'default' : 'secondary'}>
          {test.isPublic ? 'Public' : 'Private'}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          disabled={exportTest.isPending}
          onClick={() => {
            exportTest.mutate(testId, {
              onSuccess: () => toast.success('Test exported'),
              onError: () => toast.error('Export failed'),
            });
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export XLSX
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subject</span><span>{test.subject}</span></div>
            {test.chapter && <div className="flex justify-between"><span className="text-muted-foreground">Chapter</span><span>{test.chapter}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Time Limit</span><span>{test.timeLimit} min</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Coin Fee</span><span>{test.coinFee}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Creator</span><span>{creator?.name || creator?.email || '-'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span>{test.averageRating?.toFixed(1)} ({test.totalRatings} ratings)</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(test.createdAt).toLocaleDateString()}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Attempt Statistics</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {attemptStats ? (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Attempts</span><span>{attemptStats.totalAttempts}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Avg Score</span><span>{attemptStats.avgScore?.toFixed(1)}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Avg Time</span><span>{Math.round(attemptStats.avgTime / 60)} min</span></div>
              </>
            ) : (
              <p className="text-muted-foreground">No attempts yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Questions list */}
      <Card>
        <CardHeader><CardTitle>Questions ({Array.isArray(test.questions) ? test.questions.length : 0})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(test.questions as Question[]).map((q, i) => (
              <div key={q._id} className="border rounded-md p-4">
                <p className="font-medium mb-2">Q{i + 1}. {q.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                  {q.options.map((opt, j) => (
                    <div key={j} className={`px-2 py-1 rounded ${j === q.correctAnswer ? 'bg-green-100 text-green-800 font-medium' : 'text-muted-foreground'}`}>
                      {String.fromCharCode(65 + j)}. {opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-sm text-muted-foreground mt-2">Explanation: {q.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
