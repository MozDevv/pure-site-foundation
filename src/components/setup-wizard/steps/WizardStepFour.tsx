import React, { useEffect, useImperativeHandle, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  UserPlus,
  Trash2,
  Mail,
  Users,
  Crown,
  Shield,
  User,
  Key,
  Plus,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { WizardData } from '../TeamSetupWizard';
import { apiService, endpoints } from '@/lib/api';
import { TeamRoles } from '../TeamRoles';
import { useToast } from '@/hooks/use-toast';

interface ExistingTeam {
  id: string;
  name: string;
  avatar?: string;
  memberCount: number;
  role: string;
}

interface WizardStepFourProps {
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
}

export const WizardStepFour = React.forwardRef(
  ({ data, onUpdate }: WizardStepFourProps, ref) => {
    const [teamMode, setTeamMode] = useState<'select' | 'existing' | 'new'>(
      'select'
    );
    const [existingTeams, setExistingTeams] = useState<ExistingTeam[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [isLoadingTeams, setIsLoadingTeams] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');

    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [bulkInviteText, setBulkInviteText] = useState('');
    const [newInvite, setNewInvite] = useState({
      email: '',
      roleId: 'member',
      name: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showRolesDialog, setShowRolesDialog] = useState(false);

    // Fetch user's existing teams on mount
    useEffect(() => {
      const fetchExistingTeams = async () => {
        setIsLoadingTeams(true);
        try {
          const response = await apiService.get(endpoints.getUserTeams);
          if (response.status === 200) {
            setExistingTeams(response.data || []);
          }
        } catch (error) {
          console.error('Error fetching teams:', error);
          // Mock data for development
          setExistingTeams([
            { id: '1', name: 'AI Innovators', memberCount: 4, role: 'Lead' },
            { id: '2', name: 'Code Warriors', memberCount: 3, role: 'Member' },
          ]);
        } finally {
          setIsLoadingTeams(false);
        }
      };
      fetchExistingTeams();
    }, []);

    useImperativeHandle(ref, () => ({
      saveData: async () => {
        return await handleSave();
      },
    }));
    const { toast } = useToast();

    const handleSave = async (): Promise<boolean> => {
      setIsSaving(true);
      let incompleteTeam: Record<string, any> | null = null;
      const storedTeam = localStorage.getItem('incompleteTeam');
      if (storedTeam) {
        try {
          incompleteTeam = JSON.parse(storedTeam);
        } catch (error) {
          console.error(
            'Failed to parse incompleteTeam from localStorage:',
            error
          );
        }
      }

      const id = data.id || incompleteTeam?.id || null;
      if (!id) {
        console.error('No project ID found for saving step 3 data');
        toast({
          title: 'Error',
          description: 'No project ID found. Please go back and try again.',
          variant: 'destructive',
        });
        return false;
      }
      const payload = {
        ...(incompleteTeam || {}),
        teamId: selectedTeamId,
      };
      try {
        const res = await apiService.put(
          endpoints.updateProject(id as string),
          payload
        );

        if (res.status === 200) {
          console.log('Step 3 data saved:', res.data);

          // Update localStorage with latest data
          localStorage.setItem('incompleteTeam', JSON.stringify(res.data));

          toast({
            title: 'Success',
            description: 'Team saved successfully, proceed to next step',
          });
          setIsSaving(false);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error saving team data:', error);
        return false;
      } finally {
        setIsSaving(false);
      }
    };

    const getRoleIcon = (roleId: string) => {
      if (roleId === 'lead')
        return <Crown className="w-3 h-3 text-amber-500" />;
      if (roleId === 'member')
        return <Shield className="w-3 h-3 text-blue-500" />;
      return <User className="w-3 h-3 text-gray-400" />;
    };

    const addInvite = () => {
      if (!newInvite.email.trim()) return;

      const invite = {
        email: newInvite.email.trim(),
        roleId: newInvite.roleId,
        name: newInvite.name.trim() || newInvite.email.split('@')[0],
      };

      onUpdate({
        invitees: [...data.invitees, invite],
      });

      setNewInvite({ email: '', roleId: 'member', name: '' });
      setShowInviteDialog(false);
    };

    const removeInvite = (index: number) => {
      onUpdate({
        invitees: data.invitees.filter((_, i) => i !== index),
      });
    };

    const updateInviteRole = (index: number, roleId: string) => {
      const updatedInvitees = [...data.invitees];
      updatedInvitees[index].roleId = roleId;
      onUpdate({ invitees: updatedInvitees });
    };

    const generatePreviewText = (roleId: string) => {
      const role = data.customRoles.find((r) => r.id === roleId);
      if (!role) return '';

      const permissions = [];
      if (role.permissions.projects.createProject)
        permissions.push('create projects');
      if (role.permissions.projects.submitProject)
        permissions.push('submit for judging');
      if (role.permissions.team.inviteMembers)
        permissions.push('invite members');
      if (role.permissions.submissions.uploadFiles)
        permissions.push('upload files');
      if (role.permissions.communication.mentorContact)
        permissions.push('contact mentors');

      return (
        permissions.slice(0, 3).join(', ') +
        (permissions.length > 3 ? '...' : '')
      );
    };

    const selectExistingTeam = (team: ExistingTeam) => {
      setSelectedTeamId(team.id);
      setTeamMode('existing');
      onUpdate({ teamName: team.name });
    };

    const startNewTeam = () => {
      setTeamMode('new');
      setSelectedTeamId(null);
    };

    const confirmNewTeam = () => {
      if (newTeamName.trim()) {
        onUpdate({ teamName: newTeamName.trim() });
      }
    };

    // Team Selection Mode
    if (teamMode === 'select') {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Choose Your Team</h3>
            <p className="text-muted-foreground">
              Select an existing team or create a new one for this hackathon
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Use Existing Team */}
            <Card
              className="cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
              onClick={() =>
                existingTeams.length > 0 && setTeamMode('existing')
              }
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>Use Existing Team</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Submit with a team you're already part of
                </p>
                {isLoadingTeams ? (
                  <p className="text-sm text-muted-foreground">
                    Loading teams...
                  </p>
                ) : existingTeams.length > 0 ? (
                  <Badge variant="secondary">
                    {existingTeams.length} teams available
                  </Badge>
                ) : (
                  <Badge variant="outline">No existing teams</Badge>
                )}
              </CardContent>
            </Card>

            {/* Create New Team */}
            <Card
              className="cursor-pointer hover:border-emerald-500 hover:shadow-lg transition-all"
              onClick={startNewTeam}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <Plus className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle>Create New Team</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Start fresh with a new team for this hackathon
                </p>
                <Badge variant="secondary">Invite members & set roles</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Existing Team Selection
    if (teamMode === 'existing' && !selectedTeamId) {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Select Your Team</h3>
            <p className="text-muted-foreground">
              Choose which team you want to submit with
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={() => setTeamMode('select')}
            className="mb-4"
          >
            ← Back to options
          </Button>

          <div className="space-y-4">
            {existingTeams.map((team) => (
              <Card
                key={team.id}
                className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                onClick={() => selectExistingTeam(team)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {team.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{team.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {team.memberCount} members • Your role: {team.role}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Select</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    // Selected Team Confirmation (Existing)
    if (teamMode === 'existing' && selectedTeamId) {
      const selectedTeam = existingTeams.find((t) => t.id === selectedTeamId);

      return (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Team Selected</h3>
            <p className="text-muted-foreground">
              You'll be submitting with this team
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={() => setSelectedTeamId(null)}
            className="mb-4"
          >
            ← Choose different team
          </Button>

          <Card className="border-2 border-emerald-500 bg-emerald-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold">{selectedTeam?.name}</h4>
                  <p className="text-muted-foreground">
                    {selectedTeam?.memberCount} members • Your role:{' '}
                    {selectedTeam?.role}
                  </p>
                </div>
                <Badge className="bg-emerald-500">Selected</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> All existing team members will be notified
              about this hackathon submission. You can still invite additional
              members below.
            </p>
          </div>

          {/* Optional: Invite Additional Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Invite Additional Members (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog
                open={showInviteDialog}
                onOpenChange={setShowInviteDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite New Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="invite-email">Email Address *</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        value={newInvite.email}
                        onChange={(e) =>
                          setNewInvite({ ...newInvite, email: e.target.value })
                        }
                        placeholder="member@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="invite-name">
                        Display Name (Optional)
                      </Label>
                      <Input
                        id="invite-name"
                        value={newInvite.name}
                        onChange={(e) =>
                          setNewInvite({ ...newInvite, name: e.target.value })
                        }
                        placeholder="John Doe"
                      />
                    </div>
                    <Button onClick={addInvite} className="w-full">
                      Send Invitation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {data.invitees.length > 0 && (
                <div className="mt-4 space-y-2">
                  {data.invitees.map((invitee, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {invitee.name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{invitee.email}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvite(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    // New Team Creation Mode
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Create Your Team</h3>
          <p className="text-muted-foreground">
            Set up your new team and invite members
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={() => setTeamMode('select')}
          className="mb-4"
        >
          ← Back to options
        </Button>

        {/* Team Name Input */}
        {!data.teamName && (
          <Card className="border-2 border-dashed">
            <CardContent className="p-6">
              <Label htmlFor="team-name" className="text-base font-semibold">
                Team Name *
              </Label>
              <div className="flex gap-3 mt-2">
                <Input
                  id="team-name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g., AI Innovators"
                  className="flex-1"
                />
                <Button onClick={confirmNewTeam} disabled={!newTeamName.trim()}>
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Confirmed */}
        {data.teamName && (
          <>
            <Card className="border-2 border-emerald-500 bg-emerald-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Team Name</p>
                    <h4 className="text-lg font-bold">{data.teamName}</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => onUpdate({ teamName: '' })}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Invite Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Dialog
                open={showInviteDialog}
                onOpenChange={setShowInviteDialog}
              >
                <DialogTrigger asChild>
                  <Button className="flex-1">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="invite-email">Email Address *</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        value={newInvite.email}
                        onChange={(e) =>
                          setNewInvite({ ...newInvite, email: e.target.value })
                        }
                        placeholder="member@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="invite-name">
                        Display Name (Optional)
                      </Label>
                      <Input
                        id="invite-name"
                        value={newInvite.name}
                        onChange={(e) =>
                          setNewInvite({ ...newInvite, name: e.target.value })
                        }
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label>Role Assignment</Label>
                      <Select
                        value={newInvite.roleId}
                        onValueChange={(value) =>
                          setNewInvite({ ...newInvite, roleId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {data.customRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              <div className="flex items-center gap-2">
                                {getRoleIcon(role.id)}
                                <span>{role.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {newInvite.roleId && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Can: {generatePreviewText(newInvite.roleId)}
                        </p>
                      )}
                    </div>
                    <Button onClick={addInvite} className="w-full">
                      Send Invitation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showRolesDialog} onOpenChange={setShowRolesDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Key className="w-4 h-4 mr-2" />
                    Configure Roles
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[98vw] max-w-[1600px] h-[90vh] p-6 flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Configure Roles & Permissions</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <TeamRoles data={data} onUpdate={onUpdate} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Invited Members List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members ({data.invitees.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.invitees.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h4 className="text-lg font-medium mb-2">No members yet</h4>
                    <p className="text-sm">Invite your first team member</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.invitees.map((invitee, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>
                              {invitee.name?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{invitee.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {invitee.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Select
                            value={invitee.roleId}
                            onValueChange={(value) =>
                              updateInviteRole(index, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {data.customRoles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  <div className="flex items-center gap-2">
                                    {getRoleIcon(role.id)}
                                    <span>{role.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInvite(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  }
);
