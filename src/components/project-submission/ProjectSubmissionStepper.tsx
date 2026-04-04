import React, { useState } from 'react';
import { useProjectSubmission } from './ProjectSubmissionContext';
import { StepperHeader } from './StepperHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, ArrowRight, Send, HelpCircle, Users, Plus, Trash2, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { mockExistingTeams, TeamMember } from '@/lib/project-submission-api';

function TooltipHelper({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help inline ml-1" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Step 1: Manage Team
function TeamStep() {
  const { project, updateTeam, isSaving } = useProjectSubmission();
  const [useExisting, setUseExisting] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  if (!project) return null;

  const { team } = project;

  const handleAddMember = () => {
    if (!newMemberEmail.trim()) return;
    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: 'member',
    };
    updateTeam({ ...team, members: [...team.members, newMember] });
    setNewMemberEmail('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Manage Your Team</h2>
        <p className="text-muted-foreground">Set up your project team and invite collaborators.</p>
      </div>

      <RadioGroup value={useExisting ? 'existing' : 'new'} onValueChange={(v) => setUseExisting(v === 'existing')}>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className={`cursor-pointer ${!useExisting ? 'ring-2 ring-primary' : ''}`} onClick={() => setUseExisting(false)}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <RadioGroupItem value="new" id="new" />
                <div>
                  <Label htmlFor="new" className="font-medium">Create New Team</Label>
                  <p className="text-sm text-muted-foreground">Start fresh with a new team</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer ${useExisting ? 'ring-2 ring-primary' : ''}`} onClick={() => setUseExisting(true)}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <RadioGroupItem value="existing" id="existing" />
                <div>
                  <Label htmlFor="existing" className="font-medium">Use Existing Team</Label>
                  <p className="text-sm text-muted-foreground">Select from your teams</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </RadioGroup>

      {useExisting ? (
        <div className="space-y-3">
          {mockExistingTeams.map((t) => (
            <Card key={t.id} className={`cursor-pointer hover:bg-muted/50 ${team.id === t.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => updateTeam(t)}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.members.length} members</p>
                </div>
                <Badge variant="outline">{t.visibility}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label>Team Name *<TooltipHelper text="Give your team a memorable name" /></Label>
            <Input value={team.name} onChange={(e) => updateTeam({ ...team, name: e.target.value })} placeholder="e.g., Innovation Squad" />
          </div>
          <div>
            <Label>Visibility<TooltipHelper text="Private projects are only visible to reviewers." /></Label>
            <RadioGroup value={team.visibility} onValueChange={(v: 'public' | 'private') => updateTeam({ ...team, visibility: v })} className="flex gap-4 mt-2">
              <div className="flex items-center gap-2"><RadioGroupItem value="private" id="private" /><Label htmlFor="private">Private</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="public" id="public" /><Label htmlFor="public">Public</Label></div>
            </RadioGroup>
          </div>
          <div>
            <Label>Team Members<TooltipHelper text="Team members can be invited later. Mentors don't count toward team size." /></Label>
            <div className="flex gap-2 mt-2">
              <Input value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="email@example.com" />
              <Button onClick={handleAddMember} size="icon"><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="mt-3 space-y-2">
              {team.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{m.name} ({m.email})</span>
                  <Badge variant="secondary">{m.role}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Step 2: Overview
function OverviewStep() {
  const { project, updateOverview } = useProjectSubmission();
  if (!project) return null;
  const { overview } = project;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Project Overview</h2>
        <p className="text-muted-foreground">This is the first thing reviewers see.</p>
      </div>
      <div>
        <Label>Project Name *<TooltipHelper text="Choose a catchy, memorable name" /></Label>
        <Input value={overview.name} onChange={(e) => updateOverview({ ...overview, name: e.target.value })} placeholder="My Amazing Project" />
      </div>
      <div>
        <Label>Elevator Pitch *<TooltipHelper text="Keep it under 200 characters. Make it compelling!" /></Label>
        <Textarea value={overview.elevatorPitch} onChange={(e) => updateOverview({ ...overview, elevatorPitch: e.target.value })} placeholder="Describe your project in one sentence..." maxLength={200} />
        <p className="text-xs text-muted-foreground mt-1">{overview.elevatorPitch.length}/200</p>
      </div>
      <div>
        <Label>Tags<TooltipHelper text="Add relevant categories" /></Label>
        <Input placeholder="AI, Education, Sustainability (comma separated)" onChange={(e) => updateOverview({ ...overview, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
      </div>
    </div>
  );
}

// Step 3: Details
function DetailsStep() {
  const { project, updateDetails } = useProjectSubmission();
  if (!project) return null;
  const { details } = project;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Project Details</h2>
        <p className="text-muted-foreground">Help reviewers understand your solution.</p>
      </div>
      <div>
        <Label>Problem Statement *<TooltipHelper text="Clearly explain the real-world problem you're solving" /></Label>
        <Textarea value={details.problemStatement} onChange={(e) => updateDetails({ ...details, problemStatement: e.target.value })} placeholder="What problem are you solving?" rows={4} />
      </div>
      <div>
        <Label>Proposed Solution *<TooltipHelper text="Describe how your project solves the problem" /></Label>
        <Textarea value={details.proposedSolution} onChange={(e) => updateDetails({ ...details, proposedSolution: e.target.value })} placeholder="How does your solution work?" rows={4} />
      </div>
      <div>
        <Label>Innovation Factor<TooltipHelper text="What makes your idea different and unique?" /></Label>
        <Textarea value={details.innovationFactor} onChange={(e) => updateDetails({ ...details, innovationFactor: e.target.value })} placeholder="What's unique about your approach?" rows={3} />
      </div>
      <div>
        <Label>Project Stage</Label>
        <RadioGroup value={details.projectStage} onValueChange={(v: any) => updateDetails({ ...details, projectStage: v })} className="flex gap-4 mt-2">
          <div className="flex items-center gap-2"><RadioGroupItem value="idea" id="idea" /><Label htmlFor="idea">Idea</Label></div>
          <div className="flex items-center gap-2"><RadioGroupItem value="prototype" id="prototype" /><Label htmlFor="prototype">Prototype</Label></div>
          <div className="flex items-center gap-2"><RadioGroupItem value="mvp" id="mvp" /><Label htmlFor="mvp">MVP</Label></div>
        </RadioGroup>
      </div>
    </div>
  );
}

// Step 4: Additional Info
function AdditionalInfoStep() {
  const { project, updateAdditionalInfo } = useProjectSubmission();
  if (!project) return null;
  const { additionalInfo } = project;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Additional Information</h2>
        <p className="text-muted-foreground">Optional details that help reviewers understand your project better.</p>
      </div>
      <div>
        <Label>Expected Impact<TooltipHelper text="How will your project make a difference?" /></Label>
        <Textarea value={additionalInfo.expectedImpact} onChange={(e) => updateAdditionalInfo({ ...additionalInfo, expectedImpact: e.target.value })} placeholder="Describe the potential impact..." />
      </div>
      <div>
        <Label>Risks & Challenges<TooltipHelper text="Be honest about potential obstacles" /></Label>
        <Textarea value={additionalInfo.risksAndChallenges} onChange={(e) => updateAdditionalInfo({ ...additionalInfo, risksAndChallenges: e.target.value })} placeholder="What challenges might you face?" />
      </div>
      <div>
        <Label>Requested Support</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['Mentorship', 'Funding', 'Technical Resources', 'Industry Connections'].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <Checkbox checked={additionalInfo.requestedSupport.includes(s)} onCheckedChange={(c) => {
                const newSupport = c ? [...additionalInfo.requestedSupport, s] : additionalInfo.requestedSupport.filter(x => x !== s);
                updateAdditionalInfo({ ...additionalInfo, requestedSupport: newSupport });
              }} />
              <Label>{s}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 5: Submit
function SubmitStep() {
  const { project, canSubmit, submitErrors, submitProject, isSaving } = useProjectSubmission();
  if (!project) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
        <p className="text-muted-foreground">Review your project before submitting for review.</p>
      </div>

      {project.status === 'SUBMITTED' ? (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-300">Your project has been submitted successfully!</AlertDescription>
        </Alert>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle>{project.overview.name || 'Untitled Project'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><span className="font-medium">Team:</span> {project.team.name || 'Not set'} ({project.team.members.length} members)</div>
              <div><span className="font-medium">Pitch:</span> {project.overview.elevatorPitch || 'Not provided'}</div>
              <div><span className="font-medium">Stage:</span> <Badge variant="outline">{project.details.projectStage}</Badge></div>
              <div><span className="font-medium">Status:</span> <Badge>{project.status}</Badge></div>
            </CardContent>
          </Card>

          {!canSubmit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {submitErrors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={submitProject} disabled={!canSubmit || isSaving} className="w-full" size="lg">
            <Send className="h-4 w-4 mr-2" />
            {isSaving ? 'Submitting...' : 'Submit Project'}
          </Button>
        </>
      )}
    </div>
  );
}

export function ProjectSubmissionStepper() {
  const { currentStep, setCurrentStep, isLoading, isSaving } = useProjectSubmission();

  if (isLoading) {
    return <div className="max-w-3xl mx-auto p-6 space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  const steps = [TeamStep, OverviewStep, DetailsStep, AdditionalInfoStep, SubmitStep];
  const CurrentStepComponent = steps[currentStep - 1];

  return (
    <div className="min-h-screen bg-background">
      <StepperHeader />
      <div className="max-w-3xl mx-auto p-6">
        <CurrentStepComponent />
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} disabled={currentStep === 1}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          {currentStep < 5 && (
            <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save & Continue'}<ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
