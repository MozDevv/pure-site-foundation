import { BookOpen, Clock, Award, MessageCircle, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockCourses = [
  {
    id: 1,
    title: "Introduction to AI & Machine Learning",
    progress: 75,
    totalLessons: 12,
    completedLessons: 9,
    nextLesson: "Neural Networks Basics",
    instructor: "Dr. Sarah Chen",
    status: "in-progress"
  },
  {
    id: 2,
    title: "Python Programming Fundamentals",
    progress: 100,
    totalLessons: 15,
    completedLessons: 15,
    nextLesson: "Course Completed",
    instructor: "Prof. Mike Johnson",
    status: "completed"
  },
  {
    id: 3,
    title: "Data Analytics with Python",
    progress: 30,
    totalLessons: 10,
    completedLessons: 3,
    nextLesson: "Data Visualization",
    instructor: "Dr. Emily Rodriguez",
    status: "in-progress"
  }
];

const upcomingEvents = [
  { date: "Dec 15", time: "2:00 PM", title: "AI Ethics Workshop", type: "workshop" },
  { date: "Dec 18", time: "10:00 AM", title: "Project Presentation", type: "presentation" },
  { date: "Dec 22", time: "3:00 PM", title: "Career Guidance Session", type: "session" }
];

export function StudentDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
            <p className="text-white/90 text-lg">
              Continue your journey in AI and technology
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">3</div>
            <div className="text-white/90">Active Courses</div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary-light to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold text-primary">68%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success-light to-success/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Courses</p>
                <p className="text-2xl font-bold text-success">1</p>
              </div>
              <Award className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent-light to-accent/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Study Hours</p>
                <p className="text-2xl font-bold text-accent">142</p>
              </div>
              <Clock className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-light to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assignments</p>
                <p className="text-2xl font-bold text-secondary">8/12</p>
              </div>
              <BookOpen className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Courses */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                My Courses
              </CardTitle>
              <CardDescription>
                Track your progress across all enrolled courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockCourses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-smooth">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Instructor: {course.instructor}
                      </p>
                      <Badge variant={course.status === 'completed' ? 'default' : 'secondary'}>
                        {course.status === 'completed' ? 'Completed' : 'In Progress'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{course.progress}%</div>
                      <div className="text-sm text-muted-foreground">
                        {course.completedLessons}/{course.totalLessons} lessons
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={course.progress} className="mb-3" />
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Next: </span>
                      <span className="font-medium">{course.nextLesson}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant={course.status === 'completed' ? 'outline' : 'hero'}
                      disabled={course.status === 'completed'}
                    >
                      {course.status === 'completed' ? 'View Certificate' : 'Continue'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-primary">{event.date}</div>
                    <div className="text-xs text-muted-foreground">{event.time}</div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {event.type}
                    </Badge>
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
              <Button variant="outline" className="w-full justify-start" size="sm">
                <MessageCircle className="mr-2 h-4 w-4" />
                Discussion Forum
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <BookOpen className="mr-2 h-4 w-4" />
                My Assignments
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Award className="mr-2 h-4 w-4" />
                Certificates
              </Button>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-success-light rounded-lg">
                <Award className="h-6 w-6 text-success" />
                <div>
                  <p className="font-medium text-sm">Python Fundamentals</p>
                  <p className="text-xs text-muted-foreground">Course completed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-accent-light rounded-lg">
                <TrendingUp className="h-6 w-6 text-accent" />
                <div>
                  <p className="font-medium text-sm">Study Streak</p>
                  <p className="text-xs text-muted-foreground">7 days in a row</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}