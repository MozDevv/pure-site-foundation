import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, Users, Lock, Globe, UserCheck } from 'lucide-react';
import { WizardData } from '../TeamSetupWizard';
import { useIncompleteTeamIdStore } from '@/services/store';
import { useToast } from '@/hooks/use-toast';
import { apiService, endpoints } from '@/services/api';

interface WizardStepOneProps {
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
}
export interface WizardStepOneHandle {
  saveData: () => Promise<boolean>;
}

export const WizardStepOne = forwardRef<
  WizardStepOneHandle,
  WizardStepOneProps
>(({ data, onUpdate }, ref) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const { incompleteTeamId, setIncompleteTeamId } = useIncompleteTeamIdStore();

  useImperativeHandle(ref, () => ({
    saveData: async () => {
      return await handleSave();
    },
  }));

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (): Promise<boolean> => {
    if (incompleteTeamId) {
      return true;
    }

    try {
      // Your save logic here - this could be an API call
      // For example:
      const response = await apiService.post(endpoints.createProject, {
        name: data.teamName,
        description: data.description,
        avatar: data.avatar,
        visibility: data.visibility,
      });
      if (response.status === 200) {
        console.log('Step 1 data saved:', response.data);
        setIncompleteTeamId(response.data.id);
        localStorage.setItem('incompleteTeam', JSON.stringify(response.data));
        toast({
          title: 'Success',
          description: 'Step 1 data saved successfully, proceed to next step',
        });
        return true;
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save step data',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpdate({ avatar: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdate({ avatar: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getVisibilityIcon = (type: string) => {
    switch (type) {
      case 'public':
        return <Globe className="w-4 h-4" />;
      case 'private':
        return <Lock className="w-4 h-4" />;
      case 'invite-only':
        return <UserCheck className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Let's create your Project</h3>
        <p className="text-muted-foreground">
          Start by providing basic information about your Project
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="team-name">Project Name *</Label>
            <Input
              id="team-name"
              value={data.teamName}
              onChange={(e) => onUpdate({ teamName: e.target.value })}
              placeholder="e.g., Frontend Development Team"
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Describe your team's purpose and goals..."
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <Label>Team Avatar</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {data.avatar ? (
                  <img
                    src={data.avatar}
                    alt="Team avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="text-xl">
                    {data.teamName.slice(0, 2).toUpperCase() || 'TM'}
                  </AvatarFallback>
                )}
              </Avatar>

              <div
                className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                    <Upload className="w-5 h-5" />
                    <span>Upload or drag image</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Team Visibility</Label>
            <RadioGroup
              value={data.visibility}
              onValueChange={(value: 'public' | 'private' | 'invite-only') =>
                onUpdate({ visibility: value })
              }
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="invite-only" id="invite-only" />
                  <label
                    htmlFor="invite-only"
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="w-4 h-4" />
                      <span className="font-medium">Invite Only</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Members can only join through direct invitations
                    </p>
                  </label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="public" id="public" />
                  <label htmlFor="public" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4" />
                      <span className="font-medium">Public</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Anyone can discover and join this team
                    </p>
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="private" id="private" />
                  <label htmlFor="private" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4" />
                      <span className="font-medium">Private</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Only team members can see and access this team
                    </p>
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="font-semibold mb-4">Live Preview</h4>
          </div>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  {data.avatar ? (
                    <img
                      src={data.avatar}
                      alt="Team avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <AvatarFallback>
                      {data.teamName.slice(0, 2).toUpperCase() || 'TM'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {data.teamName || 'Your Team Name'}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {getVisibilityIcon(data.visibility)}
                      <span className="ml-1 capitalize">{data.visibility}</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {data.description || 'Team description will appear here...'}
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />1 member
                </span>
                <span>Created just now</span>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/30 rounded-lg p-4">
            <h5 className="font-medium text-sm mb-2">What happens next?</h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Set up roles and permissions</li>
              <li>• Connect your development tools</li>
              <li>• Invite team members</li>
              <li>• Launch your collaborative workspace</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});
