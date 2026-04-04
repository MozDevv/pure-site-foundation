import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Star, 
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal,
  Linkedin,
  Calendar,
  Send,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SmartDrawer,
  SmartDrawerContent,
  SmartDrawerDescription,
  SmartDrawerHeader,
  SmartDrawerTitle,
} from '@/components/ui/smart-drawer';
import { useMentorship } from '@/components/mentorship/MentorshipContext';
import { Mentor, MentorStatus } from '@/types/mentorship';
import { apiService, endpoints } from '@/lib/api';

const statusConfig: Record<MentorStatus, { label: string; icon: React.ElementType; color: string }> = {
  active: { label: 'Active', icon: CheckCircle, color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
  inactive: { label: 'Inactive', icon: XCircle, color: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300' },
  pending_approval: { label: 'Pending', icon: Clock, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
  on_leave: { label: 'On Leave', icon: Clock, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
};

export function MentorsPage() {
  const { mentors, fetchMentors, approveMentor, updateMentor, loading } = useMentorship();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  
  // Fetch current user to determine role
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiService.get(endpoints.getCurrentUser).then(res => res.data),
  });
  
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'ADMIN';

  useEffect(() => {
    // For students, only fetch active mentors
    if(!isAdmin) {
      fetchMentors({ status: 'active' });
    } else {
      fetchMentors();
    }
  }, [fetchMentors, isAdmin]);

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = 
      mentor.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase

()));
    const matchesStatus = statusFilter === 'all' || mentor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id: string) => {
    await approveMentor(id);
  };

  const handleStatusChange = async (id: string, status: MentorStatus) => {
    await updateMentor(id, { status });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentor Profiles</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage and approve mentor profiles' : 'Browse available mentors for your learning journey'}
          </p>
        </div>
        {isAdmin && (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Mentor
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {isAdmin && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Mentors Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredMentors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No mentors found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMentors.map((mentor) => {
            const StatusIcon = statusConfig[mentor.status].icon;
            return (
              <Card 
                key={mentor.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedMentor(mentor)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={mentor.user.avatar} />
                        <AvatarFallback>
                          {mentor.user.firstName[0]}{mentor.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {mentor.user.firstName} {mentor.user.lastName}
                        </CardTitle>
                        <CardDescription>{mentor.user.email}</CardDescription>
                      </div>
                    </div>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {mentor.status === 'pending_approval' && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleApprove(mentor.id); }}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(mentor.id, 'active'); }}>
                            Set Active
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(mentor.id, 'on_leave'); }}>
                            Set On Leave
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(mentor.id, 'inactive'); }}>
                            Set Inactive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <Badge className={statusConfig[mentor.status].color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusConfig[mentor.status].label}
                      </Badge>
                    )}
                    {mentor.rating && (
                      <Badge variant="outline">
                        <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {mentor.rating.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {mentor.bio}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise.slice(0, 3).map(exp => (
                      <Badge key={exp} variant="secondary" className="text-xs">
                        {exp}
                      </Badge>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{mentor.expertise.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                    <span>{mentor.currentMenteeCount}/{mentor.maxMentees} mentees</span>
                    <span>{mentor.totalSessions} sessions</span>
                  </div>
                  {!isAdmin && (
                    <div className="pt-2">
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={(e) => { 
                          e.stopPropagation();
                          const path = window.location.pathname;
                          const rolePrefix = path.startsWith('/student') ? '/student' : path.startsWith('/tutor') ? '/tutor' : '/admin';
                          window.location.href = `${rolePrefix}/mentorship/find`;
                        }}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Request Mentorship
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Mentor Detail Dialog */}
      <SmartDrawer open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
        <SmartDrawerContent defaultWidth={672}>
          {selectedMentor && (
            <>
              <SmartDrawerHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedMentor.user.avatar} />
                    <AvatarFallback>
                      {selectedMentor.user.firstName[0]}{selectedMentor.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SmartDrawerTitle className="text-2xl">
                      {selectedMentor.user.firstName} {selectedMentor.user.lastName}
                    </SmartDrawerTitle>
                    <SmartDrawerDescription>{selectedMentor.user.email}</SmartDrawerDescription>
                  </div>
                </div>
              </SmartDrawerHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Badge className={statusConfig[selectedMentor.status].color}>
                      {statusConfig[selectedMentor.status].label}
                    </Badge>
                  )}
                  {selectedMentor.rating && (
                    <Badge variant="outline">
                      <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {selectedMentor.rating.toFixed(1)} rating
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {selectedMentor.yearsOfExperience} years experience
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Bio</h4>
                  <p className="text-muted-foreground">{selectedMentor.bio}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMentor.expertise.map(exp => (
                      <Badge key={exp} variant="secondary">{exp}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Availability</h4>
                    <p className="text-muted-foreground">{selectedMentor.availability}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Capacity</h4>
                    <p className="text-muted-foreground">
                      {selectedMentor.currentMenteeCount} / {selectedMentor.maxMentees} mentees
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  {!isAdmin && (
                    <>
                      <Button 
                        className="flex-1"
                        onClick={() => window.location.href = '/admin/mentorship/find'}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Request Mentorship
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                    </>
                  )}
                  {selectedMentor.linkedinUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedMentor.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="mr-2 h-4 w-4" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {selectedMentor.calendlyUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedMentor.calendlyUrl} target="_blank" rel="noopener noreferrer">
                        <Calendar className="mr-2 h-4 w-4" />
                        Calendly
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SmartDrawerContent>
      </SmartDrawer>
    </div>
  );
}
