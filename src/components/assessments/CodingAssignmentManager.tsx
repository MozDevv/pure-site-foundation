import { useState, lazy, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SmartDrawer, SmartDrawerContent, SmartDrawerFooter, SmartDrawerHeader, SmartDrawerTitle } from '@/components/ui/smart-drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Plus, Pencil, Trash2, Eye, Code2, TestTube, ChevronDown, ChevronUp,
  AlertTriangle,
} from 'lucide-react';

const MonacoEditor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.default })));

// ── Types ────────────────────────────────────────────────────────────────────
interface TestCase {
  id?: string;
  inputData: string;
  expectedOutput: string;
  isHidden: boolean;
  weight: number;
  description?: string;
}

interface CodingAssignment {
  id: string;
  title: string;
  description: string;
  language: string;
  starterCode?: string;
  instructions?: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  maxScore: number;
  maxSubmissionsPerStudent: number;
  problemType: 'STANDARD_IO' | 'FUNCTION_BASED';
  courseId?: string;
  testCases?: TestCase[];
  createdAt: string;
}

const LANGUAGES = [
  'python', 'javascript', 'typescript', 'java', 'c', 'cpp', 'go', 'rust', 'ruby',
];

const EMPTY_FORM = {
  title: '',
  description: '',
  language: 'python',
  starterCode: '',
  instructions: '',
  timeLimitMs: 5000,
  memoryLimitMb: 128,
  maxScore: 100,
  maxSubmissionsPerStudent: 5,
  problemType: 'STANDARD_IO' as 'STANDARD_IO' | 'FUNCTION_BASED',
  courseId: '',
};

// ── Component ────────────────────────────────────────────────────────────────
export default function CodingAssignmentManager({ courseId }: { courseId?: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialog, setDialog]           = useState<'create' | 'edit' | 'testcases' | null>(null);
  const [selectedAssignment, setSelected] = useState<CodingAssignment | null>(null);
  const [form, setForm]               = useState({ ...EMPTY_FORM, courseId: courseId ?? '' });
  const [testCases, setTestCases]     = useState<TestCase[]>([]);
  const [showStarterCode, setShowStarterCode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'assignment' | 'testcase'; id: string } | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ['codingAssignments', courseId],
    queryFn: () => apiService.get(
      courseId ? endpoints.getCodingAssignments(courseId) : '/code/assignments'
    ).then(r => r.data?.content ?? r.data ?? []),
  });
  const assignments: CodingAssignment[] = Array.isArray(assignmentsData) ? assignmentsData : [];

  const { data: assignmentTestCases = [] } = useQuery<TestCase[]>({
    queryKey: ['codingTestCases', selectedAssignment?.id],
    queryFn: () => apiService.get(endpoints.getCodingTestCases(selectedAssignment!.id)).then(r => r.data),
    enabled: !!selectedAssignment && dialog === 'testcases',
  });

  // ── Mutations ────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: any) => apiService.post(endpoints.createCodingAssignment, data),
    onSuccess: async (res) => {
      const newId = res.data?.id;
      if (newId && testCases.length > 0) {
        await Promise.all(testCases.map(tc =>
          apiService.post(`/code/assignments/${newId}/test-cases`, tc)
        ));
      }
      toast({ title: 'Assignment created' });
      queryClient.invalidateQueries({ queryKey: ['codingAssignments'] });
      closeDialog();
    },
    onError: (error: any) => toast({ title: error?.response?.data?.message || 'Error creating assignment', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiService.put(`/code/assignments/${id}`, data),
    onSuccess: () => {
      toast({ title: 'Assignment updated' });
      queryClient.invalidateQueries({ queryKey: ['codingAssignments'] });
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.delete(`/code/assignments/${id}`),
    onSuccess: () => {
      toast({ title: 'Assignment deleted' });
      queryClient.invalidateQueries({ queryKey: ['codingAssignments'] });
    },
  });

  const addTestCaseMutation = useMutation({
    mutationFn: ({ assignmentId, tc }: { assignmentId: string; tc: TestCase }) =>
      apiService.post(`/code/assignments/${assignmentId}/test-cases`, tc),
    onSuccess: () => {
      toast({ title: 'Test case saved' });
      queryClient.invalidateQueries({ queryKey: ['codingTestCases'] });
    },
  });

  const deleteTestCaseMutation = useMutation({
    mutationFn: (tcId: string) => apiService.delete(`/code/test-cases/${tcId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codingTestCases'] });
    },
  });

  // ── Helpers ──────────────────────────────────────────────────────────────
  function openCreate() {
    setForm({ ...EMPTY_FORM, courseId: courseId ?? '' });
    setTestCases([{ inputData: '', expectedOutput: '', isHidden: false, weight: 1 }]);
    setSelected(null);
    setDialog('create');
  }

  function openEdit(a: CodingAssignment) {
    setSelected(a);
    setForm({
      title: a.title,
      description: a.description,
      language: a.language,
      starterCode: a.starterCode ?? '',
      instructions: a.instructions ?? '',
      timeLimitMs: a.timeLimitMs,
      memoryLimitMb: a.memoryLimitMb,
      maxScore: a.maxScore,
      maxSubmissionsPerStudent: a.maxSubmissionsPerStudent,
      problemType: a.problemType,
      courseId: a.courseId ?? courseId ?? '',
    });
    setTestCases([]);
    setDialog('edit');
  }

  function closeDialog() {
    setDialog(null);
    setSelected(null);
    setTestCases([]);
    setShowStarterCode(false);
  }

  function addTestCaseRow() {
    setTestCases(prev => [...prev, { inputData: '', expectedOutput: '', isHidden: false, weight: 1 }]);
  }

  function updateTestCase(idx: number, field: keyof TestCase, value: any) {
    setTestCases(prev => prev.map((tc, i) => i === idx ? { ...tc, [field]: value } : tc));
  }

  function removeTestCase(idx: number) {
    setTestCases(prev => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit() {
    const payload = {
      ...form,
      timeLimitMs: Number(form.timeLimitMs),
      memoryLimitMb: Number(form.memoryLimitMb),
      maxScore: Number(form.maxScore),
      maxSubmissionsPerStudent: Number(form.maxSubmissionsPerStudent),
      courseId: form.courseId || undefined,
      starterCode: form.starterCode || undefined,
      instructions: form.instructions || undefined,
    };
    if (dialog === 'edit' && selectedAssignment) {
      updateMutation.mutate({ id: selectedAssignment.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Coding Assignments</h2>
          <p className="text-sm text-muted-foreground">Create and manage auto-graded coding challenges</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> New Assignment</Button>
      </div>

      {isLoading && <LoadingSpinner />}

      {/* Assignment List */}
      <div className="space-y-2">
        {assignments.map((a: CodingAssignment) => (
          <Card key={a.id}>
            <CardContent className="py-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Code2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium">{a.title}</span>
                  <Badge variant="outline" className="capitalize">{a.language}</Badge>
                  <Badge variant="secondary">{a.problemType.replace('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">{a.description}</p>
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  <span>Max score: {a.maxScore}</span>
                  <span>Time limit: {a.timeLimitMs / 1000}s</span>
                  <span>Memory: {a.memoryLimitMb}MB</span>
                  <span>Max submissions: {a.maxSubmissionsPerStudent}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost" size="sm"
                  onClick={() => { setSelected(a); setDialog('testcases'); }}
                  title="Manage test cases"
                >
                  <TestTube className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(a)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost" size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget({ type: 'assignment', id: a.id })}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {assignments.length === 0 && !isLoading && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <Code2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No coding assignments yet. Click "New Assignment" to create one.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <SmartDrawer open={dialog === 'create' || dialog === 'edit'} onOpenChange={o => { if (!o) closeDialog(); }}>
        <SmartDrawerContent defaultWidth={768}>
          <SmartDrawerHeader>
            <SmartDrawerTitle>{dialog === 'edit' ? 'Edit' : 'New'} Coding Assignment</SmartDrawerTitle>
          </SmartDrawerHeader>

          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="code">Starter Code</TabsTrigger>
              <TabsTrigger value="testcases-local">Test Cases ({testCases.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Fibonacci Sequence" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Description *</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Brief description of the problem" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Instructions (shown to students)</Label>
                  <Textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} rows={4} placeholder="Detailed problem statement with examples..." />
                </div>
                <div className="space-y-1">
                  <Label>Language *</Label>
                  <Select value={form.language} onValueChange={v => setForm(f => ({ ...f, language: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Problem Type</Label>
                  <Select value={form.problemType} onValueChange={v => setForm(f => ({ ...f, problemType: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD_IO">Standard I/O</SelectItem>
                      <SelectItem value="FUNCTION_BASED">Function Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Time Limit (ms)</Label>
                  <Input type="number" value={form.timeLimitMs} min={500} max={10000} onChange={e => setForm(f => ({ ...f, timeLimitMs: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1">
                  <Label>Memory Limit (MB)</Label>
                  <Input type="number" value={form.memoryLimitMb} min={32} max={256} onChange={e => setForm(f => ({ ...f, memoryLimitMb: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1">
                  <Label>Max Score</Label>
                  <Input type="number" value={form.maxScore} min={1} onChange={e => setForm(f => ({ ...f, maxScore: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1">
                  <Label>Max Submissions per Student</Label>
                  <Input type="number" value={form.maxSubmissionsPerStudent} min={1} max={20} onChange={e => setForm(f => ({ ...f, maxSubmissionsPerStudent: Number(e.target.value) }))} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="pt-2">
              <div className="space-y-2">
                <Label>Starter Code <span className="text-muted-foreground text-xs">(optional — given to students as a starting point)</span></Label>
                <Suspense fallback={<div className="h-[300px] flex items-center justify-center bg-[#1e1e1e] rounded"><LoadingSpinner /></div>}>
                  <MonacoEditor
                    height="300px"
                    language={form.language === 'cpp' ? 'cpp' : form.language}
                    value={form.starterCode}
                    onChange={val => setForm(f => ({ ...f, starterCode: val ?? '' }))}
                    theme="vs-dark"
                    options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true }}
                  />
                </Suspense>
              </div>
            </TabsContent>

            <TabsContent value="testcases-local" className="pt-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Define inputs and expected outputs. Hidden test cases are not shown to students.
                  </p>
                  <Button size="sm" variant="outline" onClick={addTestCaseRow}>
                    <Plus className="w-4 h-4 mr-1" /> Add Test Case
                  </Button>
                </div>
                {testCases.map((tc, idx) => (
                  <Card key={idx} className="border-dashed">
                    <CardContent className="py-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Test Case #{idx + 1}</span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-sm">
                            <Switch
                              checked={tc.isHidden}
                              onCheckedChange={v => updateTestCase(idx, 'isHidden', v)}
                            />
                            Hidden
                          </label>
                          <div className="flex items-center gap-1">
                            <Label className="text-xs">Weight:</Label>
                            <Input
                              type="number" min={1} max={10}
                              value={tc.weight}
                              onChange={e => updateTestCase(idx, 'weight', Number(e.target.value))}
                              className="w-16 h-7 text-sm"
                            />
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeTestCase(idx)} className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Input (stdin)</Label>
                          <Textarea
                            value={tc.inputData}
                            onChange={e => updateTestCase(idx, 'inputData', e.target.value)}
                            rows={3}
                            placeholder="Program's stdin input"
                            className="font-mono text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Expected Output</Label>
                          <Textarea
                            value={tc.expectedOutput}
                            onChange={e => updateTestCase(idx, 'expectedOutput', e.target.value)}
                            rows={3}
                            placeholder="Expected stdout output"
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Description (optional)</Label>
                        <Input
                          value={tc.description ?? ''}
                          onChange={e => updateTestCase(idx, 'description', e.target.value)}
                          placeholder="e.g. Basic case, sorted input"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {testCases.length === 0 && (
                  <p className="text-center py-4 text-muted-foreground text-sm">
                    No test cases added. Add at least one for auto-grading to work.
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Test cases will be saved after the assignment is created.</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <SmartDrawerFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.title.trim() || !form.description.trim() || createMutation.isPending || updateMutation.isPending}
            >
              {dialog === 'edit' ? 'Update' : 'Create'} Assignment
            </Button>
          </SmartDrawerFooter>
        </SmartDrawerContent>
      </SmartDrawer>

      {/* Manage Test Cases Dialog (for existing assignments) */}
      <SmartDrawer open={dialog === 'testcases'} onOpenChange={o => { if (!o) { setDialog(null); setSelected(null); } }}>
        <SmartDrawerContent defaultWidth={768}>
          <SmartDrawerHeader>
            <SmartDrawerTitle>Test Cases — {selectedAssignment?.title}</SmartDrawerTitle>
          </SmartDrawerHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              These test cases are used for automatic grading. Hidden cases are not displayed to students.
            </div>
            {assignmentTestCases.map((tc: any) => (
              <Card key={tc.id} className={tc.isHidden ? 'border-dashed' : ''}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {tc.isHidden && <Badge variant="secondary">Hidden</Badge>}
                      <span className="text-xs text-muted-foreground">Weight: {tc.weight}</span>
                      {tc.description && <span className="text-xs text-muted-foreground">— {tc.description}</span>}
                    </div>
                    <Button
                      variant="ghost" size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget({ type: 'testcase', id: tc.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Input</Label>
                      <pre className="text-xs bg-muted p-2 rounded font-mono whitespace-pre-wrap">{tc.inputData || '(empty)'}</pre>
                    </div>
                    <div>
                      <Label className="text-xs">Expected Output</Label>
                      <pre className="text-xs bg-muted p-2 rounded font-mono whitespace-pre-wrap">{tc.expectedOutput}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Add New Test Case</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AddTestCaseForm
                  onAdd={(tc) => selectedAssignment && addTestCaseMutation.mutate({ assignmentId: selectedAssignment.id, tc })}
                  isLoading={addTestCaseMutation.isPending}
                />
              </CardContent>
            </Card>

            {assignmentTestCases.length === 0 && (
              <p className="text-center py-4 text-muted-foreground text-sm">No test cases yet.</p>
            )}
          </div>
          <SmartDrawerFooter>
            <Button variant="outline" onClick={() => { setDialog(null); setSelected(null); }}>Close</Button>
          </SmartDrawerFooter>
        </SmartDrawerContent>
      </SmartDrawer>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type === 'assignment' ? 'Assignment' : 'Test Case'}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteTarget?.type === 'assignment' ? 'coding assignment' : 'test case'}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget?.type === 'assignment') deleteMutation.mutate(deleteTarget.id);
                else if (deleteTarget?.type === 'testcase') deleteTestCaseMutation.mutate(deleteTarget.id);
                setDeleteTarget(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Add Test Case inline form ─────────────────────────────────────────────────
function AddTestCaseForm({ onAdd, isLoading }: { onAdd: (tc: TestCase) => void; isLoading: boolean }) {
  const [tc, setTc] = useState<TestCase>({ inputData: '', expectedOutput: '', isHidden: false, weight: 1 });
  function handleAdd() {
    if (!tc.expectedOutput.trim()) return;
    onAdd(tc);
    setTc({ inputData: '', expectedOutput: '', isHidden: false, weight: 1 });
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Input (stdin)</Label>
          <Textarea value={tc.inputData} onChange={e => setTc(t => ({ ...t, inputData: e.target.value }))} rows={3} placeholder="stdin input" className="font-mono text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Expected Output *</Label>
          <Textarea value={tc.expectedOutput} onChange={e => setTc(t => ({ ...t, expectedOutput: e.target.value }))} rows={3} placeholder="expected stdout" className="font-mono text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={tc.isHidden} onCheckedChange={v => setTc(t => ({ ...t, isHidden: v }))} />
          Hidden
        </label>
        <div className="flex items-center gap-1">
          <Label className="text-xs">Weight:</Label>
          <Input type="number" min={1} max={10} value={tc.weight} onChange={e => setTc(t => ({ ...t, weight: Number(e.target.value) }))} className="w-16 h-7 text-sm" />
        </div>
        <Button size="sm" onClick={handleAdd} disabled={!tc.expectedOutput.trim() || isLoading}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>
    </div>
  );
}
