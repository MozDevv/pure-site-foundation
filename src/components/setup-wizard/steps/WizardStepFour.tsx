import React, { useImperativeHandle, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Upload,
  Trash2,
  Mail,
  Users,
  Crown,
  Shield,
  User,
  Key,
} from 'lucide-react';
import { WizardData } from '../TeamSetupWizard';
// import { TeamRoles } from '../../TeamRoles';
import { apiService, endpoints } from '@/lib/api';
import { TeamRoles } from '../TeamRoles';

interface WizardStepFourProps {
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
}

export const WizardStepFour = React.forwardRef(
  ({ data, onUpdate }: WizardStepFourProps, ref) => {
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [bulkInviteText, setBulkInviteText] = useState('');
    const [newInvite, setNewInvite] = useState({
      email: '',
      roleId: 'contributor',
      name: '',
    });

    useImperativeHandle(ref, () => ({
      saveData: async () => {
        return await handleSave();
      },
    }));
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (): Promise<boolean> => {
      setIsSaving(true);
      const team = JSON.parse(localStorage.getItem('incompleteTeam') || '{}');
      const teamId = team.id;
      const payload = {
        id: teamId,
        teamMembers: data.invitees?.map((invite) => ({
          email: invite.email,
          name: invite.name || invite.email.split('@')[0],
          roleName:
            data.customRoles.find((role) => role.id === invite.roleId)?.name ||
            'Developer',
        })),
        customRoles: data.customRoles,
      };
      try {
        const response = await apiService.put(endpoints.updateTeam, payload);

        if (response.status === 200) {
          // Save the updated team to localStorage
          localStorage.setItem('incompleteTeam', JSON.stringify(response.data));
          setIsSaving(false);
          return true;
        } else {
          setIsSaving(false);
          return false;
        }
      } catch (error) {
        console.error('Error saving team data:', error);
        setIsSaving(false);
        return false;
      } finally {
        setIsSaving(false);
      }
    };
    const getRoleIcon = (roleId: string) => {
      if (roleId === 'admin') return <Crown className="w-3 h-3 text-warning" />;
      if (roleId === 'contributor')
        return <Shield className="w-3 h-3 text-primary" />;
      return <User className="w-3 h-3 text-muted-foreground" />;
    };

    const addInvite = () => {
      if (!newInvite.email.trim()) return;

      const invite = {
        email: newInvite.email.trim(),
        roleId:
          data?.customRoles.find((role) => role.id === newInvite.roleId)
            ?.name || 'Contributor',
        name: newInvite.name.trim() || newInvite.email.split('@')[0],
      };

      onUpdate({
        invitees: [...data.invitees, invite],
      });

      setNewInvite({ email: '', roleId: 'contributor', name: '' });
      setShowInviteDialog(false);
      // console.log('Invite added:', invite);
      // console.log('Current invitees:', data.invitees);
      // console.log('Updated data:', {
      //   ...data,
      //   invitees: [...data.invitees, invite],
      // });
    };

    const processBulkInvites = () => {
      const emails = bulkInviteText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.includes('@'));

      const bulkInvites = emails.map((email) => ({
        email,
        roleId: 'contributor',
        name: email.split('@')[0],
      }));

      onUpdate({
        invitees: [...data.invitees, ...bulkInvites],
      });

      setBulkInviteText('');
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
      if (role.permissions.kanban.moveCards) permissions.push('manage tasks');
      if (role.permissions.code.viewGithub) permissions.push('access code');
      if (role.permissions.cicd.triggerDeployments)
        permissions.push('deploy changes');
      if (role.permissions.general.inviteMembers)
        permissions.push('invite members');

      return (
        permissions.slice(0, 3).join(', ') +
        (permissions.length > 3 ? '...' : '')
      );
    };
    const [showRolesDialog, setShowRolesDialog] = useState(false);

    return (
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Invite Team Members</h3>
          <p className="text-muted-foreground">
            Add members to your team and assign them roles
          </p>
        </div>

        {/* Invite Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Individual Member
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
                  <Label htmlFor="invite-name">Display Name (Optional)</Label>
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
              <Button
                onClick={() => setShowRolesDialog(true)}
                variant="outline"
                className="flex-1"
              >
                <Key className="w-4 h-4 mr-2" />
                Configure Roles & Permissions
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
              Invited Members ({data.invitees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.invitees.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-medium mb-2">
                  No invitations sent yet
                </h4>
                <p className="text-sm">
                  Start by inviting your first team member
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.invitees.map((invitee, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="text-sm">
                          {invitee.name.slice(0, 2).toUpperCase()}
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
                        className="text-destructive hover:text-destructive"
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

        {/* Role Preview */}
        {data.invitees.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Role Distribution Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.customRoles.map((role) => {
                  const assignedCount = data.invitees.filter(
                    (i) => i.roleId === role.id
                  ).length;
                  return (
                    <div
                      key={role.id}
                      className="text-center p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {getRoleIcon(role.id)}
                        <span className="font-medium">{role.name}</span>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {assignedCount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {assignedCount === 1 ? 'member' : 'members'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h5 className="font-medium mb-2">Invitation Preview</h5>
                <p className="text-sm text-muted-foreground">
                  "You've been invited to join <strong>{data.teamName}</strong>{' '}
                  as a team member. Click the link below to accept your
                  invitation and start collaborating!"
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
);
