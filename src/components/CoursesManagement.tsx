import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  SmartDrawer,
  SmartDrawerContent,
  SmartDrawerDescription,
  SmartDrawerFooter,
  SmartDrawerHeader,
  SmartDrawerTitle,
} from '@/components/ui/smart-drawer';
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
  Lock,
  Unlock,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { CourseCreationStepper } from './course-creation-stepper';
import ProjectMembers from './ProjectMembers';
import { ViewToggle } from '@/components/ui/view-toggle';
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
import { useCurrency } from '@/hooks/useCurrency';
import { CurrencySelector } from '@/components/ui/currency-selector';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// Types
interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

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
  createdBy: string;
  createdAt: string;
  isOpen: boolean;
  enrolledStudents: UserSummary[];  // API returns full UserSummary objects
  tutors: UserSummary[];            // API returns full UserSummary objects
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const { formatPrice } = useCurrency();
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

  // Fetch current user to determine role
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiService.get(endpoints.getCurrentUser).then(res => res.data),
  });

  const isStudent = currentUser?.role === 'Student' || currentUser?.role === 'STUDENT';
  const canManage = !isStudent && !['Reviewer', 'REVIEWER'].includes(currentUser?.role || '');

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
      apiService.getWithParams(endpoints.getAllUsers, { pageNumber: 1, pageSize: 1000 }).then((res) => res.data),
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
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.response?.data || error?.message || 'Failed to create course';
      toast({ title: typeof message === 'string' ? message : 'Failed to create course', description: typeof message !== 'string' ? JSON.stringify(message) : undefined, variant: 'destructive' });
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiService.put(endpoints.updateCourse(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Course updated successfully', variant: 'default' });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update course';
      toast({ title: typeof msg === 'string' ? msg : 'Failed to update course', variant: 'destructive' });
    },
  });

  // Toggle course open/closed mutation
  const toggleOpenMutation = useMutation({
    mutationFn: (courseId: string) =>
      apiService.patch(endpoints.toggleCourseOpen(courseId), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Course status updated', variant: 'default' });
    },
    onError: (error: any) => {
      toast({ title: error?.response?.data?.message || 'Failed to update course status', variant: 'destructive' });
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
    onError: (error: any) => {
      toast({ title: error?.response?.data?.message || 'Failed to delete course', variant: 'destructive' });
    },
  });

  if (coursesLoading) {
    return <SkeletonPage />;
  }

  const courses: Course[] = coursesData || [];
  const users: User[] = usersData?.data || [];
  const students = users.filter((u) => u.role === 'Student');
  const tutors = users.filter((u) => u.role === 'Tutor');

  // Filter courses — students only see courses they are enrolled in
  const filteredCourses = courses.filter((course) => {
    // Role-based visibility: students only see their enrolled courses
    if (isStudent && currentUser?.id) {
      const enrolled = course.enrolledStudents?.some((s) => s.id === currentUser.id);
      if (!enrolled) return false;
    }
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

  const handleUpdateCourse = () => {
    if (!selectedCourse) return;
    const courseData = {
      ...formData,
      startDate: formData.startDate?.toISOString(),
      endDate: formData.endDate?.toISOString(),
    };
    updateCourseMutation.mutate({ id: selectedCourse.id, data: courseData });
  };

  const handleEditClick = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      code: course.code,
      title: course.title,
      shortDescription: course.shortDescription,
      description: course.description,
      category: course.category,
      priceCents: course.priceCents,
      startDate: course.startDate ? new Date(course.startDate) : undefined,
      endDate: course.endDate ? new Date(course.endDate) : undefined,
      enrolledStudentIds: course.enrolledStudents?.map((s) => s.id) || [],
      tutorIds: course.tutors?.map((t) => t.id) || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleViewClick = (course: Course) => {
    setSelectedCourse(course);
    // setIsViewDrawerOpen(true);
  };

  const handleDeleteClick = (courseId: string) => {
    setCourseToDelete(courseId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      deleteCourseMutation.mutate(courseToDelete);
    }
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
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

  const handleRefreshSelectedCourse = async () => {
    if (!selectedCourse) return;
    try {
      const res = await apiService.get(endpoints.getAllCourses);
      if (res.status === 200) {
        const updatedCourse = res.data.find(
          (c: Course) => c.id === selectedCourse.id
        );
        setSelectedCourse(updatedCourse);
      }
    } catch (error) {
      console.log('Error refreshing course:', error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="">
      {!selectedCourse ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isStudent ? 'My Courses' : 'Courses Management'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isStudent ? 'View your enrolled courses' : 'Manage and organize all courses'}
              </p>
            </div>
            {canManage && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                size="lg"
                variant="hero"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Course
              </Button>
            )}
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
                  Open Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {courses.filter((c) => c.isOpen !== false).length}
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Courses Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle>All Courses ({filteredCourses.length})</CardTitle>
                <CardDescription>
                  View and manage all courses in the system
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <CurrencySelector className="w-[130px]" />
                <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
              </div>
            </CardHeader>
            <CardContent>
              {coursesLoading ? (
                <SkeletonPage />
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No courses found. Create one to get started!
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCourses.map((course) => (
                    <Card key={course.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewClick(course)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="font-mono text-xs">{course.code}</Badge>
                          <div className="flex items-center gap-1.5">
                            <Badge variant={course.isOpen !== false ? 'default' : 'destructive'} className="text-xs">
                              {course.isOpen !== false ? 'Open' : 'Closed'}
                            </Badge>
                            <Badge variant="secondary">{course.category}</Badge>
                          </div>
                        </div>
                        <CardTitle className="text-lg mt-2">{course.title}</CardTitle>
                        {course.shortDescription && (
                          <CardDescription className="line-clamp-2">{course.shortDescription}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>{course.enrolledStudents?.length || 0} students</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-3.5 w-3.5" />
                            <span>{course.tutors?.length || 0} tutors</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold">{formatPrice(course.priceCents)}</span>
                          <span className="text-muted-foreground">
                            {course.startDate ? format(new Date(course.startDate), 'MMM yyyy') : 'TBD'}
                          </span>
                        </div>
                        {canManage && (
                          <div className="flex gap-1 mt-3 pt-3 border-t">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEditClick(course); }} title="Edit">
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleOpenMutation.mutate(course.id); }} title={course.isOpen !== false ? 'Close enrollment' : 'Open enrollment'}>
                              {course.isOpen !== false ? <Lock className="h-3.5 w-3.5 text-amber-500" /> : <Unlock className="h-3.5 w-3.5 text-green-500" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteClick(course.id); }} title="Delete">
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Start Date</TableHead>
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
                            <Badge variant={course.isOpen !== false ? 'default' : 'destructive'}>
                              {course.isOpen !== false ? 'Open' : 'Closed'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {formatPrice(course.priceCents)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {course.startDate
                              ? format(
                                  new Date(course.startDate),
                                  'MMM dd, yyyy'
                                )
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {course.enrolledStudents?.length || 0}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              {course.tutors?.length || 0}
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
                              {canManage && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditClick(course)}
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleOpenMutation.mutate(course.id)}
                                    title={course.isOpen !== false ? 'Close enrollment' : 'Open enrollment'}
                                  >
                                    {course.isOpen !== false
                                      ? <Lock className="h-4 w-4 text-amber-500" />
                                      : <Unlock className="h-4 w-4 text-green-500" />}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(course.id)}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
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
              )}
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Course</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this course? This action cannot be undone and will remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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
          <SmartDrawer
            open={isEditDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setIsEditDialogOpen(false);
                resetForm();
              }
            }}
          >
            <SmartDrawerContent defaultWidth={768}>
              <SmartDrawerHeader>
                <SmartDrawerTitle>Edit Course</SmartDrawerTitle>
                <SmartDrawerDescription>
                  Update the course information
                </SmartDrawerDescription>
              </SmartDrawerHeader>

              <div className="space-y-6 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                  onCheckedChange={() =>
                                    toggleStudent(student.id)
                                  }
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
                                  {tutor.firstName} {tutor.lastName} (
                                  {tutor.email})
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

              <SmartDrawerFooter>
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
              </SmartDrawerFooter>
            </SmartDrawerContent>
          </SmartDrawer>

          {/* View Course Drawer */}
        </div>
      ) : (
        <div className="w-full h-full overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              className="p-2 rounded hover:bg-muted transition"
              onClick={() => setSelectedCourse(null)}
              aria-label="Back"
            >
              {/* You can use any icon library, here is a simple left arrow SVG */}
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path
                  d="M13 16l-5-5 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div>
              <div className="text-2xl font-bold">{selectedCourse?.title}</div>
              <div className="text-muted-foreground text-sm">
                Course Code: {selectedCourse?.code}
              </div>
            </div>
          </div>

          {selectedCourse && (
            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Price</Label>
                        <p className="font-medium text-lg">
                          {formatPrice(selectedCourse.priceCents)}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      {selectedCourse.enrolledStudents?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProjectMembers
                      projectId={selectedCourse.id}
                      users={users}
                      members={users.filter((u) =>
                        selectedCourse.enrolledStudents?.some((s) => s.id === u.id)
                      )}
                      isStudents={true}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tutors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Assigned Tutors ({selectedCourse.tutors?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProjectMembers
                      projectId={selectedCourse.id}
                      users={users}
                      members={users.filter((u) =>
                        selectedCourse.tutors?.some((t) => t.id === u.id)
                      )}
                      isStudents={false}
                    />
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
                      No settings configured
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
        </div>
      )}
    </motion.div>
  );
}
