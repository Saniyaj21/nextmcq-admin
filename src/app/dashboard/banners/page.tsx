'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBanners, useToggleBannerStatus, useDeleteBanner } from '@/hooks/use-banners';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function BannersPage() {
  const router = useRouter();
  const { data: banners, isLoading } = useBanners();
  const toggleStatus = useToggleBannerStatus();
  const deleteBanner = useDeleteBanner();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Banners</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Banners</h1>
        <Button onClick={() => router.push('/dashboard/banners/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Banner
        </Button>
      </div>

      {banners?.length === 0 && (
        <p className="text-muted-foreground text-center py-8">No banners yet. Create one to get started.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners?.map((banner) => (
          <Card key={banner._id} className="overflow-hidden">
            <div className="aspect-video bg-muted relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.imageURL}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{banner.title}</h3>
                <StatusBadge status={banner.isActive ? 'active' : 'inactive'} />
              </div>
              <p className="text-xs text-muted-foreground">
                Created: {new Date(banner.createdAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toggleStatus.mutate(banner._id, {
                      onSuccess: () => toast.success('Status toggled'),
                      onError: () => toast.error('Failed to toggle status'),
                    });
                  }}
                >
                  {banner.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/banners/${banner._id}`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(banner._id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Banner"
        description="This will permanently delete the banner. This action cannot be undone."
        loading={deleteBanner.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteBanner.mutate(deleteId, {
              onSuccess: () => { toast.success('Banner deleted'); setDeleteId(null); },
              onError: () => toast.error('Failed to delete banner'),
            });
          }
        }}
      />
    </div>
  );
}
