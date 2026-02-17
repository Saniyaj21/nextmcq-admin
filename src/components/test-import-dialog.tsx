'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUsers } from '@/hooks/use-users';
import { useImportTest } from '@/hooks/use-test-import-export';
import { parseXLSX, type ParsedTestData } from '@/lib/xlsx-utils';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface TestImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestImportDialog({ open, onOpenChange }: TestImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedTestData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const { data: usersData } = useUsers({ role: 'teacher', limit: 200 } as Parameters<typeof useUsers>[0]);
  const importTest = useImportTest();

  const teachers = usersData?.users ?? [];

  const reset = () => {
    setParsed(null);
    setParseError(null);
    setTeacherId('');
    setFileName('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParsed(null);
    setParseError(null);

    try {
      const data = await parseXLSX(file);
      setParsed(data);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse file');
    }
  };

  const handleImport = () => {
    if (!parsed || !teacherId) return;

    const file = fileRef.current?.files?.[0];
    if (!file) return;

    importTest.mutate(
      { file, teacherId },
      {
        onSuccess: () => {
          toast.success('Test imported successfully');
          reset();
          onOpenChange(false);
        },
        onError: (err) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Import failed';
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
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Test from XLSX
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* File input */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">XLSX File</label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {fileName || 'Click to select an .xlsx file'}
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Parse error */}
          {parseError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <pre className="text-sm text-destructive whitespace-pre-wrap font-mono">{parseError}</pre>
              </div>
            </div>
          )}

          {/* Preview */}
          {parsed && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium text-base">{parsed.test.title}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                <span>Subject: <span className="text-foreground">{parsed.test.subject}</span></span>
                <span>Time: <span className="text-foreground">{parsed.test.timeLimit} min</span></span>
                <span>Questions: <span className="text-foreground">{parsed.questions.length}</span></span>
                <span>Coin Fee: <span className="text-foreground">{parsed.test.coinFee}</span></span>
                <span>Visibility: <span className="text-foreground">{parsed.test.isPublic ? 'Public' : 'Private'}</span></span>
                {parsed.test.chapter && (
                  <span>Chapter: <span className="text-foreground">{parsed.test.chapter}</span></span>
                )}
              </div>
            </div>
          )}

          {/* Teacher select */}
          {parsed && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Creator (Teacher)</label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher..." />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name} ({t.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!parsed || !teacherId || importTest.isPending}
          >
            {importTest.isPending ? 'Importing...' : 'Import Test'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
