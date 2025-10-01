import { BookOpen, Users, Calendar, TrendingUp, Clock, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const mockCourses = [
  { id: 1, title: "Introduction to AI", students: 45, completion: 67, sessions: 12 },
  { id: 2, title: "Python for Beginners", students: 38, completion: 82, sessions: 15 },
  { id: 3, title: "Data Science Fundamentals", students: 29, completion: 54, sessions: 10 },
];

const upcomingSessions = [
  { date: "Dec 15", time: "2:00 PM", course: "Introduction to AI", students: 45, topic: "Neural Networks" },
  { date: "Dec 16", time: "10:00 AM", course: "Python for Beginners", students: 38, topic: "Object-Oriented Programming" },
  { date: "Dec 17", time: "3:00 PM", course: "Data Science Fundamentals", students: 29, topic: "Data Visualization" },
];

export function TutorDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, Tutor!</h1>
            <p className="text-white/90 text-lg">Manage your courses and engage with students</p>
          </div>
          <Button variant="secondary" size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
            <Plus className="mr-2 h-5 w-5" />
            Create New Course
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary-light to-primary/10">
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

        <Card className="bg-gradient-to-br from-success-light to-success/10">
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

        <Card className="bg-gradient-to-br from-accent-light to-accent/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessions This Week</p>
                <p className="text-2xl font-bold text-accent">8</p>
              </div>
              <Calendar className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning-light to-warning/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Completion</p>
                <p className="text-2xl font-bold text-warning">68%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Courses */}
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
                <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-smooth">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.students} students
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.sessions} sessions
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{course.completion}%</div>
                      <div className="text-sm text-muted-foreground">avg. completion</div>
                    </div>
                  </div>
                  <Progress value={course.completion} className="mb-3" />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Students</Button>
                    <Button size="sm" variant="outline">Edit Course</Button>
                    <Button size="sm" variant="hero">Schedule Session</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
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
                <div key={index} className="border-l-4 border-primary pl-4 py-2">
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
              <Button variant="hero" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Session
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                View All Students
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
