// Mock API layer for project submission
// TODO: Replace with real API endpoints

export type ProjectStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'REJECTED';

export type TeamMemberRole = 'owner' | 'member' | 'mentor';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  avatar?: string;
}

export interface ProjectTeam {
  id: string;
  name: string;
  members: TeamMember[];
  visibility: 'public' | 'private';
}

export interface ProjectOverview {
  name: string;
  elevatorPitch: string;
  thumbnailUrl?: string;
  tags: string[];
}

export interface ProjectDetails {
  problemStatement: string;
  proposedSolution: string;
  targetUsers: string;
  innovationFactor: string;
  techStack: string[];
  projectStage: 'idea' | 'prototype' | 'mvp';
}

export interface ProjectAdditionalInfo {
  expectedImpact: string;
  risksAndChallenges: string;
  sustainability: string;
  requestedSupport: string[];
}

export interface ProjectSubmission {
  id: string;
  status: ProjectStatus;
  team: ProjectTeam;
  overview: ProjectOverview;
  details: ProjectDetails;
  additionalInfo: ProjectAdditionalInfo;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

// In-memory store for demo
let projectStore: ProjectSubmission | null = null;

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock existing teams for selection
export const mockExistingTeams: ProjectTeam[] = [
  {
    id: 'team-1',
    name: 'Tech Innovators',
    visibility: 'public',
    members: [
      { id: 'u1', name: 'Alex Chen', email: 'alex@student.com', role: 'owner' },
      { id: 'u2', name: 'Sarah Johnson', email: 'sarah@student.com', role: 'member' },
    ],
  },
  {
    id: 'team-2',
    name: 'Green Solutions',
    visibility: 'private',
    members: [
      { id: 'u1', name: 'Alex Chen', email: 'alex@student.com', role: 'member' },
      { id: 'u3', name: 'Mike Brown', email: 'mike@student.com', role: 'owner' },
    ],
  },
];

// API Functions - Replace these with real API calls later

export async function createProject(): Promise<ProjectSubmission> {
  await delay();
  
  const newProject: ProjectSubmission = {
    id: `proj-${Date.now()}`,
    status: 'DRAFT',
    team: {
      id: '',
      name: '',
      members: [],
      visibility: 'private',
    },
    overview: {
      name: '',
      elevatorPitch: '',
      tags: [],
    },
    details: {
      problemStatement: '',
      proposedSolution: '',
      targetUsers: '',
      innovationFactor: '',
      techStack: [],
      projectStage: 'idea',
    },
    additionalInfo: {
      expectedImpact: '',
      risksAndChallenges: '',
      sustainability: '',
      requestedSupport: [],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  projectStore = newProject;
  localStorage.setItem('draftProject', JSON.stringify(newProject));
  
  return newProject;
}

export async function getProject(id: string): Promise<ProjectSubmission | null> {
  await delay(300);
  
  // Try localStorage first
  const stored = localStorage.getItem('draftProject');
  if (stored) {
    projectStore = JSON.parse(stored);
    return projectStore;
  }
  
  return projectStore;
}

export async function updateProject(
  id: string,
  updates: Partial<ProjectSubmission>
): Promise<ProjectSubmission> {
  await delay(300);
  
  if (!projectStore) {
    throw new Error('Project not found');
  }
  
  projectStore = {
    ...projectStore,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem('draftProject', JSON.stringify(projectStore));
  
  return projectStore;
}

export async function updateProjectTeam(
  id: string,
  team: ProjectTeam
): Promise<ProjectSubmission> {
  return updateProject(id, { team });
}

export async function updateProjectOverview(
  id: string,
  overview: ProjectOverview
): Promise<ProjectSubmission> {
  return updateProject(id, { overview });
}

export async function updateProjectDetails(
  id: string,
  details: ProjectDetails
): Promise<ProjectSubmission> {
  return updateProject(id, { details });
}

export async function updateProjectAdditionalInfo(
  id: string,
  additionalInfo: ProjectAdditionalInfo
): Promise<ProjectSubmission> {
  return updateProject(id, { additionalInfo });
}

export async function submitProject(id: string): Promise<ProjectSubmission> {
  await delay(800);
  
  if (!projectStore) {
    throw new Error('Project not found');
  }
  
  projectStore = {
    ...projectStore,
    status: 'SUBMITTED',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem('draftProject', JSON.stringify(projectStore));
  
  return projectStore;
}

export async function uploadThumbnail(file: File): Promise<string> {
  await delay(1000);
  
  // Return a fake URL - in real implementation, upload to storage
  return URL.createObjectURL(file);
}

export async function inviteTeamMember(
  projectId: string,
  email: string,
  role: TeamMemberRole
): Promise<TeamMember> {
  await delay(500);
  
  const newMember: TeamMember = {
    id: `member-${Date.now()}`,
    name: email.split('@')[0],
    email,
    role,
  };
  
  return newMember;
}

// Validation helpers
export function validateTeamStep(team: ProjectTeam): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!team.name?.trim()) {
    errors.push('Team name is required');
  }
  if (team.members.length === 0) {
    errors.push('At least one team member is required');
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateOverviewStep(overview: ProjectOverview): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!overview.name?.trim()) {
    errors.push('Project name is required');
  }
  if (!overview.elevatorPitch?.trim()) {
    errors.push('Elevator pitch is required');
  }
  if (overview.elevatorPitch && overview.elevatorPitch.length > 200) {
    errors.push('Elevator pitch must be under 200 characters');
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateDetailsStep(details: ProjectDetails): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!details.problemStatement?.trim()) {
    errors.push('Problem statement is required');
  }
  if (!details.proposedSolution?.trim()) {
    errors.push('Proposed solution is required');
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateAdditionalInfoStep(info: ProjectAdditionalInfo): { valid: boolean; errors: string[] } {
  // All fields are optional
  return { valid: true, errors: [] };
}

export function canSubmitProject(project: ProjectSubmission): { canSubmit: boolean; errors: string[] } {
  const allErrors: string[] = [];
  
  const teamValidation = validateTeamStep(project.team);
  const overviewValidation = validateOverviewStep(project.overview);
  const detailsValidation = validateDetailsStep(project.details);
  
  allErrors.push(...teamValidation.errors);
  allErrors.push(...overviewValidation.errors);
  allErrors.push(...detailsValidation.errors);
  
  return { canSubmit: allErrors.length === 0, errors: allErrors };
}
