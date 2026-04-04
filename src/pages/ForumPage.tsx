import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { toast } from 'sonner';
import {
  MessageSquare, Plus, Search, ThumbsUp, CheckCircle2, Pin, Lock, Eye,
  ArrowLeft, Send, Sparkles, MessagesSquare, Filter, Hash, Clock,
  MessageCircle, Lightbulb, BookOpen, Briefcase, Megaphone, HelpCircle,
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
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

/* ── Types ── */
interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  threadCount: number;
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorProfilePicture?: string;
  authorRole?: string;
  isPinned: boolean;
  isLocked: boolean;
  isResolved: boolean;
  threadType: string;
  viewCount: number;
  replyCount: number;
  likeCount: number;
  lastActivityAt: string;
  createdAt: string;
  tags?: string;
  category?: ForumCategory;
}

interface ForumPost {
  id: string;
  content: string;
  authorName: string;
  authorProfilePicture?: string;
  authorRole?: string;
  isAnswer: boolean;
  isEdited: boolean;
  likeCount: number;
  createdAt: string;
  parentPost?: { id: string };
}

/* ── View State ── */
type ViewState = 'categories' | 'threads' | 'thread-detail';

/* ── Category Icons ── */
const CATEGORY_ICONS: Record<string, any> = {
  'General Discussion': MessagesSquare,
  'Technical Help': HelpCircle,
  'Study Groups': BookOpen,
  'Career & Jobs': Briefcase,
  'Announcements': Megaphone,
  'Feedback & Suggestions': Lightbulb,
};

/* ── Component ── */
export default function ForumPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewState>('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateThreadOpen, setIsCreateThreadOpen] = useState(false);
  const [threadForm, setThreadForm] = useState({ title: '', content: '', threadType: 'DISCUSSION', tags: '' });
  const [replyContent, setReplyContent] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = ['Admin', 'Super_Admin'].includes(user?.role);
  const isStaff = ['Admin', 'Super_Admin', 'Tutor', 'Mentor'].includes(user?.role);
  // Can mark a post as the accepted answer: staff or thread author
  const canMarkAnswer = isStaff || (selectedThread?.authorName === `${user?.firstName} ${user?.lastName}`);

  // Categories
  const { data: categories = [], isLoading: catLoading } = useQuery<ForumCategory[]>({
    queryKey: ['forum-categories'],
    queryFn: async () => (await apiService.get(endpoints.getForumCategories)).data || [],
  });

  // Threads by category
  const { data: threads = [], isLoading: threadLoading } = useQuery<ForumThread[]>({
    queryKey: ['forum-threads', selectedCategoryId],
    queryFn: async () => {
      const r = (await apiService.get(endpoints.getForumThreadsByCategory(selectedCategoryId))).data;
      return Array.isArray(r) ? r : r?.content || [];
    },
    enabled: !!selectedCategoryId && view === 'threads',
  });

  // Search
  const { data: searchResults = [] } = useQuery<ForumThread[]>({
    queryKey: ['forum-search', searchTerm],
    queryFn: async () => {
      const r = await apiService.getWithParams(endpoints.searchForumThreads, { query: searchTerm });
      const d = r.data;
      return Array.isArray(d) ? d : d?.content || [];
    },
    enabled: searchTerm.length >= 3,
  });

  // Posts for selected thread
  const { data: posts = [], isLoading: postsLoading } = useQuery<ForumPost[]>({
    queryKey: ['forum-posts', selectedThread?.id],
    queryFn: async () => {
      const r = (await apiService.get(endpoints.getForumPosts(selectedThread!.id))).data;
      return Array.isArray(r) ? r : r?.content || [];
    },
    enabled: !!selectedThread?.id && view === 'thread-detail',
  });

  // Create thread
  const createThreadMut = useMutation({
    mutationFn: (data: any) => apiService.post(endpoints.createForumThread, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-threads', selectedCategoryId] });
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      setIsCreateThreadOpen(false);
      setThreadForm({ title: '', content: '', threadType: 'DISCUSSION', tags: '' });
      toast.success('Thread created!');
    },
    onError: () => toast.error('Failed to create thread'),
  });

  // Reply
  const replyMut = useMutation({
    mutationFn: (data: any) => apiService.post(endpoints.createForumPost, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts', selectedThread?.id] });
      setReplyContent('');
      toast.success('Reply posted!');
    },
  });

  // React
  const reactMut = useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: string }) =>
      apiService.post(`${endpoints.toggleForumReaction(postId)}?type=${encodeURIComponent(type)}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forum-posts', selectedThread?.id] }),
  });

  // Mark as answer
  const answerMut = useMutation({
    mutationFn: (postId: string) => apiService.patch(endpoints.markForumPostAsAnswer(postId), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts', selectedThread?.id] });
      toast.success('Marked as accepted answer!');
    },
  });

  // Pin/Lock
  const pinMut = useMutation({
    mutationFn: (threadId: string) => apiService.patch(endpoints.togglePinThread(threadId), {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forum-threads', selectedCategoryId] }),
  });

  const lockMut = useMutation({
    mutationFn: (threadId: string) => apiService.patch(endpoints.toggleLockThread(threadId), {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forum-threads', selectedCategoryId] }),
  });

  // Seed
  const seedMut = useMutation({
    mutationFn: () => apiService.post(endpoints.seedForumCategories, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      toast.success('Forum categories seeded!');
    },
  });

  const displayedThreads = searchTerm.length >= 3 ? searchResults : threads;

  const formatDate = (d: string) => {
    if (!d) return '—';
    const diffH = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const threadTypeIcon = (t: string) => {
    switch (t) {
      case 'QUESTION': return <HelpCircle className="h-4 w-4 text-blue-500" />;
      case 'ANNOUNCEMENT': return <Megaphone className="h-4 w-4 text-orange-500" />;
      case 'RESOURCE': return <BookOpen className="h-4 w-4 text-emerald-500" />;
      default: return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // ── Categories View ──
  if (view === 'categories') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessagesSquare className="h-6 w-6 text-primary" /> Discussion Forum
            </h1>
            <p className="text-muted-foreground mt-1">Engage with your community, ask questions, and share knowledge</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && categories.length === 0 && (
              <Button variant="outline" size="sm" onClick={() => seedMut.mutate()} disabled={seedMut.isPending}>
                <Sparkles className="h-4 w-4 mr-1" /> Seed Categories
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search threads..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        {/* Search Results */}
        {searchTerm.length >= 3 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Search Results</CardTitle></CardHeader>
            <CardContent>
              {searchResults.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No threads found matching "{searchTerm}"</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map(t => (
                    <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => { setSelectedThread(t); setView('thread-detail'); }}>
                      {threadTypeIcon(t.threadType)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.authorName} · {formatDate(t.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{t.replyCount}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{t.viewCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Categories Grid */}
        {catLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <MessagesSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold">No Forum Categories</p>
              <p className="text-sm text-muted-foreground mt-1">An admin needs to set up categories first</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => {
              const Icon = CATEGORY_ICONS[cat.name] || Hash;
              return (
                <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
                    onClick={() => { setSelectedCategoryId(cat.id); setView('threads'); }}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{cat.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>
                          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            <span>{cat.threadCount || 0} threads</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Thread List View ──
  if (view === 'threads') {
    const currentCategory = categories.find(c => c.id === selectedCategoryId);
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { setView('categories'); setSearchTerm(''); }}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{currentCategory?.name || 'Threads'}</h1>
              <p className="text-muted-foreground text-sm">{currentCategory?.description}</p>
            </div>
          </div>
          <SmartDrawer open={isCreateThreadOpen} onOpenChange={setIsCreateThreadOpen}>
            <SmartDrawerTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> New Thread</Button>
            </SmartDrawerTrigger>
            <SmartDrawerContent>
              <SmartDrawerHeader>
                <SmartDrawerTitle>Create New Thread</SmartDrawerTitle>
                <SmartDrawerDescription>Start a new discussion in {currentCategory?.name}</SmartDrawerDescription>
              </SmartDrawerHeader>
              <div className="space-y-4">
                <div><Label>Title *</Label><Input placeholder="Thread title..." value={threadForm.title} onChange={e => setThreadForm(p => ({ ...p, title: e.target.value }))} /></div>
                <div><Label>Content *</Label><Textarea placeholder="Write your post..." rows={6} value={threadForm.content} onChange={e => setThreadForm(p => ({ ...p, content: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <Select value={threadForm.threadType} onValueChange={v => setThreadForm(p => ({ ...p, threadType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DISCUSSION">Discussion</SelectItem>
                        <SelectItem value="QUESTION">Question</SelectItem>
                        <SelectItem value="RESOURCE">Resource</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Tags</Label><Input placeholder="comma-separated" value={threadForm.tags} onChange={e => setThreadForm(p => ({ ...p, tags: e.target.value }))} /></div>
                </div>
              </div>
              <SmartDrawerFooter>
                <SmartDrawerClose asChild><Button variant="outline">Cancel</Button></SmartDrawerClose>
                <Button onClick={() => {
                  if (!threadForm.title.trim() || !threadForm.content.trim()) { toast.error('Fill in required fields'); return; }
                  createThreadMut.mutate({ ...threadForm, categoryId: selectedCategoryId });
                }} disabled={createThreadMut.isPending}>
                  <Send className="mr-2 h-4 w-4" /> Post
                </Button>
              </SmartDrawerFooter>
            </SmartDrawerContent>
          </SmartDrawer>
        </div>

        {threadLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div>
        ) : displayedThreads.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold">No threads yet</p>
              <p className="text-sm text-muted-foreground">Be the first to start a discussion!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {displayedThreads.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className={`cursor-pointer hover:shadow-md transition-all ${t.isPinned ? 'border-primary/30 bg-primary/5' : ''}`}
                  onClick={() => { setSelectedThread(t); setView('thread-detail'); }}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 shrink-0 mt-0.5">
                        <AvatarImage src={t.authorProfilePicture} />
                        <AvatarFallback className="text-xs">{t.authorName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {t.isPinned && <Pin className="h-3 w-3 text-primary" />}
                          {t.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                          {threadTypeIcon(t.threadType)}
                          <h3 className="font-semibold text-sm">{t.title}</h3>
                          {t.isResolved && <Badge className="bg-emerald-500 text-white text-[10px]">Resolved</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{t.content}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span>{t.authorName}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(t.lastActivityAt || t.createdAt)}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{t.replyCount}</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{t.viewCount}</span>
                          <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{t.likeCount}</span>
                        </div>
                        {t.tags && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {t.tags.split(',').filter(Boolean).map(tag => (
                              <Badge key={tag.trim()} variant="outline" className="text-[10px]">{tag.trim()}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex flex-col gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={e => { e.stopPropagation(); pinMut.mutate(t.id); }}>
                            <Pin className={`h-3.5 w-3.5 ${t.isPinned ? 'text-primary fill-primary' : ''}`} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={e => { e.stopPropagation(); lockMut.mutate(t.id); }}>
                            <Lock className={`h-3.5 w-3.5 ${t.isLocked ? 'text-destructive' : ''}`} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Thread Detail View ──
  return (
    <div className="space-y-6">
      {/* Back + Thread Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => { setView('threads'); setSelectedThread(null); }}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {selectedThread?.isPinned && <Pin className="h-4 w-4 text-primary" />}
            {selectedThread?.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
            {threadTypeIcon(selectedThread?.threadType || '')}
            <h1 className="text-xl font-bold">{selectedThread?.title}</h1>
            {selectedThread?.isResolved && <Badge className="bg-emerald-500 text-white">Resolved</Badge>}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{selectedThread?.authorName}</span>
            <span>·</span>
            <span>{formatDate(selectedThread?.createdAt || '')}</span>
            <span>·</span>
            <span>{selectedThread?.viewCount} views</span>
          </div>
        </div>
      </div>

      {/* OP Content */}
      <Card>
        <CardContent className="p-5">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={selectedThread?.authorProfilePicture} />
              <AvatarFallback>{selectedThread?.authorName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm">{selectedThread?.authorName}</span>
                {selectedThread?.authorRole && <Badge variant="outline" className="text-[10px]">{selectedThread.authorRole}</Badge>}
              </div>
              <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap">{selectedThread?.content}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Replies */}
      <div>
        <h3 className="font-semibold text-sm mb-4">{posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}</h3>
        {postsLoading ? (
          <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-24" />)}</div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={post.isAnswer ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/20' : ''}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={post.authorProfilePicture} />
                        <AvatarFallback className="text-xs">{post.authorName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{post.authorName}</span>
                            {post.authorRole && <Badge variant="outline" className="text-[10px]">{post.authorRole}</Badge>}
                            {post.isAnswer && <Badge className="bg-emerald-500 text-white text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1" />Answer</Badge>}
                            {post.isEdited && <span className="text-[10px] text-muted-foreground">(edited)</span>}
                          </div>
                          <span className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={() => reactMut.mutate({ postId: post.id, type: 'LIKE' })}>
                            <ThumbsUp className="h-3.5 w-3.5 mr-1" /> {post.likeCount || 0}
                          </Button>
                          {selectedThread?.threadType === 'QUESTION' && !post.isAnswer && canMarkAnswer && (
                            <Button variant="ghost" size="sm" className="h-9 text-xs text-emerald-600"
                              onClick={() => answerMut.mutate(post.id)}>
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Accept Answer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Box */}
      {!selectedThread?.isLocked && (
        <Card>
          <CardContent className="p-4">
            <Textarea placeholder="Write your reply..." rows={4} value={replyContent} onChange={e => setReplyContent(e.target.value)} />
            <div className="flex justify-end mt-3">
              <Button onClick={() => {
                if (!replyContent.trim()) { toast.error('Please write something'); return; }
                replyMut.mutate({ threadId: selectedThread?.id, content: replyContent });
              }} disabled={replyMut.isPending}>
                <Send className="h-4 w-4 mr-2" /> {replyMut.isPending ? 'Posting...' : 'Reply'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {selectedThread?.isLocked && (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            <Lock className="h-5 w-5 mx-auto mb-2" />
            <p className="text-sm">This thread is locked. No new replies can be posted.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
