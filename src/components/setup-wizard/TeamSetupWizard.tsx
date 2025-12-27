/* eslint-disable react-hooks/rules-of-hooks */
import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Save,
  SendHorizontal,
} from 'lucide-react';
import { WizardStepOne } from './steps/WizardStepOne';
import { WizardStepTwo } from './steps/WizardStepTwo';
import { WizardStepThree } from './steps/WizardStepThree';
import { WizardStepFour } from './steps/WizardStepFour';
import { WizardStepFive } from './steps/WizardStepFive';

export interface TeamSetupWizardProps {
  isOpen?: boolean;
  onClose?: () => void;
}
import { apiService, endpoints } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

export interface WizardData {
  teamFiles: any[];
  // Step 1: Basic Info
  teamName: string;
  description: string;
  avatar: string;
  visibility: 'public' | 'private' | 'invite-only';

  // Step 2: Roles & Permissions
  customRoles: Array<{
    id: string;
    name: string;
    permissions: {
      projects: {
        createProject: boolean;
        editProject: boolean;
        deleteProject: boolean;
        submitProject: boolean;
      };
      team: {
        inviteMembers: boolean;
        removeMembers: boolean;
        assignRoles: boolean;
        manageTeamSettings: boolean;
      };
      submissions: {
        uploadFiles: boolean;
        editSubmission: boolean;
        addDemoLink: boolean;
        viewFeedback: boolean;
      };
      communication: {
        postUpdates: boolean;
        chat: boolean;
        mentorContact: boolean;
      };
    };
  }>;
  // Step 3: Resources
  githubRepos: Array<{
    name: string;
    url: string;
    syncBranches: boolean;
    roleAccess: Record<string, string[]>;
  }>;
  projectBoards: any;
  sshServers: any;

  // Step 4: Members
  invitees: Array<{
    email: string;
    roleId: string;
    name?: string;
  }>;

  // Step 5: Final review data is computed from other steps
}

// Props interface moved to top for export

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Workspace name and description' },
  {
    id: 2,
    title: 'Planning',
    description: 'Requirements, Epics, Sprints, Boards',
  },
  {
    id: 3,
    title: 'Development',
    description: 'Git Repositories, SSH Servers, Tasks, Code Reviews',
  },
  {
    id: 4,
    title: 'Team & Permissions',
    description: 'Roles, Permissions, Invite Members, User Management',
  },
  {
    id: 5,
    title: 'Deployment, Monitoring & Analytics',
    description: 'Releases, Environments, Logs, Analytics, Notifications',
  },
];

export function TeamSetupWizard({ isOpen, onClose }: TeamSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    teamName: '',
    description: '',
    avatar: '',
    visibility: 'invite-only',
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
    githubRepos: [],
    projectBoards: [],
    sshServers: [],
    invitees: [],
    teamFiles: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  // const { createTeam } = useTeams();
  const { toast } = useToast();

  const stepOneRef = useRef<{ saveData: () => Promise<boolean> }>(null);
  const stepTwoRef = useRef<{ saveData: () => Promise<boolean> }>(null);
  const stepThreeRef = useRef<{ saveData: () => Promise<boolean> }>(null);
  const stepFourRef = useRef<{ saveData: () => Promise<boolean> }>(null);
  const stepFiveRef = useRef<{ saveData: () => Promise<boolean> }>(null);

  if (!isOpen) return null;

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = async () => {
    if (currentStep < 5) {
      setIsSaving(true);

      try {
        let saveSuccessful = true;

        // Call the appropriate step's save method
        switch (currentStep) {
          case 1:
            saveSuccessful = await stepOneRef.current?.saveData();
            break;
          case 2:
            saveSuccessful = await stepTwoRef.current?.saveData();
            break;
          case 3:
            saveSuccessful = await stepThreeRef.current?.saveData();
            break;
          case 4:
            saveSuccessful = await stepFourRef.current?.saveData();
            break;
          default:
            break;
        }

        if (saveSuccessful) {
          setCurrentStep(currentStep + 1);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to save step data',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'An error occurred while saving',
          variant: 'destructive',
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const navigate = useNavigate();

  const handleComplete = async () => {
    // Create the team with the wizard data

    toast({
      title: 'Draft Saved',
      description: `Workspace "${wizardData.teamName}" has been saved as a draft. You can continue the setup later.`,
    });
    localStorage.removeItem('incompleteTeam');
    navigate('/admin/innovation/projects');

    onClose();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return wizardData.teamName.trim().length > 0;
      case 2:
        return wizardData.customRoles.length > 0;
      case 3:
        return true; // Optional step
      case 4:
        return true; // Optional step
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <WizardStepOne
            ref={stepOneRef}
            data={wizardData}
            onUpdate={updateWizardData}
          />
        );
      case 2:
        return (
          <WizardStepTwo
            ref={stepTwoRef}
            data={wizardData}
            onUpdate={updateWizardData}
          />
        );
      case 3:
        return (
          <WizardStepThree
            ref={stepThreeRef}
            data={wizardData}
            onUpdate={updateWizardData}
          />
        );
      case 4:
        return (
          <WizardStepFour
            ref={stepFourRef}
            data={wizardData}
            onUpdate={updateWizardData}
          />
        );
      case 5:
        return <WizardStepFive data={wizardData} onUpdate={updateWizardData} />;
      default:
        return null;
    }
  };

  const handleSubmitForApproval = async () => {
    setIsSaving(true);
    try {
      const team = JSON.parse(localStorage.getItem('incompleteTeam') || '{}');
      const teamId = team.id;

      if (!teamId) {
        toast({
          title: 'Error',
          description: 'No team found. Please start from the beginning.',
          variant: 'destructive',
        });
        setIsSaving(false);
        return;
      }

      const payload = {
        id: teamId,
        hasCompletedSetup: true,
        status: 'PENDING_APPROVAL',
      };

      const res = await apiService.post(
        endpoints.submitProjectForApproval(teamId)
      );
      if (res.status === 200) {
        console.log('Team submitted for approval:', res.data);
        toast({
          title: 'Submitted for Approval',
          description: `Team "${wizardData.teamName}" has been submitted for approval. You will be notified once it's reviewed.`,
        });
        localStorage.removeItem('incompleteTeam');
        navigate('/admin/innovation/projects');
        onClose?.();
      }
    } catch (error) {
      console.error('Failed to submit for approval:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit for approval. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="  flex items-center justify-center  ">
      <div className="bg-background  w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Workspace Setup Wizard</h2>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of 5: {STEPS[currentStep - 1].description}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 ${
                  index < currentStep - 1
                    ? 'text-primary'
                    : index === currentStep - 1
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStep - 1
                      ? 'bg-primary text-primary-foreground'
                      : index === currentStep - 1
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.id}
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <Progress
            value={(currentStep / 5) * 100}
            className="h-2 bg-gray-200 [&>div]:bg-blue-600"
          />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto h-[60vh]">
          <div className="p-6">{renderStep()}</div>
        </div>

        {/* Footer - fixed at the bottom of the card */}
        <div className="sticky bottom-0 left-0 w-full bg-muted border-t p-6 flex items-center justify-between z-10">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentStep === 5 ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleComplete}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save as Draft
                  </>
                )}
              </Button>
              <Button
                onClick={handleSubmitForApproval}
                disabled={!isStepValid() || isSaving}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <SendHorizontal className="w-4 h-4" />
                    Submit for Approval
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!isStepValid() || isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Next'}
              {!isSaving && <ArrowRight className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
