import React, { useImperativeHandle, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertCircle,
  Lightbulb,
  Users,
  Sparkles,
  Layers,
  Code,
  HelpCircle,
  X,
} from 'lucide-react';
import { WizardData } from '../TeamSetupWizard';
import { apiService, endpoints } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface WizardStepTwoProps {
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
}

export interface WizardStepTwoHandle {
  saveData: () => Promise<boolean>;
}

const TECH_STACK_OPTIONS = [
  'React',
  'Node.js',
  'Python',
  'TypeScript',
  'JavaScript',
  'Java',
  'C#',
  'Go',
  'Rust',
  'AI / ML',
  'Mobile (React Native)',
  'Mobile (Flutter)',
  'iOS (Swift)',
  'Android (Kotlin)',
  'PostgreSQL',
  'MongoDB',
  'Firebase',
  'AWS',
  'Azure',
  'Docker',
  'Kubernetes',
];

const PROJECT_STAGES = [
  { value: 'IDEA', label: 'Idea', description: 'Just a concept or vision' },
  { value: 'PROTOTYPE', label: 'Prototype', description: 'Early working demo' },
  { value: 'MVP', label: 'MVP', description: 'Minimum viable product ready' },
];

export const WizardStepTwo = React.forwardRef<
  WizardStepTwoHandle,
  WizardStepTwoProps
>(({ data, onUpdate }, ref) => {
  const [isSaving, setIsSaving] = useState(false);
  const [techInput, setTechInput] = useState('');

  useImperativeHandle(ref, () => ({
    saveData: async () => {
      return await handleSave();
    },
  }));

  const { toast } = useToast();

  const handleSave = async (): Promise<boolean> => {
    // Validate required fields
    if (!data.problemStatement?.trim()) {
      return false;
    }
    if (!data.solutionDescription?.trim()) {
      return false;
    }
    if (!data.projectStage) {
      return false;
    }
    /**
 * 
        localStorage.setItem('incompleteTeam', JSON.stringify(response.data));
 * 
 */
    let incompleteTeam = localStorage.getItem('incompleteTeam');
    if (incompleteTeam) {
      incompleteTeam = JSON.parse(incompleteTeam);
    }
    const id = data.id || (incompleteTeam ? incompleteTeam.id : null);
    if (!id) {
      console.error('No project ID found for saving step 2 data');
      return false;
    }

    setIsSaving(true);
    try {
      const res = await apiService.put(endpoints.updateProject(id as string), {
        ...incompleteTeam,
        problemStatement: data.problemStatement,
        solutionDescription: data.solutionDescription,
        targetUsers: data.targetUsers,
        innovationNotes: data.innovationNotes,
        projectStage: data.projectStage,
        techStack: data.techStack,
      });
      if (res.status === 200) {
        console.log('Step 2 data saved:', res.data);
        toast({
          title: 'Success',
          description: 'Step 2 data saved successfully, proceed to next step',
        });
        localStorage.setItem('incompleteTeam', JSON.stringify(res.data));
        return true;
      }
    } catch (error) {
      console.error('Failed to save step 2 data:', error);
    }
    setIsSaving(false);
  };

  const handleAddTech = (tech: string) => {
    const currentStack = data.techStack || [];
    if (!currentStack.includes(tech)) {
      onUpdate({ techStack: [...currentStack, tech] });
    }
    setTechInput('');
  };

  const handleRemoveTech = (tech: string) => {
    const currentStack = data.techStack || [];
    onUpdate({ techStack: currentStack.filter((t) => t !== tech) });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      handleAddTech(techInput.trim());
    }
  };

  const getCharacterCount = (text: string | undefined, max: number) => {
    const count = text?.length || 0;
    return (
      <span
        className={count > max ? 'text-destructive' : 'text-muted-foreground'}
      >
        {count}/{max}
      </span>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            Project Details
          </h2>
          <p className="text-muted-foreground mt-2">
            Explain your idea clearly to reviewers, mentors, and the community
          </p>
        </div>

        {/* 1. Problem Statement (Required) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Problem Statement</CardTitle>
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Strong projects clearly define a real, specific problem.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-muted-foreground">
                  What problem are you solving?
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                placeholder="e.g., Many small farmers in rural areas lack access to real-time market prices, causing them to sell their produce at unfair rates..."
                value={data.problemStatement || ''}
                onChange={(e) => onUpdate({ problemStatement: e.target.value })}
                className="min-h-[120px] resize-none"
                maxLength={1500}
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Describe the problem your project addresses and who is
                  affected.
                </span>
                {getCharacterCount(data.problemStatement, 1500)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Proposed Solution (Required) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Proposed Solution</CardTitle>
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Focus on the idea, not the implementation details yet.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-muted-foreground">
                  How does your project solve the problem?
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                placeholder="e.g., Our mobile app aggregates real-time market prices from multiple sources and delivers SMS alerts to farmers, even without internet access..."
                value={data.solutionDescription || ''}
                onChange={(e) =>
                  onUpdate({ solutionDescription: e.target.value })
                }
                className="min-h-[120px] resize-none"
                maxLength={1500}
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Explain your solution and how it works at a high level.
                </span>
                {getCharacterCount(data.solutionDescription, 1500)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Target Users (Optional but Recommended) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">
                    Target Users / Beneficiaries
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    Recommended
                  </Badge>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Knowing the user helps reviewers understand impact.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-muted-foreground">
                  Who will use or benefit from this project?
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                placeholder="e.g., Small-scale farmers, Agricultural cooperatives, Rural communities, Government agricultural agencies..."
                value={data.targetUsers || ''}
                onChange={(e) => onUpdate({ targetUsers: e.target.value })}
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Examples: Students, Farmers, SMEs, Developers, Government
                </span>
                {getCharacterCount(data.targetUsers, 500)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Innovation / Uniqueness (Optional) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">
                    Innovation / Uniqueness
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Optional
                  </Badge>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Is this faster, cheaper, smarter, or more accessible?
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-muted-foreground">
                  What makes this different from existing solutions?
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                placeholder="e.g., Unlike existing solutions that require internet, our app works offline using SMS. We also use AI to predict price trends..."
                value={data.innovationNotes || ''}
                onChange={(e) => onUpdate({ innovationNotes: e.target.value })}
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Highlight what sets your project apart.
                </span>
                {getCharacterCount(data.innovationNotes, 500)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Project Status (Required) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Project Status</CardTitle>
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This helps reviewers set expectations.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-muted-foreground">
                  Current stage of the project
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={data.projectStage || ''}
              onValueChange={(value) =>
                onUpdate({
                  projectStage: value as 'IDEA' | 'PROTOTYPE' | 'MVP',
                })
              }
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {PROJECT_STAGES.map((stage) => (
                <Label
                  key={stage.value}
                  htmlFor={stage.value}
                  className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                    data.projectStage === stage.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <RadioGroupItem value={stage.value} id={stage.value} />
                  <div className="space-y-1">
                    <span className="font-medium">{stage.label}</span>
                    <p className="text-xs text-muted-foreground">
                      {stage.description}
                    </p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* 6. Tech Stack (Optional) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Tech Stack</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Optional
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Technologies you plan to use
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Selected Technologies */}
              {data.techStack && data.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.techStack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="pl-3 pr-1 py-1 flex items-center gap-1"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Input for custom tech */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Type a technology and press Enter..."
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Quick add suggestions */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Quick add:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {TECH_STACK_OPTIONS.filter(
                    (tech) => !data.techStack?.includes(tech)
                  )
                    .slice(0, 10)
                    .map((tech) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleAddTech(tech)}
                      >
                        + {tech}
                      </Badge>
                    ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                You can update this later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
});

WizardStepTwo.displayName = 'WizardStepTwo';
