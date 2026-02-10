'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateBanner } from '@/hooks/use-banners';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function NewBannerPage() {
  const router = useRouter();
  const create = useCreateBanner();
  const [title, setTitle] = useState('');
  const [imageURL, setImageURL] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      { title, imageURL, isActive: true },
      {
        onSuccess: () => {
          toast.success('Banner created');
          router.push('/dashboard/banners');
        },
        onError: () => toast.error('Failed to create banner'),
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
        <h1 className="text-3xl font-bold">Create Banner</h1>
      </div>

      <Card className="max-w-lg">
        <CardHeader><CardTitle>Banner Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageURL">Image URL</Label>
              <Input id="imageURL" value={imageURL} onChange={(e) => setImageURL(e.target.value)} required placeholder="https://..." />
            </div>
            {imageURL && (
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageURL} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Creating...' : 'Create Banner'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
