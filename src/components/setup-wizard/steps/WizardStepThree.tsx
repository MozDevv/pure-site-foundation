import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Github, Server, Plus, Trash2, ExternalLink, FolderGit2 } from 'lucide-react';
import { WizardData } from '../TeamSetupWizard';

interface WizardStepThreeProps {
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
}

export interface WizardStepThreeHandle {
  saveData: () => Promise<boolean>;
}

export const WizardStepThree = forwardRef<WizardStepThreeHandle, WizardStepThreeProps>(
  ({ data, onUpdate }, ref) => {
    const [showRepoDialog, setShowRepoDialog] = useState(false);
    const [showServerDialog, setShowServerDialog] = useState(false);
    const [newRepo, setNewRepo] = useState({ name: '', url: '', syncBranches: true });
    const [newServer, setNewServer] = useState({ name: '', host: '', port: '22' });

    useImperativeHandle(ref, () => ({
      saveData: async () => {
        // Simulate save
        await new Promise((resolve) => setTimeout(resolve, 500));
        return true;
      },
    }));

    const addRepo = () => {
      if (!newRepo.name.trim() || !newRepo.url.trim()) return;

      onUpdate({
        githubRepos: [
          ...data.githubRepos,
          {
            name: newRepo.name,
            url: newRepo.url,
            syncBranches: newRepo.syncBranches,
            roleAccess: {},
          },
        ],
      });

      setNewRepo({ name: '', url: '', syncBranches: true });
      setShowRepoDialog(false);
    };

    const removeRepo = (index: number) => {
      onUpdate({
        githubRepos: data.githubRepos.filter((_, i) => i !== index),
      });
    };

    const addServer = () => {
      if (!newServer.name.trim() || !newServer.host.trim()) return;

      onUpdate({
        sshServers: [
          ...(data.sshServers || []),
          {
            name: newServer.name,
            host: newServer.host,
            port: parseInt(newServer.port) || 22,
          },
        ],
      });

      setNewServer({ name: '', host: '', port: '22' });
      setShowServerDialog(false);
    };

    const removeServer = (index: number) => {
      onUpdate({
        sshServers: data.sshServers.filter((_, i) => i !== index),
      });
    };

    return (
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Development Resources</h3>
          <p className="text-muted-foreground">
            Connect your code repositories and servers
          </p>
        </div>

        {/* GitHub Repositories */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>GitHub Repositories</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Connect repositories for code collaboration
                  </p>
                </div>
              </div>
              <Dialog open={showRepoDialog} onOpenChange={setShowRepoDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Repository
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add GitHub Repository</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Repository Name</Label>
                      <Input
                        value={newRepo.name}
                        onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                        placeholder="my-project"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Repository URL</Label>
                      <Input
                        value={newRepo.url}
                        onChange={(e) => setNewRepo({ ...newRepo, url: e.target.value })}
                        placeholder="https://github.com/org/repo"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Sync Branches</Label>
                      <Switch
                        checked={newRepo.syncBranches}
                        onCheckedChange={(checked) =>
                          setNewRepo({ ...newRepo, syncBranches: checked })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowRepoDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addRepo}>Add Repository</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {data.githubRepos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderGit2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No repositories connected yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.githubRepos.map((repo, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Github className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{repo.name}</p>
                        <p className="text-xs text-muted-foreground">{repo.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {repo.syncBranches && (
                        <Badge variant="secondary" className="text-xs">
                          Sync enabled
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(repo.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeRepo(index)}
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

        {/* SSH Servers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>SSH Servers</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Connect servers for deployment and access
                  </p>
                </div>
              </div>
              <Dialog open={showServerDialog} onOpenChange={setShowServerDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Server
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add SSH Server</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Server Name</Label>
                      <Input
                        value={newServer.name}
                        onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                        placeholder="Production Server"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Host</Label>
                      <Input
                        value={newServer.host}
                        onChange={(e) => setNewServer({ ...newServer, host: e.target.value })}
                        placeholder="192.168.1.100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Port</Label>
                      <Input
                        value={newServer.port}
                        onChange={(e) => setNewServer({ ...newServer, port: e.target.value })}
                        placeholder="22"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowServerDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addServer}>Add Server</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {(!data.sshServers || data.sshServers.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground">
                <Server className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No servers connected yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.sshServers.map((server: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Server className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{server.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {server.host}:{server.port}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeServer(index)}
                    >
                      <Trash2 className="w-4 h-4" />
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
);

WizardStepThree.displayName = 'WizardStepThree';

export default WizardStepThree;
