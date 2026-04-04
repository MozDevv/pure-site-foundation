import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { API_BASE_URL, apiService, endpoints } from '@/lib/api';
import { CheckCircle, ArrowLeft, Loader2, CalendarIcon, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ApplicationSuccess } from './application-success';
import axios from 'axios';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  SearchableSelect,
  MultiSelectSearch,
  InstitutionSearch,
  SuggestTextarea,
} from '@/components/ui/searchable-inputs';
import { PhoneInput, isValidPhoneNumber, normalizePhoneNumber } from '@/components/ui/phone-input';
import {
  COUNTRIES,
  FIELDS_OF_STUDY,
  PROGRAMMING_LANGUAGES,
  TECH_INTERESTS,
  INSTITUTIONS,
  MOTIVATION_SUGGESTIONS,
  CAREER_GOAL_SUGGESTIONS,
} from '@/lib/application-data';

const STORAGE_KEY = 'techai_application_progress';

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

const applicationSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string()
    .min(1, 'Email address is required')
    .regex(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address (e.g. name@gmail.com, user@outlook.com)'
    ),
  phone: z.string()
    .min(7, 'Phone number is too short')
    .refine((val) => isValidPhoneNumber(val), {
      message: 'Please enter a valid phone number',
    }),
  dateOfBirth: z.date({ required_error: 'Please select your date of birth' }).refine(
    (date) => calculateAge(date) >= 16,
    'You must be at least 16 years old'
  ),
  location: z.string().min(2, 'Please select your country'),
  applyingAs: z.enum(['Student', 'Mentor', 'Tutor'], {
    required_error: 'Please select your role (Student, Mentor, or Tutor)',
  }),

  // Education Background
  educationLevel: z.string().min(1, 'Please select your education level'),
  fieldOfStudy: z.string().optional(),
  institutionName: z.string().optional(),

  // Technical Background
  programmingExperience: z
    .string()
    .min(1, 'Please select your programming experience'),
  programmingLanguages: z.string().optional(),
  techInterests: z.string().optional(),

  // Motivation & Goals
  motivation: z.string().optional(),
  careerGoals: z.string().optional(),
  availableHours: z.string().min(1, 'Please select your available hours'),

  // Additional Information
  portfolioLinks: z.string().optional(),
  hearAboutUs: z.string().min(1, 'Please tell us how you heard about us'),
  additionalInfo: z.string().optional(),

  // Agreements
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
  receiveUpdates: z.boolean().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export function ApplicationForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] =
    useState<ApplicationFormData | null>(null);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const totalSteps = 5;

  // Load saved progress from localStorage
  const getSavedProgress = useCallback((): Partial<ApplicationFormData> & { _step?: number } | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Restore dateOfBirth as Date object
      if (parsed.dateOfBirth) {
        parsed.dateOfBirth = new Date(parsed.dateOfBirth);
      }
      return parsed;
    } catch {
      return null;
    }
  }, []);

  const savedProgress = getSavedProgress();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      firstName: savedProgress?.firstName || '',
      lastName: savedProgress?.lastName || '',
      email: savedProgress?.email || '',
      phone: savedProgress?.phone || '',
      dateOfBirth: savedProgress?.dateOfBirth || undefined,
      location: savedProgress?.location || '',
      applyingAs: savedProgress?.applyingAs || 'Student',
      educationLevel: savedProgress?.educationLevel || '',
      fieldOfStudy: savedProgress?.fieldOfStudy || '',
      institutionName: savedProgress?.institutionName || '',
      programmingExperience: savedProgress?.programmingExperience || '',
      programmingLanguages: savedProgress?.programmingLanguages || '',
      techInterests: savedProgress?.techInterests || '',
      motivation: savedProgress?.motivation || '',
      careerGoals: savedProgress?.careerGoals || '',
      availableHours: savedProgress?.availableHours || '',
      portfolioLinks: savedProgress?.portfolioLinks || '',
      hearAboutUs: savedProgress?.hearAboutUs || '',
      additionalInfo: savedProgress?.additionalInfo || '',
      receiveUpdates: savedProgress?.receiveUpdates || false,
      agreeTerms: false, // never restore this — user must re-agree
    },
  });

  // Restore step from saved progress
  useEffect(() => {
    if (!hasRestoredProgress && savedProgress?._step) {
      setStep(savedProgress._step);
      setHasRestoredProgress(true);
      toast({ title: 'Progress restored', description: 'Your previous application progress has been restored.', duration: 3000 });
    }
  }, [hasRestoredProgress, savedProgress]);

  // Auto-save form progress on changes
  const saveProgress = useCallback(() => {
    const values = form.getValues();
    const toSave = { ...values, _step: step };
    // Serialize Date
    if (toSave.dateOfBirth instanceof Date) {
      (toSave as any).dateOfBirth = toSave.dateOfBirth.toISOString();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [form, step]);

  const watchApplyingAs = form.watch('applyingAs');
  const watchEducationLevel = form.watch('educationLevel');
  const watchDateOfBirth = form.watch('dateOfBirth');

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);

    try {
      // Step 1: Register the user first
      const isMentor = data.applyingAs === 'Mentor';
      const isTutor = data.applyingAs === 'Tutor';
      
      // Generate a secure random password (users will set their own via email verification)
      const array = new Uint8Array(18);
      crypto.getRandomValues(array);
      const randomPassword = Array.from(array, b => b.toString(36).padStart(2, '0')).join('').slice(0, 24);
      
      const registrationData = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.email, // Use email as username
        role: data.applyingAs, // 'Student', 'Mentor', or 'Tutor'
        isMentor: isMentor,
        phoneNumber: normalizePhoneNumber(data.phone),
        age: String(calculateAge(data.dateOfBirth)),
        dateOfBirth: format(data.dateOfBirth, 'yyyy-MM-dd'),
        location: data.location,
        password: randomPassword,
        profilePicture: '',
        status: 'EMAIL_NOT_CONFIRMED',
      };

      const registrationRes = await axios.post(
        `${API_BASE_URL}${endpoints.register}`,
        registrationData
      );
      
      if (registrationRes.status !== 200 && registrationRes.status !== 201) {
        throw new Error('Registration failed');
      }

      const userId = registrationRes.data.id;
      const registrationToken = registrationRes.data.token;
      localStorage.setItem('userId', userId);

      // Step 2: Create the user profile with additional information
      // Use the JWT token from registration to authenticate the profile creation request
      const profileData = {
        userId,
        educationLevel: data.educationLevel,
        fieldOfStudy: data.fieldOfStudy,
        institutionName: data.institutionName,
        programmingExperience: data.programmingExperience,
        programmingLanguages: data.programmingLanguages,
        techInterests: data.techInterests,
        motivation: data.motivation,
        careerGoals: data.careerGoals,
        availableHours: data.availableHours,
        portfolioLinks: data.portfolioLinks,
        hearAboutUs: data.hearAboutUs,
        additionalInfo: data.additionalInfo,
        agreeTerms: data.agreeTerms,
        receiveUpdates: data.receiveUpdates,
      };

      const profileRes = await axios.post(
        `${API_BASE_URL}${endpoints.createProfile}`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${registrationToken}`,
          },
        }
      );
      
      if (profileRes.status === 201 || profileRes.status === 200) {
        setSubmittedData(data);
        setIsSubmitted(true);
        
        // Clear saved progress
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('applicationStep1');
        
        toast({
          title: 'Application Submitted Successfully!',
          description: 'A verification email has been sent to your inbox. Please also check your Spam/Junk folder if you don\'t see it within a few minutes.',
          duration: 8000,
        });
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      
      // Clear userId if it was set, since the full process didn't complete
      localStorage.removeItem('userId');
      
      // Extract error message from response
      let errorTitle = 'Application Submission Failed';
      let errorMessage = 'There was a problem submitting your application. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
        if (error.response.data.message.includes('email')) {
          errorTitle = 'Email Already Registered';
        }
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
        duration: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof ApplicationFormData)[] = [];

    if (step === 1) {
      fieldsToValidate = [
        'firstName',
        'lastName',
        'email',
        'phone',
        'dateOfBirth',
        'location',
        'applyingAs',
      ];
    } else if (step === 2) {
      fieldsToValidate = ['educationLevel'];
    } else if (step === 3) {
      fieldsToValidate = ['programmingExperience'];
    } else if (step === 4) {
      fieldsToValidate = ['availableHours'];
    } else if (step === 5) {
      fieldsToValidate = ['agreeTerms'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      saveProgress();
      if (step < totalSteps) {
        setStep(step + 1);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      saveProgress();
      setStep(step - 1);
    }
  };

  const progress = (step / totalSteps) * 100;

  // Success page after submission
  if (isSubmitted && submittedData) {
    return (
      <ApplicationSuccess
        data={submittedData}
        onReturnHome={() => setIsSubmitted(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-12">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Apply to TechAI
          </h1>
          <p className="text-xl text-muted-foreground">
            Start your journey in AI and technology with us
          </p>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Step {step} of {totalSteps}
          </p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Personal Information'}
              {step === 2 && 'Education Background'}
              {step === 3 && 'Technical Background'}
              {step === 4 && 'Motivation & Goals'}
              {step === 5 && 'Additional Information & Agreements'}
            </CardTitle>
            <CardDescription>
              Please fill out all required fields to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Step 1: Personal Information */}
                {step === 1 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="applyingAs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>I am applying as *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Student">
                                <div className="flex flex-col py-1">
                                  <span className="font-medium">Student</span>
                                  <span className="text-xs text-muted-foreground">
                                    Join to learn and grow your tech skills
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem value="Mentor">
                                <div className="flex flex-col py-1">
                                  <span className="font-medium">Mentor</span>
                                  <span className="text-xs text-muted-foreground">
                                    Help guide students on their learning journey (requires approval)
                                  </span>
                                </div>
                              </SelectItem>
                              <SelectItem value="Tutor">
                                <div className="flex flex-col py-1">
                                  <span className="font-medium">Tutor</span>
                                  <span className="text-xs text-muted-foreground">
                                    Teach courses and manage educational content (requires approval)
                                  </span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {watchApplyingAs === 'Student' 
                              ? 'Students get instant access after email verification' 
                              : watchApplyingAs === 'Mentor'
                              ? 'Mentor applications require admin approval (typically 1-2 business days)'
                              : 'Tutor applications require admin approval (typically 1-2 business days)'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john.doe@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <PhoneInput
                              value={field.value}
                              onChange={(val) => field.onChange(val)}
                              defaultCountry="KE"
                              error={!!form.formState.errors.phone}
                            />
                          </FormControl>
                          <FormDescription>Enter your local number (e.g. 0712345678) or international format</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of Birth *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal h-10',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Pick your date of birth</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date('1920-01-01')
                                }
                                defaultMonth={field.value || new Date(new Date().getFullYear() - 20, 0)}
                                captionLayout="dropdown-buttons"
                                fromYear={1920}
                                toYear={new Date().getFullYear()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {field.value && (
                            <FormDescription>
                              Age: {calculateAge(field.value)} years old
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country *</FormLabel>
                          <FormControl>
                            <SearchableSelect
                              options={COUNTRIES}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Search country..."
                              allowCustom
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  </div>
                )}

                {/* Step 2: Education Background */}
                {step === 2 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="educationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Highest Education Level *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your education level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="high-school">
                                High School
                              </SelectItem>
                              <SelectItem value="diploma">Diploma</SelectItem>
                              <SelectItem value="bachelor">
                                Bachelor's Degree
                              </SelectItem>
                              <SelectItem value="master">
                                Master's Degree
                              </SelectItem>
                              <SelectItem value="phd">PhD</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fieldOfStudy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Field of Study</FormLabel>
                            <FormControl>
                              <SearchableSelect
                                options={FIELDS_OF_STUDY}
                                value={field.value || ''}
                                onChange={field.onChange}
                                placeholder="Search field of study..."
                                allowCustom
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="institutionName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution Name</FormLabel>
                            <FormControl>
                              <InstitutionSearch
                                institutions={INSTITUTIONS}
                                value={field.value || ''}
                                onChange={field.onChange}
                                educationLevel={watchEducationLevel}
                                placeholder="Search institution..."
                              />
                            </FormControl>
                            <FormDescription>
                              Search by name, abbreviation, or country
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Technical Background */}
                {step === 3 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="programmingExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Programming Experience *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your programming experience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">
                                Intermediate
                              </SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="programmingLanguages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Programming Languages</FormLabel>
                          <FormControl>
                            <MultiSelectSearch
                              options={PROGRAMMING_LANGUAGES}
                              selected={field.value ? field.value.split(', ').filter(Boolean) : []}
                              onChange={(items) => field.onChange(items.join(', '))}
                              placeholder="Search and select languages..."
                              allowCustom
                            />
                          </FormControl>
                          <FormDescription>
                            Select the programming languages you're familiar with
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="techInterests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Areas of Interest in Tech/AI</FormLabel>
                          <FormControl>
                            <MultiSelectSearch
                              options={TECH_INTERESTS}
                              selected={field.value ? field.value.split(', ').filter(Boolean) : []}
                              onChange={(items) => field.onChange(items.join(', '))}
                              placeholder="Search and select interests..."
                              allowCustom
                            />
                          </FormControl>
                          <FormDescription>
                            Select the areas of technology and AI that interest you most
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 4: Motivation & Goals */}
                {step === 4 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="motivation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Why do you want to join the program? *
                          </FormLabel>
                          <FormControl>
                            <SuggestTextarea
                              suggestions={MOTIVATION_SUGGESTIONS}
                              value={field.value || ''}
                              onChange={field.onChange}
                              placeholder="Tell us about your motivation for joining TechAI ... (click for suggestions)"
                            />
                          </FormControl>
                          <FormDescription>
                            Type your motivation or click a suggestion to get started
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="careerGoals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Career goals after completing the program *
                          </FormLabel>
                          <FormControl>
                            <SuggestTextarea
                              suggestions={CAREER_GOAL_SUGGESTIONS}
                              value={field.value || ''}
                              onChange={field.onChange}
                              placeholder="Describe your career aspirations... (click for suggestions)"
                            />
                          </FormControl>
                          <FormDescription>
                            Type your goals or click a suggestion to get started
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="availableHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Hours per week available for program *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your available hours" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="<5">
                                Less than 5 hours
                              </SelectItem>
                              <SelectItem value="5-10">5-10 hours</SelectItem>
                              <SelectItem value="10-20">10-20 hours</SelectItem>
                              <SelectItem value="20+">20+ hours</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 5: Additional Information & Agreements */}
                {step === 5 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="portfolioLinks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portfolio/GitHub/LinkedIn links</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="https://github.com/username&#10;https://linkedin.com/in/username&#10;https://portfolio.com"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional: Share your online presence (one link per
                            line)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hearAboutUs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            How did you hear about the program? *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select how you heard about us" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="friend-referral">
                                Friend/Referral
                              </SelectItem>
                              <SelectItem value="social-media">
                                Social Media
                              </SelectItem>
                              <SelectItem value="website">Website</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="additionalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Anything else you'd like us to know?
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Share any additional information that might be relevant..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4 p-6 bg-accent-light rounded-lg">
                      <FormField
                        control={form.control}
                        name="agreeTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium">
                                I agree to the terms and conditions and
                                understand the program requires commitment *
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="receiveUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium">
                                I would like to receive updates via email
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={step === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        saveProgress();
                        toast({ title: 'Progress saved', description: 'You can return later to complete your application.', duration: 3000 });
                      }}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Progress
                    </Button>
                  </div>

                  {step < totalSteps ? (
                    <Button type="button" variant="hero" onClick={nextStep}>
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
