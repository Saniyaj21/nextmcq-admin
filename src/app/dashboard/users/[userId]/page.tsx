'use client';

import { use, useState } from 'react';
import { useUser, useUpdateUser, useUserAttempts, useUserReferrals } from '@/hooks/use-users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/status-badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable, type Column } from '@/components/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { TestAttempt } from '@/types';

export default function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { data: user, isLoading } = useUser(userId);
  const updateUser = useUpdateUser();
  const router = useRouter();
  const [attemptsPage, setAttemptsPage] = useState(1);
  const { data: attemptsData, isLoading: attemptsLoading } = useUserAttempts(userId, attemptsPage);
  const { data: referralData } = useUserReferrals(userId);

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

  const attemptColumns: Column<TestAttempt>[] = [
    {
      key: 'testId',
      label: 'Test',
      render: (a) => {
        const t = a.testId as Record<string, string>;
        return typeof t === 'object' ? t.title : '-';
      },
    },
    { key: 'status', label: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'score',
      label: 'Score',
      render: (a) => a.score ? `${a.score.correct}/${a.score.total} (${a.score.percentage}%)` : '-',
    },
    { key: 'timeSpent', label: 'Time', render: (a) => a.timeSpent ? `${Math.round(a.timeSpent / 60)}m` : '-' },
    { key: 'createdAt', label: 'Date', render: (a) => new Date(a.createdAt).toLocaleDateString() },
  ];

  const tierColors: Record<string, string> = {
    CHAMPION: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    ELITE: 'bg-purple-100 border-purple-400 text-purple-800',
    ACHIEVER: 'bg-blue-100 border-blue-400 text-blue-800',
    PERFORMER: 'bg-green-100 border-green-400 text-green-800',
    UNPLACED: 'bg-gray-100 border-gray-400 text-gray-800',
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

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="attempts">Test History</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-6">
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {user.badges.map((b, i) => (
                    <div
                      key={i}
                      className={`border rounded-lg px-3 py-2 text-sm ${tierColors[b.tier] || 'bg-gray-50'}`}
                    >
                      <div className="font-medium">{b.name}</div>
                      <div className="text-xs opacity-75">
                        {b.category} - {b.month}/{b.year}
                      </div>
                      <div className="text-xs opacity-75">Rank #{b.rank}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="attempts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Test History</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={attemptColumns}
                data={attemptsData?.attempts ?? []}
                pagination={attemptsData?.pagination}
                onPageChange={setAttemptsPage}
                isLoading={attemptsLoading}
                onRowClick={(a) => router.push(`/dashboard/attempts/${a._id}`)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referral Code</span>
                  <span className="font-mono">{referralData?.referralCode || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referred By</span>
                  <span>
                    {referralData?.referredBy
                      ? `${referralData.referredBy.name || referralData.referredBy.email} (${referralData.referredBy.referralCode || ''})`
                      : 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Users Referred</span>
                  <span>{referralData?.referredUsers?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {referralData?.referredUsers && referralData.referredUsers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Referred Users ({referralData.referredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {referralData.referredUsers.map((u) => (
                      <div key={u._id} className="flex justify-between items-center text-sm border-b pb-2">
                        <div>
                          <span className="font-medium">{u.name || 'Unnamed'}</span>
                          <span className="text-muted-foreground ml-2">{u.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={u.role} />
                          <span className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
