import { useState } from 'react';

const toArray = (v: unknown): string[] =>
  Array.isArray(v) ? (v as string[]) : typeof v === 'string' && v.trim() ? v.split(',').map((s) => s.trim()) : [];

import {
  Search,
  Plus,
  FolderOpen,
  Grid3X3,
  List,
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInnovation } from '@/components/innovation-hub/InnovationContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { apiService, endpoints } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

// API Project interface matching backend response
interface ApiProject {
  id: string;
  name: string;
  description: string;
  avatar: string;
  problemStatement: string;
  solutionDescription: string;
  targetUsers: string;
  innovationNotes: string;
  techStack: string[];
  githubRepos: { name: string; url: string }[];
  team: {
    id: string;
    name: string;
    description: string;
    teamMembers: any[];
  } | null;
  status: string;
  submittedAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: FileText },
  PENDING_REVIEW: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: AlertCircle },
  APPROVED: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  CHANGES_REQUESTED: { label: 'Changes Requested', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertCircle },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
  COMPLETED: { label: 'Completed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle2 },
};

export function ProjectsPage() {
  const { currentUser } = useInnovation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'drafts'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const navigate = useNavigate();

  // Role-aware base path
  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : null;
  const userRole = user?.role || 'Student';
  const basePath = userRole === 'Student' ? '/student' : userRole === 'Tutor' ? '/tutor' : '/admin';

  const { data: projects = [], isLoading: loading } = useQuery({
    queryKey: ['innovation-projects'],
    queryFn: async () => {
      const response = await apiService.get(endpoints.getUserProjects);
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      (project.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (project.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    switch (filter) {
      case 'drafts':
        return matchesSearch && project.status === 'DRAFT';
      default:
        return matchesSearch;
    }
  });

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Projects & Ideas
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Browse innovations or submit your own idea
              </p>
            </div>
            <Button
              onClick={() => navigate(`${basePath}/innovation/submit-project`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
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
            <Tabs
              value={filter}
              onValueChange={(v) => {
                setFilter(v as typeof filter);
                setCurrentPage(1);
              }}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
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
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }
          >
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
            <h3 className="font-semibold text-foreground mb-2">
              No projects found
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {filter === 'drafts'
                ? "You don't have any draft projects"
                : 'Try adjusting your search or filters'}
            </p>
            <Button onClick={() => navigate(`${basePath}/innovation/submit-project`)}>
              <Plus className="h-4 w-4 mr-2" />
              Submit an Idea
            </Button>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedProjects.map((project) => {
              const status = statusConfig[project.status] || statusConfig.DRAFT;
              const techStack = toArray(project.techStack);
              return (
                <Card
                  key={project.id}
                  className="hover:shadow-md transition-shadow group cursor-pointer"
                  onClick={() => navigate(`${basePath}/innovation/projects/${project.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      {project.avatar ? (
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={project.avatar} alt={project.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {project.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                          <FolderOpen className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-blue-600 transition-colors truncate">
                          {project.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {project.team?.name || 'Solo Project'}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {techStack.slice(0, 3).map((tech) => (
                        <Badge
                          key={tech}
                          variant="outline"
                          className="text-xs font-normal"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {techStack.length > 3 && (
                        <Badge variant="outline" className="text-xs font-normal">
                          +{techStack.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <Badge className={cn('text-xs', status.color)}>
                        {status.label}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8">
                        View <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedProjects.map((project) => {
              const status = statusConfig[project.status] || statusConfig.DRAFT;
              const techStack = toArray(project.techStack);
              return (
                <Card
                  key={project.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`${basePath}/innovation/projects/${project.id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    {project.avatar ? (
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={project.avatar} alt={project.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {project.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                        <FolderOpen className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {project.name}
                        </h3>
                        <Badge className={cn('text-xs', status.color)}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-sm text-muted-foreground">
                        {project.team?.name || 'Solo Project'}
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Floating Create Button (Mobile) */}
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 lg:hidden"
          onClick={() => navigate(`${basePath}/innovation/submit-project`)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
