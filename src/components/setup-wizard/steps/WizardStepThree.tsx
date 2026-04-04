// filepath: c:\Users\sammy.mathenge\Desktop\techAI\src\components\setup-wizard\steps\WizardStepThree.tsx
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  SmartDrawer,
  SmartDrawerContent,
  SmartDrawerFooter,
  SmartDrawerHeader,
  SmartDrawerTitle,
  SmartDrawerTrigger,
} from '@/components/ui/smart-drawer';
import {
  Github,
  Server,
  Plus,
  Trash2,
  ExternalLink,
  FolderGit2,
  Loader2,
} from 'lucide-react';
import { WizardData } from '../TeamSetupWizard';
import { apiService, endpoints } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface WizardStepThreeProps {
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
}

export interface WizardStepThreeHandle {
  saveData: () => Promise<boolean>;
}

export const WizardStepThree = forwardRef<
  WizardStepThreeHandle,
  WizardStepThreeProps
>(({ data, onUpdate }, ref) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showRepoDialog, setShowRepoDialog] = useState(false);
  const [showServerDialog, setShowServerDialog] = useState(false);
  const [newRepo, setNewRepo] = useState({
    name: '',
    url: '',
    syncBranches: true,
  });
  const [newServer, setNewServer] = useState({
    name: '',
    host: '',
    port: '22',
  });

  useImperativeHandle(ref, () => ({
    saveData: async () => {
      return await handleSave();
    },
  }));

  const handleSave = async (): Promise<boolean> => {
    // Parse incompleteTeam from localStorage
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

    setIsSaving(true);
    try {
      // Format githubRepos to match API schema: { name: string, url: string }[]
      const formattedGithubRepos = (data.githubRepos || []).map((repo) => ({
        name: repo.name,
        url: repo.url,
      }));

      const payload = {
        ...(incompleteTeam || {}),
        githubRepos: formattedGithubRepos,
      };

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
          description:
            'Development resources saved successfully, proceed to next step',
        });
        setIsSaving(false);
        return true;
      }
    } catch (error) {
      console.error('Failed to save step 3 data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save development resources. Please try again.',
        variant: 'destructive',
      });
    }
    setIsSaving(false);
    return false;
  };

  const addRepo = () => {
    if (!newRepo.name.trim() || !newRepo.url.trim()) {
      toast({
        title: 'Error',
        description: 'Repository name and URL are required',
        variant: 'destructive',
      });
      return;
    }

    // Validate URL format
    const urlPattern = /^https?:\/\/(www\.)?github\.com\/.+\/.+/i;
    if (!urlPattern.test(newRepo.url)) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid GitHub repository URL',
        variant: 'destructive',
      });
      return;
    }

    onUpdate({
      githubRepos: [
        ...(data.githubRepos || []),
        {
          name: newRepo.name.trim(),
          url: newRepo.url.trim(),
          syncBranches: newRepo.syncBranches,
          roleAccess: {},
        },
      ],
    });

    setNewRepo({ name: '', url: '', syncBranches: true });
    setShowRepoDialog(false);

    toast({
      title: 'Repository Added',
      description: `${newRepo.name} has been added to the project`,
    });
  };

  const removeRepo = (index: number) => {
    const repoName = data.githubRepos[index]?.name || 'Repository';
    onUpdate({
      githubRepos: data.githubRepos.filter((_, i) => i !== index),
    });

    toast({
      title: 'Repository Removed',
      description: `${repoName} has been removed`,
    });
  };

  const addServer = () => {
    if (!newServer.name.trim() || !newServer.host.trim()) {
      toast({
        title: 'Error',
        description: 'Server name and host are required',
        variant: 'destructive',
      });
      return;
    }

    onUpdate({
      servers: [
        ...(data.servers || []),
        {
          name: newServer.name.trim(),
          host: newServer.host.trim(),
          port: newServer.port || '22',
        },
      ],
    });

    setNewServer({ name: '', host: '', port: '22' });
    setShowServerDialog(false);

    toast({
      title: 'Server Added',
      description: `${newServer.name} has been added to the project`,
    });
  };

  const removeServer = (index: number) => {
    const serverName = data.servers?.[index]?.name || 'Server';
    onUpdate({
      servers: (data.servers || []).filter((_, i) => i !== index),
    });

    toast({
      title: 'Server Removed',
      description: `${serverName} has been removed`,
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
            <SmartDrawer open={showRepoDialog} onOpenChange={setShowRepoDialog}>
              <SmartDrawerTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Repository
                </Button>
              </SmartDrawerTrigger>
              <SmartDrawerContent>
                <SmartDrawerHeader>
                  <SmartDrawerTitle>Add GitHub Repository</SmartDrawerTitle>
                </SmartDrawerHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Repository Name *</Label>
                    <Input
                      value={newRepo.name}
                      onChange={(e) =>
                        setNewRepo({ ...newRepo, name: e.target.value })
                      }
                      placeholder="my-project"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Repository URL *</Label>
                    <Input
                      value={newRepo.url}
                      onChange={(e) =>
                        setNewRepo({ ...newRepo, url: e.target.value })
                      }
                      placeholder="https://github.com/org/repo"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the full GitHub URL (e.g.,
                      https://github.com/username/repository)
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sync Branches</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically sync branch information
                      </p>
                    </div>
                    <Switch
                      checked={newRepo.syncBranches}
                      onCheckedChange={(checked) =>
                        setNewRepo({ ...newRepo, syncBranches: checked })
                      }
                    />
                  </div>
                </div>
                <SmartDrawerFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowRepoDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addRepo}
                    disabled={!newRepo.name.trim() || !newRepo.url.trim()}
                  >
                    Add Repository
                  </Button>
                </SmartDrawerFooter>
              </SmartDrawerContent>
            </SmartDrawer>
          </div>
        </CardHeader>
        <CardContent>
          {!data.githubRepos || data.githubRepos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderGit2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No repositories connected yet</p>
              <p className="text-sm mt-1">
                Add a GitHub repository to enable code collaboration
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.githubRepos.map((repo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{repo.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {repo.url}
                      </p>
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
                      className="text-destructive hover:text-destructive"
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

      {/* Development Servers (Optional) */}
      {/* <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Development Servers</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Connect servers for deployment (optional)
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
                  <DialogTitle>Add Development Server</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Server Name *</Label>
                    <Input
                      value={newServer.name}
                      onChange={(e) =>
                        setNewServer({ ...newServer, name: e.target.value })
                      }
                      placeholder="Production Server"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Host *</Label>
                    <Input
                      value={newServer.host}
                      onChange={(e) =>
                        setNewServer({ ...newServer, host: e.target.value })
                      }
                      placeholder="192.168.1.100 or server.example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SSH Port</Label>
                    <Input
                      value={newServer.port}
                      onChange={(e) =>
                        setNewServer({ ...newServer, port: e.target.value })
                      }
                      placeholder="22"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowServerDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addServer}
                    disabled={!newServer.name.trim() || !newServer.host.trim()}
                  >
                    Add Server
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {!data.servers || data.servers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Server className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No servers connected yet</p>
              <p className="text-sm mt-1">
                This is optional - you can add servers later
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.servers.map((server, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
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
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Port {server.port}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeServer(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card> */}

      {/* Saving indicator */}
      {isSaving && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Saving development resources...</span>
        </div>
      )}
    </div>
  );
});

WizardStepThree.displayName = 'WizardStepThree';

export default WizardStepThree;
