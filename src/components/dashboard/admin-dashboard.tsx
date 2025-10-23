import { useState } from "react";
import { Users, BookOpen, MessageSquare, TrendingUp, Search, Filter, Eye, Check, X, UserCheck, UserX, BarChart3, PieChart, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    educationLevel: "Bachelor's Degree",
    programmingExperience: "Intermediate",
    status: "Pending",
    appliedDate: "2024-12-01",
    cohort: "Unassigned",
    motivation: "I want to transition into AI development and contribute to solving real-world problems...",
    careerGoals: "To become an AI engineer and work on cutting-edge machine learning projects...",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 987-6543",
    educationLevel: "Master's Degree",
    programmingExperience: "Advanced",
    status: "Active",
    appliedDate: "2024-11-28",
    cohort: "AI Cohort 2024-A",
    motivation: "As a data scientist, I want to deepen my knowledge in AI and neural networks...",
    careerGoals: "To lead AI research projects and mentor other professionals in the field...",
  },
  {
    id: 3,
    name: "Mike Chen",
    email: "mike.chen@email.com",
    phone: "+1 (555) 456-7890",
    educationLevel: "High School",
    programmingExperience: "Beginner",
    status: "Suspended",
    appliedDate: "2024-11-25",
    cohort: "Python Basics 2024-B",
    motivation: "I'm interested in learning about AI and technology...",
    careerGoals: "To get a job in the tech industry...",
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma.wilson@email.com",
    phone: "+1 (555) 234-5678",
    educationLevel: "Bachelor's Degree",
    programmingExperience: "Intermediate",
    status: "Pending",
    appliedDate: "2024-12-03",
    cohort: "Unassigned",
    motivation: "I want to combine my background in psychology with AI to create better user experiences...",
    careerGoals: "To work on AI-powered applications that improve human-computer interaction...",
  },
];

const mockCohorts = [
  { id: 1, name: "AI Cohort 2024-A", students: 45, mentors: 3, startDate: "Jan 2024", status: "Active" },
  { id: 2, name: "Python Basics 2024-B", students: 38, mentors: 2, startDate: "Feb 2024", status: "Active" },
  { id: 3, name: "Data Science 2024-C", students: 29, mentors: 2, startDate: "Mar 2024", status: "Planning" },
];

export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      Pending: { variant: "secondary" as const, color: "bg-warning text-warning-foreground" },
      Active: { variant: "default" as const, color: "bg-success text-success-foreground" },
      Suspended: { variant: "destructive" as const, color: "bg-destructive text-destructive-foreground" }
    };
    
    const config = variants[status as keyof typeof variants] || variants.Pending;
    return <Badge variant={config.variant} className={config.color}>{status}</Badge>;
  };

  const approveUser = (userId: number) => {
    console.log(`Approving user ${userId}`);
  };

  const suspendUser = (userId: number) => {
    console.log(`Suspending user ${userId}`);
  };

  return (
    <div className="space-y-8">
      {/* Admin Header - Solid Color */}
      <div className="bg-primary rounded-xl p-8 text-primary-foreground shadow-primary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-primary-foreground/90 text-lg">
              Manage applications, cohorts, and oversee the TechAI Foundation program
            </p>
          </div>
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent-hover shadow-accent">
            <Download className="mr-2 h-5 w-5" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview - Solid Colors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-primary-light border-primary/20 hover:shadow-primary transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-primary">124</p>
                <p className="text-xs text-muted-foreground mt-1">↑ 12% from last month</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-success-light border-success/20 hover:shadow-md transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold text-success">89</p>
                <p className="text-xs text-muted-foreground mt-1">71.8% engagement rate</p>
              </div>
              <UserCheck className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-warning-light border-warning/20 hover:shadow-md transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-warning">23</p>
                <p className="text-xs text-muted-foreground mt-1">Requires review</p>
              </div>
              <TrendingUp className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent-light border-accent/20 hover:shadow-accent transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold text-accent-foreground">12</p>
                <p className="text-xs text-muted-foreground mt-1">3 cohorts running</p>
              </div>
              <BookOpen className="h-8 w-8 text-accent-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Students Management Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Management
              </CardTitle>
              <CardDescription>
                Review, approve, suspend, and manage all student accounts
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
                  onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
                  className={statusFilter === "pending" ? "bg-accent text-accent-foreground" : ""}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilter === "pending" ? "Pending Only" : "All Status"}
                </Button>
              </div>

              {/* Students Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Education</TableHead>
                      <TableHead>Cohort</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.educationLevel}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.cohort}</Badge>
                        </TableCell>
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
                                  <DialogTitle>Student Details - {selectedUser?.name}</DialogTitle>
                                  <DialogDescription>
                                    Complete application and enrollment information
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedUser && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-semibold mb-2">Contact Information</h4>
                                        <p><strong>Name:</strong> {selectedUser.name}</p>
                                        <p><strong>Email:</strong> {selectedUser.email}</p>
                                        <p><strong>Phone:</strong> {selectedUser.phone}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold mb-2">Enrollment Details</h4>
                                        <p><strong>Education:</strong> {selectedUser.educationLevel}</p>
                                        <p><strong>Programming:</strong> {selectedUser.programmingExperience}</p>
                                        <p><strong>Cohort:</strong> {selectedUser.cohort}</p>
                                        <p><strong>Status:</strong> {getStatusBadge(selectedUser.status)}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-semibold mb-2">Motivation</h4>
                                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                        {selectedUser.motivation}
                                      </p>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-semibold mb-2">Career Goals</h4>
                                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                        {selectedUser.careerGoals}
                                      </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                      {selectedUser.status === "Pending" && (
                                        <Button 
                                          className="bg-success text-success-foreground hover:bg-success/90"
                                          onClick={() => approveUser(selectedUser.id)}
                                        >
                                          <Check className="mr-2 h-4 w-4" />
                                          Approve
                                        </Button>
                                      )}
                                      {selectedUser.status !== "Suspended" && (
                                        <Button 
                                          variant="destructive" 
                                          onClick={() => suspendUser(selectedUser.id)}
                                        >
                                          <X className="mr-2 h-4 w-4" />
                                          Suspend
                                        </Button>
                                      )}
                                      <Button variant="outline">Assign Cohort</Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            {user.status === "Pending" && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => approveUser(user.id)}
                                  className="text-success hover:text-success hover:bg-success-light"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => suspendUser(user.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

        {/* Cohorts Management Tab */}
        <TabsContent value="cohorts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Cohort Management
                  </CardTitle>
                  <CardDescription>
                    Create, edit, and manage learning cohorts
                  </CardDescription>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
                  Create New Cohort
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockCohorts.map((cohort) => (
                <div key={cohort.id} className="border rounded-lg p-4 hover:shadow-md transition-smooth bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{cohort.name}</h3>
                        <Badge className={cohort.status === "Active" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                          {cohort.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {cohort.students} students
                        </span>
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-4 w-4" />
                          {cohort.mentors} mentors
                        </span>
                        <span>Started: {cohort.startDate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Assign Students</Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Overview
              </CardTitle>
              <CardDescription>
                View statistics and manage all courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Course Management</h3>
                <p className="text-muted-foreground mb-4">
                  View enrollment stats, completion rates, and course performance
                </p>
                <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
                  View All Courses
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Enrollment Trends
                </CardTitle>
                <CardDescription>
                  Monthly enrollment statistics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Enrollment chart visualization coming soon
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Completion Rates
                </CardTitle>
                <CardDescription>
                  Student progress and completion statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">AI Cohort 2024-A</span>
                      <span className="text-sm font-bold text-primary">78%</span>
                    </div>
                    <Progress value={78} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Python Basics 2024-B</span>
                      <span className="text-sm font-bold text-primary">85%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Data Science 2024-C</span>
                      <span className="text-sm font-bold text-primary">62%</span>
                    </div>
                    <Progress value={62} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Engagement Metrics
              </CardTitle>
              <CardDescription>
                Student engagement and activity metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-primary mb-2">71.8%</p>
                  <p className="text-sm text-muted-foreground">Active Users Rate</p>
                </div>
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-success mb-2">4.2</p>
                  <p className="text-sm text-muted-foreground">Avg Hours/Week</p>
                </div>
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-accent-foreground mb-2">89%</p>
                  <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Manage system settings, branding, and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">System Settings</h3>
                <p className="text-muted-foreground mb-4">
                  Configure branding, email templates, role permissions, and automated reports
                </p>
                <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
                  Open Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}