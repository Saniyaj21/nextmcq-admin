'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateInstitute } from '@/hooks/use-institutes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function NewInstitutePage() {
  const router = useRouter();
  const create = useCreateInstitute();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('school');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      { name, location, type },
      {
        onSuccess: () => {
          toast.success('Institute created');
          router.push('/dashboard/institutes');
        },
        onError: () => toast.error('Failed to create institute'),
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
        <h1 className="text-3xl font-bold">Create Institute</h1>
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
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Creating...' : 'Create Institute'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
