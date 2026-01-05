import { format } from 'date-fns';
import { FileText, GitBranch, ExternalLink, Clock, User } from 'lucide-react';
import { AssignmentSubmission } from '@/types/lms';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SubmissionCardProps {
  submission: AssignmentSubmission;
  showAssignment?: boolean;
  compact?: boolean;
}

export function SubmissionCard({
  submission,
  showAssignment = true,
  compact = false,
}: SubmissionCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-card-hover',
        compact ? 'p-4' : 'p-5 shadow-card'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className={cn(compact ? 'h-10 w-10' : 'h-12 w-12')}>
          <AvatarImage
            src={submission.studentAvatar}
            alt={submission.studentName}
          />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(submission.studentName)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-foreground">
                {submission.studentName}
              </h4>
              <p className="text-sm text-muted-foreground">
                {submission.studentEmail}
              </p>
            </div>
            <StatusBadge variant={submission.status}>
              {submission.status.charAt(0).toUpperCase() +
                submission.status.slice(1)}
            </StatusBadge>
          </div>

          {showAssignment && (
            <p className="mt-2 text-sm text-muted-foreground truncate">
              {submission.assignmentTitle}
            </p>
          )}

          {/* Submission Details */}
          {submission.submittedAt && (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>
                  Submitted{' '}
                  {format(new Date(submission.submittedAt), 'MMM d, h:mm a')}
                </span>
              </div>
              {submission.version > 1 && (
                <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                  v{submission.version}
                </span>
              )}
            </div>
          )}

          {/* Files & Links */}
          {!compact &&
            (submission.files?.length ||
              submission.repoUrl ||
              submission.demoUrl) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {submission.files?.map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <FileText className="h-3 w-3" />
                    {file.name}
                  </a>
                ))}
                {submission.repoUrl && (
                  <a
                    href={submission.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <GitBranch className="h-3 w-3" />
                    Repository
                  </a>
                )}
                {submission.demoUrl && (
                  <a
                    href={submission.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Live Demo
                  </a>
                )}
              </div>
            )}

          {/* Grade */}
          {submission.status === 'graded' && submission.grade !== undefined && (
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {submission.grade}
                </span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
              {submission.feedback && (
                <p className="text-sm text-muted-foreground flex-1">
                  "
                  {submission.feedback.length > 50
                    ? `${submission.feedback.slice(0, 50)}...`
                    : submission.feedback}
                  "
                </p>
              )}
            </div>
          )}

          {/* Plagiarism Warning */}
          {submission.plagiarismScore && submission.plagiarismScore > 20 && (
            <div className="mt-3 flex items-center gap-2 text-destructive text-sm">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              Similarity: {submission.plagiarismScore}%
            </div>
          )}
        </div>
      </div>

      {/* Action */}
      {submission.status !== 'pending' && (
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/assessments/submissions/${submission.id}`}>
              Review Submission
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
