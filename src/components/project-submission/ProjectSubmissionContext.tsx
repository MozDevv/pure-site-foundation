import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  ProjectSubmission,
  ProjectTeam,
  ProjectOverview,
  ProjectDetails,
  ProjectAdditionalInfo,
  createProject,
  getProject,
  updateProjectTeam,
  updateProjectOverview,
  updateProjectDetails,
  updateProjectAdditionalInfo,
  submitProject as apiSubmitProject,
  canSubmitProject,
  validateTeamStep,
  validateOverviewStep,
  validateDetailsStep,
} from '@/lib/project-submission-api';
import { useToast } from '@/hooks/use-toast';

interface StepStatus {
  completed: boolean;
  valid: boolean;
  errors: string[];
}

interface ProjectSubmissionContextType {
  project: ProjectSubmission | null;
  isLoading: boolean;
  isSaving: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  stepStatuses: Record<number, StepStatus>;
  
  // Step actions
  updateTeam: (team: ProjectTeam) => Promise<void>;
  updateOverview: (overview: ProjectOverview) => Promise<void>;
  updateDetails: (details: ProjectDetails) => Promise<void>;
  updateAdditionalInfo: (info: ProjectAdditionalInfo) => Promise<void>;
  submitProject: () => Promise<boolean>;
  
  // Navigation
  canProceed: boolean;
  canSubmit: boolean;
  submitErrors: string[];
}

const ProjectSubmissionContext = createContext<ProjectSubmissionContextType | undefined>(undefined);

export function ProjectSubmissionProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<ProjectSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  // Initialize or load project
  useEffect(() => {
    const initProject = async () => {
      setIsLoading(true);
      try {
        // Try to load existing draft
        let existingProject = await getProject('current');
        
        if (!existingProject) {
          // Create new project
          existingProject = await createProject();
        }
        
        setProject(existingProject);
      } catch (error) {
        console.error('Failed to initialize project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initProject();
  }, []);

  // Calculate step statuses
  const stepStatuses: Record<number, StepStatus> = {
    1: project ? {
      ...validateTeamStep(project.team),
      completed: project.team.name.length > 0 && project.team.members.length > 0,
    } : { completed: false, valid: false, errors: [] },
    2: project ? {
      ...validateOverviewStep(project.overview),
      completed: project.overview.name.length > 0 && project.overview.elevatorPitch.length > 0,
    } : { completed: false, valid: false, errors: [] },
    3: project ? {
      ...validateDetailsStep(project.details),
      completed: project.details.problemStatement.length > 0 && project.details.proposedSolution.length > 0,
    } : { completed: false, valid: false, errors: [] },
    4: { completed: true, valid: true, errors: [] }, // Optional step
    5: { completed: false, valid: true, errors: [] }, // Submit step
  };

  const canProceed = stepStatuses[currentStep]?.valid ?? false;
  
  const { canSubmit, errors: submitErrors } = project 
    ? canSubmitProject(project) 
    : { canSubmit: false, errors: ['Project not loaded'] };

  const updateTeam = useCallback(async (team: ProjectTeam) => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      const updated = await updateProjectTeam(project.id, team);
      setProject(updated);
      toast({
        title: 'Saved',
        description: 'Team information saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save team information.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [project, toast]);

  const updateOverview = useCallback(async (overview: ProjectOverview) => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      const updated = await updateProjectOverview(project.id, overview);
      setProject(updated);
      toast({
        title: 'Saved',
        description: 'Project overview saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save project overview.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [project, toast]);

  const updateDetails = useCallback(async (details: ProjectDetails) => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      const updated = await updateProjectDetails(project.id, details);
      setProject(updated);
      toast({
        title: 'Saved',
        description: 'Project details saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save project details.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [project, toast]);

  const updateAdditionalInfo = useCallback(async (info: ProjectAdditionalInfo) => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      const updated = await updateProjectAdditionalInfo(project.id, info);
      setProject(updated);
      toast({
        title: 'Saved',
        description: 'Additional information saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save additional information.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [project, toast]);

  const handleSubmitProject = useCallback(async (): Promise<boolean> => {
    if (!project || !canSubmit) return false;
    
    setIsSaving(true);
    try {
      const updated = await apiSubmitProject(project.id);
      setProject(updated);
      toast({
        title: 'Project Submitted!',
        description: 'Your project has been submitted for review.',
      });
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit project. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [project, canSubmit, toast]);

  return (
    <ProjectSubmissionContext.Provider
      value={{
        project,
        isLoading,
        isSaving,
        currentStep,
        setCurrentStep,
        stepStatuses,
        updateTeam,
        updateOverview,
        updateDetails,
        updateAdditionalInfo,
        submitProject: handleSubmitProject,
        canProceed,
        canSubmit,
        submitErrors,
      }}
    >
      {children}
    </ProjectSubmissionContext.Provider>
  );
}

export function useProjectSubmission() {
  const context = useContext(ProjectSubmissionContext);
  if (!context) {
    throw new Error('useProjectSubmission must be used within ProjectSubmissionProvider');
  }
  return context;
}
