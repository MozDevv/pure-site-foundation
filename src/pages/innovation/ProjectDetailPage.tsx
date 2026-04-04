import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Github,
  Calendar,
  Clock,
  Shield,
  ExternalLink,
  Lightbulb,
  Target,
  Wrench,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiService, endpoints } from '@/lib/api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TeamMember {
  id: string;
  inviterProvidedName: string | null;
  joinedAt: string;
  status: string;
  isOwner: boolean;
  role: { id: string; name: string; permissions: any[] } | null;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  visibility: string | null;
  updatedAt: string;
  teamMembers: TeamMember[];
  allTeamRoles: any[];
}

interface GithubRepo {
  name: string;
  url: string;
}

interface StatusChange {
  id: string;
  changedBy: {
    firstName: string;
    lastName: string;
    username: string;
  };
  previousStatus: string;
  newStatus: string;
  statusType: string;
  reason: string | null;
  changedAt: string;
}

interface ProjectApproval {
  id: string;
  reviewer: any | null;
  action: string;
  comments: string;
  actionDate: string;
}

interface ProjectData {
  id: string;
  name: string;
  description: string;
  avatar: string;
  problemStatement: string;
  solutionDescription: string;
  targetUsers: string;
  innovationNotes: string;
  techStack: string[];
  githubRepos: GithubRepo[];
  team: Team;
  status: string;
  submittedAt: string;
  projectStatusChanges: StatusChange[];
  projectApprovals: ProjectApproval[];
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: FileText },
  PENDING_REVIEW: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: AlertCircle },
  APPROVED: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  CHANGES_REQUESTED: { label: 'Changes Requested', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: MessageSquare },
};

const memberStatusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  INVITED_USER_PENDING_ACCEPTANCE: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  INACTIVE: { label: 'Inactive', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.get(endpoints.getProjectById(id));
        setProject(response.data);
      } catch (err: any) {
        console.error('Failed to fetch project:', err);
        setError(err?.response?.data?.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center p-8">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'The project you are looking for does not exist.'}</p>
          <Button onClick={() => navigate('/innovation/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Card>
      </div>
    );
  }

  const status = statusConfig[project.status] || statusConfig.DRAFT;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/innovation/projects')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {project.avatar && (
                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                  <AvatarImage src={project.avatar} alt={project.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {project.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="min-w-0">
                <h1 className="font-semibold text-foreground truncate">{project.name}</h1>
                <p className="text-xs text-muted-foreground">{project.team?.name || 'Solo Project'}</p>
              </div>
            </div>
            <Badge className={cn('shrink-0', status.color)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview Card */}
            <Card className="overflow-hidden">
              {project.avatar && (
                <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border-b">
                  <img
                    src={project.avatar}
                    alt={project.name}
                    className="h-32 w-32 object-cover rounded-xl shadow-lg border-4 border-background"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-3">{project.name}</h2>
                <p className="text-muted-foreground leading-relaxed">{project.description}</p>

                {/* Tech Stack */}
                {project.techStack?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech, i) => (
                        <Badge key={i} variant="secondary" className="font-normal">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* GitHub Repos */}
                {project.githubRepos?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Github className="h-4 w-4 text-muted-foreground" />
                      Repositories
                    </h4>
                    <div className="space-y-2">
                      {project.githubRepos.map((repo, i) => (
                        <a
                          key={i}
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline group"
                        >
                          <Github className="h-4 w-4" />
                          {repo.name}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Tabs */}
            <Card>
              <Tabs defaultValue="problem" className="w-full">
                <CardHeader className="pb-0">
                  <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0">
                    <TabsTrigger
                      value="problem"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Problem
                    </TabsTrigger>
                    <TabsTrigger
                      value="solution"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Solution
                    </TabsTrigger>
                    <TabsTrigger
                      value="users"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Target Users
                    </TabsTrigger>
                    <TabsTrigger
                      value="innovation"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Innovation
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-6">
                  <TabsContent value="problem" className="mt-0">
                    <div className="prose prose-sm max-w-none">
                      <h4 className="text-foreground font-medium mb-3">Problem Statement</h4>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {project.problemStatement || 'No problem statement provided.'}
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="solution" className="mt-0">
                    <div className="prose prose-sm max-w-none">
                      <h4 className="text-foreground font-medium mb-3">Proposed Solution</h4>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {project.solutionDescription || 'No solution description provided.'}
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="users" className="mt-0">
                    <div className="prose prose-sm max-w-none">
                      <h4 className="text-foreground font-medium mb-3">Target Users</h4>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {project.targetUsers || 'No target users specified.'}
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="innovation" className="mt-0">
                    <div className="prose prose-sm max-w-none">
                      <h4 className="text-foreground font-medium mb-3">Innovation Notes</h4>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {project.innovationNotes || 'No innovation notes provided.'}
                      </p>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground">{project.team?.name || 'Solo Project'}</h4>
                  {project.team?.description && (
                    <p className="text-sm text-muted-foreground mt-1">{project.team.description}</p>
                  )}
                </div>
                <Separator />
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-muted-foreground">Members</h5>
                  <ScrollArea className="max-h-64">
                    <div className="space-y-2">
                      {project.team?.teamMembers?.map((member) => {
                        const memberStatus = memberStatusConfig[member.status] || memberStatusConfig.ACTIVE;
                        return (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {member.firstName?.charAt(0)}
                                {member.lastName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">
                                  {member.firstName} {member.lastName}
                                </span>
                                {member.isOwner && (
                                  <Crown className="h-3 w-3 text-amber-500" />
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {member.role && (
                                  <span className="text-xs text-muted-foreground">
                                    {member.role.name}
                                  </span>
                                )}
                                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', memberStatus.color)}>
                                  {memberStatus.label}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* Submission Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Submission Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
                {project.submittedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Submitted</span>
                    <span className="font-medium">
                      {format(new Date(project.submittedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Timeline */}
            {project.projectStatusChanges?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Status History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {project.projectStatusChanges.map((change, i) => (
                      <div key={change.id} className="flex gap-3 pb-4 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                          {i < project.projectStatusChanges.length - 1 && (
                            <div className="w-px flex-1 bg-border mt-1" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px]">
                              {change.previousStatus}
                            </Badge>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <Badge className={cn('text-[10px]', statusConfig[change.newStatus]?.color)}>
                              {change.newStatus}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            by {change.changedBy?.firstName} {change.changedBy?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(change.changedAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Approvals */}
            {project.projectApprovals?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.projectApprovals.map((approval) => (
                      <div key={approval.id} className="p-3 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {approval.action}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(approval.actionDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{approval.comments}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
