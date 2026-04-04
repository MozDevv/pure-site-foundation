import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SmartDrawer, SmartDrawerContent, SmartDrawerHeader, SmartDrawerTitle, SmartDrawerTrigger } from '@/components/ui/smart-drawer';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  TicketIcon, Plus, Search, MessageSquare, AlertTriangle, Clock,
  ChevronRight, BookOpen, HelpCircle, Video, ThumbsUp, ThumbsDown,
  BarChart3, ArrowLeft,
} from 'lucide-react';
import { SkeletonPage } from '@/components/ui/animations';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  escalationLevel: number;
  createdAt: string;
  updatedAt: string;
}

interface TicketComment {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  user?: { firstName: string; lastName: string };
}

interface KBArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  articleType: string;
  tags: string;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  videoUrl?: string;
  category?: { name: string };
}

interface KBCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200',
  MEDIUM: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  HIGH: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
  URGENT: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
};

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  OPEN: 'default',
  IN_PROGRESS: 'default',
  AWAITING_RESPONSE: 'secondary',
  ESCALATED: 'destructive',
  RESOLVED: 'outline',
  CLOSED: 'outline',
};

export default function SupportPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('my-tickets');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);
  const [newComment, setNewComment] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTicket, setNewTicket] = useState({
    subject: '', description: '', category: 'GENERAL', priority: 'MEDIUM',
  });

  // My tickets
  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['myTickets'],
    queryFn: () => apiService.get(endpoints.getMySupportTickets).then(r => r.data),
  });
  const tickets: SupportTicket[] = ticketsData?.content || ticketsData || [];

  // Ticket comments
  const { data: comments, refetch: refetchComments } = useQuery<TicketComment[]>({
    queryKey: ['ticketComments', selectedTicket?.id],
    queryFn: () => apiService.get(endpoints.getSupportTicketComments(selectedTicket!.id)).then(r => r.data),
    enabled: !!selectedTicket,
  });

  // KB Categories
  const { data: kbCategories } = useQuery<KBCategory[]>({
    queryKey: ['kbCategories'],
    queryFn: () => apiService.get(endpoints.getKBCategories).then(r => r.data),
  });

  // FAQs
  const { data: faqs } = useQuery<KBArticle[]>({
    queryKey: ['kbFAQs'],
    queryFn: () => apiService.get(endpoints.getKBFAQs).then(r => r.data),
  });

  // KB search
  const { data: searchResults } = useQuery({
    queryKey: ['kbSearch', searchQuery],
    queryFn: () => apiService.getWithParams(endpoints.searchKB, { query: searchQuery }).then(r => r.data),
    enabled: searchQuery.length > 2,
  });

  // Create ticket
  const createTicketMutation = useMutation({
    mutationFn: (data: typeof newTicket) => apiService.post(endpoints.createSupportTicket, data).then(r => r.data),
    onSuccess: () => {
      toast({ title: 'Ticket created', description: 'Your support ticket has been submitted.' });
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
      setCreateDialogOpen(false);
      setNewTicket({ subject: '', description: '', category: 'GENERAL', priority: 'MEDIUM' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create ticket', variant: 'destructive' }),
  });

  // Add comment
  const addCommentMutation = useMutation({
    mutationFn: (data: { content: string }) =>
      apiService.post(endpoints.addSupportTicketComment(selectedTicket!.id), data).then(r => r.data),
    onSuccess: () => {
      setNewComment('');
      refetchComments();
      toast({ title: 'Comment added' });
    },
  });

  // KB helpful vote
  const helpfulMutation = useMutation({
    mutationFn: ({ id, helpful }: { id: string; helpful: boolean }) =>
      apiService.post(endpoints.markKBArticleHelpful(id), { helpful }),
  });

  if (isLoading) {
    return <SkeletonPage />;
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground">Get help, browse FAQs, or submit a support ticket</p>
        </div>
        <SmartDrawer open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <SmartDrawerTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1" /> New Ticket</Button>
          </SmartDrawerTrigger>
          <SmartDrawerContent>
            <SmartDrawerHeader>
              <SmartDrawerTitle>Create Support Ticket</SmartDrawerTitle>
            </SmartDrawerHeader>
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <Input
                  value={newTicket.subject}
                  onChange={e => setNewTicket(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newTicket.description}
                  onChange={e => setNewTicket(p => ({ ...p, description: e.target.value }))}
                  placeholder="Provide details..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={newTicket.category} onValueChange={v => setNewTicket(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['ACCOUNT', 'COURSE', 'ASSESSMENT', 'TECHNICAL', 'BILLING', 'GENERAL', 'BUG_REPORT', 'FEATURE_REQUEST'].map(c => (
                        <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={newTicket.priority} onValueChange={v => setNewTicket(p => ({ ...p, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => createTicketMutation.mutate(newTicket)}
                disabled={!newTicket.subject || !newTicket.description || createTicketMutation.isPending}
              >
                Submit Ticket
              </Button>
            </div>
          </SmartDrawerContent>
        </SmartDrawer>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-tickets"><TicketIcon className="w-4 h-4 mr-1" /> My Tickets</TabsTrigger>
          <TabsTrigger value="faq"><HelpCircle className="w-4 h-4 mr-1" /> FAQs</TabsTrigger>
          <TabsTrigger value="kb"><BookOpen className="w-4 h-4 mr-1" /> Knowledge Base</TabsTrigger>
        </TabsList>

        {/* My Tickets */}
        <TabsContent value="my-tickets">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)} className="mb-2">
                      ← Back to tickets
                    </Button>
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <CardDescription>
                      {selectedTicket.ticketNumber} • {new Date(selectedTicket.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[selectedTicket.priority]}`}>
                      {selectedTicket.priority}
                    </span>
                    <Badge variant={STATUS_COLORS[selectedTicket.status]}>{selectedTicket.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>

                {/* Comments thread */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Comments</h3>
                  {comments?.map((comment) => (
                    <div key={comment.id} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>{comment.user?.firstName} {comment.user?.lastName}</span>
                        <span>{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                  {(!comments || comments.length === 0) && (
                    <p className="text-sm text-muted-foreground">No comments yet</p>
                  )}
                </div>

                {/* Add comment */}
                <div className="flex gap-2">
                  <Textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => addCommentMutation.mutate({ content: newComment })}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {tickets.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <TicketIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No support tickets yet</p>
                    <p className="text-sm">Create a ticket if you need help</p>
                  </CardContent>
                </Card>
              ) : (
                tickets.map((ticket: SupportTicket) => (
                  <Card
                    key={ticket.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                            <h3 className="font-medium">{ticket.subject}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 truncate max-w-[500px]">
                            {ticket.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                            {ticket.priority}
                          </span>
                          <Badge variant={STATUS_COLORS[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        {/* FAQs */}
        <TabsContent value="faq">
          {selectedArticle ? (
            <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} onHelpful={helpfulMutation.mutate} />
          ) : (
          <div className="space-y-3">
            {faqs?.map((faq: KBArticle) => (
              <Card key={faq.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedArticle(faq)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                    {faq.title}
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{faq.summary || faq.content?.slice(0, 150)}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-muted-foreground">
                      <ThumbsUp className="w-3 h-3 inline mr-1" />{faq.helpfulCount} helpful
                    </span>
                    {faq.videoUrl && <Badge variant="outline" className="text-xs"><Video className="w-3 h-3 mr-1" />Video</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!faqs || faqs.length === 0) && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>No FAQs available yet</p>
                </CardContent>
              </Card>
            )}
          </div>
          )}
        </TabsContent>

        {/* Knowledge Base */}
        <TabsContent value="kb">
          {selectedArticle ? (
            <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} onHelpful={helpfulMutation.mutate} />
          ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {searchQuery.length > 2 && searchResults ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Search Results</h3>
                {(searchResults.content || []).map((article: KBArticle) => (
                  <Card key={article.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedArticle(article)}>
                    <CardContent className="py-3">
                      <h3 className="font-medium">{article.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{article.summary}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{article.articleType}</Badge>
                        {article.videoUrl && <Badge variant="outline" className="text-xs"><Video className="w-3 h-3 mr-1" />Video</Badge>}
                        {article.tags && article.tags.split(',').slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag.trim()}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kbCategories?.map((cat: KBCategory) => (
                  <Card key={cat.id} className="cursor-pointer hover:border-primary transition-colors">
                    <CardContent className="py-4 text-center">
                      <div className="text-3xl mb-2">{cat.icon || '📚'}</div>
                      <h3 className="font-medium">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                    </CardContent>
                  </Card>
                ))}
                {(!kbCategories || kbCategories.length === 0) && (
                  <Card className="col-span-full">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Knowledge base is being populated</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

// ── Article Detail View ───────────────────────────────────────────────────────
function isYouTubeUrl(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}
function getYouTubeEmbedUrl(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}
function isVideoFile(url: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

function ArticleDetail({
  article, onBack, onHelpful,
}: {
  article: KBArticle;
  onBack: () => void;
  onHelpful: (args: { id: string; helpful: boolean }) => void;
}) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{article.articleType}</Badge>
            {article.category && (
              <span className="text-sm text-muted-foreground">{article.category.name}</span>
            )}
          </div>
          <CardTitle className="text-xl mt-1">{article.title}</CardTitle>
          {article.summary && (
            <CardDescription>{article.summary}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Video Player */}
          {article.videoUrl && (
            <div className="rounded-lg overflow-hidden border bg-black aspect-video">
              {isYouTubeUrl(article.videoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(article.videoUrl)}
                  title={article.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isVideoFile(article.videoUrl) ? (
                <video controls className="w-full h-full" src={article.videoUrl}>
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <a href={article.videoUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 underline">
                    <Video className="w-6 h-6" /> Watch Video
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-sm leading-relaxed">
            {article.content}
          </div>

          {/* Tags */}
          {article.tags && (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.split(',').map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag.trim()}</Badge>
              ))}
            </div>
          )}

          {/* Helpful votes */}
          <div className="flex items-center gap-3 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Was this article helpful?</span>
            <Button variant="outline" size="sm" onClick={() => onHelpful({ id: article.id, helpful: true })}>
              <ThumbsUp className="w-4 h-4 mr-1" /> Yes ({article.helpfulCount})
            </Button>
            <Button variant="outline" size="sm" onClick={() => onHelpful({ id: article.id, helpful: false })}>
              <ThumbsDown className="w-4 h-4 mr-1" /> No ({article.notHelpfulCount})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
