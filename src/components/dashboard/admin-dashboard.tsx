import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  TrendingUp,
  Check,
  UserCheck,
  Activity,
  Globe,
  Clock,
  Server,
  ArrowUpRight,
  Loader2,
  GraduationCap,
  Megaphone,
  Lightbulb,
  MessageCircle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/* ───────── Types ───────── */
interface ApiUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  profilePicture: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  userProfile: any;
  role: string;
  enabled: boolean;
  isMentor?: boolean;
  isOnline?: boolean;
}

interface UsersResponse {
  data: ApiUser[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  succeeded: boolean;
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

/* ───────── Chart colours ───────── */
const COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(221, 60%, 65%)',
  'hsl(210, 100%, 56%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
];

/* ───────── Count-up animation hook ───────── */
function useCountUp(end: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const prevEnd = useRef(end);

  useEffect(() => {
    if (end === 0) { setCount(0); return; }
    prevEnd.current = end;
    let start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);

  return count;
}

/* ───────── Framer Motion variants ───────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -2, transition: { duration: 0.2 } },
};

/* ───────── Helpers ───────── */
function buildMonthlyRegistrations(users: ApiUser[]) {
  const now = new Date();
  const months: { name: string; students: number; tutors: number; mentors: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString(undefined, { month: 'short' });
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const inMonth = users.filter((u) => {
      const created = new Date(u.createdAt);
      return created >= monthStart && created <= monthEnd;
    });
    months.push({
      name: label,
      students: inMonth.filter((u) => u.role?.toLowerCase() === 'student').length,
      tutors: inMonth.filter((u) => u.role?.toLowerCase() === 'tutor').length,
      mentors: inMonth.filter((u) => u.isMentor).length,
    });
  }
  return months;
}

function buildDailyActivity(users: ApiUser[]) {
  const days: { name: string; registrations: number; active: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
    const label = d.toLocaleDateString(undefined, { weekday: 'short' });
    const regs = users.filter((u) => {
      const created = new Date(u.createdAt);
      return created >= dayStart && created <= dayEnd;
    }).length;
    days.push({ name: label, registrations: regs, active: Math.max(regs, 1) });
  }
  return days;
}

/* ───────── Component ───────── */
export function AdminDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState('6months');

  const currentUser = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : null;

  /* ── Queries ── */
  const { data: usersData, isLoading: usersLoading } = useQuery<UsersResponse>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await apiService.getWithParams(endpoints.getAllUsers, { pageNumber: 1, pageSize: 500 });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes — heavy query
  });

  const { data: coursesData, isLoading: coursesLoading } = useQuery<ApiCourse[]>({
    queryKey: ['admin-courses'],
    queryFn: () => apiService.get(endpoints.getAllCourses).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => apiService.post(endpoints.approveStudentApplication(userId)),
    onSuccess: () => {
      toast.success('Student approved successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || `Failed to approve: ${error.message}`),
  });

  /* ── Derived data ── */
  const allUsers = usersData?.data || [];
  const students = useMemo(() => allUsers.filter((u) => u.role?.toLowerCase() === 'student'), [allUsers]);
  const tutors = useMemo(() => allUsers.filter((u) => u.role?.toLowerCase() === 'tutor'), [allUsers]);
  const admins = useMemo(() => allUsers.filter((u) => u.role?.toLowerCase() === 'admin'), [allUsers]);
  const mentors = useMemo(() => allUsers.filter((u) => u.isMentor), [allUsers]);

  const totalStudents = students.length;
  const activeStudents = students.filter((u) => u.status?.toLowerCase() === 'active').length;
  const pendingStudents = students.filter((u) => isPending(u.status)).length;
  const totalCourses = coursesData?.length || 0;
  const engagementRate = totalStudents > 0 ? ((activeStudents / totalStudents) * 100).toFixed(1) : '0';
  const onlineUsers = allUsers.filter((u) => u.isOnline).length;

  const monthlyData = useMemo(() => buildMonthlyRegistrations(allUsers), [allUsers]);
  const dailyData = useMemo(() => buildDailyActivity(allUsers), [allUsers]);

  const roleDistribution = useMemo(
    () =>
      [
        { name: 'Students', value: students.length, color: COLORS[0] },
        { name: 'Tutors', value: tutors.length, color: COLORS[1] },
        { name: 'Admins', value: admins.length, color: COLORS[3] },
        { name: 'Mentors', value: mentors.length, color: COLORS[4] },
      ].filter((d) => d.value > 0),
    [students, tutors, admins, mentors]
  );

  const courseEnrollmentData = useMemo(
    () => (coursesData || []).map((c) => ({
      name: c.title.length > 18 ? c.title.slice(0, 18) + '…' : c.title,
      students: c.enrolledStudentIds?.length || 0,
      tutors: c.tutorIds?.length || 0,
    })),
    [coursesData]
  );

  const statusDistribution = useMemo(() => {
    const m: Record<string, number> = {};
    allUsers.forEach((u) => { const s = u.status?.toLowerCase() || 'unknown'; m[s] = (m[s] || 0) + 1; });
    return Object.entries(m).map(([name, value], i) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value,
      color: COLORS[i % COLORS.length],
    }));
  }, [allUsers]);

  const recentRegistrations = useMemo(
    () => [...allUsers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [allUsers]
  );

  const pendingUsers = useMemo(
    () => allUsers.filter((u) => isPending(u.status)),
    [allUsers]
  );

  /* ── Helpers ── */
  function isPending(status: string) {
    const s = status?.toLowerCase();
    return s === 'registered_not_confirmed' || s === 'pending' || s === 'email_not_confirmed';
  }

  function getStatusBadge(status: string) {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20">Active</Badge>;
      case 'registered_not_confirmed':
      case 'email_not_confirmed':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20">Pending</Badge>;
      case 'locked':
        return <Badge className="bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20">Locked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  function formatRelativeDate(dateStr: string) {
    if (!dateStr) return '—';
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      if (days < 7) return `${days}d ago`;
      return new Date(dateStr).toLocaleDateString();
    } catch { return dateStr; }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  };

  /* ── Render ── */
  /* Count-up values */
  const animTotalStudents = useCountUp(totalStudents);
  const animTotalCourses = useCountUp(totalCourses);
  const animPendingStudents = useCountUp(pendingStudents);
  const animEngagement = useCountUp(parseFloat(engagementRate));

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="rounded-xl bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-h2-sb">Welcome back, {currentUser?.firstName || 'Admin'}!</h1>
            <p className="text-primary-foreground/80 mt-1 text-body">Here's what's happening on your learning platform today.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5 text-sm backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{onlineUsers} online</span>
            </div>
            <div className="bg-white/15 rounded-lg px-3 py-1.5 text-sm backdrop-blur-sm">
              {allUsers.length} total users
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={cardHoverVariants} initial="rest" whileHover="hover">
        <Card className="hover:shadow-md transition-shadow cursor-pointer card-hover" onClick={() => navigate('/admin/users')}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Students</p>
                {usersLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{animTotalStudents}</p>}
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>{activeStudents} active</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div variants={cardHoverVariants} initial="rest" whileHover="hover">
        <Card className="hover:shadow-md transition-shadow cursor-pointer card-hover" onClick={() => navigate('/admin/courses')}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Courses</p>
                {coursesLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{animTotalCourses}</p>}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{tutors.length} tutors</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div variants={cardHoverVariants} initial="rest" whileHover="hover">
        <Card className="hover:shadow-md transition-shadow card-hover">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending Approval</p>
                {usersLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{animPendingStudents}</p>}
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <Clock className="h-3 w-3" />
                  <span>requires review</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div variants={cardHoverVariants} initial="rest" whileHover="hover">
        <Card className="hover:shadow-md transition-shadow card-hover">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Engagement Rate</p>
                {usersLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{animEngagement}%</p>}
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <Activity className="h-3 w-3" />
                  <span>platform wide</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>

      {/* Charts Row 1: Registration Trends + User Distribution */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Registration Trends</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </div>
              <Select value={chartPeriod} onValueChange={setChartPeriod}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartPeriod === '7days' ? (
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="registrations" name="Registrations" stroke="hsl(221, 83%, 53%)" fill="url(#colorRegs)" strokeWidth={2} isAnimationActive={true} animationDuration={1200} />
                    <Area type="monotone" dataKey="active" name="Active" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.1} strokeWidth={2} isAnimationActive={true} animationDuration={1400} />
                  </AreaChart>
                ) : (
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="students" name="Students" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1000} />
                    <Bar dataKey="tutors" name="Tutors" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1200} />
                    <Bar dataKey="mentors" name="Mentors" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1400} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">User Distribution</CardTitle>
            <CardDescription>Breakdown by role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" isAnimationActive={true} animationDuration={1000}>
                    {roleDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {roleDistribution.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="truncate text-muted-foreground">{entry.name}</span>
                  <span className="font-semibold ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row 2: Course Enrollment + Status Breakdown */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Course Enrollment</CardTitle>
            <CardDescription>Students and tutors per course</CardDescription>
          </CardHeader>
          <CardContent>
            {coursesLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : !coursesData?.length ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No courses yet</p>
                </div>
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseEnrollmentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="students" name="Students" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} isAnimationActive={true} animationDuration={1000} />
                    <Bar dataKey="tutors" name="Tutors" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} isAnimationActive={true} animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Account Status Overview</CardTitle>
            <CardDescription>Health of user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusDistribution} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} isAnimationActive={true} animationDuration={1000}>
                        {statusDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {statusDistribution.map((entry) => (
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
      </motion.div>

      {/* Platform Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50">
          <CardContent className="p-4 text-center">
            <Globe className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{usersLoading ? '—' : allUsers.length}</p>
            <p className="text-xs text-muted-foreground">Total Platform Users</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200/50">
          <CardContent className="p-4 text-center">
            <Activity className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{engagementRate}%</p>
            <p className="text-xs text-muted-foreground">Active Users Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50">
          <CardContent className="p-4 text-center">
            <Lightbulb className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{mentors.length}</p>
            <p className="text-xs text-muted-foreground">Active Mentors</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200/50">
          <CardContent className="p-4 text-center">
            <Server className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-600">Healthy</p>
            <p className="text-xs text-muted-foreground">Server Status</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Registrations + Pending Approvals */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Registrations</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')} className="text-xs">
                View All <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {usersLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : recentRegistrations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No recent registrations</p>
            ) : (
              recentRegistrations.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-700">
                      {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {getStatusBadge(user.status)}
                    <p className="text-[10px] text-muted-foreground mt-1">{formatRelativeDate(user.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Pending Approvals
              {pendingUsers.length > 0 && <Badge className="ml-2 bg-amber-500 text-white">{pendingUsers.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {usersLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-8">
                <Check className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All caught up! No pending approvals.</p>
              </div>
            ) : (
              pendingUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback className="text-xs font-medium bg-amber-100 text-amber-700">
                      {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.role} · {formatRelativeDate(user.createdAt)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                    onClick={() => approveMutation.mutate(user.id)}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
                    Approve
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate('/admin/users')}>
          <Users className="h-5 w-5 text-blue-600" />
          <span className="text-xs">Manage Users</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate('/admin/courses')}>
          <BookOpen className="h-5 w-5 text-emerald-600" />
          <span className="text-xs">Manage Courses</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate('/admin/chat/announcements')}>
          <Megaphone className="h-5 w-5 text-blue-600" />
          <span className="text-xs">Announcements</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => navigate('/admin/chat')}>
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <span className="text-xs">Chat Room</span>
        </Button>
      </motion.div>
    </motion.div>
  );
}
