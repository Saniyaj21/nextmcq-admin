'use client';

import { use, useState } from 'react';
import { useFeedbackDetail, useRespondToFeedback, useUpdateFeedbackStatus, useUpdateFeedbackPriority } from '@/hooks/use-feedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function FeedbackDetailPage({ params }: { params: Promise<{ feedbackId: string }> }) {
  const { feedbackId } = use(params);
  const { data: feedback, isLoading } = useFeedbackDetail(feedbackId);
  const respond = useRespondToFeedback();
  const updateStatus = useUpdateFeedbackStatus();
  const updatePriority = useUpdateFeedbackPriority();
  const router = useRouter();
  const [response, setResponse] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!feedback) return <p>Feedback not found</p>;

  const user = typeof feedback.userId === 'object' ? feedback.userId : null;

  const handleRespond = () => {
    if (!response.trim()) return;
    respond.mutate(
      { feedbackId, adminResponse: response },
      {
        onSuccess: () => { toast.success('Response sent'); setResponse(''); },
        onError: () => toast.error('Failed to send response'),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{feedback.subject}</h1>
        <StatusBadge status={feedback.type} />
        <StatusBadge status={feedback.status} />
        <StatusBadge status={feedback.priority} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Message */}
          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{feedback.message}</p>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>From: {user?.name || '-'} ({feedback.email})</p>
                <p>Submitted: {new Date(feedback.createdAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Existing response */}
          {feedback.adminResponse && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Response</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{feedback.adminResponse}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Responded: {feedback.respondedAt ? new Date(feedback.respondedAt).toLocaleString() : '-'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Respond */}
          <Card>
            <CardHeader>
              <CardTitle>{feedback.adminResponse ? 'Update Response' : 'Respond'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response..."
                rows={4}
              />
              <Button onClick={handleRespond} disabled={respond.isPending || !response.trim()}>
                {respond.isPending ? 'Sending...' : 'Send Response'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent>
              <Select
                value={feedback.status}
                onValueChange={(v) => {
                  updateStatus.mutate(
                    { feedbackId, status: v },
                    {
                      onSuccess: () => toast.success('Status updated'),
                      onError: () => toast.error('Failed to update status'),
                    }
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Priority</CardTitle></CardHeader>
            <CardContent>
              <Select
                value={feedback.priority}
                onValueChange={(v) => {
                  updatePriority.mutate(
                    { feedbackId, priority: v },
                    {
                      onSuccess: () => toast.success('Priority updated'),
                      onError: () => toast.error('Failed to update priority'),
                    }
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
