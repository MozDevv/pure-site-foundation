import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartDrawer, SmartDrawerContent, SmartDrawerFooter, SmartDrawerHeader, SmartDrawerTitle } from '@/components/ui/smart-drawer';
import { useToast } from '@/hooks/use-toast';
import {
  TicketIcon, Clock, AlertTriangle, CheckCircle2, ArrowUpCircle,
  MessageSquare, Plus, Pencil, Trash2, BookOpen, FolderOpen, Video,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SkeletonPage } from '@/components/ui/animations';

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  OPEN: 'default',
  IN_PROGRESS: 'default',
  AWAITING_RESPONSE: 'secondary',
  ESCALATED: 'destructive',
  RESOLVED: 'outline',
  CLOSED: 'outline',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200',
  MEDIUM: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  HIGH: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
  URGENT: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
};

export default function AdminSupportDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [deleteArticleDialogOpen, setDeleteArticleDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);

  // KB state
  const [kbDialog, setKbDialog]           = useState<'article' | 'category' | null>(null);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [articleForm, setArticleForm] = useState({
    title: '', summary: '', content: '', articleType: 'FAQ',
    videoUrl: '', tags: '', categoryId: '',
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '', description: '', iconEmoji: '📚', sortOrder: 0,
  });

  // Stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['supportStats'],
    queryFn: () => apiService.get(endpoints.getSupportTicketStats).then(r => r.data),
  });

  // All tickets
  const { data: ticketsData } = useQuery({
    queryKey: ['allSupportTickets', statusFilter],
    queryFn: () => {
      if (statusFilter === 'all') return apiService.get(endpoints.getAllSupportTickets).then(r => r.data);
      return apiService.get(endpoints.getSupportTicketsByStatus(statusFilter)).then(r => r.data);
    },
  });
  const tickets = ticketsData?.content || ticketsData || [];

  // Assigned tickets
  const { data: assignedData } = useQuery({
    queryKey: ['assignedTickets'],
    queryFn: () => apiService.get(endpoints.getAssignedSupportTickets).then(r => r.data),
  });
  const assignedTickets = assignedData?.content || assignedData || [];

  // KB queries
  const { data: kbCategories = [], refetch: refetchCategories } = useQuery<any[]>({
    queryKey: ['kbCategories'],
    queryFn: () => apiService.get(endpoints.getKBCategories).then(r => r.data),
  });
  const { data: kbArticles = [], refetch: refetchArticles } = useQuery<any[]>({
    queryKey: ['kbArticles', selectedCategoryId],
    queryFn: () => selectedCategoryId
      ? apiService.get(endpoints.getKBArticlesByCategory(selectedCategoryId)).then(r => r.data)
      : apiService.get(`/support/kb/articles`).then(r => r.data?.content ?? r.data ?? []),
  });

  // KB mutations
  const createArticleMutation = useMutation({
    mutationFn: (data: any) => apiService.post(endpoints.createKBArticle, data),
    onSuccess: () => {
      toast({ title: 'Article created' });
      queryClient.invalidateQueries({ queryKey: ['kbArticles'] });
      setKbDialog(null);
      resetArticleForm();
    },
  });
  const updateArticleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiService.put(endpoints.updateKBArticle(id), data),
    onSuccess: () => {
      toast({ title: 'Article updated' });
      queryClient.invalidateQueries({ queryKey: ['kbArticles'] });
      setKbDialog(null);
      setEditingArticle(null);
      resetArticleForm();
    },
  });
  const deleteArticleMutation = useMutation({
    mutationFn: (id: string) => apiService.delete(endpoints.deleteKBArticle(id)),
    onSuccess: () => {
      toast({ title: 'Article deleted' });
      queryClient.invalidateQueries({ queryKey: ['kbArticles'] });
    },
  });
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => apiService.post(endpoints.createKBCategory, data),
    onSuccess: () => {
      toast({ title: 'Category created' });
      refetchCategories();
      setKbDialog(null);
      setCategoryForm({ name: '', description: '', iconEmoji: '📚', sortOrder: 0 });
    },
  });

  function resetArticleForm() {
    setArticleForm({ title: '', summary: '', content: '', articleType: 'FAQ', videoUrl: '', tags: '', categoryId: '' });
  }
  function openEditArticle(article: any) {
    setEditingArticle(article);
    setArticleForm({
      title: article.title ?? '',
      summary: article.summary ?? '',
      content: article.content ?? '',
      articleType: article.articleType ?? 'FAQ',
      videoUrl: article.videoUrl ?? '',
      tags: (article.tags ?? []).join(', '),
      categoryId: article.category?.id ?? article.categoryId ?? '',
    });
    setKbDialog('article');
  }
  function handleArticleSubmit() {
    const payload = {
      ...articleForm,
      tags: articleForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      categoryId: articleForm.categoryId || undefined,
      videoUrl: articleForm.videoUrl || undefined,
    };
    if (editingArticle) {
      updateArticleMutation.mutate({ id: editingArticle.id, data: payload });
    } else {
      createArticleMutation.mutate(payload);
    }
  }

  // Comments
  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ['ticketComments', selectedTicket?.id],
    queryFn: () => apiService.get(endpoints.getSupportTicketComments(selectedTicket!.id)).then(r => r.data),
    enabled: !!selectedTicket,
  });

  // Update status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiService.patch(endpoints.updateSupportTicketStatus(id), { status }),
    onSuccess: () => {
      toast({ title: 'Status updated' });
      queryClient.invalidateQueries({ queryKey: ['allSupportTickets'] });
      queryClient.invalidateQueries({ queryKey: ['supportStats'] });
    },
  });

  // Escalate
  const escalateMutation = useMutation({
    mutationFn: (id: string) => apiService.patch(endpoints.escalateSupportTicket(id)),
    onSuccess: () => {
      toast({ title: 'Ticket escalated' });
      queryClient.invalidateQueries({ queryKey: ['allSupportTickets'] });
    },
  });

  // Add comment
  const addCommentMutation = useMutation({
    mutationFn: (data: { content: string; isInternal: boolean }) =>
      apiService.post(endpoints.addSupportTicketComment(selectedTicket!.id), data),
    onSuccess: () => {
      setNewComment('');
      refetchComments();
    },
  });

  if (isLoading) {
    return <SkeletonPage />;
  }

  const renderTicketList = (ticketList: any[]) => (
    <div className="space-y-2">
      {ticketList.map((ticket: any) => (
        <div
          key={ticket.id}
          className="flex items-center justify-between p-3 border rounded-md hover:bg-muted cursor-pointer"
          onClick={() => setSelectedTicket(ticket)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">{ticket.ticketNumber}</span>
              <span className="font-medium">{ticket.subject}</span>
              {ticket.escalationLevel > 0 && (
                <Badge variant="destructive" className="text-xs">L{ticket.escalationLevel}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate max-w-[400px]">{ticket.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
              {ticket.priority}
            </span>
            <Badge variant={STATUS_COLORS[ticket.status]}>{ticket.status?.replace('_', ' ')}</Badge>
          </div>
        </div>
      ))}
      {ticketList.length === 0 && (
        <p className="text-center py-8 text-muted-foreground">No tickets found</p>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Support Dashboard</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-3 flex items-center gap-3">
              <TicketIcon className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold">{stats.open || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Escalated</p>
                <p className="text-2xl font-bold">{stats.escalated || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{stats.resolved || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTicket ? (
        <Card>
          <CardHeader>
            <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)} className="w-fit">
              ← Back
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedTicket.ticketNumber}: {selectedTicket.subject}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Category: {selectedTicket.category} • Created: {new Date(selectedTicket.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedTicket.status}
                  onValueChange={v => {
                    updateStatusMutation.mutate({ id: selectedTicket.id, status: v });
                    setSelectedTicket({ ...selectedTicket, status: v });
                  }}
                >
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['OPEN', 'IN_PROGRESS', 'AWAITING_RESPONSE', 'RESOLVED', 'CLOSED'].map(s => (
                      <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline" size="sm"
                  onClick={() => escalateMutation.mutate(selectedTicket.id)}
                >
                  <ArrowUpCircle className="w-4 h-4 mr-1" /> Escalate
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Comments</h3>
              {comments?.map((c: any) => (
                <div key={c.id} className={`p-3 border rounded-md ${c.isInternal ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' : ''}`}>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <div className="flex items-center gap-2">
                      <span>{c.user?.firstName} {c.user?.lastName}</span>
                      {c.isInternal && <Badge variant="outline" className="text-xs">Internal</Badge>}
                    </div>
                    <span>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm">{c.content}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={e => setIsInternal(e.target.checked)}
                    className="rounded"
                  />
                  Internal note (not visible to user)
                </label>
                <Button
                  size="sm"
                  onClick={() => addCommentMutation.mutate({ content: newComment, isInternal })}
                  disabled={!newComment.trim()}
                >
                  <MessageSquare className="w-4 h-4 mr-1" /> Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
            <TabsTrigger value="kb"><BookOpen className="w-4 h-4 mr-1 inline" />Knowledge Base</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="flex gap-2 mb-4">
              {['all', 'OPEN', 'IN_PROGRESS', 'ESCALATED', 'AWAITING_RESPONSE', 'RESOLVED'].map(s => (
                <Button
                  key={s}
                  variant={statusFilter === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(s)}
                >
                  {s === 'all' ? 'All' : s.replace('_', ' ')}
                </Button>
              ))}
            </div>
            {renderTicketList(tickets)}
          </TabsContent>

          <TabsContent value="assigned">
            {renderTicketList(assignedTickets)}
          </TabsContent>

          <TabsContent value="kb">
            <div className="space-y-4">
              {/* Actions row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {kbCategories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.iconEmoji} {c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setKbDialog('category'); }}>
                    <FolderOpen className="w-4 h-4 mr-1" /> New Category
                  </Button>
                  <Button size="sm" onClick={() => { setEditingArticle(null); resetArticleForm(); setKbDialog('article'); }}>
                    <Plus className="w-4 h-4 mr-1" /> New Article
                  </Button>
                </div>
              </div>

              {/* Categories summary */}
              {kbCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {kbCategories.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategoryId(prev => prev === c.id ? '' : c.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm transition-colors ${
                        selectedCategoryId === c.id ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
                      }`}
                    >
                      <span>{c.iconEmoji}</span>
                      <span>{c.name}</span>
                      <Badge variant="secondary" className="ml-1 text-xs">{c.articleCount ?? 0}</Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* Articles list */}
              <div className="space-y-2">
                {kbArticles.map((article: any) => (
                  <div key={article.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={article.articleType === 'VIDEO' ? 'default' : 'outline'} className="shrink-0">
                          {article.articleType === 'VIDEO' && <Video className="w-3 h-3 mr-1" />}
                          {article.articleType}
                        </Badge>
                        <span className="font-medium truncate">{article.title}</span>
                        {article.category && (
                          <span className="text-xs text-muted-foreground">{article.category.iconEmoji} {article.category.name}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">{article.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs text-muted-foreground">{article.helpfulCount ?? 0} helpful</span>
                      <Button variant="ghost" size="sm" onClick={() => openEditArticle(article)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => { setArticleToDelete(article.id); setDeleteArticleDialogOpen(true); }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {kbArticles.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No articles found. Click "New Article" to create one.</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Article Dialog */}
        <SmartDrawer open={kbDialog === 'article'} onOpenChange={o => { if (!o) { setKbDialog(null); setEditingArticle(null); } }}>
          <SmartDrawerContent defaultWidth={672}>
            <SmartDrawerHeader>
              <SmartDrawerTitle>{editingArticle ? 'Edit Article' : 'New KB Article'}</SmartDrawerTitle>
            </SmartDrawerHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label>Title *</Label>
                  <Input value={articleForm.title} onChange={e => setArticleForm(f => ({ ...f, title: e.target.value }))} placeholder="Article title" />
                </div>
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select value={articleForm.articleType} onValueChange={v => setArticleForm(f => ({ ...f, articleType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['FAQ', 'GUIDE', 'VIDEO', 'TUTORIAL', 'ANNOUNCEMENT'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Category</Label>
                  <Select value={articleForm.categoryId} onValueChange={v => setArticleForm(f => ({ ...f, categoryId: v }))}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {kbCategories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.iconEmoji} {c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Summary</Label>
                  <Input value={articleForm.summary} onChange={e => setArticleForm(f => ({ ...f, summary: e.target.value }))} placeholder="Short description shown in listings" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Content *</Label>
                  <Textarea value={articleForm.content} onChange={e => setArticleForm(f => ({ ...f, content: e.target.value }))} rows={8} placeholder="Full article content (Markdown supported)" className="font-mono text-sm" />
                </div>
                {(articleForm.articleType === 'VIDEO' || articleForm.videoUrl) && (
                  <div className="col-span-2 space-y-1">
                    <Label>Video URL</Label>
                    <Input value={articleForm.videoUrl} onChange={e => setArticleForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="https://youtube.com/embed/... or direct MP4 URL" />
                  </div>
                )}
                <div className="col-span-2 space-y-1">
                  <Label>Tags <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
                  <Input value={articleForm.tags} onChange={e => setArticleForm(f => ({ ...f, tags: e.target.value }))} placeholder="onboarding, password, billing" />
                </div>
              </div>
            </div>
            <SmartDrawerFooter>
              <Button variant="outline" onClick={() => { setKbDialog(null); setEditingArticle(null); }}>Cancel</Button>
              <Button
                onClick={handleArticleSubmit}
                disabled={!articleForm.title.trim() || !articleForm.content.trim() || createArticleMutation.isPending || updateArticleMutation.isPending}
              >
                {editingArticle ? 'Update' : 'Create'} Article
              </Button>
            </SmartDrawerFooter>
          </SmartDrawerContent>
        </SmartDrawer>

        {/* Category Dialog */}
        <SmartDrawer open={kbDialog === 'category'} onOpenChange={o => { if (!o) setKbDialog(null); }}>
          <SmartDrawerContent>
            <SmartDrawerHeader>
              <SmartDrawerTitle>New KB Category</SmartDrawerTitle>
            </SmartDrawerHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Name *</Label>
                <Input value={categoryForm.name} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Getting Started" />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Input value={categoryForm.description} onChange={e => setCategoryForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Icon (emoji)</Label>
                  <Input value={categoryForm.iconEmoji} onChange={e => setCategoryForm(f => ({ ...f, iconEmoji: e.target.value }))} placeholder="📚" maxLength={4} />
                </div>
                <div className="space-y-1">
                  <Label>Sort Order</Label>
                  <Input type="number" value={categoryForm.sortOrder} onChange={e => setCategoryForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} min={0} />
                </div>
              </div>
            </div>
            <SmartDrawerFooter>
              <Button variant="outline" onClick={() => setKbDialog(null)}>Cancel</Button>
              <Button
                onClick={() => createCategoryMutation.mutate(categoryForm)}
                disabled={!categoryForm.name.trim() || createCategoryMutation.isPending}
              >
                Create Category
              </Button>
            </SmartDrawerFooter>
          </SmartDrawerContent>
        </SmartDrawer>

        <AlertDialog open={deleteArticleDialogOpen} onOpenChange={setDeleteArticleDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Article</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this knowledge base article? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => { if (articleToDelete) deleteArticleMutation.mutate(articleToDelete); setDeleteArticleDialogOpen(false); setArticleToDelete(null); }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </>
      )}
    </div>
  );
}
