import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { toast } from 'sonner';
import {
  ArrowUpCircle, Send, Clock, CheckCircle, XCircle, FileText, Award,
  Briefcase, GraduationCap, Users, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  SmartDrawer, SmartDrawerContent, SmartDrawerDescription, SmartDrawerHeader, SmartDrawerTitle,
  SmartDrawerTrigger, SmartDrawerFooter, SmartDrawerClose,
} from '@/components/ui/smart-drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

/* ── Types ── */
interface RoleUpgradeRequest {
  id: string;
  currentRole: string;
  targetRole: string;
  status: string;
  motivation: string;
  qualifications?: string;
  expertise?: string;
  yearsExperience?: number;
  reviewNotes?: string;
  createdAt: string;
  reviewedAt?: string;
  user?: { id: string; firstName: string; lastName: string; email: string; profilePicture?: string };
  reviewedBy?: { firstName: string; lastName: string };
}

/* ── Component ── */
export default function RoleUpgradePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('apply');
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [form, setForm] = useState({
    targetRole: 'TUTOR',
    motivation: '',
    qualifications: '',
    expertise: '',
    yearsExperience: 0,
  });
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; request: RoleUpgradeRequest | null; action: 'approve' | 'reject' }>({
    open: false, request: null, action: 'approve',
  });
  const [reviewNotes, setReviewNotes] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = ['Admin', 'Super_Admin'].includes(user?.role);
  const isStudent = user?.role === 'Student';

  // My requests
  const { data: myRequests = [], isLoading } = useQuery<RoleUpgradeRequest[]>({
    queryKey: ['my-role-requests'],
    queryFn: async () => (await apiService.get(endpoints.getMyRoleUpgradeRequests)).data || [],
  });

  // Pending (admin)
  const { data: pendingRequests = [] } = useQuery<RoleUpgradeRequest[]>({
    queryKey: ['pending-role-requests'],
    queryFn: async () => {
      const r = (await apiService.get(endpoints.getPendingRoleUpgradeRequests)).data;
      return Array.isArray(r) ? r : r?.content || [];
    },
    enabled: isAdmin && activeTab === 'manage',
  });

  // Pending count (admin)
  const { data: pendingCount = 0 } = useQuery<number>({
    queryKey: ['pending-role-count'],
    queryFn: async () => (await apiService.get(endpoints.getPendingRoleUpgradeCount)).data?.count || 0,
    enabled: isAdmin,
  });

  // Submit request
  const submitMut = useMutation({
    mutationFn: (data: typeof form) => apiService.post(endpoints.submitRoleUpgradeRequest, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-role-requests'] });
      setIsApplyOpen(false);
      setForm({ targetRole: 'TUTOR', motivation: '', qualifications: '', expertise: '', yearsExperience: 0 });
      toast.success('Application submitted! You will be notified of the decision.');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to submit application'),
  });

  // Approve
  const approveMut = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      apiService.patch(endpoints.approveRoleUpgrade(id), { reviewNotes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-role-requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-role-count'] });
      setReviewDialog({ open: false, request: null, action: 'approve' });
      setReviewNotes('');
      toast.success('Request approved! User role has been upgraded.');
    },
  });

  // Reject
  const rejectMut = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      apiService.patch(endpoints.rejectRoleUpgrade(id), { reviewNotes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-role-requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-role-count'] });
      setReviewDialog({ open: false, request: null, action: 'reject' });
      setReviewNotes('');
      toast.success('Request rejected.');
    },
  });

  const hasPending = myRequests.some(r => r.status === 'PENDING');

  const statusConfig: Record<string, { color: string; icon: any; badge: string }> = {
    PENDING: { color: 'text-amber-600', icon: Clock, badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
    APPROVED: { color: 'text-emerald-600', icon: CheckCircle, badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
    REJECTED: { color: 'text-red-600', icon: XCircle, badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-12 w-64" /><Skeleton className="h-96" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArrowUpCircle className="h-6 w-6 text-primary" /> Role Upgrade
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Manage role upgrade requests from users' : 'Apply to become a Tutor or Mentor'}
          </p>
        </div>
        {isAdmin && pendingCount > 0 && (
          <Badge className="bg-amber-500 text-white">{pendingCount} Pending</Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'} max-w-sm`}>
          <TabsTrigger value="apply">
            {isStudent ? 'Apply for Upgrade' : 'My Applications'}
          </TabsTrigger>
          {isAdmin && <TabsTrigger value="manage">Review Requests</TabsTrigger>}
        </TabsList>

        {/* Apply / My Requests Tab */}
        <TabsContent value="apply" className="space-y-6">
          {/* Apply Banner */}
          {!hasPending && (isStudent || user?.role === 'Tutor') && (
            <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">Ready for the Next Step?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Apply to become a {isStudent ? 'Tutor or Mentor' : 'Mentor'} and help others on their learning journey.
                      Your application will be reviewed by an administrator.
                    </p>
                  </div>
                  <SmartDrawer open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                    <SmartDrawerTrigger asChild>
                      <Button size="lg"><Send className="mr-2 h-4 w-4" /> Apply Now</Button>
                    </SmartDrawerTrigger>
                    <SmartDrawerContent>
                      <SmartDrawerHeader>
                        <SmartDrawerTitle>Role Upgrade Application</SmartDrawerTitle>
                        <SmartDrawerDescription>Tell us why you'd like to take on a new role</SmartDrawerDescription>
                      </SmartDrawerHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Target Role *</Label>
                          <Select value={form.targetRole} onValueChange={v => setForm(p => ({ ...p, targetRole: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {isStudent && <SelectItem value="TUTOR">Tutor</SelectItem>}
                              <SelectItem value="MENTOR">Mentor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div><Label>Motivation *</Label><Textarea placeholder="Why do you want this role? What drives you?" rows={4} value={form.motivation} onChange={e => setForm(p => ({ ...p, motivation: e.target.value }))} /></div>
                        <div><Label>Qualifications</Label><Textarea placeholder="Relevant qualifications, certifications..." rows={3} value={form.qualifications} onChange={e => setForm(p => ({ ...p, qualifications: e.target.value }))} /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div><Label>Areas of Expertise</Label><Input placeholder="e.g., Web Dev, AI" value={form.expertise} onChange={e => setForm(p => ({ ...p, expertise: e.target.value }))} /></div>
                          <div><Label>Years of Experience</Label><Input type="number" min={0} value={form.yearsExperience} onChange={e => setForm(p => ({ ...p, yearsExperience: parseInt(e.target.value) || 0 }))} /></div>
                        </div>
                      </div>
                      <SmartDrawerFooter>
                        <SmartDrawerClose asChild><Button variant="outline">Cancel</Button></SmartDrawerClose>
                        <Button onClick={() => {
                          if (!form.motivation.trim()) { toast.error('Please provide your motivation'); return; }
                          submitMut.mutate(form);
                        }} disabled={submitMut.isPending}>
                          <Send className="mr-2 h-4 w-4" /> Submit Application
                        </Button>
                      </SmartDrawerFooter>
                    </SmartDrawerContent>
                  </SmartDrawer>
                </div>
              </CardContent>
            </Card>
          )}

          {hasPending && (
            <Card className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <p className="text-sm text-amber-800 dark:text-amber-200">You have a pending application. Please wait for admin review.</p>
              </CardContent>
            </Card>
          )}

          {/* My Requests History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Applications</CardTitle>
              <CardDescription>{myRequests.length} application(s) submitted</CardDescription>
            </CardHeader>
            <CardContent>
              {myRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No applications yet</p>
                  <p className="text-sm mt-1">Submit your first application above!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRequests.map((req, i) => {
                    const cfg = statusConfig[req.status] || statusConfig.PENDING;
                    const StatusIcon = cfg.icon;
                    return (
                      <motion.div key={req.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <div className="border rounded-lg p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cfg.badge}`}>
                                <StatusIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm">{req.currentRole} → {req.targetRole}</span>
                                  <Badge className={cfg.badge}>{req.status}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Submitted {formatDate(req.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 pl-12">
                            <p className="text-sm text-muted-foreground">{req.motivation}</p>
                            {req.reviewNotes && (
                              <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                                <span className="font-medium text-xs">Review Notes:</span>
                                <p className="text-muted-foreground text-xs mt-1">{req.reviewNotes}</p>
                                {req.reviewedBy && (
                                  <p className="text-[10px] text-muted-foreground mt-1">— {req.reviewedBy.firstName} {req.reviewedBy.lastName}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Review Tab */}
        {isAdmin && (
          <TabsContent value="manage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Applications</CardTitle>
                <CardDescription>{pendingRequests.length} requests awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">All caught up!</p>
                    <p className="text-sm mt-1">No pending applications to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map(req => (
                      <Card key={req.id} className="border-amber-200 dark:border-amber-700">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 shrink-0">
                              <AvatarImage src={req.user?.profilePicture} />
                              <AvatarFallback>{req.user?.firstName?.[0]}{req.user?.lastName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold">{req.user?.firstName} {req.user?.lastName}</span>
                                <Badge variant="outline" className="text-xs">{req.user?.email}</Badge>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                <Badge className="bg-primary text-white">{req.targetRole}</Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm">
                                <div>
                                  <span className="text-xs font-medium text-muted-foreground">Motivation</span>
                                  <p className="text-sm mt-0.5">{req.motivation}</p>
                                </div>
                                {req.qualifications && (
                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Qualifications</span>
                                    <p className="text-sm mt-0.5">{req.qualifications}</p>
                                  </div>
                                )}
                                {req.expertise && (
                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">Expertise</span>
                                    <p className="text-sm mt-0.5">{req.expertise} · {req.yearsExperience || 0}yr exp</p>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2 mt-4">
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => setReviewDialog({ open: true, request: req, action: 'approve' })}>
                                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="destructive"
                                  onClick={() => setReviewDialog({ open: true, request: req, action: 'reject' })}>
                                  <XCircle className="h-4 w-4 mr-1" /> Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Review Dialog */}
      <SmartDrawer open={reviewDialog.open} onOpenChange={open => setReviewDialog(p => ({ ...p, open }))}>
        <SmartDrawerContent>
          <SmartDrawerHeader>
            <SmartDrawerTitle>{reviewDialog.action === 'approve' ? 'Approve' : 'Reject'} Application</SmartDrawerTitle>
            <SmartDrawerDescription>
              {reviewDialog.action === 'approve'
                ? `This will upgrade ${reviewDialog.request?.user?.firstName}'s role to ${reviewDialog.request?.targetRole}`
                : 'Please provide feedback for the applicant'}
            </SmartDrawerDescription>
          </SmartDrawerHeader>
          <div>
            <Label>Review Notes</Label>
            <Textarea placeholder="Optional notes for the applicant..." rows={4}
              value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} />
          </div>
          <SmartDrawerFooter>
            <SmartDrawerClose asChild><Button variant="outline">Cancel</Button></SmartDrawerClose>
            <Button
              variant={reviewDialog.action === 'approve' ? 'default' : 'destructive'}
              onClick={() => {
                if (reviewDialog.request) {
                  if (reviewDialog.action === 'approve') {
                    approveMut.mutate({ id: reviewDialog.request.id, notes: reviewNotes });
                  } else {
                    rejectMut.mutate({ id: reviewDialog.request.id, notes: reviewNotes });
                  }
                }
              }}
              disabled={approveMut.isPending || rejectMut.isPending}
            >
              {reviewDialog.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </SmartDrawerFooter>
        </SmartDrawerContent>
      </SmartDrawer>
    </div>
  );
}
