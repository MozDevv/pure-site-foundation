import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, User, Video } from "lucide-react";

interface TimetableEvent {
  id: number;
  title: string;
  course: string;
  tutor: string;
  day: string;
  startTime: string;
  endTime: string;
  color: string;
  joinLink?: string;
  type: string;
}

const mockEvents: TimetableEvent[] = [
  { id: 1, title: "AI Fundamentals", course: "Introduction to AI", tutor: "Dr. Sarah Chen", day: "Monday", startTime: "09:00", endTime: "11:00", color: "bg-blue-500", type: "Lecture" },
  { id: 2, title: "Python Basics", course: "Python Programming", tutor: "Prof. Mike Johnson", day: "Monday", startTime: "14:00", endTime: "16:00", color: "bg-green-500", type: "Workshop" },
  { id: 3, title: "Data Analysis", course: "Data Science", tutor: "Dr. Emily Rodriguez", day: "Tuesday", startTime: "10:00", endTime: "12:00", color: "bg-purple-500", type: "Practical" },
  { id: 4, title: "Neural Networks", course: "Introduction to AI", tutor: "Dr. Sarah Chen", day: "Wednesday", startTime: "09:00", endTime: "11:00", color: "bg-blue-500", type: "Lecture" },
  { id: 5, title: "Advanced Python", course: "Python Programming", tutor: "Prof. Mike Johnson", day: "Thursday", startTime: "13:00", endTime: "15:00", color: "bg-green-500", type: "Lab" },
  { id: 6, title: "ML Algorithms", course: "Introduction to AI", tutor: "Dr. Sarah Chen", day: "Friday", startTime: "10:00", endTime: "12:00", color: "bg-blue-500", type: "Lecture" },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export function WeeklyTimetable() {
  const [selectedEvent, setSelectedEvent] = useState<TimetableEvent | null>(null);
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterTutor, setFilterTutor] = useState<string>("all");

  const courses = Array.from(new Set(mockEvents.map(e => e.course)));
  const tutors = Array.from(new Set(mockEvents.map(e => e.tutor)));

  const filteredEvents = mockEvents.filter(event => {
    if (filterCourse !== "all" && event.course !== filterCourse) return false;
    if (filterTutor !== "all" && event.tutor !== filterTutor) return false;
    return true;
  });

  const getEventPosition = (event: TimetableEvent) => {
    const startHour = parseInt(event.startTime.split(":")[0]);
    const endHour = parseInt(event.endTime.split(":")[0]);
    const duration = endHour - startHour;
    return { start: startHour - 8, duration };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Timetable
              </CardTitle>
              <CardDescription>View and manage your class schedule</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterTutor} onValueChange={setFilterTutor}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by tutor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tutors</SelectItem>
                  {tutors.map(tutor => (
                    <SelectItem key={tutor} value={tutor}>{tutor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-6 gap-2">
                {/* Time column */}
                <div className="space-y-2">
                  <div className="h-12 flex items-center justify-center font-semibold text-sm">Time</div>
                  {timeSlots.map(time => (
                    <div key={time} className="h-16 flex items-center justify-center text-sm text-muted-foreground border-t">
                      {time}
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {days.map(day => (
                  <div key={day} className="space-y-2">
                    <div className="h-12 flex items-center justify-center font-semibold text-sm bg-muted/50 rounded-t-lg">
                      {day}
                    </div>
                    <div className="relative space-y-2">
                      {timeSlots.map((time, index) => (
                        <div key={time} className="h-16 border border-border rounded-md bg-muted/20" />
                      ))}
                      {/* Events overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        {filteredEvents
                          .filter(event => event.day === day)
                          .map(event => {
                            const { start, duration } = getEventPosition(event);
                            return (
                              <div
                                key={event.id}
                                className={`absolute left-0 right-0 ${event.color} text-white p-2 rounded-md shadow-md cursor-pointer pointer-events-auto hover:shadow-lg transition-smooth overflow-hidden`}
                                style={{
                                  top: `${start * 4.5}rem`,
                                  height: `${duration * 4.5 - 0.5}rem`,
                                }}
                                onClick={() => setSelectedEvent(event)}
                              >
                                <p className="font-semibold text-xs truncate">{event.title}</p>
                                <p className="text-xs opacity-90 truncate">{event.startTime} - {event.endTime}</p>
                                <Badge variant="secondary" className="text-xs mt-1 bg-white/20">
                                  {event.type}
                                </Badge>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>{selectedEvent?.course}</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{selectedEvent.day}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{selectedEvent.tutor}</span>
              </div>
              <div className="pt-4 space-y-2">
                <Button variant="hero" className="w-full">
                  <Video className="mr-2 h-4 w-4" />
                  Join Class
                </Button>
                <Button variant="outline" className="w-full">
                  View Course Materials
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
