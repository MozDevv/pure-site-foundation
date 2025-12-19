import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FolderOpen, 
  ClipboardCheck, 
  Calendar, 
  Plus, 
  Lightbulb, 
  Image,
  ChevronRight,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useInnovation } from '@/components/innovation-hub/InnovationContext';
import { 
  getStats, 
  getActivities, 
  getProjects,
  Activity,
  Project
} from '@/lib/innovation-hub-data';

export function InnovationDashboard() {
  const { currentUser } = useInnovation();
  const [stats, setStats] = useState<{ totalTeams: number; activeProjects: number; pendingReviews: number; upcomingEvents: number } | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [statsData, activitiesData, projectsData] = await Promise.all([
        getStats(),
        getActivities(),
        getProjects()
      ]);
      setStats(statsData);
      setActivities(activitiesData);
      setFeaturedProjects(projectsData.filter(p => p.is_public && p.status === 'approved').slice(0, 4));
      setLoading(false);
    };
    loadData();
  }, []);

  const statsConfig = [
    { label: 'Total Teams', value: stats?.totalTeams || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Projects', value: stats?.activeProjects || 0, icon: FolderOpen, color: 'bg-emerald-500' },
    { label: 'Pending Reviews', value: stats?.pendingReviews || 0, icon: ClipboardCheck, color: 'bg-amber-500' },
    { label: 'Upcoming Events', value: stats?.upcomingEvents || 0, icon: Calendar, color: 'bg-purple-500' },
  ];

  const quickActions = [
    { label: 'Create Team', icon: Users, href: '/innovation/teams', color: 'text-blue-600' },
    { label: 'Submit Idea', icon: Lightbulb, href: '/innovation/projects', color: 'text-emerald-600' },
    { label: 'Browse Gallery', icon: Image, href: '/innovation/projects', color: 'text-purple-600' },
  ];

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'team': return Users;
      case 'project': return FolderOpen;
      case 'event': return Calendar;
      case 'review': return ClipboardCheck;
      default: return FolderOpen;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'team': return 'bg-blue-100 text-blue-600';
      case 'project': return 'bg-emerald-100 text-emerald-600';
      case 'event': return 'bg-purple-100 text-purple-600';
      case 'review': return 'bg-amber-100 text-amber-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {currentUser.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-blue-100 text-sm">
            Explore innovations, join teams, and make an impact.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            statsConfig.map((stat) => (
              <Card key={stat.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Get started with your innovation journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <Link key={action.label} to={action.href}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between h-12 group hover:border-blue-300"
                  >
                    <span className="flex items-center gap-3">
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                      {action.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest updates from the community</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`h-9 w-9 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{activity.message}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Featured Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Featured Projects</h2>
              <p className="text-sm text-muted-foreground">Discover innovative ideas from the community</p>
            </div>
            <Link to="/innovation/projects">
              <Button variant="ghost" size="sm" className="text-blue-600">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="w-[320px] shrink-0">
                    <Skeleton className="h-40 rounded-t-lg" />
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                featuredProjects.map((project) => (
                  <Card key={project.id} className="w-[320px] shrink-0 hover:shadow-lg transition-shadow group cursor-pointer overflow-hidden">
                    <div className="h-40 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center relative overflow-hidden">
                      <FolderOpen className="h-16 w-16 text-white/30" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-1 truncate">{project.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 whitespace-normal">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech_stack.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.tech_stack.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{project.tech_stack.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
