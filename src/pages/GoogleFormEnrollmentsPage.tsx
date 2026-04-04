import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints, API_BASE_URL } from '@/lib/api';
import {
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Copy,
  ExternalLink,
  Users,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PendingEnrollment {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  course: { id: string; title: string };
  status: string;
  formSource: string;
  googleFormResponseId: string;
  createdAt: string;
  enrolledAt: string | null;
  enrolledUser: { id: string; firstName: string; lastName: string } | null;
}

interface Stats {
  totalPending: number;
  totalEnrolled: number;
  totalExpired: number;
}

export default function GoogleFormEnrollmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [showSetupDialog, setShowSetupDialog] = useState(false);

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['google-form-stats'],
    queryFn: () => apiService.get(endpoints.googleFormStats),
  });
  const stats: Stats = statsData?.data ?? { totalPending: 0, totalEnrolled: 0, totalExpired: 0 };

  // Fetch pending enrollments
  const { data: enrollmentsData, isLoading } = useQuery({
    queryKey: ['google-form-pending'],
    queryFn: () => apiService.get(endpoints.googleFormPendingEnrollments),
  });
  const enrollments: PendingEnrollment[] = enrollmentsData?.data ?? [];

  // Fetch courses for filtering
  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: () => apiService.get(endpoints.getAllCourses),
  });
  const courses = coursesData?.data ?? [];

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: (enrollmentId: string) =>
      apiService.delete(endpoints.googleFormCancelEnrollment(enrollmentId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-form-pending'] });
      queryClient.invalidateQueries({ queryKey: ['google-form-stats'] });
      toast({ title: 'Enrollment cancelled' });
    },
    onError: () => {
      toast({ title: 'Failed to cancel', variant: 'destructive' });
    },
  });

  const filteredEnrollments = courseFilter === 'all'
    ? enrollments
    : enrollments.filter(e => e.course?.id === courseFilter);

  const webhookUrl = `${API_BASE_URL}/google-form/webhook`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'ENROLLED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Enrolled</Badge>;
      case 'EXPIRED':
        return <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6" />
            Google Form Enrollments
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage course enrollments from Google Form submissions
          </p>
        </div>
        <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Setup Guide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Google Form Integration Setup</DialogTitle>
              <DialogDescription>
                Follow these steps to connect your Google Form to auto-enroll students.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Step 1: Create a Google Form</h3>
                <p>Create a Google Form with these fields:</p>
                <ul className="list-disc ml-6 mt-1 space-y-1">
                  <li><strong>Email</strong> (required) — the student's email</li>
                  <li><strong>Full Name</strong> — student's full name</li>
                  <li><strong>Phone Number</strong> — contact number</li>
                  <li><strong>Course</strong> — dropdown or multiple choice with course names</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Step 2: Add Google Apps Script</h3>
                <p>Go to Extensions → Apps Script in your form and paste:</p>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto mt-2">{`// Map form course names to course IDs
const COURSE_MAP = {
${courses.map((c: { id: string; title: string }) => `  "${c.title}": "${c.id}"`).join(',\n')}
};

const WEBHOOK_URL = "${webhookUrl}";

function onFormSubmit(e) {
  var responses = e.response.getItemResponses();
  var data = {
    formResponseId: e.response.getId(),
    email: "",
    fullName: "",
    phoneNumber: "",
    courseId: ""
  };

  responses.forEach(function(r) {
    var title = r.getItem().getTitle().toLowerCase();
    var answer = r.getResponse();
    if (title.includes("email")) data.email = answer;
    else if (title.includes("name")) data.fullName = answer;
    else if (title.includes("phone")) data.phoneNumber = answer;
    else if (title.includes("course")) {
      data.courseId = COURSE_MAP[answer] || "";
    }
  });

  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(data),
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch(WEBHOOK_URL, options);
}`}</pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Step 3: Set Up Trigger</h3>
                <p>In Apps Script, go to Triggers → Add Trigger:</p>
                <ul className="list-disc ml-6 mt-1 space-y-1">
                  <li>Function: <code>onFormSubmit</code></li>
                  <li>Event source: From form</li>
                  <li>Event type: On form submit</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Webhook URL</h3>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-xs flex-1 break-all">{webhookUrl}</code>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(webhookUrl)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="flex items-center gap-2 text-blue-700">
                  <AlertCircle className="w-4 h-4" />
                  <strong>How it works:</strong>
                </p>
                <ul className="list-disc ml-6 mt-1 space-y-1 text-blue-600">
                  <li>If the email matches an existing active user, they're enrolled immediately</li>
                  <li>If not, a pending enrollment is created</li>
                  <li>When the person signs up with that email, they're auto-enrolled</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPending}</div>
            <p className="text-xs text-muted-foreground">Awaiting registration</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrolled}</div>
            <p className="text-xs text-muted-foreground">Successfully enrolled via form</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExpired}</div>
            <p className="text-xs text-muted-foreground">Expired or cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Pending Enrollments
              </CardTitle>
              <CardDescription>
                People who submitted the Google Form but haven't registered yet
              </CardDescription>
            </div>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-[200px]">
                <BookOpen className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {courses.map((c: { id: string; title: string }) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No pending enrollments</p>
              <p className="text-sm mt-1">
                Set up a Google Form to start receiving enrollment requests
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">{enrollment.email}</TableCell>
                    <TableCell>{enrollment.fullName || '—'}</TableCell>
                    <TableCell>{enrollment.phoneNumber || '—'}</TableCell>
                    <TableCell>{enrollment.course?.title || '—'}</TableCell>
                    <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {enrollment.createdAt
                        ? new Date(enrollment.createdAt).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {enrollment.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => cancelMutation.mutate(enrollment.id)}
                          disabled={cancelMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
