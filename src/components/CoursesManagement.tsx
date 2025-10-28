import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  CalendarIcon,
  Users,
  GraduationCap,
  BookOpen,
  Filter,
  DollarSign,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { CourseCreationStepper } from './course-creation-stepper';

// Types
interface Course {
  id: string;
  code: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  priceCents: number;
  startDate: string;
  endDate: string;
  settings: string;
  createdBy: string;
  createdAt: string;
  enrolledStudentIds: string[];
  tutorIds: string[];
}

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface CourseFormData {
  code: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  priceCents: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
  enrolledStudentIds: string[];
  tutorIds: string[];
}

const categories = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Cloud Computing',
  'DevOps',
  'Cybersecurity',
  'UI/UX Design',
  'Database Management',
  'Software Engineering',
];

export default function CoursesManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    code: '',
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    priceCents: 0,
    startDate: undefined,
    endDate: undefined,
    enrolledStudentIds: [],
    tutorIds: [],
  });

  // Fetch courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () =>
      apiService.get(endpoints.getAllCourses).then((res) => res.data),
  });

  // Fetch all users for student and tutor selection
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () =>
      apiService.get(endpoints.getAllUsers).then((res) => res.data),
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: (courseData: any) =>
      apiService.post(endpoints.createCourse, courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Course created successfully', variant: 'default' });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Failed to create course', variant: 'destructive' });
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiService.post(endpoints.updateCourse, { id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Course updated successfully', variant: 'default' });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Failed to update course', variant: 'destructive' });
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: (courseId: string) =>
      apiService.delete(endpoints.deleteCourse(courseId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Course deleted successfully', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'Failed to delete course', variant: 'destructive' });
    },
  });

  const courses: Course[] = coursesData || [];
  const users: User[] = usersData?.data || [];
  const students = users.filter((u) => u.role === 'Student');
  const tutors = users.filter((u) => u.role === 'Tutor');

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      shortDescription: '',
      description: '',
      category: '',
      priceCents: 0,
      startDate: undefined,
      endDate: undefined,
      enrolledStudentIds: [],
      tutorIds: [],
    });
  };

  const handleCreateCourse = () => {
    if (!formData.title || !formData.code || !formData.category) {
      toast({
        title: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const courseData = {
      ...formData,
      startDate: formData.startDate?.toISOString(),
      endDate: formData.endDate?.toISOString(),
    };

    createCourseMutation.mutate(courseData);
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;

    const courseData = {
      ...formData,
      startDate: formData.startDate?.toISOString(),
      endDate: formData.endDate?.toISOString(),
    };

    try {
      const res = await apiService.post(endpoints.updateCourse, {
        id: selectedCourse.id,
        ...courseData,
      });
      if (res.status === 200) {
        toast({ title: 'Course updated successfully', variant: 'default' });
      }
    } catch (error) {
      console.log('Error updating course:', error);
      toast({ title: 'Failed to update course', variant: 'destructive' });
    }

    // updateCourseMutation.mutate({ id: selectedCourse.id, data: courseData });
  };

  const handleEditClick = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      id: course.id,
      code: course.code,
      title: course.title,
      shortDescription: course.shortDescription,
      description: course.description,
      category: course.category,
      priceCents: course.priceCents,
      startDate: course.startDate ? new Date(course.startDate) : undefined,
      endDate: course.endDate ? new Date(course.endDate) : undefined,
      enrolledStudentIds: course.enrolledStudentIds || [],
      tutorIds: course.tutorIds || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleViewClick = (course: Course) => {
    setSelectedCourse(course);
    setIsViewDrawerOpen(true);
  };

  const handleDeleteClick = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  const toggleStudent = (studentId: string) => {
    setFormData((prev) => ({
      ...prev,
      enrolledStudentIds: prev.enrolledStudentIds.includes(studentId)
        ? prev.enrolledStudentIds.filter((id) => id !== studentId)
        : [...prev.enrolledStudentIds, studentId],
    }));
  };

  const toggleTutor = (tutorId: string) => {
    setFormData((prev) => ({
      ...prev,
      tutorIds: prev.tutorIds.includes(tutorId)
        ? prev.tutorIds.filter((id) => id !== tutorId)
        : [...prev.tutorIds, tutorId],
    }));
  };

  const getUserById = (userId: string) => users.find((u) => u.id === userId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Courses Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize all courses
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          size="lg"
          variant="hero"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Course
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                courses.filter((c) => new Date(c.startDate) <= new Date())
                  .length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tutors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tutors.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses ({filteredCourses.length})</CardTitle>
          <CardDescription>
            View and manage all courses in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coursesLoading ? (
            <div className="text-center py-8">Loading courses...</div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No courses found. Create one to get started!
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Tutors</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-mono font-medium">
                        {course.code}
                      </TableCell>
                      <TableCell className="font-medium">
                        {course.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{course.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {(course.priceCents / 100).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {course.startDate
                          ? format(new Date(course.startDate), 'MMM dd, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {course.endDate
                          ? format(new Date(course.endDate), 'MMM dd, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course.enrolledStudentIds?.length || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {course.tutorIds?.length || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewClick(course)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(course.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Course Stepper */}
      <CourseCreationStepper
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        formData={formData}
        setFormData={setFormData}
        students={students}
        tutors={tutors}
        categories={categories}
        onSubmit={handleCreateCourse}
        onReset={resetForm}
      />

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditDialogOpen(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update the course information</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">
                    Course Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="e.g., CS101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Course Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Introduction to Web Development"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shortDescription: e.target.value,
                    })
                  }
                  placeholder="Brief overview of the course"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Detailed course description, objectives, and requirements"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (in dollars)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.priceCents / 100}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceCents: Number(e.target.value) * 100,
                    })
                  }
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Schedule</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? (
                          format(formData.startDate, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) =>
                          setFormData({ ...formData, startDate: date })
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? (
                          format(formData.endDate, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) =>
                          setFormData({ ...formData, endDate: date })
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Enrolled Students */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Enrolled Students</h3>
              <Card>
                <CardContent className="pt-4">
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {students.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No students available
                        </p>
                      ) : (
                        students.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`student-${student.id}`}
                              checked={formData.enrolledStudentIds.includes(
                                student.id
                              )}
                              onCheckedChange={() => toggleStudent(student.id)}
                            />
                            <label
                              htmlFor={`student-${student.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {student.firstName} {student.lastName} (
                              {student.email})
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formData.enrolledStudentIds.length} student(s) selected
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tutors */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Assign Tutors</h3>
              <Card>
                <CardContent className="pt-4">
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {tutors.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No tutors available
                        </p>
                      ) : (
                        tutors.map((tutor) => (
                          <div
                            key={tutor.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`tutor-${tutor.id}`}
                              checked={formData.tutorIds.includes(tutor.id)}
                              onCheckedChange={() => toggleTutor(tutor.id)}
                            />
                            <label
                              htmlFor={`tutor-${tutor.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {tutor.firstName} {tutor.lastName} ({tutor.email})
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formData.tutorIds.length} tutor(s) selected
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCourse} variant="hero">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Course Drawer */}
      <Sheet open={isViewDrawerOpen} onOpenChange={setIsViewDrawerOpen}>
        <SheetContent className="w-[600px] sm:w-[700px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedCourse?.title}</SheetTitle>
            <SheetDescription>
              Course Code: {selectedCourse?.code}
            </SheetDescription>
          </SheetHeader>

          {selectedCourse && (
            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="tutors">Tutors</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Category</Label>
                      <p className="font-medium">{selectedCourse.category}</p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">
                        Short Description
                      </Label>
                      <p className="font-medium">
                        {selectedCourse.shortDescription}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">
                        Full Description
                      </Label>
                      <p className="text-sm">{selectedCourse.description}</p>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Price</Label>
                        <p className="font-medium text-lg">
                          ${(selectedCourse.priceCents / 100).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Created At
                        </Label>
                        <p className="font-medium">
                          {format(
                            new Date(selectedCourse.createdAt),
                            'MMM dd, yyyy'
                          )}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">
                          Start Date
                        </Label>
                        <p className="font-medium">
                          {selectedCourse.startDate
                            ? format(
                                new Date(selectedCourse.startDate),
                                'MMM dd, yyyy'
                              )
                            : 'Not set'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          End Date
                        </Label>
                        <p className="font-medium">
                          {selectedCourse.endDate
                            ? format(
                                new Date(selectedCourse.endDate),
                                'MMM dd, yyyy'
                              )
                            : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="students" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Enrolled Students (
                      {selectedCourse.enrolledStudentIds?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCourse.enrolledStudentIds?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No students enrolled yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {selectedCourse.enrolledStudentIds?.map((studentId) => {
                          const student = getUserById(studentId);
                          return student ? (
                            <div
                              key={studentId}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {student.email}
                                </p>
                              </div>
                              <Badge variant="secondary">{student.role}</Badge>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tutors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Assigned Tutors ({selectedCourse.tutorIds?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCourse.tutorIds?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No tutors assigned yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {selectedCourse.tutorIds?.map((tutorId) => {
                          const tutor = getUserById(tutorId);
                          return tutor ? (
                            <div
                              key={tutorId}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">
                                  {tutor.firstName} {tutor.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {tutor.email}
                                </p>
                              </div>
                              <Badge variant="secondary">{tutor.role}</Badge>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Settings</CardTitle>
                    <CardDescription>
                      Configuration and metadata (JSON format)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      {selectedCourse.settings || 'No settings configured'}
                    </pre>
                  </CardContent>
                </Card>

                {/* Placeholder for future features */}
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-muted-foreground">
                      Future Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Course Analytics & Engagement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Cohort Management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>Visibility Controls (Draft/Published)</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
