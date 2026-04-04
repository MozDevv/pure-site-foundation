import { format, isPast, differenceInDays } from 'date-fns';
import {
  FileText,
  Users,
  Calendar,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { Assignment } from '@/types/lms';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface AssignmentCardProps {
  assignment: Assignment;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function AssignmentCard({
  assignment,
  onEdit,
  onDelete,
}: AssignmentCardProps) {
  const dueDate = new Date(assignment.dueDate);
  const isOverdue = isPast(dueDate);
  const daysUntilDue = differenceInDays(dueDate, new Date());
  const progress =
    assignment.totalSubmissions > 0
      ? Math.round(
          (assignment.gradedSubmissions / assignment.totalSubmissions) * 100
        )
      : 0;

  const getStatusVariant = () => {
    if (isOverdue) return 'late';
    if (daysUntilDue <= 3) return 'pending';
    return 'active';
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
              assignment.type === 'group'
                ? 'bg-info/10 text-info'
                : 'bg-primary/10 text-primary'
            )}
          >
            {assignment.type === 'group' ? (
              <Users className="h-5 w-5" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Link
              to={`/admin/assessments/assignments/${assignment.id}`}
              className="block"
            >
              <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
                {assignment.title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground truncate">
              {assignment.courseName}
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
              <Link to={`/admin/assessments/assignments/${assignment.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(assignment.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(assignment.id)}
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
        {assignment.description}
      </p>

      {/* Meta Info */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          <span>{format(dueDate, 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{format(dueDate, 'h:mm a')}</span>
        </div>
        <StatusBadge variant={getStatusVariant()}>
          {isOverdue
            ? 'Overdue'
            : daysUntilDue === 0
            ? 'Due Today'
            : `${daysUntilDue} days left`}
        </StatusBadge>
      </div>

      {/* Progress */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Graded</span>
          <span className="font-medium text-foreground">
            {assignment.gradedSubmissions}/{assignment.totalSubmissions}{' '}
            submissions
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer Tags */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
            {assignment.type === 'group' ? 'Team' : 'Individual'}
          </span>
          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
            {assignment.gradingMethod === 'rubric' ? 'Rubric' : 'Score'} based
          </span>
          {assignment.allowResubmission && (
            <span className="inline-flex items-center rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success">
              Resubmission allowed
            </span>
          )}
        </div>
        <Button asChild size="sm" variant="outline" className="h-8">
          <Link to={`/admin/assessments/assignments/${assignment.id}/submit`}>
            Add Submission
          </Link>
        </Button>
      </div>
    </div>
  );
}
