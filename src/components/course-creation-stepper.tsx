import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  SmartDrawer,
  SmartDrawerContent,
  SmartDrawerDescription,
  SmartDrawerHeader,
  SmartDrawerTitle,
} from '@/components/ui/smart-drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  BookOpen,
  FileText,
  Calendar as CalendarCheck,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

interface CourseCreationStepperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CourseFormData;
  setFormData: (data: CourseFormData) => void;
  students: User[];
  tutors: User[];
  categories: string[];
  onSubmit: () => void;
  onReset: () => void;
}

const steps = [
  { id: 1, name: 'Basic Info', icon: BookOpen },
  { id: 2, name: 'Description', icon: FileText },
  { id: 3, name: 'Schedule', icon: CalendarCheck },
  { id: 4, name: 'Assign People', icon: Users },
  { id: 5, name: 'Review', icon: CheckCircle2 },
];

export function CourseCreationStepper({
  open,
  onOpenChange,
  formData,
  setFormData,
  students,
  tutors,
  categories,
  onSubmit,
  onReset,
}: CourseCreationStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const stepErrors = getStepErrors(currentStep);
    if (Object.keys(stepErrors).length === 0) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      setErrors(stepErrors);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const stepErrors = getStepErrors(currentStep);
    if (Object.keys(stepErrors).length === 0) {
      onSubmit();
      setCurrentStep(1);
      setErrors({});
    } else {
      setErrors(stepErrors);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(1);
    setErrors({});
    onReset();
  };

  const getStepErrors = (step: number): Record<string, string> => {
    const errs: Record<string, string> = {};
    switch (step) {
      case 1:
        if (!formData.code?.trim()) errs.code = 'Course code is required';
        else if (formData.code.trim().length > 20) errs.code = 'Course code must be 20 characters or less';
        if (!formData.title?.trim()) errs.title = 'Course title is required';
        else if (formData.title.trim().length < 3) errs.title = 'Title must be at least 3 characters';
        if (!formData.category) errs.category = 'Please select a category';
        if (formData.priceCents < 0) errs.price = 'Price cannot be negative';
        break;
      case 3:
        if (formData.startDate && formData.endDate && formData.endDate < formData.startDate)
          errs.endDate = 'End date must be after start date';
        break;
    }
    return errs;
  };

  const validateStep = (step: number): boolean => {
    return Object.keys(getStepErrors(step)).length === 0;
  };

  const toggleStudent = (studentId: string) => {
    setFormData({
      ...formData,
      enrolledStudentIds: formData.enrolledStudentIds.includes(studentId)
        ? formData.enrolledStudentIds.filter((id) => id !== studentId)
        : [...formData.enrolledStudentIds, studentId],
    });
  };

  const toggleTutor = (tutorId: string) => {
    setFormData({
      ...formData,
      tutorIds: formData.tutorIds.includes(tutorId)
        ? formData.tutorIds.filter((id) => id !== tutorId)
        : [...formData.tutorIds, tutorId],
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                Course Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => {
                  setFormData({ ...formData, code: e.target.value });
                  if (errors.code) setErrors((prev) => { const { code, ...rest } = prev; return rest; });
                }}
                placeholder="e.g., CS101"
                className={errors.code ? 'border-destructive' : ''}
              />
              {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                Course Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors((prev) => { const { title, ...rest } = prev; return rest; });
                }}
                placeholder="e.g., Introduction to Web Development"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
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

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
                placeholder="Brief overview of the course"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (in dollars)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.priceCents / 100}
                onChange={(e) => {
                  const val = Math.round(Number(e.target.value) * 100);
                  setFormData({ ...formData, priceCents: val >= 0 ? val : 0 });
                  if (errors.price) setErrors((prev) => { const { price, ...rest } = prev; return rest; });
                }}
                placeholder="0.00"
                step="0.01"
                className={errors.price ? 'border-destructive' : ''}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detailed course description, objectives, and requirements"
                rows={12}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Provide a comprehensive overview of the course content, learning
                objectives, and prerequisites.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
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
              {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Enrolled Students
              </Label>
              <Card>
                <CardContent className="pt-4">
                  <ScrollArea className="h-[180px]">
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
                              className="text-sm font-medium leading-none cursor-pointer flex-1"
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

            <div className="space-y-4">
              <Label className="text-base font-semibold">Assign Tutors</Label>
              <Card>
                <CardContent className="pt-4">
                  <ScrollArea className="h-[180px]">
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
                              className="text-sm font-medium leading-none cursor-pointer flex-1"
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
        );

      case 5:
        return (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Course Code
                  </Label>
                  <p className="font-semibold text-lg">{formData.code}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground text-xs">Title</Label>
                  <p className="font-medium">{formData.title}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Category
                    </Label>
                    <Badge variant="secondary" className="mt-1">
                      {formData.category}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Price
                    </Label>
                    <p className="font-medium">
                      ${(formData.priceCents / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
                <Separator />
                {formData.shortDescription && (
                  <>
                    <div>
                      <Label className="text-muted-foreground text-xs">
                        Short Description
                      </Label>
                      <p className="text-sm">{formData.shortDescription}</p>
                    </div>
                    <Separator />
                  </>
                )}
                {formData.description && (
                  <>
                    <div>
                      <Label className="text-muted-foreground text-xs">
                        Full Description
                      </Label>
                      <p className="text-sm">{formData.description}</p>
                    </div>
                    <Separator />
                  </>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Start Date
                    </Label>
                    <p className="font-medium">
                      {formData.startDate
                        ? format(formData.startDate, 'PPP')
                        : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      End Date
                    </Label>
                    <p className="font-medium">
                      {formData.endDate
                        ? format(formData.endDate, 'PPP')
                        : 'Not set'}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Students Enrolled
                    </Label>
                    <p className="font-medium">
                      {formData.enrolledStudentIds.length}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Tutors Assigned
                    </Label>
                    <p className="font-medium">{formData.tutorIds.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <SmartDrawer open={open} onOpenChange={handleClose}>
      <SmartDrawerContent defaultWidth={900}>
        <SmartDrawerHeader>
          <SmartDrawerTitle>Create New Course</SmartDrawerTitle>
          <SmartDrawerDescription>
            Follow the steps to create a comprehensive course
          </SmartDrawerDescription>
        </SmartDrawerHeader>

        {/* Stepper */}
        <div className="py-4 px-4">
          <div className="flex items-center justify-between bg-primary/10 p-4 rounded-md">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center relative">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                        isCompleted &&
                          'bg-primary border-primary text-primary-foreground',
                        isCurrent && 'border-primary text-primary',
                        !isCompleted &&
                          !isCurrent &&
                          'border-muted text-muted-foreground'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs mt-1 font-medium',
                        isCurrent && 'text-primary',
                        !isCurrent && 'text-muted-foreground'
                      )}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-2 transition-colors',
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-4 px-4">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                variant="hero"
                disabled={!validateStep(currentStep)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} variant="hero">
                Create Course
                <Check className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </SmartDrawerContent>
    </SmartDrawer>
  );
}
