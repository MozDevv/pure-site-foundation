import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { toast } from 'sonner';
import {
  Megaphone, Plus, Search, Send, Users, Clock, Trash2, Pin, Filter, Eye, Bell,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  SmartDrawer, SmartDrawerContent, SmartDrawerDescription, SmartDrawerHeader, SmartDrawerTitle,
  SmartDrawerTrigger, SmartDrawerFooter, SmartDrawerClose,
} from '@/components/ui/smart-drawer';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  isPinned: boolean;
  isPublished: boolean;
  targetRole: string;
  readCount: number;
  expiresAt?: string;
  createdAt: string;
  author?: { firstName: string; lastName: string; profilePicture?: string };
  authorName?: string;
}

export default function AnnouncementsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', content: '', priority: 'NORMAL', category: 'GENERAL', targetRole: 'ALL',
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user?.role?.toLowerCase() || '';
  const canCreate = ['admin', 'super_admin', 'tutor'].includes(userRole);

  // Fetch announcements (role-filtered)
  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      const r = await apiService.get(endpoints.getAnnouncements);
      // Backend returns Page<Announcement> — extract .content array
      const data = r.data;
      if (Array.isArray(data)) return data;
      return data?.content || [];
    },
  });

  // Create
  const createMut = useMutation({
    mutationFn: (data: typeof form) => apiService.post(endpoints.createAnnouncement, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setIsCreateOpen(false);
      setForm({ title: '', content: '', priority: 'NORMAL', category: 'GENERAL', targetRole: 'ALL' });
      toast.success('Announcement published successfully');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to publish announcement'),
  });

  // Delete
  const deleteMut = useMutation({
    mutationFn: (id: string) => apiService.delete(endpoints.deleteAnnouncement(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted');
    },
  });

  // Mark read
  const readMut = useMutation({
    mutationFn: (id: string) => apiService.post(endpoints.markAnnouncementRead(id), {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });

  const filtered = useMemo(() => {
    return announcements
      .filter(a => {
        const mSearch = a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.content?.toLowerCase().includes(searchTerm.toLowerCase());
        const mPriority = priorityFilter === 'all' || a.priority?.toLowerCase() === priorityFilter;
        return mSearch && mPriority;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [announcements, searchTerm, priorityFilter]);

  const handleCreate = () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMut.mutate(form);
  };

  const getPriorityBadge = (p: string) => {
    switch (p?.toUpperCase()) {
      case 'URGENT': return <Badge variant="destructive">Urgent</Badge>;
      case 'HIGH': return <Badge className="bg-orange-500 text-white">High</Badge>;
      case 'NORMAL': return <Badge variant="secondary">Normal</Badge>;
      case 'LOW': return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="outline">{p}</Badge>;
    }
  };

  const getCategoryBadge = (c: string) => {
    const colors: Record<string, string> = {
      GENERAL: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', ACADEMIC: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      ADMINISTRATIVE: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300', URGENT: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      EVENT: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', MAINTENANCE: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    };
    return <Badge variant="outline" className={`text-xs ${colors[c] || ''}`}>{c}</Badge>;
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    try {
      const date = new Date(d);
      const diffH = Math.floor((Date.now() - date.getTime()) / 3600000);
      if (diffH < 1) return 'Just now';
      if (diffH < 24) return `${diffH}h ago`;
      const diffD = Math.floor(diffH / 24);
      if (diffD < 7) return `${diffD}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch { return d; }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}</div>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" /> Announcements
          </h1>
          <p className="text-muted-foreground mt-1">Stay updated with the latest news and important notices</p>
        </div>
        {canCreate && (
          <SmartDrawer open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <SmartDrawerTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> New Announcement</Button>
            </SmartDrawerTrigger>
            <SmartDrawerContent>
              <SmartDrawerHeader>
                <SmartDrawerTitle>Create Announcement</SmartDrawerTitle>
                <SmartDrawerDescription>Publish a new announcement to your audience</SmartDrawerDescription>
              </SmartDrawerHeader>
              <div className="space-y-4">
                <div><Label>Title *</Label><Input placeholder="Announcement title..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                <div><Label>Content *</Label><Textarea placeholder="Write your announcement..." rows={5} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">General</SelectItem>
                        <SelectItem value="ACADEMIC">Academic</SelectItem>
                        <SelectItem value="ADMINISTRATIVE">Admin</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                        <SelectItem value="EVENT">Event</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Audience</Label>
                    <Select value={form.targetRole} onValueChange={v => setForm(p => ({ ...p, targetRole: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Users</SelectItem>
                        <SelectItem value="STUDENT">Students</SelectItem>
                        <SelectItem value="TUTOR">Tutors</SelectItem>
                        <SelectItem value="MENTOR">Mentors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <SmartDrawerFooter>
                <SmartDrawerClose asChild><Button variant="outline">Cancel</Button></SmartDrawerClose>
                <Button onClick={handleCreate} disabled={createMut.isPending}>
                  <Send className="mr-2 h-4 w-4" />{createMut.isPending ? 'Publishing...' : 'Publish'}
                </Button>
              </SmartDrawerFooter>
            </SmartDrawerContent>
          </SmartDrawer>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search announcements..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[160px]"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="All Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Megaphone, color: 'text-primary', val: announcements.length, label: 'Total' },
          { icon: Pin, color: 'text-orange-500', val: announcements.filter(a => a.isPinned).length, label: 'Pinned' },
          { icon: Bell, color: 'text-red-500', val: announcements.filter(a => a.priority === 'URGENT').length, label: 'Urgent' },
          { icon: Eye, color: 'text-green-500', val: announcements.reduce((s, a) => s + (a.readCount || 0), 0), label: 'Total Reads' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold">{s.val}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Announcements</h3>
              <p className="text-muted-foreground text-center max-w-md">
                {searchTerm || priorityFilter !== 'all' ? 'No announcements match your filters.' : 'No announcements have been published yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={`transition-all hover:shadow-md ${a.isPinned ? 'border-primary/30 bg-primary/5' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {a.isPinned && <Pin className="h-4 w-4 text-primary shrink-0" />}
                        <h3 className="font-semibold text-lg">{a.title}</h3>
                        {getPriorityBadge(a.priority)}
                        {getCategoryBadge(a.category)}
                        <Badge variant="outline" className="text-xs">{a.targetRole === 'ALL' ? 'Everyone' : a.targetRole}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap line-clamp-4">{a.content}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={a.author?.profilePicture} />
                            <AvatarFallback className="text-[10px]">{(a.authorName || a.author?.firstName || 'A').charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{a.authorName || (a.author ? `${a.author.firstName} ${a.author.lastName}` : 'System')}</span>
                        </div>
                        <span>·</span>
                        <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(a.createdAt)}</div>
                        <span>·</span>
                        <div className="flex items-center gap-1"><Eye className="h-3 w-3" />{a.readCount || 0} reads</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => readMut.mutate(a.id)} title="Mark as read">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canCreate && (
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:text-destructive"
                          onClick={() => { setAnnouncementToDelete(a.id); setDeleteDialogOpen(true); }} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (announcementToDelete) deleteMut.mutate(announcementToDelete); setDeleteDialogOpen(false); setAnnouncementToDelete(null); }}
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
