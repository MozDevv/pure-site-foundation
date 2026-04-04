import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import {
  Shield,
  Search,
  Filter,
  Download,
  Clock,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Eye,
  RefreshCw,
  Monitor,
  Globe,
  ChevronDown,
  ChevronUp,
  FileText,
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

/* ── Types ── */
interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  category: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: string;
  timestamp: string;
}

interface AuditStats {
  todayCount: number;
  weekCount: number;
  activeUsersToday: number;
  activeUsersWeek: number;
}

/* ── Constants ── */
const ACTION_ICONS: Record<string, any> = {
  LOGIN: LogIn,
  LOGOUT: LogOut,
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
  VIEW: Eye,
  APPROVE: CheckCircle,
  REJECT: AlertTriangle,
};

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-blue-500/10 text-blue-600 border-blue-200',
  LOGOUT: 'bg-slate-500/10 text-slate-600 border-slate-200',
  CREATE: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  UPDATE: 'bg-amber-500/10 text-amber-600 border-amber-200',
  DELETE: 'bg-red-500/10 text-red-600 border-red-200',
  VIEW: 'bg-blue-500/10 text-blue-600 border-blue-200',
  APPROVE: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  REJECT: 'bg-red-500/10 text-red-600 border-red-200',
};

const CATEGORIES = [
  'All',
  'Authentication',
  'User Management',
  'Course Management',
  'Assessment',
  'Mentorship',
  'System',
];

/* ── Component ── */
export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const pageSize = 20;

  // Fetch real audit logs from backend with filters
  const { data: logsRes, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', page, categoryFilter, actionFilter, search],
    queryFn: async () => {
      const params: Record<string, any> = { page, size: pageSize };
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (actionFilter !== 'All') params.action = actionFilter;
      if (search.trim()) params.search = search.trim();
      const res = await apiService.getWithParams(endpoints.getAuditLogsFiltered, params);
      return res.data;
    },
  });

  // Fetch stats from backend
  const { data: stats } = useQuery<AuditStats>({
    queryKey: ['audit-log-stats'],
    queryFn: async () => {
      const res = await apiService.get(endpoints.getAuditLogStats);
      return res.data;
    },
  });

  const auditLogs: AuditLog[] = logsRes?.content || [];
  const totalElements: number = logsRes?.totalElements || 0;
  const totalPages: number = logsRes?.totalPages || 0;

  function formatRelativeDate(dateStr: string) {
    if (!dateStr) return '—';
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      if (days < 7) return `${days}d ago`;
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  function formatFullDate(dateStr: string) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }

  function parseMetadata(meta?: string): Record<string, any> | null {
    if (!meta) return null;
    try { return JSON.parse(meta); } catch { return null; }
  }

  async function handleExport() {
    try {
      // Fetch all filtered logs (up to 10000) for export
      const params: Record<string, any> = { page: 0, size: 10000 };
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (actionFilter !== 'All') params.action = actionFilter;
      if (search.trim()) params.search = search.trim();
      const res = await apiService.getWithParams(endpoints.getAuditLogsFiltered, params);
      const allLogs: AuditLog[] = res.data?.content || [];

      const csv = [
        'Timestamp,User,Email,Role,Action,Category,Description,IP Address',
        ...allLogs.map(
          (log) =>
            `"${formatFullDate(log.timestamp)}","${log.userName || ''}","${log.userEmail || ''}","${log.userRole || ''}","${log.action}","${log.category}","${log.description || ''}","${log.ipAddress || ''}"`
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // fallback: export current page
      const csv = [
        'Timestamp,User,Email,Role,Action,Category,Description,IP Address',
        ...auditLogs.map(
          (log) =>
            `"${formatFullDate(log.timestamp)}","${log.userName || ''}","${log.userEmail || ''}","${log.userRole || ''}","${log.action}","${log.category}","${log.description || ''}","${log.ipAddress || ''}"`
        ),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h2-sb flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground text-body mt-1">
            Track all platform activity and user actions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-small text-muted-foreground">Total Events</p>
                <p className="text-h4-sb">{totalElements.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-small text-muted-foreground">Today</p>
                <p className="text-h4-sb">{stats?.todayCount?.toLocaleString() ?? '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-small text-muted-foreground">This Week</p>
                <p className="text-h4-sb">{stats?.weekCount?.toLocaleString() ?? '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <User className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-small text-muted-foreground">Active Users Today</p>
                <p className="text-h4-sb">{stats?.activeUsersToday?.toLocaleString() ?? '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, email, or description..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={actionFilter}
              onValueChange={(v) => {
                setActionFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Actions</SelectItem>
                {Object.keys(ACTION_ICONS).map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.charAt(0) + action.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Log Entries */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-h4-sb">Activity Log</CardTitle>
              <CardDescription>
                {totalElements} events found
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => refetch()}>
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-body-sb text-muted-foreground">
                No audit logs match your filters
              </p>
              <p className="text-small text-muted-foreground mt-1">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => {
                const ActionIcon = ACTION_ICONS[log.action] || Activity;
                const colorClass = ACTION_COLORS[log.action] || 'bg-slate-500/10 text-slate-600 border-slate-200';
                const isExpanded = expandedId === log.id;
                const metadata = parseMetadata(log.metadata);

                return (
                  <div key={log.id}>
                    <div
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      {/* Icon */}
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass.split(' ').slice(0, 2).join(' ')}`}
                      >
                        <ActionIcon className="h-5 w-5" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-input font-medium">
                            {log.userName || 'System'}
                          </span>
                          <Badge variant="outline" className={`text-[10px] ${colorClass}`}>
                            {log.action}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {log.category}
                          </Badge>
                        </div>
                        <p className="text-small text-muted-foreground truncate mt-0.5">
                          {log.description}
                        </p>
                      </div>

                      {/* Timestamp + expand */}
                      <div className="text-right shrink-0 flex items-center gap-2">
                        <div>
                          <p className="text-small text-muted-foreground">
                            {formatRelativeDate(log.timestamp)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {log.userRole || '—'}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="ml-14 mr-3 mb-2 p-4 rounded-lg bg-muted/30 border space-y-3 text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">User</p>
                              <p className="font-medium">{log.userName || 'System'}</p>
                              {log.userEmail && (
                                <p className="text-xs text-muted-foreground">{log.userEmail}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Timestamp</p>
                              <p className="font-medium">{formatFullDate(log.timestamp)}</p>
                            </div>
                          </div>
                          {log.ipAddress && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">IP Address</p>
                                <p className="font-medium">{log.ipAddress}</p>
                              </div>
                            </div>
                          )}
                          {log.userAgent && (
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">User Agent</p>
                                <p className="font-medium text-xs truncate max-w-xs" title={log.userAgent}>
                                  {log.userAgent}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        {log.description && (
                          <div className="flex items-start gap-2 pt-2 border-t">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Description</p>
                              <p>{log.description}</p>
                            </div>
                          </div>
                        )}
                        {metadata && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground mb-1">Metadata</p>
                            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                              {JSON.stringify(metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t">
              <p className="text-small text-muted-foreground">
                Page {page + 1} of {totalPages} ({totalElements} events)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 0}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
