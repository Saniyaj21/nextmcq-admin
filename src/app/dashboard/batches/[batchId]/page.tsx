'use client';

import { use } from 'react';
import { useBatch } from '@/hooks/use-batches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTable, type Column } from '@/components/data-table';

interface Student {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function BatchDetailPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = use(params);
  const { data: batch, isLoading } = useBatch(batchId);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!batch) return <p>Batch not found</p>;

  const teacher = batch.createdBy;
  const students = (batch.students || []).filter((s): s is Student => typeof s === 'object');

  const columns: Column<Student>[] = [
    { key: 'name', label: 'Name', render: (s) => s.name || 'Unnamed' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{batch.name}</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Batch Info</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Teacher</span>
            <span>{typeof teacher === 'object' ? teacher.name || teacher.email : '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Students</span>
            <span>{students.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{new Date(batch.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Students ({students.length})</CardTitle></CardHeader>
        <CardContent>
          <DataTable columns={columns} data={students} />
        </CardContent>
      </Card>
    </div>
  );
}
