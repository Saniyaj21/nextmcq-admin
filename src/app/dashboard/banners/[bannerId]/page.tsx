'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBanners, useUpdateBanner } from '@/hooks/use-banners';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function EditBannerPage({ params }: { params: Promise<{ bannerId: string }> }) {
  const { bannerId } = use(params);
  const router = useRouter();
  const { data: banners, isLoading } = useBanners();
  const update = useUpdateBanner();

  const banner = banners?.find((b) => b._id === bannerId);

  const [title, setTitle] = useState('');
  const [imageURL, setImageURL] = useState('');

  useEffect(() => {
    if (banner) {
      setTitle(banner.title);
      setImageURL(banner.imageURL);
    }
  }, [banner]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!banner) return <p>Banner not found</p>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(
      { bannerId, data: { title, imageURL } },
      {
        onSuccess: () => {
          toast.success('Banner updated');
          router.push('/dashboard/banners');
        },
        onError: () => toast.error('Failed to update banner'),
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
        <h1 className="text-3xl font-bold">Edit Banner</h1>
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
              <Input id="imageURL" value={imageURL} onChange={(e) => setImageURL(e.target.value)} required />
            </div>
            {imageURL && (
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageURL} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
