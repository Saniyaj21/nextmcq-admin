'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBanners, useUpdateBanner, useUploadBannerImage, useDeleteBannerImage } from '@/hooks/use-banners';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function EditBannerPage({ params }: { params: Promise<{ bannerId: string }> }) {
  const { bannerId } = use(params);
  const router = useRouter();
  const { data: banners, isLoading } = useBanners();
  const update = useUpdateBanner();
  const upload = useUploadBannerImage();
  const deleteImage = useDeleteBannerImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const banner = banners?.find((b) => b._id === bannerId);

  const [title, setTitle] = useState('');
  const [currentImageURL, setCurrentImageURL] = useState('');
  const [newImage, setNewImage] = useState<{ imageURL: string; publicId: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (banner) {
      setTitle(banner.title);
      setCurrentImageURL(banner.imageURL);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreview(base64);

      upload.mutate(base64, {
        onSuccess: (data) => {
          setNewImage(data);
          toast.success('Image uploaded');
        },
        onError: () => {
          toast.error('Failed to upload image');
          setPreview(null);
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const clearNewImage = () => {
    if (newImage?.publicId) {
      deleteImage.mutate(newImage.publicId);
    }
    setPreview(null);
    setNewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Record<string, string> = { title };
    if (newImage) {
      data.imageURL = newImage.imageURL;
      data.imagePublicId = newImage.publicId;
    }

    update.mutate(
      { bannerId, data },
      {
        onSuccess: () => {
          toast.success('Banner updated');
          router.push('/dashboard/banners');
        },
        onError: () => toast.error('Failed to update banner'),
      }
    );
  };

  const displayImage = newImage?.imageURL || preview || currentImageURL;

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
              <Label>Banner Image</Label>
              {displayImage ? (
                <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={displayImage} alt="Preview" className="w-full h-full object-cover" />
                  {upload.isPending && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <p className="text-white text-sm">Uploading...</p>
                    </div>
                  )}
                  {preview && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={clearNewImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={upload.isPending}
              >
                <Upload className="h-4 w-4 mr-2" />
                {currentImageURL && !preview ? 'Replace Image' : 'Upload Image'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <Button type="submit" disabled={update.isPending || upload.isPending}>
              {update.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
