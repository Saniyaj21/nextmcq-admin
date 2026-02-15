'use client';

import { use } from 'react';
import { useAttempt } from '@/hooks/use-attempts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AttemptDetailPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  const { data: attempt, isLoading } = useAttempt(attemptId);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!attempt) return <p>Attempt not found</p>;

  const user = typeof attempt.userId === 'object' ? attempt.userId : null;
  const test = typeof attempt.testId === 'object' ? attempt.testId : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Attempt Detail</h1>
        <StatusBadge status={attempt.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User</span>
              <span>{user ? user.name || user.email : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Test</span>
              <span>{test ? test.title : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Score</span>
              <span>{attempt.score?.correct}/{attempt.score?.total} ({attempt.score?.percentage}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time Spent</span>
              <span>{attempt.timeSpent ? `${Math.round(attempt.timeSpent / 60)}m ${attempt.timeSpent % 60}s` : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rewards</span>
              <span>{attempt.rewards?.coins} coins, {attempt.rewards?.xp} XP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{new Date(attempt.createdAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question-by-question review */}
      {attempt.answers && attempt.answers.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Answer Review</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {attempt.answers.map((answer, idx) => {
              const q = answer.questionId;
              if (!q) return null;
              const isCorrect = answer.isCorrect;
              const selected = answer.selectedAnswer;
              const correct = q.correctAnswer;
              const options = q.options;

              return (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    )}
                    <p className="font-medium">Q{idx + 1}: {q.question}</p>
                  </div>
                  <div className="space-y-1 ml-7">
                    {options?.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`text-sm px-3 py-1 rounded ${
                          oi === correct
                            ? 'bg-green-50 text-green-800 font-medium'
                            : oi === selected && !isCorrect
                            ? 'bg-red-50 text-red-800'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {String.fromCharCode(65 + oi)}. {opt}
                        {oi === correct && ' (correct)'}
                        {oi === selected && oi !== correct && ' (selected)'}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
