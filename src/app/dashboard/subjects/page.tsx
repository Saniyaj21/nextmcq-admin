'use client';

import { useState } from 'react';
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
  useToggleSubjectStatus,
} from '@/hooks/use-subjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/status-badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export default function SubjectsPage() {
  const { data: subjects, isLoading } = useSubjects();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();
  const toggleStatus = useToggleSubjectStatus();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditId(null);
    setName('');
    setDialogOpen(true);
  };

  const openEdit = (id: string, currentName: string) => {
    setEditId(id);
    setName(currentName);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (editId) {
      updateSubject.mutate(
        { subjectId: editId, data: { name: name.trim() } },
        {
          onSuccess: () => {
            toast.success('Subject updated');
            setDialogOpen(false);
          },
          onError: (err: any) => {
            const message = err?.response?.data?.message || err?.message || 'Failed to update subject';
            toast.error(message);
          },
        }
      );
    } else {
      createSubject.mutate(
        { name: name.trim() },
        {
          onSuccess: () => {
            toast.success('Subject created');
            setDialogOpen(false);
          },
          onError: (err: any) => {
            const message = err?.response?.data?.message || err?.message || 'Failed to create subject';
            toast.error(message);
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Subjects</h1>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Subjects</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {subjects?.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          No subjects yet. Add one to get started.
        </p>
      )}

      {subjects && subjects.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject._id}>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>
                  <StatusBadge status={subject.isActive ? 'active' : 'inactive'} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(subject.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toggleStatus.mutate(subject._id, {
                          onSuccess: () => toast.success('Status toggled'),
                          onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to toggle status'),
                        });
                      }}
                    >
                      {subject.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(subject._id, subject.name)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(subject._id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Subject name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || createSubject.isPending || updateSubject.isPending}
            >
              {createSubject.isPending || updateSubject.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Subject"
        description="This will permanently delete the subject. This action cannot be undone."
        loading={deleteSubject.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteSubject.mutate(deleteId, {
              onSuccess: () => {
                toast.success('Subject deleted');
                setDeleteId(null);
              },
              onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete subject'),
            });
          }
        }}
      />
    </div>
  );
}
