/* eslint-disable react-hooks/rules-of-hooks */
import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { X, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
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
      kanban: {
        moveCards: boolean;
        editTasks: boolean;
        deleteColumns: boolean;
        createBoard: boolean;
        addMembersToBoard: boolean;
        archiveBoard: boolean;
        assignTasks: boolean;
        commentOnTasks: boolean;
        setDueDates: boolean;
        reorderColumns: boolean;
      };
      code: {
        viewGithub: boolean;
        mergePRs: boolean;
        accessSSH: boolean;
        addRepo: boolean;
        manageRepoAccess: boolean;
        deleteRepo: boolean;
        createBranch: boolean;
        pushCode: boolean;
        reviewCode: boolean;
        viewCommitHistory: boolean;
      };
      cicd: {
        triggerDeployments: boolean;
        editPipelines: boolean;
        viewPipelineStatus: boolean;
        rollbackDeployment: boolean;
        approvePipeline: boolean;
        cancelPipeline: boolean;
        viewDeploymentLogs: boolean;
      };
      documents: {
        uploadFiles: boolean;
        downloadFiles: boolean;
        deleteFiles: boolean;
        shareFiles: boolean;
        editFiles: boolean;
        commentOnFiles: boolean;
        viewFileHistory: boolean;
      };
      ssh: {
        startSession: boolean;
        terminateSession: boolean;
        viewSessionLogs: boolean;
        manageSessionAccess: boolean;
      };
      general: {
        inviteMembers: boolean;
        viewAnalytics: boolean;
        editSettings: boolean;
        removeMembers: boolean;
        viewActivityLog: boolean;
        deleteTeam: boolean;
        changeTeamOwner: boolean;
        manageIntegrations: boolean;
        viewTeamProfile: boolean;
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
        id: 'pm',
        name: 'Project Manager',
        permissions: {
          kanban: {
            moveCards: true,
            editTasks: true,
            deleteColumns: true,
            createBoard: true,
            addMembersToBoard: true,
            archiveBoard: true,
            assignTasks: true,
            commentOnTasks: true,
            setDueDates: true,
            reorderColumns: true,
          },
          code: {
            viewGithub: true,
            mergePRs: true,
            accessSSH: true,
            addRepo: true,
            manageRepoAccess: true,
            deleteRepo: true,
            createBranch: true,
            pushCode: true,
            reviewCode: true,
            viewCommitHistory: true,
          },
          cicd: {
            triggerDeployments: true,
            editPipelines: true,
            viewPipelineStatus: true,
            rollbackDeployment: true,
            approvePipeline: true,
            cancelPipeline: true,
            viewDeploymentLogs: true,
          },
          documents: {
            uploadFiles: true,
            downloadFiles: true,
            deleteFiles: true,
            shareFiles: true,
            editFiles: true,
            commentOnFiles: true,
            viewFileHistory: true,
          },
          ssh: {
            startSession: true,
            terminateSession: true,
            viewSessionLogs: true,
            manageSessionAccess: true,
          },
          general: {
            inviteMembers: true,
            viewAnalytics: true,
            editSettings: true,
            removeMembers: true,
            viewActivityLog: true,
            deleteTeam: true,
            changeTeamOwner: true,
            manageIntegrations: true,
            viewTeamProfile: true,
          },
        },
      },
      {
        id: 'dev',
        name: 'Developer',
        permissions: {
          kanban: {
            moveCards: true,
            editTasks: true,
            deleteColumns: false,
            createBoard: false,
            addMembersToBoard: false,
            archiveBoard: false,
            assignTasks: false,
            commentOnTasks: true,
            setDueDates: true,
            reorderColumns: true,
          },
          code: {
            viewGithub: true,
            mergePRs: true,
            accessSSH: false,
            addRepo: false,
            manageRepoAccess: false,
            deleteRepo: false,
            createBranch: true,
            pushCode: true,
            reviewCode: true,
            viewCommitHistory: true,
          },
          cicd: {
            triggerDeployments: true,
            editPipelines: false,
            viewPipelineStatus: true,
            rollbackDeployment: false,
            approvePipeline: false,
            cancelPipeline: false,
            viewDeploymentLogs: true,
          },
          documents: {
            uploadFiles: true,
            downloadFiles: true,
            deleteFiles: false,
            shareFiles: true,
            editFiles: true,
            commentOnFiles: true,
            viewFileHistory: true,
          },
          ssh: {
            startSession: false,
            terminateSession: false,
            viewSessionLogs: true,
            manageSessionAccess: false,
          },
          general: {
            inviteMembers: false,
            viewAnalytics: true,
            editSettings: false,
            removeMembers: false,
            viewActivityLog: true,
            deleteTeam: false,
            changeTeamOwner: false,
            manageIntegrations: false,
            viewTeamProfile: true,
          },
        },
      },
      {
        id: 'QA',
        name: 'QA',
        permissions: {
          kanban: {
            moveCards: false,
            editTasks: true,
            deleteColumns: false,
            createBoard: false,
            addMembersToBoard: false,
            archiveBoard: false,
            assignTasks: false,
            commentOnTasks: true,
            setDueDates: false,
            reorderColumns: false,
          },
          code: {
            viewGithub: true,
            mergePRs: false,
            accessSSH: false,
            addRepo: false,
            manageRepoAccess: false,
            deleteRepo: false,
            createBranch: false,
            pushCode: false,
            reviewCode: true,
            viewCommitHistory: true,
          },
          cicd: {
            triggerDeployments: false,
            editPipelines: false,
            viewPipelineStatus: true,
            rollbackDeployment: false,
            approvePipeline: false,
            cancelPipeline: false,
            viewDeploymentLogs: true,
          },
          documents: {
            uploadFiles: false,
            downloadFiles: true,
            deleteFiles: false,
            shareFiles: false,
            editFiles: false,
            commentOnFiles: true,
            viewFileHistory: true,
          },
          ssh: {
            startSession: false,
            terminateSession: false,
            viewSessionLogs: false,
            manageSessionAccess: false,
          },
          general: {
            inviteMembers: false,
            viewAnalytics: false,
            editSettings: false,
            removeMembers: false,
            viewActivityLog: true,
            deleteTeam: false,
            changeTeamOwner: false,
            manageIntegrations: false,
            viewTeamProfile: true,
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
    // createTeam(wizardData);
    const team = JSON.parse(localStorage.getItem('incompleteTeam') || '{}');
    const teamId = team.id;
    const payload = {
      id: teamId,
      hasCompletedSetup: true,
    };
    try {
      const res = await apiService.put(endpoints.updateTeam, payload);
      if (res.status === 200) {
        console.log('Team created successfully:', res.data);
        toast({
          title: 'Team Created',
          description: `Team "${wizardData.teamName}" has been created successfully.`,
        });
        navigate(`/team`);
      }
    } catch (error) {
      console.log(error);
    }

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
          <Progress value={(currentStep / 5) * 100} className="h-2" />
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
            <Button
              onClick={handleComplete}
              disabled={!isStepValid()}
              className="flex items-center gap-2 bg-gradient-primary hover:opacity-90"
            >
              <Sparkles className="w-4 h-4" />
              Create Team
            </Button>
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
