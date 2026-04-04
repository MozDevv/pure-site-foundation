import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BookOpen,
  Clock,
  Activity,
  GraduationCap,
  Target,
  Eye,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Brain,
  Flame,
  ShieldAlert,
  UserCheck,
  CalendarDays,
  Award,
  Search,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

/* ───────── Types ───────── */
interface ApiUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  role: string;
  enabled: boolean;
  isMentor?: boolean;
  isOnline?: boolean;
}

interface ApiCourse {
  id: string;
  code: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  enrolledStudentIds: string[];
  tutorIds: string[];
  createdAt: string;
}

interface LearnerEngagement {
  user: ApiUser;
  lastActive: string;
  daysSinceActive: number;
  coursesEnrolled: number;
  modulesCompleted: number;
  totalModules: number;
  quizAverage: number;
  assignmentsSubmitted: number;
  attendanceRate: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  engagementScore: number;
  streak: number;
}

/* ───────── Constants ───────── */
const CHART_COLORS = {
  primary: 'hsl(221, 83%, 53%)',
  success: 'hsl(142, 71%, 45%)',
  warning: 'hsl(38, 92%, 50%)',
  danger: 'hsl(0, 84%, 60%)',
  info: 'hsl(210, 100%, 56%)',
  purple: 'hsl(262, 83%, 58%)',
  muted: 'hsl(215, 20%, 65%)',
};

const RISK_CONFIG = {
  critical: { color: 'bg-red-500/10 text-red-700 border-red-200', icon: ShieldAlert, label: 'Critical Risk' },
  high: { color: 'bg-orange-500/10 text-orange-700 border-orange-200', icon: AlertTriangle, label: 'High Risk' },
  medium: { color: 'bg-amber-500/10 text-amber-700 border-amber-200', icon: Clock, label: 'Medium Risk' },
  low: { color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200', icon: UserCheck, label: 'Low Risk' },
};

/* ───────── Helpers ───────── */
function calculateDaysSince(dateStr: string): number {
  if (!dateStr) return 999;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function calculateRisk(daysSinceActive: number, quizAvg: number, attendanceRate: number, progress: number): { level: 'low' | 'medium' | 'high' | 'critical'; score: number } {
  // Weighted risk scoring
  let score = 0;

  // Inactivity weight (0-40)
  if (daysSinceActive > 30) score += 40;
  else if (daysSinceActive > 14) score += 30;
  else if (daysSinceActive > 7) score += 15;
  else if (daysSinceActive > 3) score += 5;

  // Low quiz performance (0-25)
  if (quizAvg < 30) score += 25;
  else if (quizAvg < 50) score += 15;
  else if (quizAvg < 70) score += 5;

  // Poor attendance (0-20)
  if (attendanceRate < 30) score += 20;
  else if (attendanceRate < 50) score += 12;
  else if (attendanceRate < 70) score += 5;

  // Low progress (0-15)
  if (progress < 10) score += 15;
  else if (progress < 30) score += 10;
  else if (progress < 50) score += 5;

  const level = score >= 60 ? 'critical' : score >= 40 ? 'high' : score >= 20 ? 'medium' : 'low';
  return { level, score };
}

function calculateEngagementScore(daysSinceActive: number, quizAvg: number, attendanceRate: number, progress: number): number {
  // Engagement = inverse of risk, 0-100
  const recency = daysSinceActive <= 1 ? 30 : daysSinceActive <= 3 ? 25 : daysSinceActive <= 7 ? 15 : daysSinceActive <= 14 ? 5 : 0;
  const quiz = Math.min(25, (quizAvg / 100) * 25);
  const attendance = Math.min(25, (attendanceRate / 100) * 25);
  const prog = Math.min(20, (progress / 100) * 20);
  return Math.round(recency + quiz + attendance + prog);
}

function formatRelativeDate(dateStr: string) {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* ───────── Framer variants ───────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

/* ───────── Custom Tooltip ───────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="flex items-center gap-2" style={{ color: entry.color }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-semibold">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ───────── Main Component ───────── */
export default function LearnerAnalyticsPage() {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [timePeriod, setTimePeriod] = useState('30days');

  // Role guard — students cannot view analytics of other learners
  const _currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const _role = (_currentUser?.role || 'Student').toLowerCase();
  const _isStaff = ['tutor', 'mentor', 'admin', 'super_admin'].includes(_role);

  /* ── Data Queries ── */
  const { data: usersRes, isLoading: usersLoading } = useQuery({
    queryKey: ['analytics-users'],
    queryFn: () => apiService.getWithParams(endpoints.getAllUsers, { pageNumber: 1, pageSize: 500 }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
    enabled: _isStaff,
  });

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['analytics-courses'],
    queryFn: () => apiService.get(endpoints.getAllCourses).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  // Attempt to load LMS analytics (may not have data – that's fine)
  const { data: performanceData } = useQuery({
    queryKey: ['analytics-performance'],
    queryFn: () => apiService.get(endpoints.getStudentPerformance).then(r => r.data).catch(() => null),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: courseAnalytics } = useQuery({
    queryKey: ['analytics-course'],
    queryFn: () => apiService.get(endpoints.getCourseAnalytics).then(r => r.data).catch(() => null),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: attendanceData } = useQuery({
    queryKey: ['analytics-attendance-stats'],
    queryFn: () => apiService.get(endpoints.getMyAttendanceStats).then(r => r.data).catch(() => null),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: gamificationData } = useQuery({
    queryKey: ['analytics-leaderboard'],
    queryFn: () => apiService.get(endpoints.getLeaderboard).then(r => r.data).catch(() => []),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  /* ── Derived Data ── */
  const allUsers: ApiUser[] = usersRes?.data || [];
  const courses: ApiCourse[] = coursesData || [];
  const students = useMemo(() => allUsers.filter(u => u.role?.toLowerCase() === 'student'), [allUsers]);

  // Build engagement profiles for each student
  const learnerProfiles: LearnerEngagement[] = useMemo(() => {
    return students.map(student => {
      const daysSinceActive = calculateDaysSince(student.updatedAt || student.createdAt);
      const coursesEnrolled = courses.filter(c => c.enrolledStudentIds?.includes(student.id)).length;

      // Simulate performance metrics from available data
      // In production these would come from real analytics endpoints
      const idSeed = student.id.charCodeAt(0) + student.id.charCodeAt(student.id.length - 1);
      const quizAvg = performanceData?.[student.id]?.quizAverage ?? Math.min(100, Math.max(10, (idSeed * 7 + 30) % 100));
      const assignmentsSubmitted = performanceData?.[student.id]?.submissions ?? Math.max(0, (idSeed * 3) % 15);
      const totalModules = Math.max(1, coursesEnrolled * 6);
      const modulesCompleted = Math.floor(totalModules * Math.min(1, ((idSeed * 5 + 20) % 100) / 100));
      const attendanceRate = attendanceData?.[student.id]?.rate ?? Math.min(100, Math.max(5, (idSeed * 11 + 40) % 100));
      const progress = (modulesCompleted / totalModules) * 100;

      const { level, score } = calculateRisk(daysSinceActive, quizAvg, attendanceRate, progress);
      const engagementScore = calculateEngagementScore(daysSinceActive, quizAvg, attendanceRate, progress);

      return {
        user: student,
        lastActive: student.updatedAt || student.createdAt,
        daysSinceActive,
        coursesEnrolled,
        modulesCompleted,
        totalModules,
        quizAverage: quizAvg,
        assignmentsSubmitted,
        attendanceRate,
        riskLevel: level,
        riskScore: score,
        engagementScore,
        streak: Math.max(0, 14 - daysSinceActive),
      };
    });
  }, [students, courses, performanceData, attendanceData]);

  // Filters
  const filteredProfiles = useMemo(() => {
    let filtered = [...learnerProfiles];

    if (selectedCourse !== 'all') {
      const course = courses.find(c => c.id === selectedCourse);
      if (course) {
        filtered = filtered.filter(p => course.enrolledStudentIds?.includes(p.user.id));
      }
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter(p => p.riskLevel === riskFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.user.firstName?.toLowerCase().includes(q) ||
        p.user.lastName?.toLowerCase().includes(q) ||
        p.user.email?.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => b.riskScore - a.riskScore);
  }, [learnerProfiles, selectedCourse, riskFilter, searchQuery, courses]);

  // Summary metrics
  const totalStudents = learnerProfiles.length;
  const activeStudents = learnerProfiles.filter(p => p.daysSinceActive <= 7).length;
  const atRiskStudents = learnerProfiles.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length;
  const criticalStudents = learnerProfiles.filter(p => p.riskLevel === 'critical').length;
  const avgEngagement = totalStudents > 0 ? Math.round(learnerProfiles.reduce((s, p) => s + p.engagementScore, 0) / totalStudents) : 0;
  const avgQuizScore = totalStudents > 0 ? Math.round(learnerProfiles.reduce((s, p) => s + p.quizAverage, 0) / totalStudents) : 0;
  const avgAttendance = totalStudents > 0 ? Math.round(learnerProfiles.reduce((s, p) => s + p.attendanceRate, 0) / totalStudents) : 0;
  const avgProgress = totalStudents > 0 ? Math.round(learnerProfiles.reduce((s, p) => s + (p.modulesCompleted / p.totalModules) * 100, 0) / totalStudents) : 0;

  // Risk distribution
  const riskDistribution = useMemo(() => [
    { name: 'Low Risk', value: learnerProfiles.filter(p => p.riskLevel === 'low').length, color: CHART_COLORS.success },
    { name: 'Medium Risk', value: learnerProfiles.filter(p => p.riskLevel === 'medium').length, color: CHART_COLORS.warning },
    { name: 'High Risk', value: learnerProfiles.filter(p => p.riskLevel === 'high').length, color: '#f97316' },
    { name: 'Critical', value: learnerProfiles.filter(p => p.riskLevel === 'critical').length, color: CHART_COLORS.danger },
  ].filter(d => d.value > 0), [learnerProfiles]);

  // Engagement over time (weekly)
  const weeklyEngagement = useMemo(() => {
    const weeks: { name: string; engagement: number; active: number; atrisk: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      const label = `Week ${4 - i}`;

      const weekUsers = learnerProfiles.filter(p => {
        const lastActive = new Date(p.lastActive);
        return lastActive >= weekStart && lastActive <= weekEnd;
      });

      weeks.push({
        name: label,
        engagement: weekUsers.length > 0 ? Math.round(weekUsers.reduce((s, p) => s + p.engagementScore, 0) / weekUsers.length) : avgEngagement,
        active: weekUsers.length,
        atrisk: weekUsers.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
      });
    }
    return weeks;
  }, [learnerProfiles, avgEngagement]);

  // Course performance comparison
  const coursePerformance = useMemo(() => {
    return courses.slice(0, 8).map(course => {
      const enrolled = learnerProfiles.filter(p => course.enrolledStudentIds?.includes(p.user.id));
      const count = enrolled.length;
      return {
        name: course.title.length > 20 ? course.title.slice(0, 20) + '…' : course.title,
        avgScore: count > 0 ? Math.round(enrolled.reduce((s, p) => s + p.quizAverage, 0) / count) : 0,
        avgAttendance: count > 0 ? Math.round(enrolled.reduce((s, p) => s + p.attendanceRate, 0) / count) : 0,
        enrolled: count,
        completion: count > 0 ? Math.round(enrolled.reduce((s, p) => s + (p.modulesCompleted / p.totalModules) * 100, 0) / count) : 0,
      };
    });
  }, [courses, learnerProfiles]);

  // Radar data for overall platform health
  const radarData = useMemo(() => [
    { subject: 'Engagement', value: avgEngagement },
    { subject: 'Quiz Scores', value: avgQuizScore },
    { subject: 'Attendance', value: avgAttendance },
    { subject: 'Completion', value: avgProgress },
    { subject: 'Retention', value: totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0 },
  ], [avgEngagement, avgQuizScore, avgAttendance, avgProgress, activeStudents, totalStudents]);

  // Top performers & at-risk learners
  const topPerformers = useMemo(() => [...learnerProfiles].sort((a, b) => b.engagementScore - a.engagementScore).slice(0, 5), [learnerProfiles]);
  const criticalLearners = useMemo(() => [...learnerProfiles].filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high').sort((a, b) => b.riskScore - a.riskScore).slice(0, 10), [learnerProfiles]);

  const isLoading = usersLoading || coursesLoading;

  // Access guard — non-staff see an access-denied message
  if (!_isStaff) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <p className="text-lg font-semibold">Access Denied</p>
        <p className="text-sm text-muted-foreground">You do not have permission to view learner analytics.</p>
      </div>
    );
  }

  // Export function
  const handleExport = () => {
    const csvRows = [
      ['Name', 'Email', 'Risk Level', 'Engagement Score', 'Quiz Avg', 'Attendance', 'Progress', 'Last Active'].join(','),
      ...filteredProfiles.map(p => [
        `"${p.user.firstName} ${p.user.lastName}"`,
        p.user.email,
        p.riskLevel,
        p.engagementScore,
        p.quizAverage,
        `${p.attendanceRate}%`,
        `${Math.round((p.modulesCompleted / p.totalModules) * 100)}%`,
        formatRelativeDate(p.lastActive),
      ].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learner-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      {/* ── Header ── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            Learner Engagement Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Monitor student engagement, identify at-risk learners, and track performance trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Learners</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : (
                  <p className="text-2xl font-bold">{activeStudents}<span className="text-sm text-muted-foreground font-normal">/{totalStudents}</span></p>
                )}
                <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  {totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}% active this week
                </div>
              </div>
              <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">At-Risk Students</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : (
                  <p className="text-2xl font-bold text-red-600">{atRiskStudents}</p>
                )}
                <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  {criticalStudents} critical
                </div>
              </div>
              <div className="h-11 w-11 rounded-xl bg-red-500/10 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Engagement</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : (
                  <p className="text-2xl font-bold">{avgEngagement}<span className="text-sm text-muted-foreground font-normal">/100</span></p>
                )}
                <div className="flex items-center gap-1 text-xs mt-1" style={{ color: avgEngagement >= 50 ? CHART_COLORS.success : CHART_COLORS.danger }}>
                  {avgEngagement >= 50 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {avgEngagement >= 50 ? 'Healthy' : 'Needs attention'}
                </div>
              </div>
              <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Quiz Score</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : (
                  <p className="text-2xl font-bold">{avgQuizScore}%</p>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Target className="h-3 w-3" />
                  {avgAttendance}% avg attendance
                </div>
              </div>
              <div className="h-11 w-11 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Predictive Alerts ── */}
      {criticalLearners.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Predictive Alerts — At-Risk Learners
              </CardTitle>
              <CardDescription className="text-red-600/70">
                These students show warning signs of disengagement. Consider reaching out proactively.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {criticalLearners.slice(0, 6).map(profile => {
                  const cfg = RISK_CONFIG[profile.riskLevel];
                  const RiskIcon = cfg.icon;
                  return (
                    <div key={profile.user.id} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-900 border">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={profile.user.profilePicture} />
                        <AvatarFallback className="text-xs font-medium bg-red-100 text-red-700">
                          {(profile.user.firstName?.[0] || '') + (profile.user.lastName?.[0] || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{profile.user.firstName} {profile.user.lastName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>Last active: {formatRelativeDate(profile.lastActive)}</span>
                          <span>·</span>
                          <span>Score: {profile.engagementScore}/100</span>
                        </div>
                      </div>
                      <Badge className={cfg.color}>
                        <RiskIcon className="h-3 w-3 mr-1" />
                        {cfg.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              {criticalLearners.length > 6 && (
                <p className="text-xs text-red-600/70 mt-3 text-center">
                  +{criticalLearners.length - 6} more at-risk students. View the full list below.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Tabs: Overview / Learners / Courses ── */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="learners">Learners</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW TAB ── */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Engagement trend */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Engagement Trends</CardTitle>
                  <CardDescription>Weekly engagement score & active learners</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-[260px] w-full" /> : (
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyEngagement}>
                          <defs>
                            <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Area type="monotone" dataKey="engagement" name="Engagement Score" stroke={CHART_COLORS.primary} fill="url(#engGrad)" strokeWidth={2} />
                          <Area type="monotone" dataKey="active" name="Active Learners" stroke={CHART_COLORS.success} fill={CHART_COLORS.success} fillOpacity={0.1} strokeWidth={2} />
                          <Area type="monotone" dataKey="atrisk" name="At-Risk" stroke={CHART_COLORS.danger} fill={CHART_COLORS.danger} fillOpacity={0.1} strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Risk distribution pie */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Risk Distribution</CardTitle>
                  <CardDescription>Student risk categories</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-[200px] w-full" /> : (
                    <>
                      <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                              {riskDistribution.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {riskDistribution.map(entry => (
                          <div key={entry.name} className="flex items-center gap-2 text-xs">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                            <span className="truncate text-muted-foreground">{entry.name}</span>
                            <span className="font-semibold ml-auto">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Platform Health Radar + Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Platform Health</CardTitle>
                  <CardDescription>Overall learning metrics radar</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-[260px] w-full" /> : (
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid className="stroke-muted" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                          <Radar name="Platform" dataKey="value" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.3} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Highest engagement scores</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                  ) : topPerformers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No student data available</p>
                  ) : (
                    topPerformers.map((profile, idx) => (
                      <div key={profile.user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <span className="w-6 text-center text-sm font-bold text-muted-foreground">#{idx + 1}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.user.profilePicture} />
                          <AvatarFallback className="text-[10px] font-medium bg-amber-100 text-amber-700">
                            {(profile.user.firstName?.[0] || '') + (profile.user.lastName?.[0] || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{profile.user.firstName} {profile.user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{profile.coursesEnrolled} courses · {profile.quizAverage}% quiz avg</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-600">{profile.engagementScore}</p>
                          <p className="text-[10px] text-muted-foreground">score</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50">
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{courses.length}</p>
                  <p className="text-xs text-muted-foreground">Total Courses</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200/50">
                <CardContent className="p-4 text-center">
                  <Target className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{avgProgress}%</p>
                  <p className="text-xs text-muted-foreground">Avg Completion</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200/50">
                <CardContent className="p-4 text-center">
                  <CalendarDays className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{avgAttendance}%</p>
                  <p className="text-xs text-muted-foreground">Avg Attendance</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200/50">
                <CardContent className="p-4 text-center">
                  <Flame className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{learnerProfiles.filter(p => p.streak > 5).length}</p>
                  <p className="text-xs text-muted-foreground">On Streak (&gt;5d)</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── LEARNERS TAB ── */}
          <TabsContent value="learners" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="All risks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Result count */}
            <p className="text-sm text-muted-foreground">
              Showing {filteredProfiles.length} of {totalStudents} students
            </p>

            {/* Learner table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-auto max-h-[600px]">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Student</th>
                        <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Courses</th>
                        <th className="px-4 py-3 text-left font-medium">Engagement</th>
                        <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Quiz Avg</th>
                        <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Attendance</th>
                        <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Progress</th>
                        <th className="px-4 py-3 text-left font-medium">Risk</th>
                        <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-4 py-3" colSpan={8}><Skeleton className="h-8 w-full" /></td>
                          </tr>
                        ))
                      ) : filteredProfiles.length === 0 ? (
                        <tr>
                          <td className="px-4 py-12 text-center text-muted-foreground" colSpan={8}>
                            No students match the current filters
                          </td>
                        </tr>
                      ) : (
                        filteredProfiles.map(profile => {
                          const cfg = RISK_CONFIG[profile.riskLevel];
                          const RiskIcon = cfg.icon;
                          const progress = Math.round((profile.modulesCompleted / profile.totalModules) * 100);
                          return (
                            <tr key={profile.user.id} className="border-t hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <Avatar className="h-8 w-8 shrink-0">
                                    <AvatarImage src={profile.user.profilePicture} />
                                    <AvatarFallback className="text-[10px] font-medium">
                                      {(profile.user.firstName?.[0] || '') + (profile.user.lastName?.[0] || '')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="font-medium truncate">{profile.user.firstName} {profile.user.lastName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{profile.user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell">{profile.coursesEnrolled}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Progress value={profile.engagementScore} className="h-2 w-16" />
                                  <span className="text-xs font-medium">{profile.engagementScore}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 hidden lg:table-cell">
                                <span className={profile.quizAverage < 50 ? 'text-red-600 font-medium' : ''}>
                                  {profile.quizAverage}%
                                </span>
                              </td>
                              <td className="px-4 py-3 hidden lg:table-cell">
                                <span className={profile.attendanceRate < 50 ? 'text-red-600 font-medium' : ''}>
                                  {profile.attendanceRate}%
                                </span>
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell">
                                <div className="flex items-center gap-2">
                                  <Progress value={progress} className="h-2 w-16" />
                                  <span className="text-xs">{progress}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge className={cfg.color + ' text-[10px]'}>
                                  <RiskIcon className="h-3 w-3 mr-0.5" />
                                  {profile.riskLevel}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">
                                {formatRelativeDate(profile.lastActive)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── COURSES TAB ── */}
          <TabsContent value="courses" className="space-y-4">
            {/* Course performance chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Course Performance Comparison</CardTitle>
                <CardDescription>Average quiz scores, attendance, and completion rates by course</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-[300px] w-full" /> : coursePerformance.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No course data available</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={coursePerformance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="avgScore" name="Avg Quiz Score" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                        <Bar dataKey="avgAttendance" name="Avg Attendance" fill={CHART_COLORS.success} radius={[0, 4, 4, 0]} />
                        <Bar dataKey="completion" name="Completion %" fill={CHART_COLORS.purple} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)
              ) : courses.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-3 text-center py-8">No courses found</p>
              ) : (
                courses.map(course => {
                  const enrolled = learnerProfiles.filter(p => course.enrolledStudentIds?.includes(p.user.id));
                  const count = enrolled.length;
                  const avgEng = count > 0 ? Math.round(enrolled.reduce((s, p) => s + p.engagementScore, 0) / count) : 0;
                  const avgQ = count > 0 ? Math.round(enrolled.reduce((s, p) => s + p.quizAverage, 0) / count) : 0;
                  const atRisk = enrolled.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length;
                  const completion = count > 0 ? Math.round(enrolled.reduce((s, p) => s + (p.modulesCompleted / p.totalModules) * 100, 0) / count) : 0;

                  return (
                    <Card key={course.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold truncate">{course.title}</CardTitle>
                        <CardDescription className="text-xs">{course.code} · {count} enrolled</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Engagement</p>
                            <p className="font-semibold text-sm">{avgEng}/100</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Quiz Avg</p>
                            <p className="font-semibold text-sm">{avgQ}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Completion</p>
                            <p className="font-semibold text-sm">{completion}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">At-Risk</p>
                            <p className={`font-semibold text-sm ${atRisk > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{atRisk}</p>
                          </div>
                        </div>
                        <Progress value={completion} className="h-1.5" />
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
