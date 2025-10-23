import { BookOpen, Clock, Award, MessageCircle, TrendingUp, Calendar, Video, Code, FileText, Star } from "lucide-react";
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
    status: "in-progress",
    avgScore: 85,
    lastActivity: "2 hours ago"
  },
  {
    id: 2,
    title: "Python Programming Fundamentals",
    progress: 100,
    totalLessons: 15,
    completedLessons: 15,
    nextLesson: "Course Completed",
    instructor: "Prof. Mike Johnson",
    status: "completed",
    avgScore: 92,
    lastActivity: "3 days ago"
  },
  {
    id: 3,
    title: "Data Analytics with Python",
    progress: 30,
    totalLessons: 10,
    completedLessons: 3,
    nextLesson: "Data Visualization",
    instructor: "Dr. Emily Rodriguez",
    status: "in-progress",
    avgScore: 78,
    lastActivity: "1 day ago"
  }
];

const upcomingEvents = [
  { date: "Dec 15", time: "2:00 PM", title: "AI Ethics Workshop", type: "workshop" },
  { date: "Dec 18", time: "10:00 AM", title: "Project Presentation", type: "presentation" },
  { date: "Dec 22", time: "3:00 PM", title: "Career Guidance Session", type: "session" }
];

const skillBadges = [
  { name: "Python Master", icon: Code, earned: true },
  { name: "Quick Learner", icon: TrendingUp, earned: true },
  { name: "Assignment Champion", icon: Award, earned: true },
  { name: "7-Day Streak", icon: Star, earned: false }
];

const recentFeedback = [
  {
    course: "Python Programming",
    tutor: "Prof. Mike Johnson",
    feedback: "Excellent work on your final project! Your code is clean and well-documented.",
    grade: "A",
    date: "Dec 10"
  },
  {
    course: "AI & ML",
    tutor: "Dr. Sarah Chen",
    feedback: "Good progress on neural networks. Focus more on optimization techniques.",
    grade: "B+",
    date: "Dec 8"
  }
];

export function StudentDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section - Solid Color */}
      <div className="bg-primary rounded-xl p-8 text-primary-foreground shadow-primary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
            <p className="text-primary-foreground/90 text-lg">
              Continue your journey in AI and technology
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">3</div>
            <div className="text-primary-foreground/90">Active Courses</div>
          </div>
        </div>
      </div>

      {/* Progress Overview - Solid Colors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-primary-light border-primary/20 hover:shadow-primary transition-smooth">
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

        <Card className="bg-success-light border-success/20 hover:shadow-md transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold text-success">85%</p>
              </div>
              <Award className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent-light border-accent/20 hover:shadow-accent transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Study Hours</p>
                <p className="text-2xl font-bold text-accent-foreground">142</p>
              </div>
              <Clock className="h-8 w-8 text-accent-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-light border-secondary/20 hover:shadow-secondary transition-smooth">
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
        <div className="lg:col-span-2 space-y-6">
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
                <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-smooth bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Instructor: {course.instructor}
                      </p>
                      <div className="flex gap-2 mb-2">
                        <Badge variant={course.status === 'completed' ? 'default' : 'secondary'}>
                          {course.status === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                        <Badge variant="outline">Avg: {course.avgScore}%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Last activity: {course.lastActivity}</p>
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
                      variant={course.status === 'completed' ? 'outline' : 'default'}
                      disabled={course.status === 'completed'}
                      className="bg-primary text-primary-foreground hover:bg-primary-hover"
                    >
                      {course.status === 'completed' ? 'View Certificate' : 'Continue'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mentor Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Recent Feedback
              </CardTitle>
              <CardDescription>
                Latest feedback from your mentors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentFeedback.map((item, index) => (
                <div key={index} className="border-l-4 border-primary pl-4 py-3 bg-muted/50 rounded-r">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{item.course}</p>
                      <p className="text-xs text-muted-foreground">{item.tutor}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground">{item.grade}</Badge>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{item.feedback}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skill Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Skill Mastery Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {skillBadges.map((badge, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    badge.earned 
                      ? 'bg-success-light border border-success/20' 
                      : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <badge.icon className={`h-6 w-6 ${badge.earned ? 'text-success' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {badge.earned ? 'Earned' : 'Not yet earned'}
                    </p>
                  </div>
                  {badge.earned && <Award className="h-5 w-5 text-success" />}
                </div>
              ))}
            </CardContent>
          </Card>

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
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-smooth">
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
                <Video className="mr-2 h-4 w-4" />
                Join Live Session
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Code className="mr-2 h-4 w-4" />
                Coding Playground
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                My Assignments
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Award className="mr-2 h-4 w-4" />
                Certificates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}