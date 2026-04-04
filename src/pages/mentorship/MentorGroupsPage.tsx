import { useEffect, useState } from 'react';
import { 
  Search, 
  Plus,
  Users,
  Calendar,
  MoreHorizontal
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
  SmartDrawer,
  SmartDrawerContent,
  SmartDrawerDescription,
  SmartDrawerFooter,
  SmartDrawerHeader,
  SmartDrawerTitle,
  SmartDrawerTrigger,
} from '@/components/ui/smart-drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMentorship } from '@/components/mentorship/MentorshipContext';
import { MentorGroup } from '@/types/mentorship';

export function MentorGroupsPage() {
  const { groups, mentors, fetchGroups, fetchMentors, createGroup, updateGroup, loading } = useMentorship();
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<MentorGroup | null>(null);

  const _user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const _role = (_user?.role || 'Student').toLowerCase();
  const canManageGroups = ['tutor', 'mentor', 'admin', 'super_admin'].includes(_role);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mentorId: '',
    maxMembers: 10,
    focus: '',
    meetingSchedule: '',
  });

  useEffect(() => {
    fetchGroups();
    fetchMentors({ status: 'active' });
  }, [fetchGroups, fetchMentors]);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.focus.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.mentor.user.firstName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = async () => {
    await createGroup(formData);
    setCreateDialogOpen(false);
    setFormData({
      name: '',
      description: '',
      mentorId: '',
      maxMembers: 10,
      focus: '',
      meetingSchedule: '',
    });
  };

  const handleStatusChange = async (id: string, status: 'active' | 'inactive' | 'full') => {
    await updateGroup(id, { status });
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    full: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentor Groups</h1>
          <p className="text-muted-foreground">
            Manage group mentorship sessions and member assignments
          </p>
        </div>
        <SmartDrawer open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          {canManageGroups && (
            <SmartDrawerTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </SmartDrawerTrigger>
          )}
          <SmartDrawerContent>
            <SmartDrawerHeader>
              <SmartDrawerTitle>Create Mentor Group</SmartDrawerTitle>
              <SmartDrawerDescription>
                Set up a new group mentorship program
              </SmartDrawerDescription>
            </SmartDrawerHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Group Name</Label>
                <Input
                  placeholder="e.g., Career Development Circle"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the group's purpose and activities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Lead Mentor</Label>
                <Select 
                  value={formData.mentorId} 
                  onValueChange={(val) => setFormData({ ...formData, mentorId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors.filter(m => m.status === 'active').map(mentor => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.user.firstName} {mentor.user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Members</Label>
                  <Input
                    type="number"
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                    min={2}
                    max={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Focus Area</Label>
                  <Input
                    placeholder="e.g., Data Science"
                    value={formData.focus}
                    onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Meeting Schedule</Label>
                <Input
                  placeholder="e.g., Every Thursday 7 PM"
                  value={formData.meetingSchedule}
                  onChange={(e) => setFormData({ ...formData, meetingSchedule: e.target.value })}
                />
              </div>
            </div>
            <SmartDrawerFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGroup} disabled={!formData.name || !formData.mentorId}>
                Create Group
              </Button>
            </SmartDrawerFooter>
          </SmartDrawerContent>
        </SmartDrawer>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No groups found</p>
            {canManageGroups && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setCreateDialogOpen(true)}
              >
                Create your first group
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <Card 
              key={group.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedGroup(group)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {group.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    {canManageGroups && (
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    )}
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(group.id, 'active'); }}>
                        Set Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(group.id, 'inactive'); }}>
                        Set Inactive
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(group.id, 'full'); }}>
                        Mark as Full
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[group.status]}>
                    {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                  </Badge>
                  <Badge variant="outline">{group.focus}</Badge>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={group.mentor.user.avatar} />
                    <AvatarFallback>
                      {group.mentor.user.firstName[0]}{group.mentor.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {group.mentor.user.firstName} {group.mentor.user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">Lead Mentor</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-3 border-t">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{group.currentMemberCount}/{group.maxMembers}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">{group.meetingSchedule}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Group Detail Dialog */}
      <SmartDrawer open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <SmartDrawerContent defaultWidth={672}>
          {selectedGroup && (
            <>
              <SmartDrawerHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <SmartDrawerTitle className="text-2xl">{selectedGroup.name}</SmartDrawerTitle>
                    <SmartDrawerDescription>{selectedGroup.description}</SmartDrawerDescription>
                  </div>
                  <Badge className={statusColors[selectedGroup.status]}>
                    {selectedGroup.status}
                  </Badge>
                </div>
              </SmartDrawerHeader>
              <div className="space-y-6 mt-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={selectedGroup.mentor.user.avatar} />
                    <AvatarFallback>
                      {selectedGroup.mentor.user.firstName[0]}{selectedGroup.mentor.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {selectedGroup.mentor.user.firstName} {selectedGroup.mentor.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">Lead Mentor</p>
                    <p className="text-sm text-muted-foreground">{selectedGroup.mentor.user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{selectedGroup.currentMemberCount}</p>
                    <p className="text-sm text-muted-foreground">Members</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{selectedGroup.maxMembers}</p>
                    <p className="text-sm text-muted-foreground">Max Capacity</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{selectedGroup.focus}</p>
                    <p className="text-sm text-muted-foreground">Focus Area</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Meeting Schedule</h4>
                  <p className="text-muted-foreground">{selectedGroup.meetingSchedule}</p>
                </div>

                {selectedGroup.members.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Members</h4>
                    <div className="space-y-2">
                      {selectedGroup.members.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg border">
                          <Avatar>
                            <AvatarImage src={member.user.avatar} />
                            <AvatarFallback>
                              {member.user.firstName[0]}{member.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {member.user.firstName} {member.user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{member.user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SmartDrawerContent>
      </SmartDrawer>
    </div>
  );
}
