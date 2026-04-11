'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTest, useUpdateTest } from '@/hooks/use-tests';
import { useSubjects } from '@/hooks/use-subjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Question } from '@/types';

interface QuestionForm {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function EditTestPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = use(params);
  const router = useRouter();
  const { data, isLoading } = useTest(testId);
  const { data: subjects } = useSubjects();
  const updateTest = useUpdateTest();

  const [initialized, setInitialized] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [description, setDescription] = useState('');
  const [testClass, setTestClass] = useState('');
  const [testSemester, setTestSemester] = useState('');
  const [timeLimit, setTimeLimit] = useState(10);
  const [coinFee, setCoinFee] = useState(0);
  const [isPublic, setIsPublic] = useState(false);
  const [questions, setQuestions] = useState<QuestionForm[]>([]);

  useEffect(() => {
    if (data?.test && !initialized) {
      const t = data.test;
      setTitle(t.title);
      setSubject(t.subject);
      setChapter(t.chapter || '');
      setDescription(t.description || '');
      setTestClass(t.class || '');
      setTestSemester(t.semester || '');
      setTimeLimit(t.timeLimit);
      setCoinFee(t.coinFee);
      setIsPublic(t.isPublic);
      setQuestions(
        (t.questions as Question[]).map((q) => ({
          _id: q._id,
          question: q.question,
          options: [...q.options],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
        }))
      );
      setInitialized(true);
    }
  }, [data, initialized]);

  if (isLoading || !initialized) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data?.test) return <p>Test not found</p>;

  const updateQuestion = (index: number, field: keyof QuestionForm, value: unknown) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const opts = [...updated[qIndex].options];
      opts[oIndex] = value;
      updated[qIndex] = { ...updated[qIndex], options: opts };
      return updated;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      if (updated[qIndex].options.length >= 5) return prev;
      updated[qIndex] = { ...updated[qIndex], options: [...updated[qIndex].options, ''] };
      return updated;
    });
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = updated[qIndex];
      if (q.options.length <= 2) return prev;
      const opts = q.options.filter((_, i) => i !== oIndex);
      const correctAnswer = q.correctAnswer >= opts.length ? opts.length - 1 : q.correctAnswer > oIndex ? q.correctAnswer - 1 : q.correctAnswer;
      updated[qIndex] = { ...q, options: opts, correctAnswer };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTest.mutate(
      {
        testId,
        data: {
          title,
          subject,
          chapter: chapter || undefined,
          description: description || undefined,
          class: testClass || null,
          semester: (testClass === '11' || testClass === '12') ? (testSemester || null) : null,
          timeLimit,
          coinFee,
          isPublic,
          questions,
        },
      },
      {
        onSuccess: () => {
          toast.success('Test updated');
          router.replace(`/dashboard/tests/${testId}`);
        },
        onError: () => toast.error('Failed to update test'),
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
        <h1 className="text-3xl font-bold">Edit Test</h1>
        <div className="ml-auto flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" form="edit-test-form" disabled={updateTest.isPending}>
            {updateTest.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <form id="edit-test-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Test Details */}
        <Card>
          <CardHeader><CardTitle>Test Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={subject || undefined} onValueChange={setSubject}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects?.filter((s) => s.isActive).map((s) => (
                      <SelectItem key={s._id} value={s.name}>{s.name}</SelectItem>
                    ))}
                    {subject && !subjects?.some((s) => s.isActive && s.name === subject) && (
                      <SelectItem value={subject}>{subject}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapter">Chapter</Label>
                <Input id="chapter" value={chapter} onChange={(e) => setChapter(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={testClass || 'none'} onValueChange={(v) => { setTestClass(v === 'none' ? '' : v); setTestSemester(''); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Classes</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
                    <SelectItem value="11">Class 11</SelectItem>
                    <SelectItem value="12">Class 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(testClass === '11' || testClass === '12') && (
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select value={testSemester || 'all'} onValueChange={(v) => setTestSemester(v === 'all' ? '' : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {testClass === '11' ? (
                      <>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="3">Semester 3</SelectItem>
                        <SelectItem value="4">Semester 4</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input id="timeLimit" type="number" min={1} max={60} value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coinFee">Coin Fee</Label>
                <Input id="coinFee" type="number" min={0} value={coinFee} onChange={(e) => setCoinFee(Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="isPublic" checked={isPublic} onCheckedChange={(v) => setIsPublic(!!v)} />
              <Label htmlFor="isPublic" className="cursor-pointer">Public Test</Label>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Questions ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((q, qi) => (
              <div key={q._id || qi} className="border rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label className="font-medium text-base">Q{qi + 1}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(qi)}
                    disabled={questions.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(qi, 'question', e.target.value)}
                    rows={2}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Options</Label>
                    {q.options.length < 5 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => addOption(qi)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Option
                      </Button>
                    )}
                  </div>
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <span className={`text-sm font-medium w-6 ${oi === q.correctAnswer ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      <Input
                        value={opt}
                        onChange={(e) => updateOption(qi, oi, e.target.value)}
                        required
                        className={oi === q.correctAnswer ? 'border-green-500' : ''}
                      />
                      {q.options.length > 2 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(qi, oi)} className="px-2">
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Select
                      value={String(q.correctAnswer)}
                      onValueChange={(v) => updateQuestion(qi, 'correctAnswer', Number(v))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {q.options.map((_, oi) => (
                          <SelectItem key={oi} value={String(oi)}>
                            {String.fromCharCode(65 + oi)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Explanation</Label>
                    <Input
                      value={q.explanation}
                      onChange={(e) => updateQuestion(qi, 'explanation', e.target.value)}
                      placeholder="Optional explanation"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="default" size="sm" onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateTest.isPending}>
            {updateTest.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
