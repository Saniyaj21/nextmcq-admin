'use client';

import { useState } from 'react';
import { useExportUsers, useExportAttempts, useExportTests } from '@/hooks/use-reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Users, ClipboardList, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [userDateFrom, setUserDateFrom] = useState('');
  const [userDateTo, setUserDateTo] = useState('');
  const [userRole, setUserRole] = useState('');

  const [attemptDateFrom, setAttemptDateFrom] = useState('');
  const [attemptDateTo, setAttemptDateTo] = useState('');

  const exportUsers = useExportUsers();
  const exportAttempts = useExportAttempts();
  const exportTests = useExportTests();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports & Export</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Export Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Date From</Label>
              <Input type="date" value={userDateFrom} onChange={(e) => setUserDateFrom(e.target.value)} />
            </div>
            <div>
              <Label>Date To</Label>
              <Input type="date" value={userDateTo} onChange={(e) => setUserDateTo(e.target.value)} />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={userRole || 'all'} onValueChange={(v) => setUserRole(v === 'all' ? '' : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={() => exportUsers.mutate(
                { dateFrom: userDateFrom || undefined, dateTo: userDateTo || undefined, role: userRole || undefined },
                { onSuccess: () => toast.success('Users exported'), onError: () => toast.error('Export failed') }
              )}
              disabled={exportUsers.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              {exportUsers.isPending ? 'Exporting...' : 'Download CSV'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Export Attempts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Date From</Label>
              <Input type="date" value={attemptDateFrom} onChange={(e) => setAttemptDateFrom(e.target.value)} />
            </div>
            <div>
              <Label>Date To</Label>
              <Input type="date" value={attemptDateTo} onChange={(e) => setAttemptDateTo(e.target.value)} />
            </div>
            <Button
              className="w-full"
              onClick={() => exportAttempts.mutate(
                { dateFrom: attemptDateFrom || undefined, dateTo: attemptDateTo || undefined },
                { onSuccess: () => toast.success('Attempts exported'), onError: () => toast.error('Export failed') }
              )}
              disabled={exportAttempts.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              {exportAttempts.isPending ? 'Exporting...' : 'Download CSV'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Export Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Export all tests with their metadata, creator info, and statistics.</p>
            <Button
              className="w-full"
              onClick={() => exportTests.mutate(undefined, {
                onSuccess: () => toast.success('Tests exported'),
                onError: () => toast.error('Export failed'),
              })}
              disabled={exportTests.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              {exportTests.isPending ? 'Exporting...' : 'Download CSV'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
