import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Github, 
  Kanban, 
  Server, 
  Crown, 
  Shield, 
  User, 
  Eye, 
  Clock,
  CheckCircle,
  Settings,
  Mail,
  Calendar,
  Sparkles
} from 'lucide-react';
import { WizardData } from '../TeamSetupWizard';

interface WizardStepFiveProps {
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
}

export function WizardStepFive({ data, onUpdate }: WizardStepFiveProps) {
  const [simulateRole, setSimulateRole] = useState<string>('');
  const [scheduleSetup, setScheduleSetup] = useState(false);

  const getRoleIcon = (roleId: string) => {
    if (roleId === 'admin') return <Crown className="w-4 h-4 text-warning" />;
    if (roleId === 'contributor') return <Shield className="w-4 h-4 text-primary" />;
    return <User className="w-4 h-4 text-muted-foreground" />;
  };

  const getPermissionSummary = (roleId: string) => {
    const role = data.customRoles.find(r => r.id === roleId);
    if (!role) return [];
    
    const permissions = [];
    if (role.permissions.kanban.moveCards) permissions.push('Move kanban cards');
    if (role.permissions.kanban.editTasks) permissions.push('Edit tasks');
    if (role.permissions.code.viewGithub) permissions.push('View GitHub repos');
    if (role.permissions.code.mergePRs) permissions.push('Merge pull requests');
    if (role.permissions.cicd.triggerDeployments) permissions.push('Trigger deployments');
    if (role.permissions.general.inviteMembers) permissions.push('Invite members');
    
    return permissions;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Review & Launch</h3>
        <p className="text-muted-foreground">
          Final review of your team configuration before launch
        </p>
      </div>

      {/* Team Summary */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-3">
            <Avatar className="w-16 h-16">
              {data.avatar ? (
                <img src={data.avatar} alt="Team avatar" className="w-full h-full object-cover" />
              ) : (
                <AvatarFallback className="text-2xl">
                  {data.teamName.slice(0, 2).toUpperCase() || 'TM'}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{data.teamName}</CardTitle>
              <p className="text-muted-foreground">{data.description}</p>
              <Badge variant="secondary" className="mt-2">
                {data.visibility.charAt(0).toUpperCase() + data.visibility.slice(1).replace('-', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              {data.customRoles.map((role) => {
                const memberCount = data.invitees.filter(i => i.roleId === role.id).length + (role.id === 'admin' ? 1 : 0);
                return (
                  <div key={role.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {getRoleIcon(role.id)}
                      <span className="text-sm font-medium">{role.name}</span>
                    </div>
                    <div className="text-xl font-bold text-primary">{memberCount}</div>
                    <div className="text-xs text-muted-foreground">
                      {memberCount === 1 ? 'member' : 'members'}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Invited Members</h5>
              {data.invitees.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members invited yet</p>
              ) : (
                <div className="space-y-1">
                  {data.invitees.slice(0, 3).map((invitee, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {invitee.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{invitee.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {data.customRoles.find(r => r.id === invitee.roleId)?.name}
                      </Badge>
                    </div>
                  ))}
                  {data.invitees.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{data.invitees.length - 3} more members
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resources Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Connected Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 border rounded-lg">
                <Github className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                <div className="text-lg font-bold">{data.githubRepos.length}</div>
                <div className="text-xs text-muted-foreground">Repositories</div>
              </div>
              <div className="p-3 border rounded-lg">
                <Kanban className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                <div className="text-lg font-bold">{data.projectBoards.length}</div>
                <div className="text-xs text-muted-foreground">Boards</div>
              </div>
              <div className="p-3 border rounded-lg">
                <Server className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                <div className="text-lg font-bold">{data.sshServers.length}</div>
                <div className="text-xs text-muted-foreground">Servers</div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-sm">Recent Additions</h5>
              <div className="space-y-1 text-sm">
                {data.githubRepos.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    <span>{data.githubRepos[0].name}</span>
                  </div>
                )}
                {data.projectBoards.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Kanban className="w-4 h-4" />
                    <span>{data.projectBoards[0].name}</span>
                  </div>
                )}
                {data.sshServers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    <span>{data.sshServers[0].name}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permission Simulation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Permission Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="role-simulate">Simulate view as:</Label>
              <Select value={simulateRole} onValueChange={setSimulateRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select a role" />
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
            </div>

            {simulateRole && (
              <div className="border rounded-lg p-4 bg-muted/20">
                <h5 className="font-medium mb-3">
                  Permissions for {data.customRoles.find(r => r.id === simulateRole)?.name}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getPermissionSummary(simulateRole).map((permission, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Launch Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Launch Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Schedule Setup Reminder</div>
              <div className="text-sm text-muted-foreground">
                Send a reminder to complete any pending setup tasks
              </div>
            </div>
            <Switch
              checked={scheduleSetup}
              onCheckedChange={setScheduleSetup}
            />
          </div>

          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4">
            <h5 className="font-medium mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              What happens after launch?
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Team workspace will be created instantly</li>
              <li>• Invitation emails will be sent to all members</li>
              <li>• Connected resources will be available immediately</li>
              <li>• You can continue customizing settings anytime</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Final Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-primary">{data.invitees.length + 1}</div>
          <div className="text-sm text-muted-foreground">Total Members</div>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-primary">{data.customRoles.length}</div>
          <div className="text-sm text-muted-foreground">Defined Roles</div>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {data.githubRepos.length + data.projectBoards.length + data.sshServers.length}
          </div>
          <div className="text-sm text-muted-foreground">Resources</div>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-primary">Ready</div>
          <div className="text-sm text-muted-foreground">Status</div>
        </div>
      </div>
    </div>
  );
}