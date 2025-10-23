import { BookOpen, Users, Calendar, TrendingUp, Clock, Plus, Upload, Edit, GraduationCap, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockCourses = [
  { id: 1, title: "Introduction to AI", students: 45, completion: 67, sessions: 12, pendingGrades: 5 },
  { id: 2, title: "Python for Beginners", students: 38, completion: 82, sessions: 15, pendingGrades: 2 },
  { id: 3, title: "Data Science Fundamentals", students: 29, completion: 54, sessions: 10, pendingGrades: 8 },
];

const upcomingSessions = [
  { date: "Dec 15", time: "2:00 PM", course: "Introduction to AI", students: 45, topic: "Neural Networks" },
  { date: "Dec 16", time: "10:00 AM", course: "Python for Beginners", students: 38, topic: "Object-Oriented Programming" },
  { date: "Dec 17", time: "3:00 PM", course: "Data Science Fundamentals", students: 29, topic: "Data Visualization" },
];

const mockStudents = [
  { id: 1, name: "John Doe", course: "Introduction to AI", progress: 75, avgScore: 85, lastActive: "2 hours ago" },
  { id: 2, name: "Sarah Johnson", course: "Python for Beginners", progress: 92, avgScore: 90, lastActive: "1 day ago" },
  { id: 3, name: "Mike Chen", course: "Data Science", progress: 45, avgScore: 72, lastActive: "3 days ago" },
  { id: 4, name: "Emma Wilson", course: "Introduction to AI", progress: 88, avgScore: 88, lastActive: "5 hours ago" },
];

const pendingSubmissions = [
  { student: "John Doe", course: "AI Course", assignment: "Neural Networks Project", submitted: "2 hours ago" },
  { student: "Mike Chen", course: "Data Science", assignment: "Data Visualization", submitted: "1 day ago" },
  { student: "Emma Wilson", course: "AI Course", assignment: "Ethics Essay", submitted: "3 hours ago" },
];

export function TutorDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section - Solid Color */}
      <div className="bg-secondary rounded-xl p-8 text-secondary-foreground shadow-secondary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, Dr. Sarah Chen!</h1>
            <p className="text-secondary-foreground/90 text-lg">Manage your courses and engage with students</p>
          </div>
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent-hover shadow-accent">
            <Plus className="mr-2 h-5 w-5" />
            Create New Course
          </Button>
        </div>
      </div>

      {/* Stats Overview - Solid Colors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-primary-light border-primary/20 hover:shadow-primary transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold text-primary">3</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-success-light border-success/20 hover:shadow-md transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-success">112</p>
              </div>
              <Users className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent-light border-accent/20 hover:shadow-accent transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessions This Week</p>
                <p className="text-2xl font-bold text-accent-foreground">8</p>
              </div>
              <Calendar className="h-8 w-8 text-accent-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-warning-light border-warning/20 hover:shadow-md transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Grades</p>
                <p className="text-2xl font-bold text-warning">15</p>
              </div>
              <TrendingUp className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="grading">Grading</TabsTrigger>
          <TabsTrigger value="content">Content Upload</TabsTrigger>
        </TabsList>

        {/* My Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    My Courses
                  </CardTitle>
                  <CardDescription>Manage and track your course performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockCourses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-smooth bg-card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {course.students} students
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {course.sessions} sessions
                            </span>
                          </div>
                          {course.pendingGrades > 0 && (
                            <Badge variant="secondary" className="bg-warning text-warning-foreground">
                              {course.pendingGrades} pending grades
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{course.completion}%</div>
                          <div className="text-sm text-muted-foreground">avg. completion</div>
                        </div>
                      </div>
                      <Progress value={course.completion} className="mb-3" />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Course
                        </Button>
                        <Button size="sm" variant="outline">
                          <Users className="mr-2 h-4 w-4" />
                          View Students
                        </Button>
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary-hover">
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Upcoming Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingSessions.map((session, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 py-2 bg-muted/50 rounded-r">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-primary">{session.date}</span>
                        <Badge variant="outline">{session.time}</Badge>
                      </div>
                      <p className="font-medium text-sm mb-1">{session.course}</p>
                      <p className="text-xs text-muted-foreground mb-2">{session.topic}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{session.students} enrolled</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary-hover">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Course
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Content
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Students
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Management
              </CardTitle>
              <CardDescription>View and manage students across all your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.course}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={student.progress} className="w-20" />
                          <span className="text-sm">{student.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-primary text-primary-foreground">{student.avgScore}%</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{student.lastActive}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Message</Button>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grading Tab */}
        <TabsContent value="grading">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Pending Submissions
              </CardTitle>
              <CardDescription>Review and grade student assignments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingSubmissions.map((submission, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-smooth bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{submission.student}</h4>
                      <p className="text-sm text-muted-foreground">{submission.course} - {submission.assignment}</p>
                      <p className="text-xs text-muted-foreground mt-1">Submitted: {submission.submitted}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Review</Button>
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary-hover">
                        Grade
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Upload Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Content Management
              </CardTitle>
              <CardDescription>Upload and manage course materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Course Content</h3>
                <p className="text-muted-foreground mb-6">
                  Add videos, PDFs, documents, and code snippets to your courses
                </p>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                  </Button>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Add Code Snippet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}