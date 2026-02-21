'use client';

import { useState } from 'react';
import { usePosts, useDeletePost } from '@/hooks/use-posts';
import { DataTable, type Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { toast } from 'sonner';
import type { Post } from '@/types';
import { Trash2, Plus } from 'lucide-react';

export default function PostsPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = usePosts({ page, type: type || undefined });
  const deletePost = useDeletePost();

  const columns: Column<Post>[] = [
    { key: 'type', label: 'Type', render: (p) => <StatusBadge status={p.type} /> },
    { key: 'title', label: 'Title', render: (p) => p.title || '-' },
    { key: 'description', label: 'Description', render: (p) => (
      <span className="truncate max-w-xs block">{p.description || '-'}</span>
    ) },
    {
      key: 'creator',
      label: 'Creator',
      render: (p) => {
        const c = p.creator;
        return typeof c === 'object' && c ? c.name || c.email : '-';
      },
    },
    { key: 'createdAt', label: 'Created', render: (p) => new Date(p.createdAt).toLocaleDateString() },
    {
      key: 'actions',
      label: '',
      render: (p) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); setDeleteId(p._id); }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Posts</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      <Select value={type || 'all'} onValueChange={(v) => { setType(v === 'all' ? '' : v); setPage(1); }}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="teacher_test_created">Teacher Test Created</SelectItem>
          <SelectItem value="student_test_attempt">Student Test Attempt</SelectItem>
          <SelectItem value="user_joined">User Joined</SelectItem>
          <SelectItem value="user_post">User Post</SelectItem>
        </SelectContent>
      </Select>

      <DataTable
        columns={columns}
        data={data?.posts ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
      />

      <CreatePostDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Post"
        description="This will permanently delete the post. This action cannot be undone."
        loading={deletePost.isPending}
        onConfirm={() => {
          if (deleteId) {
            deletePost.mutate(deleteId, {
              onSuccess: () => { toast.success('Post deleted'); setDeleteId(null); },
              onError: () => toast.error('Failed to delete post'),
            });
          }
        }}
      />
    </div>
  );
}
