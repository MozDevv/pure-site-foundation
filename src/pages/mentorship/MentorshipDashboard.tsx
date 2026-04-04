import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  ClipboardList, 
  Video, 
  UsersRound, 
  ArrowRight,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useMentorship } from '@/components/mentorship/MentorshipContext';
import { format } from 'date-fns';

export function MentorshipDashboard() {
  const navigate = useNavigate();
  const { 
    stats, 
    requests, 
    sessions, 
    matches,
    fetchStats, 
    fetchRequests, 
    fetchSessions,
    fetchMatches,
    loading 
  } = useMentorship();

  // Determine base path based on user role
  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : null;
  const userRole = (user?.role || 'Student');
  const isAdmin = userRole === 'Admin' || userRole === 'ADMIN';
  const isTutor = userRole === 'Tutor' || userRole === 'TUTOR';
  const isMentor = userRole === 'Mentor' || userRole === 'MENTOR';
  const isStudent = userRole === 'Student' || userRole === 'STUDENT';
  const basePath = isStudent ? '/student/mentorship' : isAdmin ? '/admin/mentorship' : '/tutor/mentorship';

  useEffect(() => {
    fetchStats();
    fetchRequests({ status: 'pending' });
    fetchSessions({ status: 'scheduled' });
    fetchMatches({ status: 'active' });
  }, [fetchStats, fetchRequests, fetchSessions, fetchMatches]);

  const statCards = [
    { 
      title: 'Active Mentors', 
      value: stats?.activeMentors || 0, 
      icon: UserCheck, 
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
      href: `${basePath}/mentors`
    },
    { 
      title: 'Pending Requests', 
      value: stats?.pendingRequests || 0, 
      icon: ClipboardList, 
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
      href: `${basePath}/requests`
    },
    { 
      title: 'Active Matches', 
      value: stats?.activeMatches || 0, 
      icon: Users, 
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
      href: `${basePath}/matching`
    },
    { 
      title: 'Upcoming Sessions', 
      value: stats?.upcomingSessions || 0, 
      icon: Video, 
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
      href: `${basePath}/sessions`
    },
    { 
      title: 'Mentor Groups', 
      value: stats?.totalGroups || 0, 
      icon: UsersRound, 
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
      href: `${basePath}/groups`
    },
    { 
      title: 'Completed Sessions', 
      value: stats?.completedSessions || 0, 
      icon: TrendingUp, 
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
      href: `${basePath}/sessions`
    },
  ];

  const pendingRequests = requests.filter(r => r.status === 'pending').slice(0, 5);
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mentorship Hub</h1>
          <p className="text-muted-foreground">
            Manage mentor-mentee relationships and track mentorship progress
          </p>
        </div>
        {!isStudent && (
          <Button onClick={() => navigate(`${basePath}/matching`)}>
            <Users className="mr-2 h-4 w-4" />
            Create Match
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards
          .filter((stat) => {
            // Students shouldn't see admin-oriented stats
            if (isStudent) {
              const hiddenForStudents = ['Pending Requests', 'Active Matches', 'Mentor Groups'];
              return !hiddenForStudents.includes(stat.title);
            }
            return true;
          })
          .map((stat) => (
          <Card 
            key={stat.title} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(stat.href)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Requests - Admin/Tutor only */}
        {!isStudent && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>Students waiting for mentor assignment</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate(`${basePath}/requests`)}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : pendingRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pending requests</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`${basePath}/requests`)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.mentee.user.avatar} />
                        <AvatarFallback>
                          {request.mentee.user.firstName[0]}{request.mentee.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {request.mentee.user.firstName} {request.mentee.user.lastName}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {request.requestedExpertise.slice(0, 2).map(exp => (
                            <Badge key={exp} variant="secondary" className="text-xs">
                              {exp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {format(new Date(request.createdAt), 'MMM d')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Scheduled mentorship sessions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate(`${basePath}/sessions`)}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingSessions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No upcoming sessions</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div 
                    key={session.id} 
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`${basePath}/sessions`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{session.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.mentor.user.firstName} {session.mentor.user.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(new Date(session.scheduledAt), 'MMM d')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(session.scheduledAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Matches - Admin/Tutor only */}
      {!isStudent && (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Mentorships</CardTitle>
            <CardDescription>Currently active mentor-mentee pairs</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(`${basePath}/matching`)}>
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : matches.filter(m => m.status === 'active').length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active matches</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {matches.filter(m => m.status === 'active').slice(0, 6).map((match) => (
                <div 
                  key={match.id} 
                  className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`${basePath}/matching`)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={match.mentor.user.avatar} />
                      <AvatarFallback>
                        {match.mentor.user.firstName[0]}{match.mentor.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={match.mentee.user.avatar} />
                      <AvatarFallback>
                        {match.mentee.user.firstName[0]}{match.mentee.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="font-medium text-sm">
                    {match.mentor.user.firstName} → {match.mentee.user.firstName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {match.completedSessions} / {match.totalSessions} sessions
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {match.meetingFrequency}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}
