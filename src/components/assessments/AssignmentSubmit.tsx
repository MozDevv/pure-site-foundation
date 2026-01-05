import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  format,
  isPast,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Users,
  Upload,
  Github,
  Globe,
  CheckCircle,
  AlertCircle,
  Info,
  File,
  X,
  Link2,
  Timer,
  Award,
  BookOpen,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { Assignment, SubmittedFile } from '@/types/lms';
import { cn } from '@/lib/utils';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOverdue: boolean;
}

function useCountdown(targetDate: Date): TimeRemaining {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(targetDate)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeRemaining;
}

function calculateTimeRemaining(targetDate: Date): TimeRemaining {
  const now = new Date();
  const isOverdue = isPast(targetDate);

  if (isOverdue) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: true };
  }

  return {
    days: differenceInDays(targetDate, now),
    hours: differenceInHours(targetDate, now) % 24,
    minutes: differenceInMinutes(targetDate, now) % 60,
    seconds: differenceInSeconds(targetDate, now) % 60,
    isOverdue: false,
  };
}

export default function AssignmentSubmit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // File input with metadata
  interface FileWithMeta {
    file: File;
    name: string;
    description: string;
    previewUrl?: string;
  }

  // Submission form state
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState<FileWithMeta | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) return;
      try {
        const data = await apiService.getAssignment(id);
        if (data) setAssignment(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load assignment details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id, toast]);

  const dueDate = assignment ? new Date(assignment.dueDate) : new Date();
  const timeRemaining = useCountdown(dueDate);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/x-zip-compressed',
    ];

    const validFiles = selectedFiles.filter(
      (file) =>
        validTypes.includes(file.type) ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.zip')
    );

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: 'Invalid file type',
        description: 'Only PDF, DOCX, and ZIP files are allowed',
        variant: 'destructive',
      });
    }

    const filesWithMeta: FileWithMeta[] = validFiles.map((file) => ({
      file,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for display name
      description: '',
      previewUrl:
        file.type === 'application/pdf' ? URL.createObjectURL(file) : undefined,
    }));

    setFiles((prev) => [...prev, ...filesWithMeta]);
  };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFileName = (index: number, name: string) => {
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, name } : f)));
  };

  const updateFileDescription = (index: number, description: string) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, description } : f))
    );
  };

  const handlePreview = (fileWithMeta: FileWithMeta) => {
    if (fileWithMeta.previewUrl) {
      window.open(fileWithMeta.previewUrl, '_blank');
    } else {
      // For non-PDF files, create a download link
      const url = URL.createObjectURL(fileWithMeta.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileWithMeta.file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async () => {
    if (!assignment) return;

    // Validation
    const hasFiles = files.length > 0;
    const hasRepo = repoUrl.trim() !== '';
    const hasDemo = demoUrl.trim() !== '';

    if (!hasFiles && !hasRepo && !hasDemo) {
      toast({
        title: 'No submission content',
        description:
          'Please add at least one file, repository URL, or demo URL',
        variant: 'destructive',
      });
      return;
    }

    // Validate required submission types
    if (assignment.submissionTypes.includes('repo') && !hasRepo && !hasFiles) {
      toast({
        title: 'Repository URL required',
        description: 'This assignment requires a repository URL',
        variant: 'destructive',
      });
      return;
    }

    // Validate that all files have names
    const filesWithoutNames = files.filter((f) => !f.name.trim());
    if (filesWithoutNames.length > 0) {
      toast({
        title: 'Missing file names',
        description: 'Please provide a name for all uploaded files',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      // Progress simulation for UI feedback
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 300);

      // Call the real API
      await apiService.uploadSubmissionFiles(
        assignment.id,
        files.map((f) => ({
          file: f.file,
          name: f.name,
          description: f.description,
        })),
        hasRepo ? repoUrl : undefined,
        hasDemo ? demoUrl : undefined,
        (progress) => setUploadProgress(progress)
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: 'Submission successful!',
        description: 'Your assignment has been submitted successfully',
      });

      // Cleanup preview URLs
      files.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });

      // Navigate back after short delay
      setTimeout(() => {
        navigate('/admin/assessments/assignments');
      }, 1500);
    } catch (error) {
      toast({
        title: 'Submission failed',
        description:
          'There was an error submitting your assignment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Assignment not found</p>
        <Button asChild variant="outline">
          <Link to="/admin/assessments/assignments">Back to Assignments</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/assessments/assignments">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {assignment.title}
          </h1>
          <p className="text-muted-foreground">{assignment.courseName}</p>
        </div>
        <StatusBadge variant={timeRemaining.isOverdue ? 'late' : 'active'}>
          {timeRemaining.isOverdue ? 'Overdue' : 'Open'}
        </StatusBadge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Assignment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="font-medium text-foreground mb-2">
                  Description
                </h4>
                <p className="text-muted-foreground">
                  {assignment.description}
                </p>
              </div>

              <Separator />

              {/* Instructions */}
              <div>
                <h4 className="font-medium text-foreground mb-2">
                  Instructions
                </h4>
                <div
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: assignment.instructions }}
                />
              </div>

              <Separator />

              {/* Meta Info Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 p-3 rounded-lg ">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg ">
                    {assignment.type === 'group' ? (
                      <Users className="h-5 w-5 text-primary" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Assignment Type
                    </p>
                    <p className="font-medium text-foreground capitalize">
                      {assignment.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg ">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                    <Award className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Max Score</p>
                    <p className="font-medium text-foreground">
                      {assignment.maxScore} points
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg ">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <Calendar className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="font-medium text-foreground">
                      {format(dueDate, 'MMM d, yyyy')} at{' '}
                      {format(dueDate, 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg ">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <RefreshCw className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Resubmissions
                    </p>
                    <p className="font-medium text-foreground">
                      {assignment.allowResubmission
                        ? `${
                            assignment.maxResubmissions || 'Unlimited'
                          } allowed`
                        : 'Not allowed'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Late Submission Info */}
              {assignment.lateSubmissionAllowed && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <Info className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Late Submissions Allowed
                    </p>
                    <p className="text-sm text-muted-foreground">
                      A {assignment.latePenalty}% penalty will be applied to
                      late submissions.
                    </p>
                  </div>
                </div>
              )}

              {/* Rubric */}
              {assignment.gradingMethod === 'rubric' && assignment.rubric && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-foreground mb-4">
                      Grading Rubric
                    </h4>
                    <div className="space-y-3">
                      {assignment.rubric.map((criteria) => (
                        <div
                          key={criteria.id}
                          className="p-4 rounded-lg border border-border bg-card"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-foreground">
                              {criteria.name}
                            </h5>
                            <span className="text-sm font-semibold text-primary">
                              {criteria.maxPoints} pts ({criteria.weight}%)
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {criteria.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Submission Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Submit Your Work
              </CardTitle>
              <CardDescription>
                Accepted submission types:{' '}
                {assignment.submissionTypes
                  .map((t) =>
                    t === 'file'
                      ? 'File Upload'
                      : t === 'repo'
                      ? 'Repository Link'
                      : 'Demo URL'
                  )
                  .join(', ')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="file"
                    disabled={!assignment.submissionTypes.includes('file')}
                    className="flex items-center gap-2"
                  >
                    <File className="h-4 w-4" />
                    Files
                  </TabsTrigger>
                  <TabsTrigger
                    value="repo"
                    disabled={!assignment.submissionTypes.includes('repo')}
                    className="flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    Repository
                  </TabsTrigger>
                  <TabsTrigger
                    value="url"
                    disabled={!assignment.submissionTypes.includes('url')}
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    Demo URL
                  </TabsTrigger>
                </TabsList>

                {/* File Upload */}
                <TabsContent value="file" className="space-y-4">
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                      'hover:border-primary/50 hover:bg-primary/5',
                      'border-border'
                    )}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      multiple
                      accept=".pdf,.docx,.zip"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="font-medium text-foreground text-sm">
                        Drop files here or click to upload
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, DOCX, ZIP files (max 50MB each)
                      </p>
                    </label>
                  </div>

                  {files.length > 0 && (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 w-12">
                              #
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                              File
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                              Name
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                              Description
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 w-12">
                              Size
                            </th>
                            <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 w-24">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {files.map((fileWithMeta, index) => (
                            <tr
                              key={index}
                              className="hover:bg-muted/30 transition-colors"
                            >
                              <td className="px-4 py-3 text-sm text-muted-foreground">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 flex-shrink-0">
                                    <File className="h-4 w-4 text-primary" />
                                  </div>
                                  <span
                                    className="text-sm text-foreground truncate max-w-[120px]"
                                    title={fileWithMeta.file.name}
                                  >
                                    {fileWithMeta.file.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  value={fileWithMeta.name}
                                  onChange={(e) =>
                                    updateFileName(index, e.target.value)
                                  }
                                  placeholder="Enter file name"
                                  className="h-8 text-sm"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  value={fileWithMeta.description}
                                  onChange={(e) =>
                                    updateFileDescription(index, e.target.value)
                                  }
                                  placeholder="Enter description (optional)"
                                  className="h-8 text-sm"
                                />
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                {formatFileSize(fileWithMeta.file.size)}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handlePreview(fileWithMeta)}
                                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                                    title="Preview file"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeFile(index)}
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    title="Remove file"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>

                {/* Repository Link */}
                <TabsContent value="repo" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="repo-url">
                      GitHub / GitLab Repository URL
                    </Label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="repo-url"
                        placeholder="https://github.com/username/repository"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Make sure your repository is public or you have shared
                      access with the instructor.
                    </p>
                  </div>
                </TabsContent>

                {/* Demo URL */}
                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="demo-url">Live Demo URL</Label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="demo-url"
                        placeholder="https://your-demo.vercel.app"
                        value={demoUrl}
                        onChange={(e) => setDemoUrl(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Provide a URL where your project is deployed and
                      accessible.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Upload Progress */}
              {submitting && (
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uploading...</span>
                    <span className="font-medium text-foreground">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" asChild disabled={submitting}>
                  <Link to="/admin/assessments/assignments">Cancel</Link>
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="min-w-[140px]"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Assignment
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Countdown Timer */}
          <Card
            className={cn(
              'overflow-hidden',
              timeRemaining.isOverdue && 'border-destructive/50'
            )}
          >
            <CardHeader
              className={cn(
                'pb-3',
                timeRemaining.isOverdue ? 'bg-destructive/10' : 'bg-primary/5'
              )}
            >
              <CardTitle className="flex items-center gap-2 text-lg">
                <Timer
                  className={cn(
                    'h-5 w-5',
                    timeRemaining.isOverdue
                      ? 'text-destructive'
                      : 'text-primary'
                  )}
                />
                {timeRemaining.isOverdue ? 'Deadline Passed' : 'Time Remaining'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {timeRemaining.isOverdue ? (
                <div className="text-center py-4">
                  <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-3" />
                  <p className="text-destructive font-medium">
                    This assignment is overdue
                  </p>
                  {assignment.lateSubmissionAllowed && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Late submissions accepted with {assignment.latePenalty}%
                      penalty
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="text-2xl font-bold text-foreground">
                      {timeRemaining.days}
                    </div>
                    <div className="text-xs text-muted-foreground">Days</div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="text-2xl font-bold text-foreground">
                      {timeRemaining.hours}
                    </div>
                    <div className="text-xs text-muted-foreground">Hours</div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="text-2xl font-bold text-foreground">
                      {timeRemaining.minutes}
                    </div>
                    <div className="text-xs text-muted-foreground">Mins</div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="text-2xl font-bold text-primary animate-pulse">
                      {timeRemaining.seconds}
                    </div>
                    <div className="text-xs text-muted-foreground">Secs</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submission Checklist */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Submission Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignment.submissionTypes.includes('file') && (
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full',
                      files.length > 0
                        ? 'bg-success/20 text-success'
                        : 'bg-secondary text-muted-foreground'
                    )}
                  >
                    {files.length > 0 ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <File className="h-3 w-3" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm',
                      files.length > 0
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    Upload files ({files.length} added)
                  </span>
                </div>
              )}

              {assignment.submissionTypes.includes('repo') && (
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full',
                      repoUrl
                        ? 'bg-success/20 text-success'
                        : 'bg-secondary text-muted-foreground'
                    )}
                  >
                    {repoUrl ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Github className="h-3 w-3" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm',
                      repoUrl ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    Add repository URL
                  </span>
                </div>
              )}

              {assignment.submissionTypes.includes('url') && (
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full',
                      demoUrl
                        ? 'bg-success/20 text-success'
                        : 'bg-secondary text-muted-foreground'
                    )}
                  >
                    {demoUrl ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Globe className="h-3 w-3" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm',
                      demoUrl ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    Add demo URL (optional)
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Instructor</span>
                <span className="font-medium text-foreground">
                  {assignment.createdBy}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Grading Method</span>
                <span className="font-medium text-foreground capitalize">
                  {assignment.gradingMethod}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Points</span>
                <span className="font-medium text-foreground">
                  {assignment.maxScore}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Submissions</span>
                <span className="font-medium text-foreground">
                  {assignment.totalSubmissions}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
