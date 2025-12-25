/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Crown,
  Shield,
  User,
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
} from 'lucide-react';
// import { WizardData } from './setup-wizard/TeamSetupWizard';

interface WizardStepTwoProps {
  data: any;
  onUpdate: (updates: Partial<any>) => void;
}

export function TeamRoles({ data, onUpdate }: WizardStepTwoProps) {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [compareRoles, setCompareRoles] = useState<string[]>([]);

  const getRoleIcon = (roleId: string) => {
    if (roleId === 'admin') return <Crown className="w-4 h-4 text-warning" />;
    if (roleId === 'contributor')
      return <Shield className="w-4 h-4 text-primary" />;
    return <User className="w-4 h-4 text-muted-foreground" />;
  };

  const createNewRole = () => {
    if (!newRoleName.trim()) return;

    // Build permissions object with all keys and all permissions set to false
    const permissions = Object.fromEntries(
      permissionCategories.map((category) => [
        category.key,
        Object.fromEntries(
          category.permissions.map((perm) => [perm.key, false])
        ),
      ])
    );

    const newRole = {
      id: Date.now().toString(),
      name: newRoleName,
      permissions,
    };

    onUpdate({
      customRoles: [...data.customRoles, newRole],
    });

    setNewRoleName('');
    setShowRoleDialog(false);
  };

  const updateRolePermission = (
    roleId: string,
    category: string,
    permission: string,
    value: boolean
  ) => {
    const updatedRoles = data.customRoles.map((role) => {
      if (role.id === roleId) {
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [category]: {
              ...role.permissions[category as keyof typeof role.permissions],
              [permission]: value,
            },
          },
        };
      }
      return role;
    });

    onUpdate({ customRoles: updatedRoles });
  };

  const deleteRole = (roleId: string) => {
    // Don't allow deleting default roles
    if (['admin', 'contributor', 'viewer'].includes(roleId)) return;

    onUpdate({
      customRoles: data.customRoles.filter((role) => role.id !== roleId),
    });
  };

  const toggleRoleComparison = (roleId: string) => {
    setCompareRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : prev.length < 3
        ? [...prev, roleId]
        : prev
    );
  };

  const permissionCategories = [
    {
      key: 'kanban',
      title: 'Kanban Boards',
      permissions: [
        { key: 'moveCards', label: 'Move cards between columns' },
        { key: 'editTasks', label: 'Edit task details' },
        { key: 'deleteColumns', label: 'Delete board columns' },
        { key: 'createBoard', label: 'Create new boards' },
        { key: 'addMembersToBoard', label: 'Add members to boards' },
        { key: 'archiveBoard', label: 'Archive boards' },
        { key: 'assignTasks', label: 'Assign tasks to members' },
        { key: 'commentOnTasks', label: 'Comment on tasks' },
        { key: 'setDueDates', label: 'Set due dates for tasks' },
        { key: 'reorderColumns', label: 'Reorder board columns' },
      ],
    },
    {
      key: 'code',
      title: 'Code Management',
      permissions: [
        { key: 'viewGithub', label: 'View GitHub repositories' },
        { key: 'mergePRs', label: 'Merge pull requests' },
        { key: 'accessSSH', label: 'Access SSH sessions' },
        { key: 'addRepo', label: 'Add repositories to team' },
        { key: 'manageRepoAccess', label: 'Manage repository access' },
        { key: 'deleteRepo', label: 'Delete repositories' },
        { key: 'createBranch', label: 'Create branches' },
        { key: 'pushCode', label: 'Push code to repository' },
        { key: 'reviewCode', label: 'Review code changes' },
        { key: 'viewCommitHistory', label: 'View commit history' },
      ],
    },
    {
      key: 'cicd',
      title: 'CI/CD Pipeline',
      permissions: [
        { key: 'triggerDeployments', label: 'Trigger deployments' },
        { key: 'editPipelines', label: 'Edit pipeline configurations' },
        { key: 'viewPipelineStatus', label: 'View pipeline status' },
        { key: 'rollbackDeployment', label: 'Rollback deployments' },
        { key: 'approvePipeline', label: 'Approve pipeline runs' },
        { key: 'cancelPipeline', label: 'Cancel running pipelines' },
        { key: 'viewDeploymentLogs', label: 'View deployment logs' },
      ],
    },
    {
      key: 'documents',
      title: 'Documents',
      permissions: [
        { key: 'uploadFiles', label: 'Upload files to team' },
        { key: 'downloadFiles', label: 'Download team files' },
        { key: 'deleteFiles', label: 'Delete team files' },
        { key: 'shareFiles', label: 'Share files with members' },
        { key: 'editFiles', label: 'Edit team documents' },
        { key: 'commentOnFiles', label: 'Comment on documents' },
        { key: 'viewFileHistory', label: 'View file version history' },
      ],
    },
    {
      key: 'ssh',
      title: 'SSH Sessions',
      permissions: [
        { key: 'startSession', label: 'Start SSH session' },
        { key: 'terminateSession', label: 'Terminate SSH session' },
        { key: 'viewSessionLogs', label: 'View SSH session logs' },
        { key: 'manageSessionAccess', label: 'Manage SSH session access' },
      ],
    },
    {
      key: 'general',
      title: 'General Access',
      permissions: [
        { key: 'inviteMembers', label: 'Invite new members' },
        { key: 'viewAnalytics', label: 'View team analytics' },
        { key: 'editSettings', label: 'Edit team settings' },
        { key: 'removeMembers', label: 'Remove members from team' },
        { key: 'viewActivityLog', label: 'View team activity log' },
        { key: 'deleteTeam', label: 'Delete team' },
        { key: 'changeTeamOwner', label: 'Change team owner' },
        { key: 'manageIntegrations', label: 'Manage third-party integrations' },
        { key: 'viewTeamProfile', label: 'View team profile' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Define Roles & Permissions</h3>
        <p className="text-muted-foreground">
          Set up your team structure with granular permission controls
        </p>
      </div>

      {/* Role Management Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h4 className="text-lg font-semibold">Team Roles</h4>
          {compareRoles.length > 0 && (
            <Badge variant="secondary">
              Comparing {compareRoles.length} roles
            </Badge>
          )}
        </div>
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g., DevOps Engineer"
                />
              </div>
              <Button onClick={createNewRole} className="w-full">
                Create Role
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {data.customRoles.map((role) => {
          return (
            <Card
              key={role.id}
              className={`hover:shadow-lg transition-all max-h-[50vh] overflow-y-auto ${
                compareRoles.includes(role.id) ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardHeader
                className="pb-3 sticky top-0 z-10 bg-secondary backdrop-blur border-b"
                style={
                  {
                    // fallback for dark mode if needed:
                    // background: 'rgba(17, 24, 39, 0.95)'
                  }
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(role.id)}
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRoleComparison(role.id)}
                      className={
                        compareRoles.includes(role.id)
                          ? 'bg-primary text-primary-foreground'
                          : ''
                      }
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    {!['admin', 'contributor', 'viewer'].includes(role.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRole(role.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent
                className={`space-y-4 transition-all pt-2 duration-300
                }`}
              >
                {permissionCategories.map((category) => (
                  <div key={category.key} className="space-y-2">
                    <h5 className="text-sm font-medium text-muted-foreground">
                      {category.title}
                    </h5>
                    <div className="space-y-2">
                      {category.permissions.map((permission) => (
                        <div
                          key={permission.key}
                          className="flex items-center justify-between"
                        >
                          <Label
                            htmlFor={`${role.id}-${category.key}-${permission.key}`}
                            className="text-xs"
                          >
                            {permission.label}
                          </Label>
                          <Switch
                            id={`${role.id}-${category.key}-${permission.key}`}
                            checked={
                              role.permissions?.[category.key]?.[
                                permission.key
                              ] ?? false
                            }
                            onCheckedChange={(checked) =>
                              updateRolePermission(
                                role.id,
                                category.key,
                                permission.key,
                                checked
                              )
                            }
                            disabled={role.id === 'admin'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Role Comparison Table */}
      {compareRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Role Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Permission</th>
                    {compareRoles.map((roleId) => {
                      const role = data.customRoles.find(
                        (r) => r.id === roleId
                      );
                      return (
                        <th
                          key={roleId}
                          className="text-center py-2 font-medium"
                        >
                          <div className="flex items-center justify-center gap-1">
                            {getRoleIcon(roleId)}
                            {role?.name}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {permissionCategories.map((category) => (
                    <React.Fragment key={category.key}>
                      <tr className="border-b bg-muted/20">
                        <td
                          colSpan={compareRoles.length + 1}
                          className="py-2 font-medium text-muted-foreground"
                        >
                          {category.title}
                        </td>
                      </tr>
                      {category.permissions.map((permission) => (
                        <tr
                          key={permission.key}
                          className="border-b hover:bg-muted/10"
                        >
                          <td className="py-2">{permission.label}</td>
                          {compareRoles.map((roleId) => {
                            const role = data.customRoles.find(
                              (r) => r.id === roleId
                            );
                            const hasPermission =
                              role?.permissions[
                                category.key as keyof typeof role.permissions
                              ][permission.key as any];
                            return (
                              <td key={roleId} className="text-center py-2">
                                {hasPermission ? (
                                  <Check className="w-4 h-4 text-green-500 mx-auto" />
                                ) : (
                                  <X className="w-4 h-4 text-muted-foreground mx-auto" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
