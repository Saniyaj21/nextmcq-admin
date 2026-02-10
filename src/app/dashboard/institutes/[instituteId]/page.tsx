'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInstitutes, useUpdateInstitute } from '@/hooks/use-institutes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function EditInstitutePage({ params }: { params: Promise<{ instituteId: string }> }) {
  const { instituteId } = use(params);
  const router = useRouter();
  const { data, isLoading } = useInstitutes();
  const update = useUpdateInstitute();

  const institute = data?.institutes?.find((i) => i._id === instituteId);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('school');

  useEffect(() => {
    if (institute) {
      setName(institute.name);
      setLocation(institute.location || '');
      setType(institute.type);
    }
  }, [institute]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!institute) return <p>Institute not found</p>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(
      { instituteId, data: { name, location, type } as Record<string, unknown> },
      {
        onSuccess: () => {
          toast.success('Institute updated');
          router.push('/dashboard/institutes');
        },
        onError: () => toast.error('Failed to update institute'),
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
        <h1 className="text-3xl font-bold">Edit Institute</h1>
      </div>

      <Card className="max-w-lg">
        <CardHeader><CardTitle>Institute Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="university">University</SelectItem>
                  <SelectItem value="academy">Academy</SelectItem>
                  <SelectItem value="institute">Institute</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Students: {institute.studentCount} | Teachers: {institute.teacherCount}
            </div>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
