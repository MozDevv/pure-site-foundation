import { format, isPast, differenceInDays } from 'date-fns';
import {
  CheckSquare,
  Clock,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  HelpCircle,
  Users,
  Play,
} from 'lucide-react';
import { Quiz, QuizQuestion } from '@/types/lms';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { QuizTaker, QuizAnswer } from './QuizTaker';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

interface QuizCardProps {
  quiz: Quiz;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAttemptComplete?: () => void;
}

export function QuizCard({
  quiz,
  onEdit,
  onDelete,
  onAttemptComplete,
}: QuizCardProps) {
  const [showQuizTaker, setShowQuizTaker] = useState(false);
  const { toast } = useToast();

  const dueDate = new Date(quiz.dueDate);
  const isOverdue = isPast(dueDate);
  const daysUntilDue = differenceInDays(dueDate, new Date());

  // Parse questions from questionsJson if available, otherwise use questions array
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

  const getStatusVariant = () => {
    if (isOverdue) return 'late';
    if (daysUntilDue <= 3) return 'pending';
    return 'active';
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  const canAttempt = !isOverdue;

  const handleSubmitQuiz = async (answers: QuizAnswer[]) => {
    await apiService.submitQuizAttempt(quiz.id, answers);
    setShowQuizTaker(false);
    onAttemptComplete?.();
    toast({
      title: 'Quiz submitted!',
      description: 'Your answers have been recorded.',
    });
  };

  const handleTimeUp = () => {
    toast({
      title: "Time's up!",
      description: 'Your quiz has been auto-submitted.',
      variant: 'destructive',
    });
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                to={`/admin/assessments/quizzes/${quiz.id}`}
                className="block"
              >
                <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
                  {quiz.title}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground truncate">
                {quiz.courseName}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link to={`/admin/assessments/quizzes/${quiz.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(quiz.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(quiz.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {quiz.description}
        </p>

        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {questions.length}
            </p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {quiz.timeLimit || '∞'}
            </p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </div>
          <div className="text-center">
            <p className="mt-1 text-lg font-semibold text-foreground">
              {totalPoints}
            </p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
        </div>

        {/* Meta Info */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{format(dueDate, 'MMM d, yyyy')}</span>
          </div>
          <StatusBadge variant={getStatusVariant()}>
            {isOverdue
              ? 'Closed'
              : daysUntilDue === 0
              ? 'Due Today'
              : `${daysUntilDue} days left`}
          </StatusBadge>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
              {quiz.maxAttempts} attempt{quiz.maxAttempts !== 1 ? 's' : ''}
            </span>
            {quiz.shuffleQuestions && (
              <span className="inline-flex items-center rounded-md bg-info/10 px-2 py-1 text-xs font-medium text-info">
                Shuffled
              </span>
            )}
            {quiz.totalAttempts > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                <Users className="h-3 w-3" />
                {quiz.totalAttempts} taken
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {quiz.averageScore !== null
                ? `${Math.round(quiz.averageScore)}%`
                : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">Avg. Score</p>
          </div>
        </div>

        {/* Attempt Quiz Button */}
        {canAttempt && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              onClick={() => setShowQuizTaker(true)}
              className="w-full"
              variant="default"
            >
              <Play className="mr-2 h-4 w-4" />
              Attempt Quiz
            </Button>
          </div>
        )}
      </div>

      {/* Quiz Taker Dialog */}
      <Dialog open={showQuizTaker} onOpenChange={setShowQuizTaker}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">{quiz.title}</DialogTitle>
          </DialogHeader>
          <QuizTaker
            quiz={quiz}
            onSubmit={handleSubmitQuiz}
            onTimeUp={handleTimeUp}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
