import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
} from 'lucide-react';
import { toast } from 'sonner';

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

  // Fetch users data
  const {
    data: usersData,
    isLoading,
    refetch,
  } = useQuery<UsersResponse>({
    queryKey: ['users', currentPage],
    queryFn: async () => {
      const response = await apiService.getWithParams(endpoints.getAllUsers, {
        page: currentPage,
        pageSize: 10,
      });
      return response.data;
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
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`
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
      usersData?.data?.filter((u) => u.status === 'REGISTERED_NOT_CONFIRMED')
        .length || 0,
    tutors: usersData?.data?.filter((u) => u.role === 'TUTOR').length || 0,
  };

  const getStatusBadge = (user: User) => {
    if (!user.accountNonLocked) {
      return <Badge variant="destructive">Locked</Badge>;
    }
    if (user.status === 'REGISTERED_NOT_CONFIRMED') {
      return <Badge className="bg-[#FFD54F] text-black">Pending</Badge>;
    }
    if (user.enabled) {
      return <Badge className="bg-green-500 text-white">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-[#6A1B9A] text-white',
      TUTOR: 'bg-[#1E3A8A] text-white',
      Student: 'bg-[#FFD54F] text-black',
    };
    return (
      <Badge className={colors[role] || 'bg-gray-500 text-white'}>{role}</Badge>
    );
  };

  const handleAction = (
    user: User,
    action: 'lock' | 'unlock' | 'approve' | 'suspend'
  ) => {
    setSelectedUser(user);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const approveStudentApplication = async (userId: string) => {
    try {
      const res = await apiService.post(
        endpoints.approveStudentApplication(userId)
      );
      if (res.status === 200) {
        toast.success('Student application approved successfully');
      }
    } catch (error) {
      toast.error('Failed to approve student application');
    }
  };
  const confirmAction = async () => {
    if (!selectedUser) return;

    try {
      if (actionType === 'approve') {
        await approveStudentApplication(selectedUser.id);
      }
    } catch (error) {
      toast.error(`Failed to ${actionType} user`);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-[#1E3A8A]" />
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
            <XCircle className="h-4 w-4 text-[#FFD54F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tutors</CardTitle>
            <Users className="h-4 w-4 text-[#6A1B9A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tutors}</div>
          </CardContent>
        </Card>
      </div>

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
              <Dialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-[#1E3A8A] hover:bg-[#1A3173] text-white">
                    <UserPlus className="h-4 w-4" />
                    Create User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new user to the system
                    </DialogDescription>
                  </DialogHeader>
                  <CreateUserForm
                    rolesData={rolesData}
                    onClose={() => setCreateDialogOpen(false)}
                    onSuccess={refetch}
                  />
                </DialogContent>
              </Dialog>
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
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="REGISTERED_NOT_CONFIRMED">
                  Pending
                </SelectItem>
                <SelectItem value="LOCKED">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
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
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
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
                        {user.role === 'Student' &&
                          user.status === 'REGISTERED_NOT_CONFIRMED' && (
                            <Button
                              size="sm"
                              onClick={() => handleAction(user, 'approve')}
                              className="gap-1 bg-green-500 hover:bg-green-600 text-white"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Approve
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
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
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-5xl min-h-[75vh] overflow-y-auto">
          {selectedUser && (
            <ViewUserDialog user={selectedUser} onAction={handleAction} />
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionType} user "
              {selectedUser?.username}"? This action can be reversed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className="bg-[#1E3A8A] hover:bg-[#1A3173]"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
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
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
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
        </DialogTitle>
      </DialogHeader>

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
          <div className="grid grid-cols-2 gap-4 text-base">
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <p>Classes Assigned (Coming Soon)</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No additional profile information available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {user.role === 'Student' ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Progress Summary</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8 text-muted-foreground">
                  <p>Progress tracking (Coming Soon)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment History</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8 text-muted-foreground">
                  <p>Payment records (Coming Soon)</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Activity logs (Coming Soon)</p>
            </div>
          )}
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    //take the roleId based on the role selected

    e.preventDefault();
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            required
          />
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
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
          />
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
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[#1E3A8A] hover:bg-[#1A3173] text-white"
        >
          Create User
        </Button>
      </div>
    </form>
  );
}

export default UserManagement;
