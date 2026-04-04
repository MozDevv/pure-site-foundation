import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { toast } from 'sonner';
import {
  Award, Download, ExternalLink, Search, Shield, CheckCircle, XCircle,
  Sparkles, Eye, FileText, Calendar, Copy, Plus, Send,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  SmartDrawer, SmartDrawerContent, SmartDrawerDescription, SmartDrawerHeader, SmartDrawerTitle,
  SmartDrawerTrigger, SmartDrawerFooter, SmartDrawerClose,
} from '@/components/ui/smart-drawer';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

/* ── Types ── */
interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  backgroundColor: string;
  accentColor: string;
  signatureName: string;
  signatureTitle: string;
  isActive: boolean;
}

interface IssuedCertificate {
  id: string;
  title: string;
  description?: string;
  verificationCode: string;
  recipientName: string;
  status: string;
  gradeAchieved?: string;
  completionDate?: string;
  createdAt: string;
  template?: CertificateTemplate;
  course?: { name: string };
  user?: { firstName: string; lastName: string };
}

interface VerifyResult {
  id: string;
  title: string;
  recipientName: string;
  verificationCode: string;
  status: string;
  completionDate?: string;
  gradeAchieved?: string;
}

/* ── Component ── */
export default function CertificatesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('my-certificates');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [verifyError, setVerifyError] = useState('');
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({ userId: '', templateId: '', courseId: '', title: '', gradeAchieved: '' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = ['Admin', 'Super_Admin'].includes(user?.role);
  const isTutor = user?.role === 'Tutor';
  const canManage = isAdmin || isTutor;

  // My certificates
  const { data: myCerts = [], isLoading: myLoading } = useQuery<IssuedCertificate[]>({
    queryKey: ['my-certificates'],
    queryFn: async () => (await apiService.get(endpoints.getMyCertificates)).data || [],
  });

  // All certificates (admin)
  const { data: allCerts = [] } = useQuery<IssuedCertificate[]>({
    queryKey: ['all-certificates'],
    queryFn: async () => {
      const r = (await apiService.get(endpoints.getAllCertificates)).data;
      return Array.isArray(r) ? r : r?.content || [];
    },
    enabled: canManage && activeTab === 'manage',
  });

  // Templates
  const { data: templates = [] } = useQuery<CertificateTemplate[]>({
    queryKey: ['cert-templates'],
    queryFn: async () => (await apiService.get(endpoints.getCertificateTemplates)).data || [],
    enabled: canManage,
  });

  // Verify
  const handleVerify = async () => {
    if (!verifyCode.trim()) { toast.error('Enter a verification code'); return; }
    try {
      setVerifyError('');
      const r = await apiService.get(endpoints.verifyCertificate(verifyCode.trim()));
      setVerifyResult(r.data);
    } catch {
      setVerifyResult(null);
      setVerifyError('Certificate not found or invalid code');
    }
  };

  // Issue
  const issueMut = useMutation({
    mutationFn: (data: typeof issueForm) => apiService.post(endpoints.issueCertificate, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-certificates'] });
      queryClient.invalidateQueries({ queryKey: ['my-certificates'] });
      setIsIssueOpen(false);
      setIssueForm({ userId: '', templateId: '', courseId: '', title: '', gradeAchieved: '' });
      toast.success('Certificate issued successfully!');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to issue certificate'),
  });

  // Revoke
  const revokeMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiService.patch(`${endpoints.revokeCertificate(id)}?reason=${encodeURIComponent(reason)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-certificates'] });
      toast.success('Certificate revoked');
    },
  });

  // Seed templates
  const seedMut = useMutation({
    mutationFn: () => apiService.post(endpoints.seedCertificateTemplates, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cert-templates'] });
      toast.success('Default templates created!');
    },
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Verification code copied!');
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  if (myLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" /> Certificates
          </h1>
          <p className="text-muted-foreground mt-1">View your earned certificates and verify credentials</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            {templates.length === 0 && (
              <Button variant="outline" size="sm" onClick={() => seedMut.mutate()} disabled={seedMut.isPending}>
                <Sparkles className="h-4 w-4 mr-1" /> Seed Templates
              </Button>
            )}
            <SmartDrawer open={isIssueOpen} onOpenChange={setIsIssueOpen}>
              <SmartDrawerTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Issue Certificate</Button>
              </SmartDrawerTrigger>
              <SmartDrawerContent>
                <SmartDrawerHeader>
                  <SmartDrawerTitle>Issue Certificate</SmartDrawerTitle>
                  <SmartDrawerDescription>Issue a certificate to a student</SmartDrawerDescription>
                </SmartDrawerHeader>
                <div className="space-y-4">
                  <div><Label>User ID *</Label><Input placeholder="User UUID" value={issueForm.userId} onChange={e => setIssueForm(p => ({ ...p, userId: e.target.value }))} /></div>
                  <div>
                    <Label>Template *</Label>
                    <Select value={issueForm.templateId} onValueChange={v => setIssueForm(p => ({ ...p, templateId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                      <SelectContent>{templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Course ID</Label><Input placeholder="Course UUID (optional)" value={issueForm.courseId} onChange={e => setIssueForm(p => ({ ...p, courseId: e.target.value }))} /></div>
                  <div><Label>Title *</Label><Input placeholder="Certificate title" value={issueForm.title} onChange={e => setIssueForm(p => ({ ...p, title: e.target.value }))} /></div>
                  <div><Label>Grade</Label><Input placeholder="e.g., A+, 95%" value={issueForm.gradeAchieved} onChange={e => setIssueForm(p => ({ ...p, gradeAchieved: e.target.value }))} /></div>
                </div>
                <SmartDrawerFooter>
                  <SmartDrawerClose asChild><Button variant="outline">Cancel</Button></SmartDrawerClose>
                  <Button onClick={() => issueMut.mutate(issueForm)} disabled={issueMut.isPending}>
                    <Send className="mr-2 h-4 w-4" /> Issue
                  </Button>
                </SmartDrawerFooter>
              </SmartDrawerContent>
            </SmartDrawer>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`grid w-full ${canManage ? 'grid-cols-3' : 'grid-cols-2'} max-w-md`}>
          <TabsTrigger value="my-certificates">My Certificates</TabsTrigger>
          <TabsTrigger value="verify">Verify</TabsTrigger>
          {canManage && <TabsTrigger value="manage">Manage</TabsTrigger>}
        </TabsList>

        {/* My Certificates */}
        <TabsContent value="my-certificates" className="space-y-4">
          {myCerts.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-semibold">No Certificates Yet</p>
                <p className="text-sm text-muted-foreground mt-1">Complete courses and assessments to earn certificates</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCerts.map((cert, i) => (
                <motion.div key={cert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={`overflow-hidden ${cert.status === 'REVOKED' ? 'opacity-60' : ''}`}>
                    <div className="h-3 bg-gradient-to-r from-primary to-primary/60" />
                    <CardContent className="p-5">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-3">
                          <Award className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-base">{cert.title}</h3>
                        {cert.course && <p className="text-sm text-muted-foreground mt-1">{cert.course.name}</p>}
                        {cert.gradeAchieved && (
                          <Badge className="mt-2 bg-emerald-500 text-white">Grade: {cert.gradeAchieved}</Badge>
                        )}
                        <div className="mt-3 p-2 bg-muted/50 rounded-lg">
                          <p className="text-[10px] text-muted-foreground mb-1">Verification Code</p>
                          <div className="flex items-center justify-center gap-2">
                            <code className="text-xs font-mono font-semibold">{cert.verificationCode}</code>
                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => copyCode(cert.verificationCode)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(cert.completionDate || cert.createdAt)}
                        </div>
                        {cert.status === 'REVOKED' && <Badge variant="destructive" className="mt-2">Revoked</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Verify */}
        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Verify Certificate
              </CardTitle>
              <CardDescription>Enter a verification code to check certificate authenticity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input placeholder="e.g., TECH-AB12CD34" value={verifyCode} onChange={e => setVerifyCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()} className="sm:max-w-sm" />
                <Button onClick={handleVerify} className="w-full sm:w-auto"><Search className="h-4 w-4 mr-2" /> Verify</Button>
              </div>

              {verifyResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/20">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                          <CheckCircle className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-800 dark:text-emerald-200">Certificate Verified!</p>
                          <div className="mt-2 space-y-1 text-sm">
                            <p><span className="text-muted-foreground">Title:</span> {verifyResult.title}</p>
                            <p><span className="text-muted-foreground">Recipient:</span> {verifyResult.recipientName}</p>
                            <p><span className="text-muted-foreground">Code:</span> {verifyResult.verificationCode}</p>
                            <p><span className="text-muted-foreground">Status:</span>
                              <Badge className={`ml-2 ${verifyResult.status === 'ISSUED' ? 'bg-emerald-500' : 'bg-destructive'} text-white`}>
                                {verifyResult.status}
                              </Badge>
                            </p>
                            {verifyResult.gradeAchieved && <p><span className="text-muted-foreground">Grade:</span> {verifyResult.gradeAchieved}</p>}
                            {verifyResult.completionDate && <p><span className="text-muted-foreground">Date:</span> {formatDate(verifyResult.completionDate)}</p>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {verifyError && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="p-5 flex items-center gap-3">
                      <XCircle className="h-6 w-6 text-destructive shrink-0" />
                      <p className="text-sm text-destructive">{verifyError}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage (Admin/Tutor) */}
        {canManage && (
          <TabsContent value="manage" className="space-y-4">
            {/* Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Certificate Templates</CardTitle>
                <CardDescription>{templates.length} templates available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {templates.map(t => (
                    <div key={t.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{t.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">{t.type}</Badge>
                        {t.isActive && <Badge className="bg-emerald-500 text-white text-[10px]">Active</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* All Issued */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Issued Certificates</CardTitle>
                <CardDescription>{allCerts.length} certificates issued</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allCerts.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Award className="h-5 w-5 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{c.recipientName} · {c.verificationCode}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] ${c.status === 'ISSUED' ? 'bg-emerald-500' : 'bg-destructive'} text-white`}>
                          {c.status}
                        </Badge>
                        {c.status === 'ISSUED' && (
                          <Button variant="ghost" size="sm" className="text-destructive h-9 text-xs"
                            onClick={() => revokeMut.mutate({ id: c.id, reason: 'Administrative action' })}>
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {allCerts.length === 0 && (
                    <p className="text-center py-8 text-sm text-muted-foreground">No certificates issued yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
