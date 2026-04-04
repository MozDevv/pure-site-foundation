import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Route, BookOpen, Lock, Unlock, CheckCircle2, Circle, Trophy,
  Star, ChevronRight, Play, Award, Target
} from 'lucide-react';
import { SkeletonPage } from '@/components/ui/animations';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  difficulty: string;
  tags: string;
  isPublished: boolean;
  steps: LearningPathStep[];
}

interface LearningPathStep {
  id: string;
  title: string;
  stepType: string;
  stepOrder: number;
  requiresPreviousCompletion: boolean;
  minimumScorePercent?: number;
  externalUrl?: string;
  course?: { id: string; courseName: string };
}

interface PathProgress {
  path: LearningPath;
  steps: StepProgress[];
  overallProgress: number;
  completedSteps: number;
  totalSteps: number;
}

interface StepProgress {
  id: string;
  step: LearningPathStep;
  status: string;
  scorePercent?: number;
  isLocked: boolean;
  startedAt?: string;
  completedAt?: string;
}

interface SkillMastery {
  id: string;
  skillName: string;
  skillCategory: string;
  masteryLevel: number;
  masteryLabel: string;
  totalPoints: number;
  assessmentCount: number;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  INTERMEDIATE: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  ADVANCED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
};

const MASTERY_COLORS: Record<string, string> = {
  Novice: 'text-gray-500 dark:text-gray-400',
  Beginner: 'text-blue-500 dark:text-blue-400',
  Intermediate: 'text-yellow-500 dark:text-yellow-400',
  Advanced: 'text-orange-500 dark:text-orange-400',
  Expert: 'text-purple-500 dark:text-purple-400',
};

export default function LearningPathPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Published paths
  const { data: pathsData, isLoading } = useQuery({
    queryKey: ['learningPaths'],
    queryFn: () => apiService.get(endpoints.getPublishedLearningPaths).then(r => r.data),
  });
  const paths: LearningPath[] = pathsData?.content || pathsData || [];

  // My enrolled paths
  const { data: enrolledPaths } = useQuery<Array<Record<string, any>>>({
    queryKey: ['myEnrolledPaths'],
    queryFn: () => apiService.get(endpoints.getMyEnrolledPaths).then(r => r.data),
  });

  // Selected path progress
  const { data: pathProgress } = useQuery<PathProgress>({
    queryKey: ['pathProgress', selectedPath],
    queryFn: () => apiService.get(endpoints.getLearningPathProgress(selectedPath!)).then(r => r.data),
    enabled: !!selectedPath,
  });

  // My skills
  const { data: skills } = useQuery<SkillMastery[]>({
    queryKey: ['mySkills'],
    queryFn: () => apiService.get(endpoints.getMySkills).then(r => r.data),
  });

  // Enroll in path
  const enrollMutation = useMutation({
    mutationFn: (pathId: string) => apiService.post(endpoints.enrollInLearningPath(pathId)),
    onSuccess: (_, pathId) => {
      toast({ title: 'Enrolled!', description: 'You have been enrolled in this learning path.' });
      queryClient.invalidateQueries({ queryKey: ['myEnrolledPaths'] });
      setSelectedPath(pathId);
    },
    onError: (err: any) => toast({
      title: 'Error',
      description: err?.response?.data?.error || 'Failed to enroll',
      variant: 'destructive'
    }),
  });

  // Complete step
  const completeStepMutation = useMutation({
    mutationFn: ({ progressId, scorePercent }: { progressId: string; scorePercent?: number }) =>
      apiService.patch(endpoints.completeLearningPathStep(progressId), { scorePercent }),
    onSuccess: () => {
      toast({ title: 'Step completed!' });
      queryClient.invalidateQueries({ queryKey: ['pathProgress', selectedPath] });
      queryClient.invalidateQueries({ queryKey: ['mySkills'] });
    },
  });

  const isEnrolled = (pathId: string) =>
    enrolledPaths?.some((ep: any) => ep.pathId === pathId || ep.path?.id === pathId);

  // Group skills by category
  const skillsByCategory: Record<string, SkillMastery[]> = {};
  skills?.forEach(s => {
    if (!skillsByCategory[s.skillCategory]) skillsByCategory[s.skillCategory] = [];
    skillsByCategory[s.skillCategory].push(s);
  });

  if (isLoading) {
    return <SkeletonPage />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Learning Paths</h1>
        <p className="text-muted-foreground">Structured learning journeys to master new skills</p>
      </div>

      <Tabs defaultValue="paths">
        <TabsList>
          <TabsTrigger value="paths"><Route className="w-4 h-4 mr-1" /> Paths</TabsTrigger>
          <TabsTrigger value="my-progress"><Target className="w-4 h-4 mr-1" /> My Progress</TabsTrigger>
          <TabsTrigger value="skills"><Award className="w-4 h-4 mr-1" /> Skills</TabsTrigger>
        </TabsList>

        {/* Available Paths */}
        <TabsContent value="paths">
          {selectedPath && pathProgress ? (
            <Card>
              <CardHeader>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPath(null)} className="w-fit mb-2">
                  ← Back to paths
                </Button>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{pathProgress.path?.title}</CardTitle>
                    <CardDescription>{pathProgress.path?.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{pathProgress.overallProgress || 0}%</div>
                    <div className="text-sm text-muted-foreground">
                      {pathProgress.completedSteps}/{pathProgress.totalSteps} steps
                    </div>
                  </div>
                </div>
                <Progress value={pathProgress.overallProgress || 0} className="mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pathProgress.steps?.map((sp: StepProgress, idx: number) => (
                    <div
                      key={sp.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg ${
                        sp.isLocked ? 'opacity-50 bg-muted' : 'hover:border-primary'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {sp.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : sp.isLocked ? (
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        ) : sp.status === 'IN_PROGRESS' ? (
                          <Play className="w-6 h-6 text-blue-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Step {idx + 1}</span>
                          <span className="font-medium">{sp.step.title}</span>
                          <Badge variant="outline" className="text-xs">{sp.step.stepType}</Badge>
                        </div>
                        {sp.scorePercent != null && (
                          <span className="text-xs text-muted-foreground">Score: {sp.scorePercent}%</span>
                        )}
                        {sp.step.minimumScorePercent && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (min: {sp.step.minimumScorePercent}%)
                          </span>
                        )}
                      </div>
                      {!sp.isLocked && sp.status !== 'COMPLETED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => completeStepMutation.mutate({ progressId: sp.id })}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paths.map((path: LearningPath) => (
                <Card key={path.id} className="hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className={DIFFICULTY_COLORS[path.difficulty]}>
                        {path.difficulty}
                      </Badge>
                      {path.estimatedHours && (
                        <span className="text-xs text-muted-foreground">{path.estimatedHours}h</span>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-2">{path.title}</CardTitle>
                    <CardDescription>{path.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {path.steps?.length || 0} steps
                        </span>
                      </div>
                      {isEnrolled(path.id) ? (
                        <Button size="sm" onClick={() => setSelectedPath(path.id)}>
                          Continue <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => enrollMutation.mutate(path.id)}>
                          Enroll
                        </Button>
                      )}
                    </div>
                    {path.tags && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {path.tags.split(',').map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag.trim()}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {paths.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Route className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No learning paths available yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* My Progress */}
        <TabsContent value="my-progress">
          <div className="space-y-3">
            {enrolledPaths?.map((ep: any) => (
              <Card
                key={ep.pathId || ep.path?.id}
                className="cursor-pointer hover:border-primary"
                onClick={() => setSelectedPath(ep.pathId || ep.path?.id)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{ep.pathTitle || ep.path?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {ep.completedSteps || 0}/{ep.totalSteps || 0} steps completed
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <Progress value={ep.progress || 0} />
                      </div>
                      <span className="text-sm font-medium">{ep.progress || 0}%</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!enrolledPaths || enrolledPaths.length === 0) && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>You haven't enrolled in any learning paths yet</p>
                  <p className="text-sm mt-1">Browse the Paths tab to get started</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Skills */}
        <TabsContent value="skills">
          {Object.keys(skillsByCategory).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categorySkills.map((skill: SkillMastery) => (
                      <Card key={skill.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{skill.skillName}</span>
                            <span className={`text-sm font-semibold ${MASTERY_COLORS[skill.masteryLabel] || ''}`}>
                              {skill.masteryLabel}
                            </span>
                          </div>
                          <Progress value={skill.masteryLevel} className="mb-1" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{skill.masteryLevel}/100</span>
                            <span>{skill.assessmentCount} assessments</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No skills tracked yet</p>
                <p className="text-sm mt-1">Complete courses and assessments to build your skill profile</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
