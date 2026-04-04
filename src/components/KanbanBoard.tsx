import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  SmartDrawer, SmartDrawerContent, SmartDrawerFooter, SmartDrawerHeader, SmartDrawerTitle,
} from '@/components/ui/smart-drawer';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Kanban, Plus, GripVertical, Pencil, Trash2, Search, Filter,
  AlertTriangle, Bug, Lightbulb, BookOpen, Zap, LayoutList, Circle,
} from 'lucide-react';
import { SkeletonPage } from '@/components/ui/animations';

interface Requirement {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  storyPoints?: number;
  acceptanceCriteria?: string;
  sprint?: string;
  assigneeId?: string;
  parentId?: string;
  sortOrder: number;
  teamId: string;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUSES = [
  { id: 'BACKLOG', name: 'Backlog', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'TODO', name: 'To Do', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'IN_PROGRESS', name: 'In Progress', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { id: 'IN_REVIEW', name: 'In Review', color: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'DONE', name: 'Done', color: 'bg-green-50 dark:bg-green-900/20' },
];

const TYPES = [
  { id: 'EPIC', name: 'Epic', icon: BookOpen, color: 'text-purple-600 bg-purple-100' },
  { id: 'USER_STORY', name: 'Story', icon: LayoutList, color: 'text-blue-600 bg-blue-100' },
  { id: 'TASK', name: 'Task', icon: Circle, color: 'text-green-600 bg-green-100' },
  { id: 'BUG', name: 'Bug', icon: Bug, color: 'text-red-600 bg-red-100' },
  { id: 'FEATURE', name: 'Feature', icon: Lightbulb, color: 'text-amber-600 bg-amber-100' },
  { id: 'SPIKE', name: 'Spike', icon: Zap, color: 'text-orange-600 bg-orange-100' },
];

const PRIORITIES = [
  { id: 'LOW', name: 'Low', color: 'text-gray-600' },
  { id: 'MEDIUM', name: 'Medium', color: 'text-blue-600' },
  { id: 'HIGH', name: 'High', color: 'text-orange-600' },
  { id: 'CRITICAL', name: 'Critical', color: 'text-red-600' },
];

const EMPTY_FORM = {
  title: '', description: '', type: 'TASK', priority: 'MEDIUM',
  storyPoints: '', acceptanceCriteria: '', sprint: '',
};

interface KanbanBoardProps {
  teamId?: string;
}

export default function KanbanBoard({ teamId }: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<Requirement | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  // Get current team
  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await apiService.get(endpoints.getUserTeams);
      return Array.isArray(res.data) ? res.data : res.data?.content || [];
    },
  });

  const currentTeamId = teamId || teams[0]?.id;

  const { data: requirements = [], isLoading } = useQuery<Requirement[]>({
    queryKey: ['requirements', currentTeamId],
    queryFn: async () => {
      if (!currentTeamId) return [];
      const res = await apiService.get(endpoints.getTeamRequirements(currentTeamId));
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!currentTeamId,
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiService.post(endpoints.createRequirement, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      toast.success('Requirement created');
      closeDrawer();
    },
    onError: () => toast.error('Failed to create requirement'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiService.put(`${endpoints.updateRequirement}/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      toast.success('Requirement updated');
      closeDrawer();
    },
    onError: () => toast.error('Failed to update requirement'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.delete(endpoints.deleteRequirement(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      toast.success('Requirement deleted');
    },
  });

  const filtered = useMemo(() => {
    return requirements.filter(r => {
      const matchSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'all' || r.type === typeFilter;
      const matchPriority = priorityFilter === 'all' || r.priority === priorityFilter;
      return matchSearch && matchType && matchPriority;
    });
  }, [requirements, searchTerm, typeFilter, priorityFilter]);

  const columns = useMemo(() => {
    return STATUSES.map(status => ({
      ...status,
      items: filtered
        .filter(r => r.status === status.id)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    }));
  }, [filtered]);

  const openCreate = () => {
    setEditingReq(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  };

  const openEdit = (req: Requirement) => {
    setEditingReq(req);
    setForm({
      title: req.title,
      description: req.description || '',
      type: req.type,
      priority: req.priority,
      storyPoints: req.storyPoints?.toString() || '',
      acceptanceCriteria: req.acceptanceCriteria || '',
      sprint: req.sprint || '',
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingReq(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    const payload = {
      ...form,
      storyPoints: form.storyPoints ? parseInt(form.storyPoints) : null,
      teamId: currentTeamId,
    };
    if (editingReq) {
      updateMutation.mutate({ id: editingReq.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDragStart = (e: React.DragEvent, reqId: string) => {
    setDraggedCard(reqId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (!draggedCard) return;
    const req = requirements.find(r => r.id === draggedCard);
    if (req && req.status !== targetStatus) {
      updateMutation.mutate({
        id: draggedCard,
        data: { status: targetStatus },
      });
    }
    setDraggedCard(null);
  };

  const getTypeConfig = (type: string) => TYPES.find(t => t.id === type) || TYPES[2];
  const getPriorityConfig = (priority: string) => PRIORITIES.find(p => p.id === priority) || PRIORITIES[1];

  if (!currentTeamId && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Kanban className="h-12 w-12 mb-4 opacity-30" />
        <p>No team found. Join or create a team to use the Kanban board.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Kanban className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Kanban Board</h2>
            <p className="text-sm text-muted-foreground">
              {requirements.length} items · {filtered.length} shown
            </p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requirements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TYPES.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {PRIORITIES.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Board */}
      {isLoading ? (
        <SkeletonPage />
      ) : (
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 min-h-0 overflow-auto pb-4">
          {columns.map(col => (
            <div
              key={col.id}
              className={`rounded-lg border ${col.color} flex flex-col min-h-[300px]`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="text-sm font-semibold">{col.name}</h3>
                <Badge variant="secondary" className="text-xs">{col.items.length}</Badge>
              </div>
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {col.items.map(req => {
                  const typeConf = getTypeConfig(req.type);
                  const prioConf = getPriorityConfig(req.priority);
                  const TypeIcon = typeConf.icon;
                  return (
                    <Card
                      key={req.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, req.id)}
                      className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
                        draggedCard === req.id ? 'opacity-50' : ''
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <TypeIcon className={`h-3.5 w-3.5 shrink-0 ${typeConf.color.split(' ')[0]}`} />
                              <span className="text-sm font-medium truncate">{req.title}</span>
                            </div>
                            {req.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{req.description}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${prioConf.color}`}>
                                  {req.priority}
                                </Badge>
                                {req.storyPoints != null && (
                                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{req.storyPoints} SP</span>
                                )}
                              </div>
                              <div className="flex gap-0.5">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(req)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDeleteTarget(req.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            {req.createdByName && (
                              <div className="flex items-center gap-1.5 mt-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-[10px]">{req.createdByName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] text-muted-foreground">{req.createdByName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {col.items.length === 0 && (
                  <div className="h-20 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                    Drop items here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Drawer */}
      <SmartDrawer open={drawerOpen} onOpenChange={(o) => { if (!o) closeDrawer(); }}>
        <SmartDrawerContent defaultWidth={672}>
          <SmartDrawerHeader>
            <SmartDrawerTitle>{editingReq ? 'Edit Requirement' : 'New Requirement'}</SmartDrawerTitle>
          </SmartDrawerHeader>
          <div className="space-y-4 py-4 px-1">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Requirement title" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Describe the requirement..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Story Points</Label>
                <Input type="number" min="0" max="100" value={form.storyPoints} onChange={(e) => setForm({ ...form, storyPoints: e.target.value })} placeholder="e.g. 5" />
              </div>
              <div>
                <Label>Sprint</Label>
                <Input value={form.sprint} onChange={(e) => setForm({ ...form, sprint: e.target.value })} placeholder="e.g. Sprint 1" />
              </div>
            </div>
            <div>
              <Label>Acceptance Criteria</Label>
              <Textarea value={form.acceptanceCriteria} onChange={(e) => setForm({ ...form, acceptanceCriteria: e.target.value })} rows={3} placeholder="Define the acceptance criteria..." />
            </div>
          </div>
          <SmartDrawerFooter>
            <Button variant="outline" onClick={closeDrawer}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {editingReq ? 'Update' : 'Create'}
            </Button>
          </SmartDrawerFooter>
        </SmartDrawerContent>
      </SmartDrawer>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Requirement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this requirement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); setDeleteTarget(null); }}
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
