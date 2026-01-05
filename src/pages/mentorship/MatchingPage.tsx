import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  ArrowRight,
  CheckCircle,
  Users,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/dialog';
import { useMentorship } from '@/components/mentorship/MentorshipContext';
import { Mentor, MenteeRequest, MentorGroup } from '@/types/mentorship';

export function MatchingPage() {
  const location = useLocation();
  const { 
    mentors, 
    requests, 
    groups,
    matches,
    fetchMentors, 
    fetchRequests,
    fetchGroups,
    fetchMatches,
    createMatch,
    loading 
  } = useMentorship();

  const [selectedRequest, setSelectedRequest] = useState<MenteeRequest | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<MentorGroup | null>(null);
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [matchGoals, setMatchGoals] = useState('');
  const [meetingFrequency, setMeetingFrequency] = useState('Weekly');
  const [searchMentor, setSearchMentor] = useState('');

  useEffect(() => {
    fetchMentors({ status: 'active' });
    fetchRequests({ status: 'pending' });
    fetchGroups();
    fetchMatches();
  }, [fetchMentors, fetchRequests, fetchGroups, fetchMatches]);

  // Auto-select request if passed from requests page
  useEffect(() => {
    if (location.state?.requestId) {
      const request = requests.find(r => r.id === location.state.requestId);
      if (request) {
        setSelectedRequest(request);
      }
    }
  }, [location.state, requests]);

  const availableMentors = mentors.filter(m => 
    m.status === 'active' && 
    m.currentMenteeCount < m.maxMentees &&
    (searchMentor === '' || 
      m.user.firstName.toLowerCase().includes(searchMentor.toLowerCase()) ||
      m.user.lastName.toLowerCase().includes(searchMentor.toLowerCase()) ||
      m.expertise.some(e => e.toLowerCase().includes(searchMentor.toLowerCase())))
  );

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const handleCreateMatch = async () => {
    if (!selectedRequest || !selectedMentor) return;

    await createMatch({
      mentorId: selectedMentor.id,
      menteeId: selectedRequest.menteeId,
      requestId: selectedRequest.id,
      groupId: selectedGroup?.id,
      goals: matchGoals || selectedRequest.goals,
      meetingFrequency,
    });

    setMatchDialogOpen(false);
    setSelectedRequest(null);
    setSelectedMentor(null);
    setSelectedGroup(null);
    setMatchGoals('');
    setMeetingFrequency('Weekly');
  };

  const getCompatibilityScore = (mentor: Mentor, request: MenteeRequest): number => {
    const expertiseMatch = request.requestedExpertise.filter(exp =>
      mentor.expertise.some(e => e.toLowerCase().includes(exp.toLowerCase()))
    ).length;
    const score = Math.min((expertiseMatch / request.requestedExpertise.length) * 100, 100);
    return Math.round(score);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mentor Matching</h1>
        <p className="text-muted-foreground">
          Match mentees with suitable mentors based on expertise and goals
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Requests</span>
              <Badge variant="secondary">{pendingRequests.length}</Badge>
            </CardTitle>
            <CardDescription>Select a request to match with a mentor</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : pendingRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No pending requests
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedRequest?.id === request.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.mentee.user.avatar} />
                        <AvatarFallback>
                          {request.mentee.user.firstName[0]}{request.mentee.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {request.mentee.user.firstName} {request.mentee.user.lastName}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {request.requestedExpertise.slice(0, 2).map(exp => (
                            <Badge key={exp} variant="secondary" className="text-xs">
                              {exp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {selectedRequest?.id === request.id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Mentors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Available Mentors</span>
              <Badge variant="secondary">{availableMentors.length}</Badge>
            </CardTitle>
            <CardDescription>Select a mentor to create a match</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or expertise..."
                value={searchMentor}
                onChange={(e) => setSearchMentor(e.target.value)}
                className="pl-9"
              />
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : availableMentors.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No available mentors
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {availableMentors.map((mentor) => {
                  const compatScore = selectedRequest 
                    ? getCompatibilityScore(mentor, selectedRequest) 
                    : null;
                  return (
                    <div
                      key={mentor.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedMentor?.id === mentor.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedMentor(mentor)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={mentor.user.avatar} />
                          <AvatarFallback>
                            {mentor.user.firstName[0]}{mentor.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {mentor.user.firstName} {mentor.user.lastName}
                            </p>
                            {mentor.rating && (
                              <span className="flex items-center text-sm text-muted-foreground">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                {mentor.rating}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {mentor.expertise.slice(0, 2).map(exp => (
                              <Badge key={exp} variant="secondary" className="text-xs">
                                {exp}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {mentor.currentMenteeCount}/{mentor.maxMentees} mentees
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {compatScore !== null && (
                            <Badge 
                              variant={compatScore >= 70 ? 'default' : 'secondary'}
                              className={compatScore >= 70 ? 'bg-green-600' : ''}
                            >
                              {compatScore}% match
                            </Badge>
                          )}
                          {selectedMentor?.id === mentor.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
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

      {/* Create Match Button */}
      {selectedRequest && selectedMentor && (
        <Card className="bg-primary/5 border-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedRequest.mentee.user.avatar} />
                  <AvatarFallback>
                    {selectedRequest.mentee.user.firstName[0]}
                  </AvatarFallback>
                </Avatar>
                <ArrowRight className="h-6 w-6 text-primary" />
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedMentor.user.avatar} />
                  <AvatarFallback>
                    {selectedMentor.user.firstName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-semibold">
                    {selectedRequest.mentee.user.firstName} {selectedRequest.mentee.user.lastName}
                    <span className="text-muted-foreground font-normal mx-2">→</span>
                    {selectedMentor.user.firstName} {selectedMentor.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ready to create mentorship match
                  </p>
                </div>
              </div>
              <Button size="lg" onClick={() => setMatchDialogOpen(true)}>
                <Users className="mr-2 h-4 w-4" />
                Create Match
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Matches */}
      <Card>
        <CardHeader>
          <CardTitle>Active Matches</CardTitle>
          <CardDescription>Currently active mentor-mentee pairs</CardDescription>
        </CardHeader>
        <CardContent>
          {matches.filter(m => m.status === 'active').length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No active matches
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {matches.filter(m => m.status === 'active').map((match) => (
                <div key={match.id} className="p-4 rounded-lg border">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarImage src={match.mentor.user.avatar} />
                      <AvatarFallback>
                        {match.mentor.user.firstName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Avatar>
                      <AvatarImage src={match.mentee.user.avatar} />
                      <AvatarFallback>
                        {match.mentee.user.firstName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="font-medium text-sm">
                    {match.mentor.user.firstName} → {match.mentee.user.firstName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {match.completedSessions} sessions completed
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

      {/* Match Dialog */}
      <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Mentorship Match</DialogTitle>
            <DialogDescription>
              Confirm the details for this mentor-mentee pairing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <Avatar className="h-16 w-16 mx-auto">
                  <AvatarImage src={selectedMentor?.user.avatar} />
                  <AvatarFallback>
                    {selectedMentor?.user.firstName[0]}
                  </AvatarFallback>
                </Avatar>
                <p className="mt-2 font-medium text-sm">
                  {selectedMentor?.user.firstName}
                </p>
                <p className="text-xs text-muted-foreground">Mentor</p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div className="text-center">
                <Avatar className="h-16 w-16 mx-auto">
                  <AvatarImage src={selectedRequest?.mentee.user.avatar} />
                  <AvatarFallback>
                    {selectedRequest?.mentee.user.firstName[0]}
                  </AvatarFallback>
                </Avatar>
                <p className="mt-2 font-medium text-sm">
                  {selectedRequest?.mentee.user.firstName}
                </p>
                <p className="text-xs text-muted-foreground">Mentee</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Meeting Frequency</Label>
              <Select value={meetingFrequency} onValueChange={setMeetingFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Add to Group (Optional)</Label>
              <Select 
                value={selectedGroup?.id || ''} 
                onValueChange={(val) => setSelectedGroup(groups.find(g => g.id === val) || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No group</SelectItem>
                  {groups.filter(g => g.mentorId === selectedMentor?.id).map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Goals</Label>
              <Textarea
                placeholder="Define goals for this mentorship..."
                value={matchGoals || selectedRequest?.goals || ''}
                onChange={(e) => setMatchGoals(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMatchDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMatch}>
              Create Match
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
