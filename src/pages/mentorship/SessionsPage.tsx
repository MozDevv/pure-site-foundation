import { useEffect, useState } from 'react';
import { 
  Search, 
  Plus,
  Video,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMentorship } from '@/components/mentorship/MentorshipContext';
import { MentorshipSession, SessionStatus } from '@/types/mentorship';
import { format } from 'date-fns';

const statusConfig: Record<SessionStatus, { label: string; icon: React.ElementType; color: string }> = {
  scheduled: { label: 'Scheduled', icon: Calendar, color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-700' },
  no_show: { label: 'No Show', icon: XCircle, color: 'bg-amber-100 text-amber-700' },
};

export function SessionsPage() {
  const { 
    sessions, 
    matches, 
    groups,
    mentors,
    fetchSessions, 
    fetchMatches,
    fetchGroups,
    fetchMentors,
    createSession, 
    updateSession, 
    loading 
  } = useMentorship();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('scheduled');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<MentorshipSession | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    matchId: '',
    groupId: '',
    mentorId: '',
    scheduledAt: '',
    duration: 60,
    meetingLink: '',
    agenda: '',
  });

  useEffect(() => {
    fetchSessions();
    fetchMatches();
    fetchGroups();
    fetchMentors({ status: 'active' });
  }, [fetchSessions, fetchMatches, fetchGroups, fetchMentors]);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.mentor.user.firstName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || session.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleCreateSession = async () => {
    const menteeIds = formData.matchId 
      ? [matches.find(m => m.id === formData.matchId)?.menteeId || '']
      : groups.find(g => g.id === formData.groupId)?.members.map(m => m.id) || [];

    await createSession({
      ...formData,
      menteeIds,
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
    });
    setCreateDialogOpen(false);
    setFormData({
      title: '',
      description: '',
      matchId: '',
      groupId: '',
      mentorId: '',
      scheduledAt: '',
      duration: 60,
      meetingLink: '',
      agenda: '',
    });
  };

  const handleStatusChange = async (id: string, status: SessionStatus) => {
    await updateSession(id, { status });
  };

  const handleAddNotes = async () => {
    if (!selectedSession) return;
    await updateSession(selectedSession.id, { notes: sessionNotes });
    setNotesDialogOpen(false);
    setSessionNotes('');
    setSelectedSession(null);
  };

  const scheduledCount = sessions.filter(s => s.status === 'scheduled').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentorship Sessions</h1>
          <p className="text-muted-foreground">
            Schedule and track mentorship sessions
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Session</DialogTitle>
              <DialogDescription>
                Create a new mentorship session
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Session Title</Label>
                <Input
                  placeholder="e.g., Career Development Check-in"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Session Type</Label>
                <Select 
                  value={formData.matchId ? 'match' : formData.groupId ? 'group' : ''} 
                  onValueChange={(val) => {
                    if (val === 'match') {
                      setFormData({ ...formData, groupId: '' });
                    } else {
                      setFormData({ ...formData, matchId: '' });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match">1-on-1 Session</SelectItem>
                    <SelectItem value="group">Group Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!formData.groupId && (
                <div className="space-y-2">
                  <Label>Match</Label>
                  <Select 
                    value={formData.matchId} 
                    onValueChange={(val) => {
                      const match = matches.find(m => m.id === val);
                      setFormData({ 
                        ...formData, 
                        matchId: val,
                        mentorId: match?.mentorId || ''
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a match" />
                    </SelectTrigger>
                    <SelectContent>
                      {matches.filter(m => m.status === 'active').map(match => (
                        <SelectItem key={match.id} value={match.id}>
                          {match.mentor.user.firstName} → {match.mentee.user.firstName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!formData.matchId && (
                <div className="space-y-2">
                  <Label>Group</Label>
                  <Select 
                    value={formData.groupId} 
                    onValueChange={(val) => {
                      const group = groups.find(g => g.id === val);
                      setFormData({ 
                        ...formData, 
                        groupId: val,
                        mentorId: group?.mentorId || ''
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.filter(g => g.status === 'active').map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Select 
                    value={formData.duration.toString()} 
                    onValueChange={(val) => setFormData({ ...formData, duration: parseInt(val) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                      <SelectItem value="90">90 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Meeting Link (Optional)</Label>
                <Input
                  placeholder="https://zoom.us/j/..."
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Agenda (Optional)</Label>
                <Textarea
                  placeholder="Session agenda..."
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSession} 
                disabled={!formData.title || !formData.scheduledAt || (!formData.matchId && !formData.groupId)}
              >
                Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="scheduled" className="relative">
            Scheduled
            {scheduledCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                {scheduledCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No sessions found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => {
                const StatusIcon = statusConfig[session.status].icon;
                return (
                  <Card 
                    key={session.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-primary/10 text-primary">
                            <Video className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{session.title}</h3>
                              <Badge className={statusConfig[session.status].color}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {statusConfig[session.status].label}
                              </Badge>
                              {session.groupId && (
                                <Badge variant="outline">Group</Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(session.scheduledAt), 'MMM d, yyyy')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(new Date(session.scheduledAt), 'h:mm a')} ({session.duration} min)
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={session.mentor.user.avatar} />
                                <AvatarFallback>
                                  {session.mentor.user.firstName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {session.mentor.user.firstName} {session.mentor.user.lastName}
                              </span>
                              {session.mentees.length > 0 && (
                                <>
                                  <span className="text-muted-foreground">→</span>
                                  <div className="flex -space-x-2">
                                    {session.mentees.slice(0, 3).map(mentee => (
                                      <Avatar key={mentee.id} className="h-8 w-8 border-2 border-background">
                                        <AvatarImage src={mentee.user.avatar} />
                                        <AvatarFallback>
                                          {mentee.user.firstName[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {session.mentees.length > 3 && (
                                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                        +{session.mentees.length - 3}
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>

                            {session.notes && (
                              <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                                {session.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {session.meetingLink && session.status === 'scheduled' && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Join
                              </a>
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {session.status === 'scheduled' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleStatusChange(session.id, 'completed')}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark Completed
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(session.id, 'cancelled')}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Session
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(session.id, 'no_show')}>
                                    No Show
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem onClick={() => {
                                setSelectedSession(session);
                                setSessionNotes(session.notes || '');
                                setNotesDialogOpen(true);
                              }}>
                                Add Notes
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Notes</DialogTitle>
            <DialogDescription>
              Add notes for this session
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter session notes..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            rows={6}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
