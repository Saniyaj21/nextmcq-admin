'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreatePost } from '@/hooks/use-posts';
import { toast } from 'sonner';

const TITLE_MAX = 200;
const DESC_MAX = 2000;

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const createPost = useCreatePost();

  const reset = () => {
    setTitle('');
    setDescription('');
    setErrors({});
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!title.trim()) next.title = 'Title is required';
    else if (title.length > TITLE_MAX) next.title = `Title must be ${TITLE_MAX} characters or less`;
    if (!description.trim()) next.description = 'Description is required';
    else if (description.length > DESC_MAX) next.description = `Description must be ${DESC_MAX} characters or less`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    createPost.mutate(
      { title: title.trim(), description: description.trim() },
      {
        onSuccess: () => {
          toast.success('Post created');
          reset();
          onOpenChange(false);
        },
        onError: (err) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Failed to create post';
          toast.error(msg);
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="post-title">Title</Label>
              <span className="text-xs text-muted-foreground">
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <Input
              id="post-title"
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={TITLE_MAX}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="post-description">Description</Label>
              <span className="text-xs text-muted-foreground">
                {description.length}/{DESC_MAX}
              </span>
            </div>
            <Textarea
              id="post-description"
              placeholder="Post description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={DESC_MAX}
              rows={5}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createPost.isPending}>
            {createPost.isPending ? 'Creating...' : 'Create Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
