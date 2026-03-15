'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateBanner, useUploadBannerImage, useDeleteBannerImage } from '@/hooks/use-banners';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function NewBannerPage() {
  const router = useRouter();
  const create = useCreateBanner();
  const upload = useUploadBannerImage();
  const deleteImage = useDeleteBannerImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{ imageURL: string; publicId: string } | null>(null);

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
      setUploadedImage(null);

      upload.mutate(base64, {
        onSuccess: (data) => {
          setUploadedImage(data);
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

  const clearImage = () => {
    if (uploadedImage?.publicId) {
      deleteImage.mutate(uploadedImage.publicId);
    }
    setPreview(null);
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    create.mutate(
      { title, imageURL: uploadedImage.imageURL, imagePublicId: uploadedImage.publicId, isActive: true },
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
              <Label>Banner Image</Label>
              {preview ? (
                <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={uploadedImage?.imageURL || preview} alt="Preview" className="w-full h-full object-cover" />
                  {upload.isPending && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <p className="text-white text-sm">Uploading...</p>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={clearImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="aspect-video border-2 border-dashed rounded-md flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload image</p>
                  <p className="text-xs text-muted-foreground">Max 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <Button type="submit" disabled={create.isPending || upload.isPending || !uploadedImage}>
              {create.isPending ? 'Creating...' : 'Create Banner'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
