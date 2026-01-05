import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  FileText,
  GitBranch,
  ExternalLink,
  Clock,
  Send,
  Sparkles,
  MessageSquare,
  Eye,
  Download,
  X,
  Maximize2,
  Minimize2,
  File,
} from 'lucide-react';
import { format } from 'date-fns';
import { apiService } from '@/services/apiService';
import { apiService as api, endpoints } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { SubmittedFile } from '@/types/lms';
import { cn } from '@/lib/utils';
import FilePreviewDialog from '../FilePreviewDialog';

export default function SubmissionReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [rubricGrades, setRubricGrades] = useState<
    { criteriaId: string; score: number; feedback: string }[]
  >([]);

  // File preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<SubmittedFile | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);

  const { data: submission, isLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => apiService.getSubmission(id!),
    enabled: !!id,
  });

  const { data: assignment } = useQuery({
    queryKey: ['assignment', submission?.assignmentId],
    queryFn: () => apiService.getAssignment(submission!.assignmentId),
    enabled: !!submission?.assignmentId,
  });

  const gradeMutation = useMutation({
    mutationFn: () =>
      apiService.gradeSubmission(id!, { grade, feedback, rubricGrades }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission', id] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast({
        title: 'Submission graded',
        description: 'The grade and feedback have been saved.',
      });
      navigate('/admin/assessments/submissions');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save grade. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleGenerateFeedback = () => {
    // AI feedback placeholder
    setFeedback(
      'Great work on this submission! Your implementation shows a solid understanding of the core concepts. Consider improving code documentation and adding more test cases for edge cases.'
    );
    toast({
      title: 'AI Feedback Generated',
      description:
        'Feedback suggestion has been added. Feel free to modify it.',
    });
  };

  // File preview handler
  const handlePreviewFile = async (file: SubmittedFile) => {
    setPreviewFile(file);
    setPreviewLoading(true);
    setPreviewOpen(true);

    try {
      // Try to get preview from API
      const res = await api.get(endpoints.getDocumentPreview(file.id));
      if (res.status === 200) {
        setPreviewContent(res.data);
      }
    } catch (error) {
      console.error('Preview error:', error);
      // If API fails, try using the direct file path for PDFs
      if (file.contentType?.includes('pdf') && file.filePath) {
        setPreviewContent(file.filePath);
      } else {
        setPreviewContent('');
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadFile = (file: SubmittedFile) => {
    const link = document.createElement('a');
    link.href = file.filePath || file.url || '';
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Submission not found</p>
        <Button variant="link" asChild className="mt-2">
          <Link to="/admin/assessments/submissions">Back to submissions</Link>
        </Button>
      </div>
    );
  }

  const isRubric = assignment?.gradingMethod === 'rubric';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/assessments/submissions">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Review Submission
          </h1>
          <p className="text-muted-foreground">{submission.assignmentTitle}</p>
        </div>
        <StatusBadge variant={submission.status} size="lg">
          {submission.status.charAt(0).toUpperCase() +
            submission.status.slice(1)}
        </StatusBadge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src={submission.studentAvatar}
                    alt={submission.studentName}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(submission.studentName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {submission.studentName}
                  </h3>
                  <p className="text-muted-foreground">
                    {submission.studentEmail}
                  </p>
                </div>
                {submission.submittedAt && (
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">
                        {format(
                          new Date(submission.submittedAt),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </span>
                    </div>
                    {submission.version > 1 && (
                      <span className="text-xs text-muted-foreground">
                        Version {submission.version}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment Details - Compact */}
          {submission.assignment && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Assignment Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-xs">Course</p>
                    <p className="font-medium truncate">
                      {submission.assignment.courseName}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-xs">Type</p>
                    <p className="font-medium capitalize">
                      {submission.assignment.type}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-xs">Max Score</p>
                    <p className="font-medium">
                      {submission.assignment.maxScore} pts
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-xs">Due Date</p>
                    <p className="font-medium">
                      {submission.assignment.dueDate
                        ? format(
                            new Date(submission.assignment.dueDate),
                            'MMM d, yyyy'
                          )
                        : 'No due date'}
                    </p>
                  </div>
                </div>
                {submission.assignment.description && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Description
                    </p>
                    <p className="text-sm text-foreground line-clamp-2">
                      {submission.assignment.description}
                    </p>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {submission.assignment.lateSubmissionAllowed && (
                    <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20">
                      Late: -{submission.assignment.latePenalty}%
                    </span>
                  )}
                  {submission.assignment.allowResubmission && (
                    <span className="px-2 py-0.5 rounded-full bg-info/10 text-info border border-info/20">
                      Resubmit: {submission.assignment.maxResubmissions}x
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border capitalize">
                    {submission.assignment.gradingMethod}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submitted Materials */}
          <Card>
            <CardHeader>
              <CardTitle>Submitted Materials</CardTitle>
              <CardDescription>
                Files and links submitted by the student
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Files */}
              {submission.files && submission.files.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Files ({submission.files.length})
                  </Label>
                  <div className="grid gap-2">
                    {submission.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          {file.contentType?.includes('pdf') ? (
                            <FileText className="h-5 w-5 text-red-500" />
                          ) : file.contentType?.includes('image') ? (
                            <File className="h-5 w-5 text-green-500" />
                          ) : (
                            <File className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)} •{' '}
                            {file.contentType?.split('/')[1]?.toUpperCase() ||
                              'FILE'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPreviewFile(file);
                              setOpen(true);
                            }}
                            title="Preview file"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownloadFile(file)}
                            title="Download file"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <FilePreviewDialog
                open={open}
                onClose={() => setOpen(false)}
                file={previewFile}
              />

              {/* Repository Link */}
              {submission.repoUrl && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Repository
                  </Label>
                  <a
                    href={submission.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
                  >
                    <GitBranch className="h-5 w-5 text-success" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {submission.repoUrl}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        GitHub Repository
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                </div>
              )}

              {/* Demo URL */}
              {submission.demoUrl && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Live Demo
                  </Label>
                  <a
                    href={submission.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5 text-info" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {submission.demoUrl}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Live Demo URL
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                </div>
              )}

              {/* Plagiarism Warning */}
              {submission.plagiarismScore &&
                submission.plagiarismScore > 20 && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <p className="text-sm font-medium text-destructive">
                      Plagiarism Alert: {submission.plagiarismScore}% similarity
                      detected
                    </p>
                    <p className="text-xs text-destructive/80 mt-1">
                      Review this submission carefully before grading.
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Grading Panel */}
        {submission.status !== 'graded' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grade Submission</CardTitle>
                <CardDescription>
                  {isRubric
                    ? 'Score each rubric criteria'
                    : `Score out of ${assignment?.maxScore || 100}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isRubric && assignment?.rubric ? (
                  <div className="space-y-4">
                    {assignment.rubric.map((criteria) => (
                      <div
                        key={criteria.id}
                        className="space-y-3 pb-4 border-b border-border last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <Label className="font-medium">{criteria.name}</Label>
                          <span className="text-sm text-muted-foreground">
                            {rubricGrades.find(
                              (g) => g.criteriaId === criteria.id
                            )?.score || 0}{' '}
                            / {criteria.maxPoints}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {criteria.description}
                        </p>
                        <Slider
                          value={[
                            rubricGrades.find(
                              (g) => g.criteriaId === criteria.id
                            )?.score || 0,
                          ]}
                          max={criteria.maxPoints}
                          step={1}
                          onValueChange={([value]) => {
                            const existing = rubricGrades.find(
                              (g) => g.criteriaId === criteria.id
                            );
                            if (existing) {
                              setRubricGrades(
                                rubricGrades.map((g) =>
                                  g.criteriaId === criteria.id
                                    ? { ...g, score: value }
                                    : g
                                )
                              );
                            } else {
                              setRubricGrades([
                                ...rubricGrades,
                                {
                                  criteriaId: criteria.id,
                                  score: value,
                                  feedback: '',
                                },
                              ]);
                            }
                            // Update total grade
                            const totalScore = rubricGrades.reduce(
                              (sum, g) => {
                                if (g.criteriaId === criteria.id)
                                  return sum + value;
                                return sum + g.score;
                              },
                              rubricGrades.find(
                                (g) => g.criteriaId === criteria.id
                              )
                                ? 0
                                : value
                            );
                            setGrade(totalScore);
                          }}
                          className="w-full"
                        />
                        <Textarea
                          placeholder="Feedback for this criteria..."
                          value={
                            rubricGrades.find(
                              (g) => g.criteriaId === criteria.id
                            )?.feedback || ''
                          }
                          onChange={(e) => {
                            const existing = rubricGrades.find(
                              (g) => g.criteriaId === criteria.id
                            );
                            if (existing) {
                              setRubricGrades(
                                rubricGrades.map((g) =>
                                  g.criteriaId === criteria.id
                                    ? { ...g, feedback: e.target.value }
                                    : g
                                )
                              );
                            } else {
                              setRubricGrades([
                                ...rubricGrades,
                                {
                                  criteriaId: criteria.id,
                                  score: 0,
                                  feedback: e.target.value,
                                },
                              ]);
                            }
                          }}
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="font-semibold text-foreground">
                        Total Score
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {grade}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="grade">Score</Label>
                        <span className="text-sm text-muted-foreground">
                          {grade} / {assignment?.maxScore || 100}
                        </span>
                      </div>
                      <Slider
                        value={[grade]}
                        max={assignment?.maxScore || 100}
                        step={1}
                        onValueChange={([value]) => setGrade(value)}
                      />
                      <Input
                        id="grade"
                        type="number"
                        value={grade}
                        onChange={(e) =>
                          setGrade(
                            Math.min(
                              parseInt(e.target.value) || 0,
                              assignment?.maxScore || 100
                            )
                          )
                        }
                        className="w-24"
                      />
                    </div>
                  </div>
                )}

                {/* Feedback */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="feedback">Feedback</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateFeedback}
                      className="text-primary"
                    >
                      <Sparkles className="mr-1.5 h-3 w-3" />
                      AI Suggest
                    </Button>
                  </div>
                  <Textarea
                    id="feedback"
                    placeholder="Provide feedback for the student..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  className="w-full"
                  onClick={() => gradeMutation.mutate()}
                  disabled={gradeMutation.isPending}
                >
                  {gradeMutation.isPending ? (
                    'Saving...'
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Grade
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Previous Feedback */}
          </div>
        )}
        {submission.status === 'graded' && submission.feedback && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base"> Grade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Score</span>
                <span className="text-xl font-bold text-foreground">
                  {submission.grade}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Feedback</span>
                <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">
                  {submission.feedback}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Graded by {submission.gradedBy} on{' '}
                {submission.gradedAt &&
                  format(new Date(submission.gradedAt), 'MMM d, yyyy')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* File Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className={cn(
            'p-0 overflow-hidden',
            expanded ? 'max-w-[95vw] max-h-[95vh]' : 'max-w-4xl max-h-[80vh]'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Dialog Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <DialogHeader className="flex-1">
                <DialogTitle className="truncate pr-4">
                  {previewFile?.name}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {previewFile && formatFileSize(previewFile.size)} •{' '}
                  {previewFile?.contentType}
                </p>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpanded(!expanded)}
                  title={expanded ? 'Minimize' : 'Maximize'}
                >
                  {expanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => previewFile && handleDownloadFile(previewFile)}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewOpen(false)}
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Preview Content */}
            <div
              className={cn(
                'flex-1 bg-muted/30 flex items-center justify-center overflow-auto',
                expanded ? 'h-[calc(95vh-80px)]' : 'h-[60vh]'
              )}
            >
              {previewLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">
                    Loading preview...
                  </span>
                </div>
              ) : previewContent ? (
                previewFile?.contentType?.includes('pdf') ? (
                  <iframe
                    src={previewContent}
                    title="PDF Preview"
                    className="w-full h-full border-none"
                  />
                ) : previewFile?.contentType?.includes('image') ? (
                  <img
                    src={previewContent}
                    alt={previewFile?.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-8">
                    <File className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Preview not available for this file type
                    </p>
                    <Button
                      onClick={() =>
                        previewFile && handleDownloadFile(previewFile)
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download to View
                    </Button>
                  </div>
                )
              ) : (
                <div className="text-center p-8">
                  <File className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Unable to load preview
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    The file may be too large or in an unsupported format
                  </p>
                  <Button
                    onClick={() =>
                      previewFile && handleDownloadFile(previewFile)
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                </div>
              )}
            </div>

            {/* File Metadata Footer */}
            {previewFile && (
              <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center gap-6 text-xs text-muted-foreground">
                <span>
                  <strong>Uploaded:</strong>{' '}
                  {previewFile.uploadedDate &&
                    format(
                      new Date(previewFile.uploadedDate),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                </span>
                {previewFile.description && (
                  <span>
                    <strong>Description:</strong> {previewFile.description}
                  </span>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
