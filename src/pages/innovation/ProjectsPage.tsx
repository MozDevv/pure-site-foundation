import { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  FolderOpen, 
  Filter, 
  Grid3X3, 
  List,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInnovation } from '@/components/innovation-hub/InnovationContext';
import { toast } from '@/hooks/use-toast';
import { 
  getProjects, 
  getTeams,
  Project,
  Team
} from '@/lib/innovation-hub-data';
import { cn } from '@/lib/utils';

const statusColors: Record<Project['status'], string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-purple-100 text-purple-700',
};

const statusLabels: Record<Project['status'], string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export function ProjectsPage() {
  const { currentUser } = useInnovation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'my' | 'drafts' | 'public'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    problemStatement: '',
    solutionOverview: '',
    techStack: '',
    isPublic: true,
    teamId: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [projectsData, teamsData] = await Promise.all([
        getProjects(),
        getTeams()
      ]);
      setProjects(projectsData);
      setTeams(teamsData);
      setLoading(false);
    };
    loadData();
  }, []);

  const getTeamName = (teamId: number | null) => {
    if (!teamId) return 'Solo Project';
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Unknown Team';
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (filter) {
      case 'my':
        return matchesSearch && project.creator_id === currentUser.id;
      case 'drafts':
        return matchesSearch && project.status === 'draft' && project.creator_id === currentUser.id;
      case 'public':
        return matchesSearch && project.is_public;
      default:
        return matchesSearch;
    }
  });

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handleCreateProject = () => {
    if (!newProject.title.trim()) {
      toast({ title: 'Error', description: 'Project title is required', variant: 'destructive' });
      return;
    }
    
    toast({ title: 'Project Created!', description: `${newProject.title} has been created as a draft.` });
    setShowCreateModal(false);
    setCurrentStep(1);
    setNewProject({
      title: '',
      description: '',
      problemStatement: '',
      solutionOverview: '',
      techStack: '',
      isPublic: true,
      teamId: ''
    });
  };

  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Problem & Solution' },
    { number: 3, title: 'Tech & Visibility' },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Projects & Ideas</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Browse innovations or submit your own idea
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Submit Idea
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={filter} onValueChange={(v) => { setFilter(v as typeof filter); setCurrentPage(1); }}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="my">My Projects</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
                <TabsTrigger value="public">Gallery</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex border rounded-lg">
              <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="rounded-r-none"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="rounded-l-none"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {paginatedProjects.length} of {filteredProjects.length} projects
        </p>

        {/* Projects Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : paginatedProjects.length === 0 ? (
          <Card className="p-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {filter === 'drafts' 
                ? "You don't have any draft projects" 
                : "Try adjusting your search or filters"}
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Submit an Idea
            </Button>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-blue-600 transition-colors truncate">
                        {project.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getTeamName(project.team_id)}
                      </p>
                    </div>
                    {project.is_public ? (
                      <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tech_stack.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs font-normal">
                        {tech}
                      </Badge>
                    ))}
                    {project.tech_stack.length > 3 && (
                      <Badge variant="outline" className="text-xs font-normal">
                        +{project.tech_stack.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <Badge className={cn('text-xs', statusColors[project.status])}>
                      {statusLabels[project.status]}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8">
                      View <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                    <FolderOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{project.title}</h3>
                      <Badge className={cn('text-xs', statusColors[project.status])}>
                        {statusLabels[project.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-sm text-muted-foreground">
                      {getTeamName(project.team_id)}
                    </div>
                    {project.is_public ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Floating Create Button (Mobile) */}
        <Button 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 lg:hidden"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Create Project Modal - Multi-step */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit New Idea</DialogTitle>
            <DialogDescription>
              Share your innovation idea with the community
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, i) => (
              <div key={step.number} className="flex items-center">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  currentStep >= step.number 
                    ? "bg-blue-600 text-white" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {step.number}
                </div>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "h-0.5 w-12 mx-2",
                    currentStep > step.number ? "bg-blue-600" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
          
          <div className="space-y-4 py-2">
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Smart Campus Navigator"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    placeholder="A brief overview of your project..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team">Team (optional)</Label>
                  <Select 
                    value={newProject.teamId} 
                    onValueChange={(v) => setNewProject({ ...newProject, teamId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Solo project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solo">Solo Project</SelectItem>
                      {teams.filter(t => t.creator_id === currentUser.id).map(team => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="problem">Problem Statement</Label>
                  <Textarea
                    id="problem"
                    placeholder="What problem are you solving?"
                    value={newProject.problemStatement}
                    onChange={(e) => setNewProject({ ...newProject, problemStatement: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solution">Solution Overview</Label>
                  <Textarea
                    id="solution"
                    placeholder="How does your solution work?"
                    value={newProject.solutionOverview}
                    onChange={(e) => setNewProject({ ...newProject, solutionOverview: e.target.value })}
                    rows={4}
                  />
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="techStack">Tech Stack</Label>
                  <Input
                    id="techStack"
                    placeholder="e.g., React, Python, Firebase (comma separated)"
                    value={newProject.techStack}
                    onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label>Make project public</Label>
                    <p className="text-xs text-muted-foreground">
                      Public projects appear in the gallery
                    </p>
                  </div>
                  <Switch 
                    checked={newProject.isPublic}
                    onCheckedChange={(v) => setNewProject({ ...newProject, isPublic: v })}
                  />
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border-dashed border-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    File uploads coming soon
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex-row gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)}>
                Back
              </Button>
            )}
            <div className="flex-1" />
            {currentStep < 3 ? (
              <Button onClick={() => setCurrentStep(s => s + 1)} className="bg-blue-600 hover:bg-blue-700">
                Next
              </Button>
            ) : (
              <Button onClick={handleCreateProject} className="bg-blue-600 hover:bg-blue-700">
                Submit Idea
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
