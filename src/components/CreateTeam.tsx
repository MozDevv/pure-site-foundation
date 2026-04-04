import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Users,
  Plus,
  Crown,
  Shield,
  User,
  Mail,
  Trash2,
  Edit,
  Settings,
  UserPlus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Key,
  Globe,
  Lock,
  UserCheck,
} from 'lucide-react';
import { apiService, endpoints } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { TeamRoles } from '@/components/setup-wizard/TeamRoles';
import { format } from 'date-fns';

// Types based on API response
interface Permission {
  id: string;
  name: string;
  section: string;
  enabled: boolean;
}

interface TeamRole {
  id: string;
  name: string;
  permissions: Permission[];
}

interface TeamMember {
  id: string;
  inviterProvidedName: string;
  joinedAt: string;
  status: 'INVITED_USER_PENDING_ACCEPTANCE' | 'ACTIVE' | 'INACTIVE';
  isOwner: boolean;
  role: TeamRole;
  email: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  createdAt: string;
  updatedAt: string;
  teamMembers: TeamMember[];
  allTeamRoles: TeamRole[];
}

// Create team payload type
interface CreateTeamPayload {
  name: string;
  description: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  teamMembers: {
    name: string;
    email: string;
    roleName: string;
  }[];
  customRoles: {
    name: string;
    permissions: Record<string, Record<string, boolean>>;
  }[];
}

interface TeamSetupProps {
  teamId?: string;
  onBack?: () => void;
  onTeamCreated?: (team: Team) => void;
}

export function CreateTeam({ teamId, onBack, onTeamCreated }: TeamSetupProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [team, setTeam] = useState<Team | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showRolesDialog, setShowRolesDialog] = useState(false);

  // Form state for creating/editing team
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'INVITE_ONLY' as 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY',
  });

  // Invitee state
  const [newInvite, setNewInvite] = useState({
    name: '',
    email: '',
    roleName: 'Member',
  });

  // Local state for wizard-style data (compatible with TeamRoles component)
  const [wizardData, setWizardData] = useState<any>({
    teamName: '',
    description: '',
    customRoles: [
      {
        id: 'lead',
        name: 'Team Lead',
        permissions: {
          projects: {
            createProject: true,
            editProject: true,
            deleteProject: true,
            submitProject: true,
          },
          team: {
            inviteMembers: true,
            removeMembers: true,
            assignRoles: true,
            manageTeamSettings: true,
          },
          submissions: {
            uploadFiles: true,
            editSubmission: true,
            addDemoLink: true,
            viewFeedback: true,
          },
          communication: {
            postUpdates: true,
            chat: true,
            mentorContact: true,
          },
        },
      },
      {
        id: 'member',
        name: 'Member',
        permissions: {
          projects: {
            createProject: true,
            editProject: true,
            deleteProject: false,
            submitProject: false,
          },
          team: {
            inviteMembers: false,
            removeMembers: false,
            assignRoles: false,
            manageTeamSettings: false,
          },
          submissions: {
            uploadFiles: true,
            editSubmission: true,
            addDemoLink: true,
            viewFeedback: true,
          },
          communication: {
            postUpdates: true,
            chat: true,
            mentorContact: true,
          },
        },
      },
      {
        id: 'viewer',
        name: 'Viewer',
        permissions: {
          projects: {
            createProject: false,
            editProject: false,
            deleteProject: false,
            submitProject: false,
          },
          team: {
            inviteMembers: false,
            removeMembers: false,
            assignRoles: false,
            manageTeamSettings: false,
          },
          submissions: {
            uploadFiles: false,
            editSubmission: false,
            addDemoLink: false,
            viewFeedback: true,
          },
          communication: {
            postUpdates: false,
            chat: true,
            mentorContact: false,
          },
        },
      },
    ],
    invitees: [],
  });

  const isEditMode = !!teamId;

  // Fetch team data if editing
  useEffect(() => {
    if (teamId) {
      fetchTeam();
    }
  }, [teamId]);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const response = await apiService.getWithParams(
        endpoints.getTeamById(teamId),
        {
          teamId,
        }
      );
      if (response.status === 200) {
        const teamData = response.data;
        setTeam(teamData);
        setFormData({
          name: teamData.name,
          description: teamData.description,
          visibility: teamData.visibility || 'INVITE_ONLY',
        });
        // Convert API roles to wizard format
        const convertedRoles = teamData.allTeamRoles.map((role: TeamRole) => ({
          id: role.id,
          name: role.name,
          permissions: convertPermissionsFromApi(role.permissions),
        }));
        setWizardData((prev: any) => ({
          ...prev,
          teamName: teamData.name,
          description: teamData.description,
          customRoles:
            convertedRoles.length > 0 ? convertedRoles : prev.customRoles,
          invitees: teamData.teamMembers.map((m: TeamMember) => ({
            email: m.email,
            name:
              m.firstName && m.lastName
                ? `${m.firstName} ${m.lastName}`
                : m.inviterProvidedName,
            roleId: m?.role?.id || 'member',
          })),
        }));
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Convert API permissions format to wizard format
  const convertPermissionsFromApi = (permissions: Permission[]): any => {
    const result: Record<string, Record<string, boolean>> = {
      projects: {},
      team: {},
      submissions: {},
      communication: {},
    };

    permissions.forEach((perm) => {
      const section = perm?.section?.toLowerCase();
      if (result[section]) {
        result[section][perm.name] = perm.enabled;
      }
    });

    return result;
  };

  // Convert wizard format to API format
  const convertPermissionsToApi = (
    permissions: any
  ): Record<string, Record<string, boolean>> => {
    return permissions;
  };

  const handleCreateTeam = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Team name is required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const payload: CreateTeamPayload = {
      name: formData.name,
      description: formData.description,
      visibility: formData.visibility,
      teamMembers: wizardData.invitees.map((inv: any) => ({
        name: inv.name,
        email: inv.email,
        roleName:
          wizardData.customRoles.find((r: any) => r.id === inv.roleId)?.name ||
          'Member',
      })),
      customRoles: wizardData.customRoles.map((role: any) => ({
        name: role.name,
        permissions: convertPermissionsToApi(role.permissions),
      })),
    };

    try {
      const response = await apiService.post(endpoints.createTeam, payload);
      if (response.status === 200 || response.status === 201) {
        toast({
          title: 'Success',
          description: `Team "${formData.name}" created successfully!`,
        });
        onTeamCreated?.(response.data);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: 'Error',
        description: 'Failed to create team',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Team name is required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const payload = {
      id: teamId,
      name: formData.name,
      description: formData.description,
      visibility: formData.visibility,
      customRoles: wizardData.customRoles.map((role: any) => ({
        name: role.name,
        permissions: convertPermissionsToApi(role.permissions),
      })),
    };

    try {
      const response = await apiService.put(endpoints.teams, payload);
      if (response.status === 200) {
        toast({
          title: 'Success',
          description: 'Team updated successfully!',
        });
        fetchTeam();
      }
    } catch (error) {
      console.error('Error updating team:', error);
      toast({
        title: 'Error',
        description: 'Failed to update team',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const [loadingInvites, setLoadingInvites] = useState(false);
  const handleAddInvite = async () => {
    setLoadingInvites(true);
    if (!newInvite.email.trim()) {
      setLoadingInvites(false);
      return;
    }

    const roleId =
      wizardData.customRoles.find((r: any) => r.name === newInvite.roleName)
        ?.id || 'member';

    try {
      const res = await apiService.post(
        endpoints.inviteMemberToTeam(teamId!, newInvite.email, roleId)
      );
      if (res.status === 200 || res.status === 201) {
        setWizardData((prev: any) => ({
          ...prev,
          invitees: [
            ...prev.invitees,
            {
              email: newInvite.email.trim(),
              name: newInvite.name.trim() || newInvite.email.split('@')[0],
              roleId,
            },
          ],
        }));

        setNewInvite({ name: '', email: '', roleName: 'Member' });
        setShowInviteDialog(false);
        toast({
          title: 'Success',
          description: 'Invitation sent successfully!',
        });
        fetchTeam();
      }
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setLoadingInvites(false);
    }
  };

  const handleRemoveInvite = (index: number) => {
    setWizardData((prev: any) => ({
      ...prev,
      invitees: prev.invitees.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await apiService.delete(
        `${endpoints.teams}/${teamId}/members/${memberId}`
      );
      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });
      fetchTeam();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const updateWizardData = (updates: Partial<any>) => {
    setWizardData((prev: any) => ({ ...prev, ...updates }));
  };

  const getRoleIcon = (roleName?: string | null) => {
    if (!roleName || typeof roleName !== 'string') {
      return <User className="w-4 h-4 text-gray-400" />;
    }

    const name = roleName.toLowerCase();
    if (
      name.includes('lead') ||
      name.includes('owner') ||
      name.includes('admin')
    ) {
      return <Crown className="w-4 h-4 text-amber-500" />;
    }
    if (name.includes('member')) {
      return <Shield className="w-4 h-4 text-blue-500" />;
    }
    return <User className="w-4 h-4 text-gray-400" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'INVITED_USER_PENDING_ACCEPTANCE':
        return (
          <Badge
            variant="outline"
            className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400"
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'ACTIVE':
        return (
          <Badge
            variant="outline"
            className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-400"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'INACTIVE':
        return (
          <Badge
            variant="outline"
            className="text-muted-foreground border-border bg-muted"
          >
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      default:
        return null;
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return (
          <Badge
            variant="outline"
            className="text-green-600 border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800 dark:text-green-400"
          >
            <Globe className="w-3 h-3 mr-1" />
            Public
          </Badge>
        );
      case 'PRIVATE':
        return (
          <Badge
            variant="outline"
            className="text-red-600 border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800 dark:text-red-400"
          >
            <Lock className="w-3 h-3 mr-1" />
            Private
          </Badge>
        );
      case 'INVITE_ONLY':
        return (
          <Badge
            variant="outline"
            className="text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400"
          >
            <UserCheck className="w-3 h-3 mr-1" />
            Invite Only
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b">
        <div className=" mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {isEditMode ? 'Team Settings' : 'Create New Team'}
                </h1>
                {isEditMode && team && getVisibilityBadge(formData.visibility)}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {isEditMode
                  ? 'Manage your team details, members, and roles'
                  : 'Set up your team with members and roles'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className=" mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members
              {(team?.teamMembers.length || wizardData.invitees.length) > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {team?.teamMembers.length || wizardData.invitees.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Roles
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Team Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., AI Innovators"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="What's your team about?"
                      rows={4}
                    />
                  </div>

                  {isEditMode && team && (
                    <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Created: {format(new Date(team.createdAt), 'PPP')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Last updated: {format(new Date(team.updatedAt), 'PPP')}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Visibility Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Visibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.visibility}
                    onValueChange={(
                      value: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY'
                    ) => setFormData({ ...formData, visibility: value })}
                  >
                    <div className="space-y-3">
                      <div
                        className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                          formData.visibility === 'INVITE_ONLY'
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/50'
                            : ''
                        }`}
                      >
                        <RadioGroupItem value="INVITE_ONLY" id="INVITE_ONLY" />
                        <label
                          htmlFor="INVITE_ONLY"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <UserCheck className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Invite Only</span>
                            <Badge variant="secondary" className="text-xs">
                              Recommended
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Members can only join through direct invitations
                            from team leads
                          </p>
                        </label>
                      </div>

                      <div
                        className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                          formData.visibility === 'PUBLIC'
                            ? 'border-green-500 bg-green-50/50 dark:bg-green-950/50'
                            : ''
                        }`}
                      >
                        <RadioGroupItem value="PUBLIC" id="PUBLIC" />
                        <label
                          htmlFor="PUBLIC"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Globe className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Public</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Anyone can discover and request to join this team
                          </p>
                        </label>
                      </div>

                      <div
                        className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                          formData.visibility === 'PRIVATE'
                            ? 'border-red-500 bg-red-50/50 dark:bg-red-950/50'
                            : ''
                        }`}
                      >
                        <RadioGroupItem value="PRIVATE" id="PRIVATE" />
                        <label
                          htmlFor="PRIVATE"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Lock className="w-4 h-4 text-red-600" />
                            <span className="font-medium">Private</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Only team members can see and access this team.
                            Hidden from discovery.
                          </p>
                        </label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Members
                  </CardTitle>
                  <SmartDrawer
                    open={showInviteDialog}
                    onOpenChange={setShowInviteDialog}
                  >
                    <SmartDrawerTrigger asChild>
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Member
                      </Button>
                    </SmartDrawerTrigger>
                    <SmartDrawerContent>
                      <SmartDrawerHeader>
                        <SmartDrawerTitle>Invite Team Member</SmartDrawerTitle>
                        <SmartDrawerDescription>
                          Send an invitation to join your team
                        </SmartDrawerDescription>
                      </SmartDrawerHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="invite-email">Email Address *</Label>
                          <Input
                            id="invite-email"
                            type="email"
                            value={newInvite.email}
                            onChange={(e) =>
                              setNewInvite({
                                ...newInvite,
                                email: e.target.value,
                              })
                            }
                            placeholder="member@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="invite-name">Display Name</Label>
                          <Input
                            id="invite-name"
                            value={newInvite.name}
                            onChange={(e) =>
                              setNewInvite({
                                ...newInvite,
                                name: e.target.value,
                              })
                            }
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select
                            value={newInvite.roleName}
                            onValueChange={(value) =>
                              setNewInvite({ ...newInvite, roleName: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {wizardData.customRoles.map((role: any) => (
                                <SelectItem key={role.id} value={role.name}>
                                  <div className="flex items-center gap-2">
                                    {getRoleIcon(role?.name)}
                                    {role?.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <SmartDrawerFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowInviteDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddInvite}
                          disabled={loadingInvites || !newInvite.email.trim()}
                        >
                          {loadingInvites ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send Invitation'
                          )}
                        </Button>
                      </SmartDrawerFooter>
                    </SmartDrawerContent>
                  </SmartDrawer>
                </div>
              </CardHeader>
              <CardContent>
                {/* Existing Team Members (Edit Mode) */}
                {isEditMode &&
                  team?.teamMembers &&
                  team.teamMembers.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Current Members
                      </h4>
                      {team.teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {(
                                  member.firstName?.[0] ||
                                  member.inviterProvidedName?.[0] ||
                                  'U'
                                ).toUpperCase()}
                                {(member.lastName?.[0] || '').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {member.firstName && member.lastName
                                    ? `${member.firstName} ${member.lastName}`
                                    : member.inviterProvidedName ||
                                      member.username ||
                                      'Unknown'}
                                </span>
                                {member.isOwner && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    <Crown className="w-3 h-3 mr-1 text-amber-500" />
                                    Owner
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {member.email}
                              </div>
                              {member.joinedAt && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  Joined{' '}
                                  {format(
                                    new Date(member.joinedAt),
                                    'MMM d, yyyy'
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(member.status)}
                            {member.role && (
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1"
                              >
                                {getRoleIcon(member.role.name)}
                                {member.role.name}
                              </Badge>
                            )}
                            {!member.isOwner && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Remove Member
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove this
                                      member from the team?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleRemoveMember(member.id)
                                      }
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {/* Empty State */}
                {(!team?.teamMembers || team.teamMembers.length === 0) &&
                  wizardData.invitees.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h4 className="text-lg font-medium mb-2">
                        No team members yet
                      </h4>
                      <p className="text-sm mb-4">
                        Start by inviting your first team member
                      </p>
                      <Button onClick={() => setShowInviteDialog(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Member
                      </Button>
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card>
              <CardContent className="pt-6">
                <TeamRoles data={wizardData} onUpdate={updateWizardData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
          )}
          <Button
            onClick={isEditMode ? handleUpdateTeam : handleCreateTeam}
            disabled={saving || !formData.name.trim()}
            className="min-w-32"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : isEditMode ? (
              'Save Changes'
            ) : (
              'Create Team'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
