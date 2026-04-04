import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { toast } from 'sonner';
import {
  ClipboardCheck, Calendar, Clock, Users, CheckCircle, XCircle, AlertTriangle,
  Search, Filter, BarChart3, TrendingUp, UserCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

/* ── Types ── */
interface AttendanceRecord {
  id: string;
  status: string;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  recordedByMethod: string;
  user?: { firstName: string; lastName: string; profilePicture?: string };
  event?: { title: string };
  course?: { name: string };
}

interface AttendanceStat {
  status: string;
  count: number;
}

/* ── Component ── */
export default function AttendancePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('my-attendance');
  const [dateFilter, setDateFilter] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = ['Admin', 'Super_Admin'].includes(user?.role);
  const isTutor = user?.role === 'Tutor';
  const isMentor = user?.role === 'Mentor';
  const canManage = isAdmin || isTutor || isMentor;

  // My attendance
  const { data: myAttendance = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['my-attendance'],
    queryFn: async () => {
      const r = (await apiService.get(endpoints.getMyAttendance)).data;
      return Array.isArray(r) ? r : r?.content || [];
    },
  });

  // My stats (backend returns a Map like { presentCount, lateCount, totalSessions, attendanceRate })
  const { data: myStatsRaw } = useQuery<Record<string, number>>({
    queryKey: ['my-attendance-stats'],
    queryFn: async () => (await apiService.get(endpoints.getMyAttendanceStats)).data || {},
  });

  // Calculate rate from backend stats map
  const presentCount = myStatsRaw?.presentCount || 0;
  const lateCount = myStatsRaw?.lateCount || 0;
  const absentCount = myStatsRaw?.absentCount || 0;
  const excusedCount = myStatsRaw?.excusedCount || 0;
  const totalRecords = (myStatsRaw?.totalSessions as number) || 0;
  const attendanceRate = (myStatsRaw?.attendanceRate as number) || 0;

  // Self check-in mutation
  const checkInMut = useMutation({
    mutationFn: (eventId: string) => apiService.post(endpoints.selfCheckIn(eventId), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['my-attendance-stats'] });
      toast.success('Checked in successfully!');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Check-in failed'),
  });

  const checkOutMut = useMutation({
    mutationFn: (eventId: string) => apiService.post(endpoints.checkOut(eventId), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-attendance'] });
      toast.success('Checked out successfully!');
    },
  });

  const statusConfig: Record<string, { color: string; icon: any; bg: string }> = {
    PRESENT: { color: 'text-emerald-600', icon: CheckCircle, bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    ABSENT: { color: 'text-red-600', icon: XCircle, bg: 'bg-red-100 dark:bg-red-900/30' },
    LATE: { color: 'text-amber-600', icon: AlertTriangle, bg: 'bg-amber-100 dark:bg-amber-900/30' },
    EXCUSED: { color: 'text-blue-600', icon: Clock, bg: 'bg-blue-100 dark:bg-blue-900/30' },
  };

  const filteredAttendance = useMemo(() => {
    if (!dateFilter) return myAttendance;
    return myAttendance.filter(a => a.attendanceDate === dateFilter);
  }, [myAttendance, dateFilter]);

  const formatTime = (t?: string) => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" /> Attendance
        </h1>
        <p className="text-muted-foreground mt-1">Track your attendance across events and courses</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: BarChart3, color: 'text-primary', value: `${attendanceRate}%`, label: 'Rate', bg: 'bg-primary/10' },
          { icon: CheckCircle, color: 'text-emerald-500', value: presentCount, label: 'Present', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { icon: AlertTriangle, color: 'text-amber-500', value: lateCount, label: 'Late', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { icon: XCircle, color: 'text-red-500', value: absentCount, label: 'Absent', bg: 'bg-red-100 dark:bg-red-900/30' },
          { icon: Clock, color: 'text-blue-500', value: excusedCount, label: 'Excused', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance Rate Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Attendance Rate</span>
            <span className="text-sm font-bold text-primary">{attendanceRate}%</span>
          </div>
          <Progress value={attendanceRate} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {totalRecords} total sessions recorded · {presentCount + lateCount} attended
          </p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="my-attendance">My Records</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        {/* Records List */}
        <TabsContent value="my-attendance" className="space-y-4">
          {/* Date filter */}
          <div className="flex items-center gap-3">
            <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="max-w-[200px]" />
            {dateFilter && <Button variant="ghost" size="sm" onClick={() => setDateFilter('')}>Clear</Button>}
          </div>

          {filteredAttendance.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-semibold">No Attendance Records</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {dateFilter ? 'No records for the selected date' : 'Your attendance will appear here as you attend sessions'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredAttendance.map((rec, i) => {
                const cfg = statusConfig[rec.status] || statusConfig.PRESENT;
                const StatusIcon = cfg.icon;
                return (
                  <motion.div key={rec.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                            <StatusIcon className={`h-5 w-5 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm">{rec.event?.title || rec.course?.name || 'Session'}</p>
                              <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>{rec.status}</Badge>
                              <Badge variant="outline" className="text-[10px]">{rec.recordedByMethod?.replace(/_/g, ' ')}</Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{rec.attendanceDate}</span>
                              {rec.checkInTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />In: {formatTime(rec.checkInTime)}</span>}
                              {rec.checkOutTime && <span>Out: {formatTime(rec.checkOutTime)}</span>}
                            </div>
                            {rec.notes && <p className="text-xs text-muted-foreground mt-1 italic">{rec.notes}</p>}
                          </div>
                          {!rec.checkOutTime && rec.checkInTime && rec.status === 'PRESENT' && rec.event && (
                            <Button size="sm" variant="outline" onClick={() => checkOutMut.mutate(rec.event!.title)}>
                              Check Out
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Calendar View (simplified) */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Monthly Overview
              </CardTitle>
              <CardDescription>Attendance distribution for recent sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Group by date */}
              {(() => {
                const byDate = new Map<string, AttendanceRecord[]>();
                myAttendance.slice(0, 30).forEach(r => {
                  const d = r.attendanceDate;
                  if (!byDate.has(d)) byDate.set(d, []);
                  byDate.get(d)!.push(r);
                });
                const dates = Array.from(byDate.entries()).sort((a, b) => b[0].localeCompare(a[0]));
                
                if (dates.length === 0) {
                  return <p className="text-center py-8 text-sm text-muted-foreground">No data available</p>;
                }
                
                return (
                  <div className="space-y-4">
                    {dates.map(([date, records]) => (
                      <div key={date}>
                        <p className="text-sm font-semibold mb-2">{new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <div className="flex flex-wrap gap-2">
                          {records.map(r => {
                            const cfg = statusConfig[r.status] || statusConfig.PRESENT;
                            return (
                              <div key={r.id} className={`px-3 py-2 rounded-lg ${cfg.bg} ${cfg.color} text-xs font-medium flex items-center gap-1`}>
                                <cfg.icon className="h-3 w-3" />
                                {r.event?.title || r.course?.name || 'Session'}: {r.status}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
