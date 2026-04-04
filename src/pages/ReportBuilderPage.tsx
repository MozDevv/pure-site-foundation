import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3, Users, BookOpen, TrendingUp, Download, Calendar,
  GraduationCap, Target
} from 'lucide-react';

interface ReportConfig {
  type: string;
  dateFrom: string;
  dateTo: string;
  courseId: string;
  format: string;
}

const REPORT_TYPES = [
  { value: 'student-performance', label: 'Student Performance', icon: GraduationCap, description: 'Grades, submissions, and progress across courses' },
  { value: 'course-analytics', label: 'Course Analytics', icon: BookOpen, description: 'Enrollment, completion rates, and engagement metrics' },
  { value: 'attendance-report', label: 'Attendance Report', icon: Calendar, description: 'Attendance tracking and check-in/check-out records' },
  { value: 'assessment-summary', label: 'Assessment Summary', icon: Target, description: 'Quiz and assignment results with grade distributions' },
  { value: 'user-activity', label: 'User Activity', icon: Users, description: 'Login frequency, active sessions, and platform usage' },
  { value: 'mentorship-report', label: 'Mentorship Report', icon: TrendingUp, description: 'Mentor-mentee sessions, feedback, and progress' },
];

export default function ReportBuilderPage() {
  const [config, setConfig] = useState<ReportConfig>({
    type: '', dateFrom: '', dateTo: '', courseId: '', format: 'json',
  });
  const [activeReport, setActiveReport] = useState<any>(null);

  // Role check (must be before any early return, but computed first)
  const _currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const _role = (_currentUser?.role || 'Student').toLowerCase();
  const _isStaff = ['tutor', 'mentor', 'admin', 'super_admin'].includes(_role);

  // Courses for filter
  const { data: coursesData } = useQuery({
    queryKey: ['coursesList'],
    queryFn: () => apiService.get(endpoints.getAllCourses).then(r => r.data),
    enabled: _isStaff,
  });
  const courses = coursesData || [];

  // Student performance
  const { data: performanceData, refetch: fetchPerformance, isFetching: loadingPerformance } = useQuery({
    queryKey: ['reportStudentPerformance', config],
    queryFn: () => apiService.get(endpoints.getStudentPerformance).then(r => r.data),
    enabled: false,
  });

  // Course analytics
  const { data: courseAnalytics, refetch: fetchCourseAnalytics, isFetching: loadingCourse } = useQuery({
    queryKey: ['reportCourseAnalytics', config],
    queryFn: () => apiService.get(endpoints.getCourseAnalytics).then(r => r.data),
    enabled: false,
  });

  // Attendance stats
  const { data: attendanceStats, refetch: fetchAttendance, isFetching: loadingAttendance } = useQuery({
    queryKey: ['reportAttendance', config],
    queryFn: () => apiService.get(endpoints.getMyAttendanceStats).then(r => r.data),
    enabled: false,
  });

  // Mentorship stats
  const { data: mentorshipStats, refetch: fetchMentorship, isFetching: loadingMentorship } = useQuery({
    queryKey: ['reportMentorship'],
    queryFn: () => apiService.get(endpoints.getMentorshipStats).then(r => r.data),
    enabled: false,
  });

  const generateReport = () => {
    switch (config.type) {
      case 'student-performance':
        fetchPerformance().then(r => setActiveReport({ type: config.type, data: r.data }));
        break;
      case 'course-analytics':
        fetchCourseAnalytics().then(r => setActiveReport({ type: config.type, data: r.data }));
        break;
      case 'attendance-report':
        fetchAttendance().then(r => setActiveReport({ type: config.type, data: r.data }));
        break;
      case 'mentorship-report':
        fetchMentorship().then(r => setActiveReport({ type: config.type, data: r.data }));
        break;
      default:
        setActiveReport({ type: config.type, data: { message: 'Report generated' } });
    }
  };

  const exportReport = () => {
    if (!activeReport?.data) return;
    const jsonStr = JSON.stringify(activeReport.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.type}-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isLoading = loadingPerformance || loadingCourse || loadingAttendance || loadingMentorship;

  // Access guard — non-staff see an access-denied message (placed after all hooks)
  if (!_isStaff) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <BarChart3 className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold">Access Denied</p>
        <p className="text-sm text-muted-foreground">You do not have permission to access reports.</p>
      </div>
    );
  }

  const renderReportData = () => {
    if (!activeReport?.data) return null;
    const data = activeReport.data;

    if (typeof data === 'object' && !Array.isArray(data)) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(data).map(([key, value]) => (
            <Card key={key}>
              <CardContent className="py-4 text-center">
                <p className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="text-2xl font-bold mt-1">
                  {typeof value === 'number' ? value.toLocaleString() : String(value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (Array.isArray(data)) {
      return (
        <div className="border rounded-md overflow-auto max-h-[400px]">
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0">
              <tr>
                {data.length > 0 && Object.keys(data[0]).map(key => (
                  <th key={key} className="px-3 py-2 text-left font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, i: number) => (
                <tr key={i} className="border-t">
                  {Object.values(row).map((val: any, j: number) => (
                    <td key={j} className="px-3 py-2">{String(val)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return <pre className="p-4 bg-muted rounded-md text-sm overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Report Builder</h1>
        <p className="text-muted-foreground">Generate and export customized reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Config Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Report Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Report Type</Label>
              <Select value={config.type} onValueChange={v => setConfig(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Select report type" /></SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map(rt => (
                    <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>From</Label>
                <Input type="date" value={config.dateFrom} onChange={e => setConfig(p => ({ ...p, dateFrom: e.target.value }))} />
              </div>
              <div>
                <Label>To</Label>
                <Input type="date" value={config.dateTo} onChange={e => setConfig(p => ({ ...p, dateTo: e.target.value }))} />
              </div>
            </div>

            <div>
              <Label>Course (optional)</Label>
              <Select value={config.courseId} onValueChange={v => setConfig(p => ({ ...p, courseId: v }))}>
                <SelectTrigger><SelectValue placeholder="All courses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {(Array.isArray(courses) ? courses : []).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.courseName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={generateReport}
              disabled={!config.type || isLoading}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              {isLoading ? 'Generating...' : 'Generate Report'}
            </Button>
          </CardContent>
        </Card>

        {/* Report Output */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {activeReport ? REPORT_TYPES.find(r => r.value === activeReport.type)?.label || 'Report' : 'Report Output'}
                </CardTitle>
                {activeReport && (
                  <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
                )}
              </div>
              {activeReport && (
                <Button variant="outline" size="sm" onClick={exportReport}>
                  <Download className="w-4 h-4 mr-1" /> Export JSON
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activeReport ? (
              renderReportData()
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a report type and click Generate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Type Cards */}
      {!activeReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_TYPES.map(rt => {
            const Icon = rt.icon;
            return (
              <Card
                key={rt.value}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setConfig(p => ({ ...p, type: rt.value }))}
              >
                <CardContent className="py-4 flex items-start gap-3">
                  <Icon className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">{rt.label}</h3>
                    <p className="text-sm text-muted-foreground">{rt.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
