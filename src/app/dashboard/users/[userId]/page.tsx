'use client';

import { use } from 'react';
import { useUser, useUpdateUser } from '@/hooks/use-users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/status-badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { data: user, isLoading } = useUser(userId);
  const updateUser = useUpdateUser();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) return <p>User not found</p>;

  const handleRoleChange = (role: string) => {
    updateUser.mutate(
      { userId, data: { role } as Record<string, unknown> },
      {
        onSuccess: () => toast.success('Role updated'),
        onError: () => toast.error('Failed to update role'),
      }
    );
  };

  const handleToggleStatus = () => {
    updateUser.mutate(
      { userId, data: { isActive: !user.isActive } as Record<string, unknown> },
      {
        onSuccess: () => toast.success('Status updated'),
        onError: () => toast.error('Failed to update status'),
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
        <h1 className="text-3xl font-bold">{user.name || 'Unnamed User'}</h1>
        <StatusBadge status={user.role} />
        <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Institute</span>
              <span>{typeof user.institute === 'object' && user.institute ? user.institute.name : 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Verified</span>
              <span>{user.isEmailVerified ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Login</span>
              <span>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Joined</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Rewards card */}
        <Card>
          <CardHeader>
            <CardTitle>Rewards & Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Level</span>
              <span className="font-bold">{user.rewards.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Coins</span>
              <span>{user.rewards.coins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">XP</span>
              <span>{user.rewards.xp}</span>
            </div>
            <Separator />
            {user.role === 'student' && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tests Taken</span>
                  <span>{user.student.totalTests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Correct Answers</span>
                  <span>{user.student.correctAnswers} / {user.student.totalQuestions}</span>
                </div>
              </>
            )}
            {user.role === 'teacher' && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tests Created</span>
                  <span>{user.teacher.testsCreated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Questions Created</span>
                  <span>{user.teacher.questionsCreated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student Attempts</span>
                  <span>{user.teacher.totalAttemptsOfStudents}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Role:</span>
            <Select value={user.role} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant={user.isActive ? 'destructive' : 'default'}
            onClick={handleToggleStatus}
            disabled={updateUser.isPending}
          >
            {user.isActive ? 'Deactivate User' : 'Activate User'}
          </Button>
        </CardContent>
      </Card>

      {/* Badges */}
      {user.badges && user.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Badges ({user.badges.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((b, i) => (
                <div key={i} className="border rounded-md px-3 py-2 text-sm">
                  <span className="font-medium">{b.name}</span>
                  <span className="text-muted-foreground ml-2">
                    {b.month}/{b.year} - Rank #{b.rank}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
