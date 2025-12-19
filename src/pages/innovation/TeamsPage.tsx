import { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Users, 
  Filter, 
  Grid3X3, 
  List,
  UserPlus,
  Crown,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  getTeams, 
  getTeamMembers,
  Team,
  TeamMember
} from '@/lib/innovation-hub-data';
import { format } from 'date-fns';

export function TeamsPage() {
  const { currentUser } = useInnovation();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'my' | 'open'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    maxMembers: '',
    isClub: false,
    lookingForMembers: true,
    skillsNeeded: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [teamsData, membersData] = await Promise.all([
        getTeams(),
        getTeamMembers()
      ]);
      setTeams(teamsData);
      setTeamMembers(membersData);
      setLoading(false);
    };
    loadData();
  }, []);

  const getMemberCount = (teamId: number) => {
    return teamMembers.filter(m => m.team_id === teamId).length;
  };

  const isUserMember = (teamId: number) => {
    return teamMembers.some(m => m.team_id === teamId && m.user_id === currentUser.id);
  };

  const isUserLeader = (teamId: number) => {
    return teamMembers.some(m => m.team_id === teamId && m.user_id === currentUser.id && m.role === 'leader');
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          team.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'my') {
      return matchesSearch && isUserMember(team.id);
    }
    if (filter === 'open') {
      return matchesSearch && team.looking_for_members;
    }
    return matchesSearch;
  });

  const handleCreateTeam = () => {
    if (!newTeam.name.trim()) {
      toast({ title: 'Error', description: 'Team name is required', variant: 'destructive' });
      return;
    }
    
    toast({ title: 'Team Created!', description: `${newTeam.name} has been created successfully.` });
    setShowCreateModal(false);
    setNewTeam({ name: '', description: '', maxMembers: '', isClub: false, lookingForMembers: true, skillsNeeded: '' });
  };

  const handleJoinTeam = (team: Team) => {
    toast({ title: 'Request Sent!', description: `Your request to join ${team.name} has been sent.` });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Teams & Clubs</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Find your team or start something new
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Team
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
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="my">My Teams</TabsTrigger>
                <TabsTrigger value="open">Open to Join</TabsTrigger>
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

        {/* Teams Grid/List */}
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
        ) : filteredTeams.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No teams found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {filter === 'my' 
                ? "You haven't joined any teams yet" 
                : "Try adjusting your search or filters"}
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create a Team
            </Button>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team) => (
              <Card key={team.id} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                          {team.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {getMemberCount(team.id)}{team.max_members ? `/${team.max_members}` : ''} members
                          </span>
                        </div>
                      </div>
                    </div>
                    {team.is_club && (
                      <Badge variant="secondary" className="text-xs">Club</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {team.description}
                  </p>

                  {team.skills_needed.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {team.skills_needed.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs font-normal">
                          {skill}
                        </Badge>
                      ))}
                      {team.skills_needed.length > 3 && (
                        <Badge variant="outline" className="text-xs font-normal">
                          +{team.skills_needed.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    {team.looking_for_members && (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        <UserPlus className="h-3 w-3 mr-1" />
                        Recruiting
                      </Badge>
                    )}
                    {!team.looking_for_members && <div />}
                    
                    {isUserMember(team.id) ? (
                      <Button variant="outline" size="sm">
                        {isUserLeader(team.id) && <Crown className="h-3 w-3 mr-1 text-amber-500" />}
                        View
                      </Button>
                    ) : team.looking_for_members ? (
                      <Button size="sm" onClick={() => handleJoinTeam(team)}>
                        Join
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">View</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTeams.map((team) => (
              <Card key={team.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{team.name}</h3>
                      {team.is_club && <Badge variant="secondary" className="text-xs">Club</Badge>}
                      {team.looking_for_members && (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
                          Recruiting
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{team.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                    <Users className="h-4 w-4" />
                    {getMemberCount(team.id)}{team.max_members ? `/${team.max_members}` : ''}
                  </div>
                  {isUserMember(team.id) ? (
                    <Button variant="outline" size="sm">View</Button>
                  ) : team.looking_for_members ? (
                    <Button size="sm" onClick={() => handleJoinTeam(team)}>Join</Button>
                  ) : (
                    <Button variant="outline" size="sm">View</Button>
                  )}
                </CardContent>
              </Card>
            ))}
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

      {/* Create Team Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Start a new team or club for your innovation project
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                placeholder="e.g., AI Innovators"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What's your team about?"
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxMembers">Max Members</Label>
                <Select 
                  value={newTeam.maxMembers} 
                  onValueChange={(v) => setNewTeam({ ...newTeam, maxMembers: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unlimited" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                    <SelectItem value="4">4 members</SelectItem>
                    <SelectItem value="5">5 members</SelectItem>
                    <SelectItem value="6">6 members</SelectItem>
                    <SelectItem value="8">8 members</SelectItem>
                    <SelectItem value="10">10 members</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills Needed</Label>
                <Input
                  id="skills"
                  placeholder="React, Python..."
                  value={newTeam.skillsNeeded}
                  onChange={(e) => setNewTeam({ ...newTeam, skillsNeeded: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Is this a club?</Label>
                <p className="text-xs text-muted-foreground">Clubs are ongoing, teams are project-based</p>
              </div>
              <Switch 
                checked={newTeam.isClub}
                onCheckedChange={(v) => setNewTeam({ ...newTeam, isClub: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Looking for members</Label>
                <p className="text-xs text-muted-foreground">Allow others to request to join</p>
              </div>
              <Switch 
                checked={newTeam.lookingForMembers}
                onCheckedChange={(v) => setNewTeam({ ...newTeam, lookingForMembers: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateTeam} className="bg-blue-600 hover:bg-blue-700">
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
