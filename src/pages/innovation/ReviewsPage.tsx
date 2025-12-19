import { useEffect, useState } from 'react';
import { ClipboardCheck, Search, Eye, Check, X, MessageSquare, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInnovation } from '@/components/innovation-hub/InnovationContext';
import { toast } from '@/hooks/use-toast';
import { getReviews, getProjects, getTeams, Review, Project, Team } from '@/lib/innovation-hub-data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statusColors: Record<Review['status'], string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  revisions_needed: 'bg-orange-100 text-orange-700',
  rejected: 'bg-red-100 text-red-700',
};

export function ReviewsPage() {
  const { currentUser } = useInnovation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [scores, setScores] = useState({ innovation: 5, feasibility: 5, impact: 5 });
  const [comments, setComments] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [reviewsData, projectsData, teamsData] = await Promise.all([getReviews(), getProjects(), getTeams()]);
      setReviews(reviewsData);
      setProjects(projectsData);
      setTeams(teamsData);
      setLoading(false);
    };
    loadData();
  }, []);

  const getProject = (id: number) => projects.find(p => p.id === id);
  const getTeamName = (teamId: number | null) => teamId ? teams.find(t => t.id === teamId)?.name || 'Unknown' : 'Solo';

  const pendingReviews = reviews.filter(r => r.status === 'pending');
  const filteredReviews = reviews.filter(r => {
    const project = getProject(r.project_id);
    return project?.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleDecision = (decision: 'approved' | 'revisions_needed' | 'rejected') => {
    toast({ title: 'Review Submitted', description: `Project has been ${decision.replace('_', ' ')}.` });
    setSelectedReview(null);
  };

  if (currentUser.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground text-sm">Switch to admin role to access reviews.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Submissions & Reviews</h1>
              <p className="text-muted-foreground text-sm mt-1">{pendingReviews.length} pending reviews</p>
            </div>
            <Badge variant="destructive" className="text-lg px-4 py-1">{pendingReviews.length}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search submissions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 max-w-md" />
        </div>

        {loading ? (
          <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.slice(0, 15).map((review) => {
                  const project = getProject(review.project_id);
                  if (!project) return null;
                  const avgScore = review.status !== 'pending' ? Math.round((review.score_innovation + review.score_feasibility + review.score_impact) / 3 * 10) / 10 : null;
                  return (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>{getTeamName(project.team_id)}</TableCell>
                      <TableCell><Badge className={statusColors[review.status]}>{review.status.replace('_', ' ')}</Badge></TableCell>
                      <TableCell>{avgScore ? `${avgScore}/10` : '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => { setSelectedReview(review); setScores({ innovation: 5, feasibility: 5, impact: 5 }); setComments(''); }}>
                          {review.status === 'pending' ? 'Review' : 'View'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Review Project</DialogTitle></DialogHeader>
          {selectedReview && (() => {
            const project = getProject(selectedReview.project_id);
            return project ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{getTeamName(project.team_id)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Problem Statement</Label>
                  <p className="text-sm bg-muted p-3 rounded">{project.problem_statement}</p>
                </div>
                <div className="space-y-2">
                  <Label>Solution Overview</Label>
                  <p className="text-sm bg-muted p-3 rounded">{project.solution_overview}</p>
                </div>
                {selectedReview.status === 'pending' && (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      {['innovation', 'feasibility', 'impact'].map((key) => (
                        <div key={key} className="space-y-2">
                          <Label className="capitalize">{key}: {scores[key as keyof typeof scores]}</Label>
                          <Slider value={[scores[key as keyof typeof scores]]} onValueChange={([v]) => setScores(s => ({ ...s, [key]: v }))} max={10} step={1} />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label>Comments</Label>
                      <Textarea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Feedback..." rows={3} />
                    </div>
                    <DialogFooter className="gap-2">
                      <Button variant="destructive" onClick={() => handleDecision('rejected')}><X className="h-4 w-4 mr-1" />Reject</Button>
                      <Button variant="outline" onClick={() => handleDecision('revisions_needed')}>Request Revisions</Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleDecision('approved')}><Check className="h-4 w-4 mr-1" />Approve</Button>
                    </DialogFooter>
                  </>
                )}
              </div>
            ) : null;
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
