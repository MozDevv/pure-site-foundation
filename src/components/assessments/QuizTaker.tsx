import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Send,
  RotateCcw,
} from 'lucide-react';
import { Quiz, QuizQuestion } from '@/types/lms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface QuizTakerProps {
  quiz: Quiz;
  onSubmit: (answers: QuizAnswer[]) => Promise<void>;
  onTimeUp?: () => void;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
}

type QuizStatus = 'not-started' | 'in-progress' | 'time-up' | 'submitted';

export function QuizTaker({ quiz, onSubmit, onTimeUp }: QuizTakerProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Parse questions from questionsJson if available
  const questions: QuizQuestion[] = useMemo(() => {
    if (quiz.questionsJson) {
      try {
        return JSON.parse(quiz.questionsJson);
      } catch {
        return [];
      }
    }
    return quiz.questions || [];
  }, [quiz.questionsJson, quiz.questions]);

  // Shuffle questions if enabled
  const shuffledQuestions = useMemo(() => {
    if (quiz.shuffleQuestions) {
      return [...questions].sort(() => Math.random() - 0.5);
    }
    return questions;
  }, [questions, quiz.shuffleQuestions]);

  // State
  const [status, setStatus] = useState<QuizStatus>('not-started');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [timeRemaining, setTimeRemaining] = useState(
    (quiz.timeLimit || 60) * 60
  ); // Convert to seconds
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const totalQuestions = shuffledQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    if (status !== 'in-progress') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('time-up');
          setShowTimeUpDialog(true);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, onTimeUp]);

  // Warn when time is low
  useEffect(() => {
    if (status === 'in-progress' && timeRemaining === 300) {
      toast({
        title: '5 minutes remaining',
        description: 'Please review and submit your answers soon.',
        variant: 'destructive',
      });
    }
    if (status === 'in-progress' && timeRemaining === 60) {
      toast({
        title: '1 minute remaining!',
        description: 'Your quiz will be auto-submitted when time runs out.',
        variant: 'destructive',
      });
    }
  }, [timeRemaining, status, toast]);

  // Start quiz
  const handleStart = () => {
    setStatus('in-progress');
  };

  // Navigate questions
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  };

  const goNext = () => goToQuestion(currentQuestionIndex + 1);
  const goPrev = () => goToQuestion(currentQuestionIndex - 1);

  // Answer handling
  const setAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // Flag question for review
  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Submit quiz
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const formattedAnswers: QuizAnswer[] = shuffledQuestions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || '',
      }));
      await onSubmit(formattedAnswers);
      setStatus('submitted');
      toast({
        title: 'Quiz submitted!',
        description: 'Your answers have been recorded.',
      });
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, shuffledQuestions, onSubmit, toast]);

  // Auto-submit on time up
  useEffect(() => {
    if (status === 'time-up' && !isSubmitting) {
      handleSubmit();
    }
  }, [status, isSubmitting, handleSubmit]);

  // Prevent leaving page during quiz
  useEffect(() => {
    if (status !== 'in-progress') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status]);

  // Get time color based on remaining time
  const getTimeColor = () => {
    if (timeRemaining <= 60) return 'text-destructive';
    if (timeRemaining <= 300) return 'text-warning';
    return 'text-foreground';
  };

  // Render start screen
  if (status === 'not-started') {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
            <p className="text-muted-foreground mt-2">{quiz.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quiz Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border text-center">
                <p className="text-3xl font-bold text-foreground">
                  {totalQuestions}
                </p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
              <div className="p-4 rounded-lg border border-border text-center">
                <p className="text-3xl font-bold text-foreground">
                  {quiz.timeLimit || '∞'}
                </p>
                <p className="text-sm text-muted-foreground">Minutes</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <h3 className="font-medium text-foreground">Instructions:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Answer all questions before submitting</li>
                <li>• You can flag questions for review</li>
                <li>
                  • Navigate between questions using the buttons or question
                  navigator
                </li>
                {quiz.timeLimit && (
                  <li>• The quiz will auto-submit when time runs out</li>
                )}
                {quiz.shuffleQuestions && (
                  <li>• Questions are shuffled randomly</li>
                )}
                <li>• Maximum attempts: {quiz.maxAttempts}</li>
              </ul>
            </div>

            {/* Start Button */}
            <Button onClick={handleStart} className="w-full" size="lg">
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render submitted screen
  if (status === 'submitted') {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card className="text-center">
          <CardContent className="py-12">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Quiz Submitted!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your answers have been recorded successfully.
            </p>
            <div className="p-4 rounded-lg bg-muted/50 mb-6">
              <p className="text-sm text-muted-foreground">
                You answered{' '}
                <span className="font-medium text-foreground">
                  {answeredCount}
                </span>{' '}
                out of{' '}
                <span className="font-medium text-foreground">
                  {totalQuestions}
                </span>{' '}
                questions.
              </p>
            </div>
            {quiz.showResults && (
              <Button onClick={() => navigate(-1)}>View Results</Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render question
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const currentAnswer = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <RadioGroup
            value={(currentAnswer as string) || ''}
            onValueChange={(value) => setAnswer(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center space-x-3 rounded-lg border border-border p-4 transition-colors cursor-pointer hover:bg-muted/50',
                  currentAnswer === option && 'border-primary bg-primary/5'
                )}
                onClick={() => setAnswer(currentQuestion.id, option)}
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer text-foreground"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'true_false':
        return (
          <RadioGroup
            value={(currentAnswer as string) || ''}
            onValueChange={(value) => setAnswer(currentQuestion.id, value)}
            className="space-y-3"
          >
            {['True', 'False'].map((option) => (
              <div
                key={option}
                className={cn(
                  'flex items-center space-x-3 rounded-lg border border-border p-4 transition-colors cursor-pointer hover:bg-muted/50',
                  currentAnswer?.toLowerCase() === option.toLowerCase() &&
                    'border-primary bg-primary/5'
                )}
                onClick={() =>
                  setAnswer(currentQuestion.id, option.toLowerCase())
                }
              >
                <RadioGroupItem
                  value={option.toLowerCase()}
                  id={`option-${option}`}
                />
                <Label
                  htmlFor={`option-${option}`}
                  className="flex-1 cursor-pointer text-foreground"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'short_answer':
        return (
          <Textarea
            value={(currentAnswer as string) || ''}
            onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-32 resize-none"
          />
        );

      case 'code':
        return (
          <Textarea
            value={
              (currentAnswer as string) || currentQuestion.codeTemplate || ''
            }
            onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
            placeholder="Write your code here..."
            className="min-h-48 font-mono text-sm resize-none"
          />
        );

      default:
        return (
          <Textarea
            value={(currentAnswer as string) || ''}
            onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-32 resize-none"
          />
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Timer */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border -mx-4 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {quiz.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border',
              timeRemaining <= 60
                ? 'border-destructive bg-destructive/10'
                : timeRemaining <= 300
                ? 'border-warning bg-warning/10'
                : 'border-border'
            )}
          >
            <Clock className={cn('h-5 w-5', getTimeColor())} />
            <span className={cn('text-xl font-mono font-bold', getTimeColor())}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        <Progress value={progressPercent} className="mt-3 h-2" />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Question Navigator */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card className="sticky top-24">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Questions</CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-4">
              <div className="grid grid-cols-5 gap-2">
                {shuffledQuestions.map((q, index) => {
                  const isAnswered = !!answers[q.id];
                  const isFlagged = flaggedQuestions.has(q.id);
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(index)}
                      className={cn(
                        'relative h-10 w-10 rounded-lg text-sm font-medium transition-all',
                        isCurrent
                          ? 'bg-primary text-primary-foreground'
                          : isAnswered
                          ? 'bg-success/20 text-success hover:bg-success/30'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {index + 1}
                      {isFlagged && (
                        <Flag className="absolute -top-1 -right-1 h-3 w-3 text-warning fill-warning" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-success/20" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-muted" />
                  <span>Unanswered ({totalQuestions - answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-3 w-3 text-warning fill-warning" />
                  <span>Flagged ({flaggedQuestions.size})</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Content */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground capitalize">
                      {currentQuestion?.type.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {currentQuestion?.points} points
                    </span>
                  </div>
                  <h2 className="text-lg font-medium text-foreground">
                    {currentQuestion?.question}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    currentQuestion && toggleFlag(currentQuestion.id)
                  }
                  className={cn(
                    flaggedQuestions.has(currentQuestion?.id || '')
                      ? 'text-warning'
                      : 'text-muted-foreground'
                  )}
                >
                  <Flag
                    className={cn(
                      'h-5 w-5',
                      flaggedQuestions.has(currentQuestion?.id || '') &&
                        'fill-warning'
                    )}
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderQuestion()}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={goPrev}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <div className="flex gap-2">
                  {answers[currentQuestion?.id || ''] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newAnswers = { ...answers };
                        delete newAnswers[currentQuestion.id];
                        setAnswers(newAnswers);
                      }}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  )}
                </div>
                {currentQuestionIndex === totalQuestions - 1 ? (
                  <Button onClick={() => setShowSubmitDialog(true)}>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Quiz
                  </Button>
                ) : (
                  <Button onClick={goNext}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Are you sure you want to submit your quiz?</p>
                <div className="p-3 rounded-lg bg-muted space-y-1">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">
                      {answeredCount}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-foreground">
                      {totalQuestions}
                    </span>{' '}
                    questions answered
                  </p>
                  {flaggedQuestions.size > 0 && (
                    <p className="text-sm text-warning">
                      <Flag className="inline h-3 w-3 mr-1" />
                      {flaggedQuestions.size} question(s) flagged for review
                    </p>
                  )}
                  {answeredCount < totalQuestions && (
                    <p className="text-sm text-destructive">
                      <AlertTriangle className="inline h-3 w-3 mr-1" />
                      {totalQuestions - answeredCount} question(s) unanswered
                    </p>
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Up Dialog */}
      <AlertDialog open={showTimeUpDialog} onOpenChange={setShowTimeUpDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-destructive" />
              Time's Up!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your time has expired. Your answers are being submitted
              automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'OK'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
