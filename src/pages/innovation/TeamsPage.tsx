import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Users,
  Grid3X3,
  List,
  UserPlus,
  Crown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { apiService, endpoints } from '@/lib/api';
import { CreateTeam } from '@/components/CreateTeam';

interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  teamMembers: any[];
  allTeamRoles: any[];
}

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'my' | 'open'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(endpoints.getUserTeams);
      if (response.status === 200) {
        setTeams(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      // Mock data for development
      setTeams([
        {
          id: '1',
          name: 'AI Innovators',
          description: 'Building the future with AI',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          teamMembers: [{ id: '1' }, { id: '2' }, { id: '3' }],
          allTeamRoles: [],
        },
        {
          id: '2',
          name: 'Code Warriors',
          description: 'Passionate developers team',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          teamMembers: [{ id: '1' }, { id: '2' }],
          allTeamRoles: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTeamCreated = (team: Team) => {
    setTeams((prev) => [...prev, team]);
    setShowCreateTeam(false);
    toast({
      title: 'Team Created!',
      description: `${team.name} has been created successfully.`,
    });
  };

  // Show TeamSetup for create/edit
  if (showCreateTeam || selectedTeamId) {
    return (
      <CreateTeam
        teamId={selectedTeamId || undefined}
        onBack={() => {
          setShowCreateTeam(false);
          setSelectedTeamId(null);
        }}
        onTeamCreated={handleTeamCreated}
      />
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Teams</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your teams and collaborate with others
              </p>
            </div>
            <Button
              onClick={() => setShowCreateTeam(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
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
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as typeof filter)}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="my">My Teams</TabsTrigger>
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
        ) : filteredTeams.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              No teams found
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {filter === 'my'
                ? "You haven't joined any teams yet"
                : 'Try adjusting your search or filters'}
            </p>
            <Button onClick={() => setShowCreateTeam(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create a Team
            </Button>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team) => (
              <Card
                key={team.id}
                className="hover:shadow-md transition-shadow group cursor-pointer"
                onClick={() => setSelectedTeamId(team.id)}
              >
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
                            {team.teamMembers?.length || 0} members
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {team.description || 'No description'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <Badge variant="secondary">
                      {team.allTeamRoles?.length || 0} roles
                    </Badge>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTeams.map((team) => (
              <Card
                key={team.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTeamId(team.id)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        {team.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {team.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                    <Users className="h-4 w-4" />
                    {team.teamMembers?.length || 0}
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Floating Create Button (Mobile) */}
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 lg:hidden"
          onClick={() => setShowCreateTeam(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
