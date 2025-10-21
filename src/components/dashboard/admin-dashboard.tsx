import { useState } from 'react';
import {
  Users,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Check,
  X,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    educationLevel: "Bachelor's Degree",
    programmingExperience: 'Intermediate',
    status: 'Applied',
    appliedDate: '2024-12-01',
    motivation:
      'I want to transition into AI development and contribute to solving real-world problems...',
    careerGoals:
      'To become an AI engineer and work on cutting-edge machine learning projects...',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 987-6543',
    educationLevel: "Master's Degree",
    programmingExperience: 'Advanced',
    status: 'Approved',
    appliedDate: '2024-11-28',
    motivation:
      'As a data scientist, I want to deepen my knowledge in AI and neural networks...',
    careerGoals:
      'To lead AI research projects and mentor other professionals in the field...',
  },
  {
    id: 3,
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    phone: '+1 (555) 456-7890',
    educationLevel: 'High School',
    programmingExperience: 'Beginner',
    status: 'Rejected',
    appliedDate: '2024-11-25',
    motivation: "I'm interested in learning about AI and technology...",
    careerGoals: 'To get a job in the tech industry...',
  },
  {
    id: 4,
    name: 'Emma Wilson',
    email: 'emma.wilson@email.com',
    phone: '+1 (555) 234-5678',
    educationLevel: "Bachelor's Degree",
    programmingExperience: 'Intermediate',
    status: 'Applied',
    appliedDate: '2024-12-03',
    motivation:
      'I want to combine my background in psychology with AI to create better user experiences...',
    careerGoals:
      'To work on AI-powered applications that improve human-computer interaction...',
  },
];

export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<
    (typeof mockUsers)[0] | null
  >(null);

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || user.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      Applied: 'secondary',
      Approved: 'default',
      Rejected: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const approveUser = (userId: number) => {
    // Mock approval - in real app would make API call
    console.log(`Approving user ${userId}`);
  };

  const rejectUser = (userId: number) => {
    // Mock rejection - in real app would make API call
    console.log(`Rejecting user ${userId}`);
  };

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-primary rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-white/90 text-lg">
              Manage applications and oversee the TechAI program
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary-light to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Applications
                </p>
                <p className="text-2xl font-bold text-primary">124</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success-light to-success/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Approved Students
                </p>
                <p className="text-2xl font-bold text-success">89</p>
              </div>
              <Check className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning-light to-warning/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-warning">23</p>
              </div>
              <TrendingUp className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent-light to-accent/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Courses
                </p>
                <p className="text-2xl font-bold text-accent">12</p>
              </div>
              <BookOpen className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="courses">Course Management</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Applications
              </CardTitle>
              <CardDescription>
                Review and manage student applications to the TechAI program
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setStatusFilter(
                      statusFilter === 'applied' ? 'all' : 'applied'
                    )
                  }
                  className={
                    statusFilter === 'applied'
                      ? 'bg-accent text-accent-foreground'
                      : ''
                  }
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilter === 'applied' ? 'Pending Only' : 'All Status'}
                </Button>
              </div>

              {/* Applications Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Education</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.educationLevel}</TableCell>
                        <TableCell>{user.programmingExperience}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{user.appliedDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Application Details - {selectedUser?.name}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Review the complete application information
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedUser && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-semibold mb-2">
                                          Contact Information
                                        </h4>
                                        <p>
                                          <strong>Name:</strong>{' '}
                                          {selectedUser.name}
                                        </p>
                                        <p>
                                          <strong>Email:</strong>{' '}
                                          {selectedUser.email}
                                        </p>
                                        <p>
                                          <strong>Phone:</strong>{' '}
                                          {selectedUser.phone}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold mb-2">
                                          Background
                                        </h4>
                                        <p>
                                          <strong>Education:</strong>{' '}
                                          {selectedUser.educationLevel}
                                        </p>
                                        <p>
                                          <strong>Programming:</strong>{' '}
                                          {selectedUser.programmingExperience}
                                        </p>
                                        <p>
                                          <strong>Status:</strong>{' '}
                                          {getStatusBadge(selectedUser.status)}
                                        </p>
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Motivation
                                      </h4>
                                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                        {selectedUser.motivation}
                                      </p>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">
                                        Career Goals
                                      </h4>
                                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                        {selectedUser.careerGoals}
                                      </p>
                                    </div>

                                    {selectedUser.status === 'Applied' && (
                                      <div className="flex gap-3 pt-4">
                                        <Button
                                          variant="success"
                                          onClick={() =>
                                            approveUser(selectedUser.id)
                                          }
                                        >
                                          <Check className="mr-2 h-4 w-4" />
                                          Approve
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() =>
                                            rejectUser(selectedUser.id)
                                          }
                                        >
                                          <X className="mr-2 h-4 w-4" />
                                          Reject
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {user.status === 'Applied' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => approveUser(user.id)}
                                  className="text-success hover:text-success"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => rejectUser(user.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Course Management Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Management
              </CardTitle>
              <CardDescription>
                Create and manage courses for the TechAI program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Course Management Coming Soon
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create, edit, and manage course content and modules
                </p>
                <Button variant="hero">Create New Course</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Announcements
              </CardTitle>
              <CardDescription>
                Send updates and announcements to students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Announcements Panel
                </h3>
                <p className="text-muted-foreground mb-4">
                  Send important updates and messages to all students
                </p>
                <Button variant="hero">Create Announcement</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics & Reports
              </CardTitle>
              <CardDescription>
                View program statistics and student progress analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Analytics Dashboard
                </h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive reports on student engagement and course
                  performance
                </p>
                <Button variant="hero">View Reports</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
