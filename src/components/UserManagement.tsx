import React, { useState, useEffect, useRef } from 'react';
import { ViewToggle } from '@/components/ui/view-toggle';
import { useQuery } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { motion } from 'framer-motion';
import { SkeletonPage } from '@/components/ui/animations';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  SmartDrawer,
  SmartDrawerContent,
  SmartDrawerDescription,
  SmartDrawerHeader,
  SmartDrawerTitle,
  SmartDrawerTrigger,
} from '@/components/ui/smart-drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Users,
  UserPlus,
  Search,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserCog,
} from 'lucide-react';
import { toast } from 'sonner';
import { PhoneInput } from '@/components/ui/phone-input';

// Types based on API response
interface Authority {
  authority: string;
}

interface UserProfile {
  id: string;
  user: string;
  educationLevel: string;
  fieldOfStudy: string;
  institutionName: string;
  programmingExperience: string;
  programmingLanguages: string;
  techInterests: string;
  motivation: string;
  careerGoals: string;
  availableHours: string;
  portfolioLinks: string;
  hearAboutUs: string;
  additionalInfo: string;
  agreeTerms: boolean;
  receiveUpdates: boolean;
}

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  age: string;
  location: string;
  email: string;
  profilePicture: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  userProfile: UserProfile | null;
  role: string;
  enabled: boolean;
  authorities: Authority[];
  // Mentor fields
  isMentor?: boolean;
  expertise?: string[];
  yearsOfExperience?: number;
  maxMentees?: number;
  currentMenteeCount?: number;
  preferredMeetingFrequency?: string;
  mentorBio?: string;
  accountNonExpired: boolean;
  credentialsNonExpired: boolean;
  accountNonLocked: boolean;
}

interface UsersResponse {
  data: User[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  messages: string;
  succeeded: boolean;
}

function UserManagement() {
  // Check user role - only Admin and Tutor can access
  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : null;
  const userRole = user?.role || '';
  
  // Redirect if not allowed
  React.useEffect(() => {
    if (userRole && !['Admin', 'ADMIN', 'Tutor', 'TUTOR'].includes(userRole)) {
      window.location.href = '/student';
    }
  }, [userRole]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<
    'lock' | 'unlock' | 'approve' | 'suspend'
  >('lock');
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendCustomMessage, setSuspendCustomMessage] = useState('');
  const [suspendUseCustom, setSuspendUseCustom] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  // Fetch users data
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery<UsersResponse>({
    queryKey: ['users', currentPage],
    queryFn: async () => {
      try {
        console.log('Fetching users with params:', { pageNumber: currentPage, pageSize: 10 });
        const response = await apiService.getWithParams(endpoints.getAllUsers, {
          pageNumber: currentPage,
          pageSize: 10,
        });
        console.log('Users API response:', response.data);
        return response.data;
      } catch (err: any) {
        console.error('Error fetching users:', err);
        console.error('Error response:', err.response?.data);
        throw err;
      }
    },
  });

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles', currentPage],
    queryFn: async () => {
      const response = await apiService.get(endpoints.getAllRoles);
      return response.data;
    },
  });

  // Filter users based on search and filters
  const filteredUsers =
    usersData?.data?.filter((user) => {
      const matchesSearch =
        (user?.username?.toLowerCase() || '').includes(
          searchTerm.toLowerCase()
        ) ||
        (user?.email.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        `${user?.firstName} ${user?.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    }) || [];

  // Calculate statistics
  const stats = {
    total: usersData?.totalCount || 0,
    active:
      usersData?.data?.filter((u) => u.enabled && u.accountNonLocked).length ||
      0,
    locked: usersData?.data?.filter((u) => !u.accountNonLocked).length || 0,
    pending:
      usersData?.data?.filter((u) => u.status === 'REGISTERED_NOT_CONFIRMED' || u.status === 'PENDING_APPROVAL')
        .length || 0,
    tutors: usersData?.data?.filter((u) => u.role === 'TUTOR').length || 0,
  };

  const getStatusBadge = (user: User) => {
    if (!user.accountNonLocked || user.status === 'LOCKED') {
      return <Badge variant="destructive">Locked</Badge>;
    }
    if (user.status === 'SUSPENDED') {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (user.status === 'REGISTERED_NOT_CONFIRMED') {
      return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
    }
    if (user.status === 'PENDING_APPROVAL') {
      return <Badge className="bg-orange-500 text-white">Pending Approval</Badge>;
    }
    if (user.status === 'EMAIL_NOT_CONFIRMED') {
      return <Badge className="bg-yellow-500 text-white">Email Not Confirmed</Badge>;
    }
    if (user.enabled) {
      return <Badge className="bg-green-500 text-white">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-primary text-primary-foreground',
      TUTOR: 'bg-primary text-primary-foreground',
      Student: 'bg-warning text-warning-foreground',
    };
    return (
      <Badge className={colors[role] || 'bg-muted text-muted-foreground'}>{role}</Badge>
    );
  };

  const handleAction = (
    user: User,
    action: 'lock' | 'unlock' | 'approve' | 'suspend'
  ) => {
    setSelectedUser(user);
    setActionType(action);
    setSuspendReason('');
    setSuspendCustomMessage('');
    setSuspendUseCustom(false);
    setActionDialogOpen(true);
  };

  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setNewRoleName(user.role || '');
    setChangeRoleDialogOpen(true);
  };

  const confirmChangeRole = async () => {
    if (!selectedUser || !newRoleName) return;
    try {
      await apiService.patch(endpoints.changeUserRole(selectedUser.id), { role: newRoleName });
      toast.success(`Role updated to ${newRoleName}`);
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update role');
    }
    setChangeRoleDialogOpen(false);
  };

  const approveStudentApplication = async (userId: string) => {
    try {
      const res = await apiService.post(
        endpoints.approveStudentApplication(userId)
      );
      if (res.status === 200) {
        toast.success('Student application approved successfully');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to approve student application');
    }
  };

  // ── Auto-approve students when the system setting is enabled ──
  const { data: systemSettings } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: async () => {
      const res = await apiService.get(endpoints.getSystemSettings);
      return res.data as Array<{ settingKey: string; settingValue: string }>;
    },
    staleTime: 60_000,
  });

  const autoApproveTriggered = useRef(false);
  useEffect(() => {
    if (autoApproveTriggered.current) return;
    const autoApproveEnabled = systemSettings?.find(s => s.settingKey === 'auto_approve_students')?.settingValue === 'true';
    if (!autoApproveEnabled) return;
    const pending = usersData?.data?.filter(u => u.status === 'REGISTERED_NOT_CONFIRMED') || [];
    if (pending.length === 0) return;

    autoApproveTriggered.current = true;
    const runAutoApprove = async () => {
      let approved = 0;
      for (const u of pending) {
        try {
          await apiService.post(endpoints.approveStudentApplication(u.id));
          approved++;
        } catch {
          // silently continue for individual failures
        }
      }
      if (approved > 0) {
        toast.success(`Auto-approved ${approved} pending student${approved > 1 ? 's' : ''}`);
        refetch();
        autoApproveTriggered.current = false; // reset so next page load re-checks
      }
    };
    runAutoApprove();
  }, [systemSettings, usersData, refetch]);

  const confirmAction = async () => {
    if (!selectedUser) return;

    try {
      switch (actionType) {
        case 'approve':
          if (selectedUser.role === 'Student') {
            await approveStudentApplication(selectedUser.id);
          } else {
            await apiService.post(endpoints.approveUser(selectedUser.id));
            toast.success(`${selectedUser.role} approved successfully`);
          }
          break;
        case 'lock':
          await apiService.patch(endpoints.lockUser(selectedUser.id));
          toast.success('User account locked');
          break;
        case 'unlock':
          await apiService.patch(endpoints.unlockUser(selectedUser.id));
          toast.success('User account unlocked');
          break;
        case 'suspend':
          await apiService.patch(endpoints.suspendUser(selectedUser.id), {
            reason: suspendReason || undefined,
            customMessage: suspendUseCustom ? suspendCustomMessage : undefined,
            sendEmail: 'true',
          });
          toast.success('User account suspended — notification email sent');
          break;
      }
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${actionType} user`);
    }
    setActionDialogOpen(false);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  if (isLoading) {
    return <SkeletonPage />;
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Locked</CardTitle>
            <Lock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.locked}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approval
            </CardTitle>
            <XCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tutors</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tutors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending students banner — shown when auto-approve is OFF and there are pending students */}
      {stats.pending > 0 && systemSettings?.find(s => s.settingKey === 'auto_approve_students')?.settingValue !== 'true' && (
        <div className="flex items-center justify-between rounded-lg border border-warning bg-warning/10 px-4 py-3 text-sm text-foreground">
          <span>
            <span className="font-semibold">{stats.pending} student{stats.pending > 1 ? 's' : ''} pending approval.</span>
            {' '}Review and approve them below, or enable Auto-Approval in Settings → System.
          </span>
          <button
            className="ml-4 text-xs underline text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setStatusFilter('REGISTERED_NOT_CONFIRMED')}
          >
            Show pending
          </button>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>User Management</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Send Bulk Email
              </Button>
              <SmartDrawer
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
              >
                <SmartDrawerTrigger asChild>
                  <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <UserPlus className="h-4 w-4" />
                    Create User
                  </Button>
                </SmartDrawerTrigger>
                <SmartDrawerContent defaultWidth={672}>
                  <SmartDrawerHeader>
                    <SmartDrawerTitle>Create New User</SmartDrawerTitle>
                    <SmartDrawerDescription>
                      Add a new user to the system
                    </SmartDrawerDescription>
                  </SmartDrawerHeader>
                  <CreateUserForm
                    rolesData={rolesData}
                    onClose={() => setCreateDialogOpen(false)}
                    onSuccess={refetch}
                  />
                </SmartDrawerContent>
              </SmartDrawer>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username, email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                {rolesData?.data?.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="REGISTERED_NOT_CONFIRMED">
                  Pending
                </SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="LOCKED">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex justify-end">
            <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
          </div>

          {/* Users Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.profilePicture} alt={user.username} />
                        <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{user.username}</div>
                        <div className="text-sm text-muted-foreground truncate">{user.firstName} {user.lastName}</div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="truncate ml-2 max-w-[180px]">{user.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Role</span>
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status</span>
                        {getStatusBadge(user)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Joined</span>
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t">
                      <Button variant="outline" size="sm" onClick={() => handleViewUser(user)} className="gap-1">
                        <Eye className="h-3 w-3" /> View
                      </Button>
                      {user.accountNonLocked ? (
                        <Button variant="outline" size="sm" onClick={() => handleAction(user, 'lock')} className="gap-1">
                          <Lock className="h-3 w-3" /> Lock
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleAction(user, 'unlock')} className="gap-1">
                          <Unlock className="h-3 w-3" /> Unlock
                        </Button>
                      )}
                      {(user.role === 'Tutor' || user.role === 'TUTOR' || user.role === 'Mentor' || user.isMentor) &&
                        (user.status === 'PENDING_APPROVAL' || user.status === 'REGISTERED_NOT_CONFIRMED') && (
                          <Button size="sm" onClick={() => handleAction(user, 'approve')} className="gap-1 bg-green-500 hover:bg-green-600 text-white">
                            <CheckCircle className="h-3 w-3" /> Approve
                          </Button>
                        )}
                      {userRole === 'Admin' && (
                        <Button variant="outline" size="sm" onClick={() => handleChangeRole(user)} className="gap-1">
                          <UserCog className="h-3 w-3" /> Role
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
          // Users Table
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={user.profilePicture}
                            alt={user.username}
                          />
                          <AvatarFallback>
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                    <TableCell className="hidden lg:table-cell">{user.phoneNumber || 'N/A'}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 sm:gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                          className="gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        {user.accountNonLocked ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(user, 'lock')}
                            className="gap-1"
                          >
                            <Lock className="h-3 w-3" />
                            Lock
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(user, 'unlock')}
                            className="gap-1"
                          >
                            <Unlock className="h-3 w-3" />
                            Unlock
                          </Button>
                        )}
                        {user.role === 'Student' && (
                          <>
                            {user.status === 'REGISTERED_NOT_CONFIRMED' ? (
                              <Button
                                size="sm"
                                onClick={() => handleAction(user, 'approve')}
                                className="gap-1 bg-green-500 hover:bg-green-600 text-white"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Approve
                              </Button>
                            ) : user.status === 'EMAIL_NOT_CONFIRMED' ? (
                              <Button
                                size="sm"
                                onClick={() => handleAction(user, 'approve')}
                                className="gap-1 bg-green-500 hover:bg-green-600 text-white"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Resend Activation Email
                              </Button>
                            ) : null}
                          </>
                        )}
                        {(user.role === 'Tutor' || user.role === 'TUTOR' || user.role === 'Mentor' || user.isMentor) &&
                          (user.status === 'PENDING_APPROVAL' || user.status === 'REGISTERED_NOT_CONFIRMED') && (
                            <Button
                              size="sm"
                              onClick={() => handleAction(user, 'approve')}
                              className="gap-1 bg-green-500 hover:bg-green-600 text-white"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Approve
                            </Button>
                          )}
                        {user.status === 'SUSPENDED' && (
                          <Button
                            size="sm"
                            onClick={() => handleAction(user, 'approve')}
                            className="gap-1 bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Reactivate
                          </Button>
                        )}
                        {userRole === 'Admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangeRole(user)}
                            className="gap-1"
                          >
                            <UserCog className="h-3 w-3" />
                            Role
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {usersData?.totalCount || 0}{' '}
              users
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!usersData?.hasPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  Page {currentPage} of {usersData?.totalPages || 1}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!usersData?.hasNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <SmartDrawer open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <SmartDrawerContent defaultWidth={900}>
          {selectedUser && (
            <ViewUserDialog user={selectedUser} onAction={handleAction} />
          )}
        </SmartDrawerContent>
      </SmartDrawer>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent className={actionType === 'suspend' ? 'max-w-lg' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'suspend' ? 'Suspend Account' : 'Confirm Action'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'suspend' ? (
                <>Suspending <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong> ({selectedUser?.email}). A notification email will be sent.</>
              ) : (
                <>Are you sure you want to {actionType} user "{selectedUser?.username}"? This action can be reversed later.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {actionType === 'suspend' && (
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="suspend-reason">Reason for suspension (optional)</Label>
                <Input
                  id="suspend-reason"
                  placeholder="e.g. Violation of community guidelines"
                  value={suspendReason}
                  onChange={e => setSuspendReason(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="custom-email-toggle"
                  checked={suspendUseCustom}
                  onChange={e => setSuspendUseCustom(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="custom-email-toggle" className="text-sm cursor-pointer">
                  Draft a custom email instead of default template
                </Label>
              </div>
              {suspendUseCustom && (
                <div>
                  <Label htmlFor="custom-email">Custom email message (HTML supported)</Label>
                  <Textarea
                    id="custom-email"
                    placeholder={`Dear ${selectedUser?.firstName},\n\nYour account has been suspended because...\n\nPlease contact support if you have questions.`}
                    value={suspendCustomMessage}
                    onChange={e => setSuspendCustomMessage(e.target.value)}
                    className="mt-1 min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will replace the default suspension email. Use &lt;b&gt; for bold, &lt;br&gt; for line breaks.
                  </p>
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={actionType === 'suspend' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'}
            >
              {actionType === 'suspend' ? 'Suspend & Notify' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Role Dialog */}
      <AlertDialog open={changeRoleDialogOpen} onOpenChange={setChangeRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Assign a new role to <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong> ({selectedUser?.email}).
              Current role: <strong>{selectedUser?.role}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="new-role">New Role</Label>
            <Select value={newRoleName} onValueChange={setNewRoleName}>
              <SelectTrigger id="new-role" className="mt-1">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {rolesData?.data?.map((role: any) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmChangeRole}
              className="bg-primary hover:bg-primary/90"
              disabled={!newRoleName || newRoleName === selectedUser?.role}
            >
              Assign Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

// View User Dialog Component
function ViewUserDialog({
  user,
  onAction,
}: {
  user: User;
  onAction: (
    user: User,
    action: 'lock' | 'unlock' | 'approve' | 'suspend'
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <SmartDrawerHeader>
        <SmartDrawerTitle className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profilePicture} alt={user.username} />
            <AvatarFallback>
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-xl">{user.username}</div>
            <div className="text-sm text-muted-foreground font-normal">
              {user.firstName} {user.lastName}
            </div>
          </div>
        </SmartDrawerTitle>
      </SmartDrawerHeader>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="profile">
            {user.role === 'Student'
              ? 'Student Profile'
              : user.role === 'TUTOR'
              ? 'Tutor Info'
              : 'Details'}
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <div className="font-medium">{user.email}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Phone</Label>
              <div className="font-medium">{user.phoneNumber || 'N/A'}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Age</Label>
              <div className="font-medium">{user.age || 'N/A'}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Location</Label>
              <div className="font-medium">{user.location || 'N/A'}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Role</Label>
              <div className="font-medium">{user.role}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="font-medium">{user.status}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Account Status</Label>
              <div className="flex gap-2 mt-1">
                {user.enabled && (
                  <Badge className="bg-green-500">Enabled</Badge>
                )}
                {user.accountNonLocked ? (
                  <Badge className="bg-blue-500">Unlocked</Badge>
                ) : (
                  <Badge variant="destructive">Locked</Badge>
                )}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Created At</Label>
              <div className="font-medium">
                {new Date(user.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          {user.role === 'Student' && user.userProfile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Education Level</Label>
                <div className="font-medium">
                  {user.userProfile.educationLevel}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Field of Study</Label>
                <div className="font-medium">
                  {user.userProfile.fieldOfStudy}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Institution</Label>
                <div className="font-medium">
                  {user.userProfile.institutionName}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  Programming Experience
                </Label>
                <div className="font-medium">
                  {user.userProfile.programmingExperience}
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">
                  Programming Languages
                </Label>
                <div className="font-medium">
                  {user.userProfile.programmingLanguages}
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">Tech Interests</Label>
                <div className="font-medium">
                  {user.userProfile.techInterests}
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">Career Goals</Label>
                <div className="font-medium">
                  {user.userProfile.careerGoals}
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">Motivation</Label>
                <div className="font-medium">{user.userProfile.motivation}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Available Hours</Label>
                <div className="font-medium">
                  {user.userProfile.availableHours}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  How They Heard About Us
                </Label>
                <div className="font-medium">
                  {user.userProfile.hearAboutUs}
                </div>
              </div>
            </div>
          ) : user.role === 'TUTOR' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="font-medium"><Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>{user.status}</Badge></div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Member Since</Label>
                  <div className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="font-medium">{user.email}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <div className="font-medium">{user.phoneNumber || 'N/A'}</div>
                </div>
              </div>
            </div>
          ) : user.isMentor ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Badge className="bg-primary text-primary-foreground mb-4">Mentor</Badge>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">Expertise Areas</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.expertise?.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  )) || <span className="text-muted-foreground">N/A</span>}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  Years of Experience
                </Label>
                <div className="font-medium">
                  {user.yearsOfExperience ?? 'N/A'} years
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  Preferred Meeting Frequency
                </Label>
                <div className="font-medium capitalize">
                  {user.preferredMeetingFrequency?.replace('-', ' ') || 'N/A'}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Max Mentees</Label>
                <div className="font-medium">{user.maxMentees ?? 'N/A'}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  Current Mentee Count
                </Label>
                <div className="font-medium">
                  {user.currentMenteeCount ?? 0}
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">Mentor Bio</Label>
                <div className="font-medium mt-1 p-3 bg-muted rounded-md">
                  {user.mentorBio || 'No bio provided'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No additional profile information available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Account Status</span>
                    <div className="font-medium mt-1"><Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>{user.status}</Badge></div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Account Locked</span>
                    <div className="font-medium mt-1">{user.accountNonLocked ? 'No' : 'Yes'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created</span>
                    <div className="font-medium mt-1">{new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Role</span>
                    <div className="font-medium mt-1"><Badge variant="outline">{user.role}</Badge></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => onAction(user, user.accountNonLocked ? 'lock' : 'unlock')}>
                  {user.accountNonLocked ? <><Lock className="h-3 w-3 mr-1" /> Lock Account</> : <><Unlock className="h-3 w-3 mr-1" /> Unlock Account</>}
                </Button>
                {user.status !== 'ACTIVE' && user.status !== 'SUSPENDED' && (
                  <Button size="sm" onClick={() => onAction(user, 'approve')} className="bg-green-500 hover:bg-green-600 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" /> Approve
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        {user.accountNonLocked ? (
          <Button
            variant="outline"
            onClick={() => onAction(user, 'lock')}
            className="gap-2"
          >
            <Lock className="h-4 w-4" />
            Lock Account
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => onAction(user, 'unlock')}
            className="gap-2"
          >
            <Unlock className="h-4 w-4" />
            Unlock Account
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => onAction(user, 'suspend')}
          className="gap-2"
        >
          <XCircle className="h-4 w-4" />
          Suspend
        </Button>
        {user.role === 'Student' &&
          user.status === 'REGISTERED_NOT_CONFIRMED' && (
            <Button
              onClick={() => onAction(user, 'approve')}
              className="gap-2 bg-green-500 hover:bg-green-600 text-white"
            >
              <CheckCircle className="h-4 w-4" />
              Approve Student
            </Button>
          )}
        {(user.role === 'Tutor' || user.role === 'TUTOR' || user.role === 'Mentor' || user.isMentor) &&
          (user.status === 'PENDING_APPROVAL' || user.status === 'REGISTERED_NOT_CONFIRMED') && (
            <Button
              onClick={() => onAction(user, 'approve')}
              className="gap-2 bg-green-500 hover:bg-green-600 text-white"
            >
              <CheckCircle className="h-4 w-4" />
              Approve {user.role}
            </Button>
          )}
      </div>
    </div>
  );
}

// Create User Form Component
function CreateUserForm({
  onClose,
  onSuccess,
  rolesData,
}: {
  onClose: () => void;
  onSuccess: () => void;
  rolesData: any;
}) {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    age: '',
    location: '',
    password: '',
    role: 'Student',
    profilePicture: '',
    // Mentor fields
    isMentor: false,
    expertise: [] as string[],
    yearsOfExperience: 0,
    maxMentees: 5,
    currentMenteeCount: 0,
    preferredMeetingFrequency: 'weekly',
    mentorBio: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!formData.username?.trim()) errs.username = 'Username is required';
    else if (formData.username.trim().length < 3) errs.username = 'Username must be at least 3 characters';
    if (!formData.email?.trim()) errs.email = 'Email is required';
    else if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(formData.email.trim())) errs.email = 'Please enter a valid email address';
    if (!formData.firstName?.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName?.trim()) errs.lastName = 'Last name is required';
    if (formData.phoneNumber && !/^\+?[\d\s\-()]{7,20}$/.test(formData.phoneNumber.trim())) errs.phoneNumber = 'Please enter a valid phone number';
    if (!formData.role) errs.role = 'Please select a role';
    if (formData.isMentor) {
      if (formData.expertise.length === 0) errs.expertise = 'Please select at least one area of expertise';
      if (!formData.mentorBio?.trim()) errs.mentorBio = 'Mentor bio is required';
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      toast.error('Please fix the highlighted errors');
      return;
    }
    setFormErrors({});
    try {
      const response = await apiService.post(endpoints.register, {
        ...formData,
        roleId: formData.role,
      });
      if (response.status === 201 || response.status === 200) {
        toast.success('User created successfully');
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => {
              setFormData({ ...formData, username: e.target.value });
              if (formErrors.username) setFormErrors((prev) => { const { username, ...rest } = prev; return rest; });
            }}
            required
            className={formErrors.username ? 'border-destructive' : ''}
          />
          {formErrors.username && <p className="text-xs text-destructive mt-1">{formErrors.username}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (formErrors.email) setFormErrors((prev) => { const { email, ...rest } = prev; return rest; });
            }}
            required
            className={formErrors.email ? 'border-destructive' : ''}
          />
          {formErrors.email && <p className="text-xs text-destructive mt-1">{formErrors.email}</p>}
        </div>
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => {
              setFormData({ ...formData, firstName: e.target.value });
              if (formErrors.firstName) setFormErrors((prev) => { const { firstName, ...rest } = prev; return rest; });
            }}
            required
            className={formErrors.firstName ? 'border-destructive' : ''}
          />
          {formErrors.firstName && <p className="text-xs text-destructive mt-1">{formErrors.firstName}</p>}
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => {
              setFormData({ ...formData, lastName: e.target.value });
              if (formErrors.lastName) setFormErrors((prev) => { const { lastName, ...rest } = prev; return rest; });
            }}
            required
            className={formErrors.lastName ? 'border-destructive' : ''}
          />
          {formErrors.lastName && <p className="text-xs text-destructive mt-1">{formErrors.lastName}</p>}
        </div>
        {/* <div>
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
        </div> */}
        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <PhoneInput
            value={formData.phoneNumber}
            onChange={(val) => {
              setFormData({ ...formData, phoneNumber: val });
              if (formErrors.phoneNumber) setFormErrors((prev) => { const { phoneNumber, ...rest } = prev; return rest; });
            }}
            defaultCountry="KE"
            error={!!formErrors.phoneNumber}
          />
          {formErrors.phoneNumber && <p className="text-xs text-destructive mt-1">{formErrors.phoneNumber}</p>}
        </div>
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="role">Role *</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rolesData?.data?.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label className="mb-2">Profile Picture</Label>

          <div className="flex items-center gap-4">
            {/* Avatar preview */}
            <div>
              <Avatar className="h-20 w-20">
                {formData.profilePicture ? (
                  <AvatarImage
                    src={formData.profilePicture}
                    alt={formData.username || 'Avatar'}
                  />
                ) : (
                  <AvatarFallback className="text-lg">IMG</AvatarFallback>
                )}
              </Avatar>
            </div>

            <div className="flex flex-col gap-2">
              {/* Hidden file input */}
              <input
                id="profilePictureFile"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    // reader.result is a base64 data URL
                    setFormData({
                      ...formData,
                      profilePicture: reader.result as string,
                    });
                  };
                  reader.readAsDataURL(file);
                }}
              />

              <label
                htmlFor="profilePictureFile"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground cursor-pointer hover:opacity-90"
              >
                Choose Image
              </label>

              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, profilePicture: '' })
                  }
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Remove
                </button>

                <span className="text-xs text-muted-foreground">
                  PNG / JPG, up to 2MB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mentor Toggle */}
        <div className="col-span-2 border-t pt-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isMentor"
              checked={formData.isMentor}
              onChange={(e) =>
                setFormData({ ...formData, isMentor: e.target.checked })
              }
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="isMentor" className="cursor-pointer">
              Register as Mentor
            </Label>
          </div>
        </div>

        {/* Mentor Fields - Only shown when isMentor is true */}
        {formData.isMentor && (
          <>
            <div className="col-span-2">
              <Label>Expertise Areas *</Label>
              {/* Selected expertise as badges */}
              <div className="flex flex-wrap gap-2 mt-2 mb-3 min-h-[32px] p-2 border rounded-md bg-muted/30">
                {formData.expertise.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    No expertise selected
                  </span>
                ) : (
                  formData.expertise.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          expertise: formData.expertise.filter(
                            (_, i) => i !== index
                          ),
                        })
                      }
                    >
                      {skill}
                      <XCircle className="h-3 w-3" />
                    </Badge>
                  ))
                )}
              </div>
              {/* Suggested expertise options */}
              <span className="text-xs text-muted-foreground mb-2 block">
                Click to add expertise:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'React',
                  'Python',
                  'JavaScript',
                  'TypeScript',
                  'Node.js',
                  'Machine Learning',
                  'Data Science',
                  'Cloud Computing',
                  'DevOps',
                  'Mobile Development',
                  'UI/UX Design',
                  'Backend Development',
                  'Frontend Development',
                  'Database Management',
                  'Cybersecurity',
                  'AI/ML',
                  'Blockchain',
                  'System Design',
                  'Java',
                  'C++',
                ]
                  .filter((skill) => !formData.expertise.includes(skill))
                  .map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          expertise: [...formData.expertise, skill],
                        })
                      }
                    >
                      + {skill}
                    </Badge>
                  ))}
              </div>
              {/* Custom expertise input */}
              <div className="flex gap-2 mt-3">
                <Input
                  id="customExpertise"
                  placeholder="Add custom expertise..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value && !formData.expertise.includes(value)) {
                        setFormData({
                          ...formData,
                          expertise: [...formData.expertise, value],
                        });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.getElementById(
                      'customExpertise'
                    ) as HTMLInputElement;
                    const value = input?.value.trim();
                    if (value && !formData.expertise.includes(value)) {
                      setFormData({
                        ...formData,
                        expertise: [...formData.expertise, value],
                      });
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              {formData.isMentor && formData.expertise.length === 0 && (
                <span className="text-xs text-destructive mt-1">
                  Please select at least one expertise area
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                min="0"
                value={formData.yearsOfExperience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    yearsOfExperience: parseInt(e.target.value) || 0,
                  })
                }
                required={formData.isMentor}
              />
            </div>
            <div>
              <Label htmlFor="maxMentees">Max Mentees *</Label>
              <Input
                id="maxMentees"
                type="number"
                min="1"
                value={formData.maxMentees}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxMentees: parseInt(e.target.value) || 1,
                  })
                }
                required={formData.isMentor}
              />
            </div>
            {/* <div>
              <Label htmlFor="currentMenteeCount">Current Mentee Count</Label>
              <Input
                id="currentMenteeCount"
                type="number"
                min="0"
                value={formData.currentMenteeCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentMenteeCount: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div> */}
            <div>
              <Label htmlFor="preferredMeetingFrequency">
                Preferred Meeting Frequency *
              </Label>
              <Select
                value={formData.preferredMeetingFrequency}
                onValueChange={(value) =>
                  setFormData({ ...formData, preferredMeetingFrequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="twice-weekly">Twice Weekly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="mentorBio">Mentor Bio *</Label>
              <textarea
                id="mentorBio"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Tell potential mentees about yourself, your experience, and what you can offer..."
                value={formData.mentorBio}
                onChange={(e) =>
                  setFormData({ ...formData, mentorBio: e.target.value })
                }
                required={formData.isMentor}
              />
            </div>
          </>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Create User
        </Button>
      </div>
    </form>
  );
}

export default UserManagement;
