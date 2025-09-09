import { useState } from 'react';
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
import { apiService, endpoints } from '@/lib/api';
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ApplicationSuccess } from './application-success';

const applicationSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  age: z
    .number()
    .min(16, 'Must be at least 16 years old')
    .max(100, 'Invalid age'),
  location: z.string().min(2, 'Please enter your city'),

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
  motivation: z.string().min(50, 'Please provide at least 50 characters'),
  careerGoals: z.string().min(50, 'Please provide at least 50 characters'),
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
  const [submittedData, setSubmittedData] = useState<ApplicationFormData | null>(null);
  const totalSteps = 5;

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      receiveUpdates: false,
      agreeTerms: false,
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID not found. Please complete step 1 first.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

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

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const res = await apiService.post(endpoints.createProfile, profileData);
      if (res.status === 201) {
        setSubmittedData(data);
        setIsSubmitted(true);
        toast({
          title: 'Application Submitted!',
          description: 'Your application has been successfully submitted.',
        });
      }
    } catch (error) {
      toast({
        title: 'Submission Error',
        description: 'There was a problem submitting your application.',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof ApplicationFormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'age', 'location'];
    } else if (step === 2) {
      fieldsToValidate = ['educationLevel'];
    } else if (step === 3) {
      fieldsToValidate = ['programmingExperience'];
    } else if (step === 4) {
      fieldsToValidate = ['motivation', 'careerGoals', 'availableHours'];
    } else if (step === 5) {
      fieldsToValidate = ['hearAboutUs', 'agreeTerms'];
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (step === 1) {
        await handleSaveStepOne(form.getValues());
      }
      if (step < totalSteps) {
        setStep(step + 1);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const progress = (step / totalSteps) * 100;

  const handleSaveStepOne = async (data: any) => {
    /**{
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "username": "string",
  "phoneNumber": "string",
  "age": "string",
  "location": "string",
  "password": "string",
  "profilePicture": "string",
  "status": "string",
} */
    try {
      const applicationData = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        // username: data.username,
        phoneNumber: data.phoneNumber,
        age: data.age,
        location: data.location,
        password: data.password,
        // profilePicture: data.profilePicture,
      };

      const res = await apiService.post(endpoints.register, applicationData);
      if (res.status === 200) {
        localStorage.setItem('userId', res.data.id);
        toast({
          title: 'Step 1 Saved',
          description: 'Your personal information has been saved successfully.',
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Success page after submission
  if (isSubmitted && submittedData) {
    return <ApplicationSuccess data={submittedData} onReturnHome={() => setIsSubmitted(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-12">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Apply to TechAI Foundation
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
                            <Input
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="25"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (City) *</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                              <Input
                                placeholder="Computer Science"
                                {...field}
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
                              <Input
                                placeholder="University of Technology"
                                {...field}
                              />
                            </FormControl>
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
                            <Input
                              placeholder="Python, JavaScript, Java"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            List any programming languages you're familiar with
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
                            <Input
                              placeholder="Data Analytics, Machine Learning, Mobile Apps"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            What areas of technology and AI interest you most?
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
                            <Textarea
                              placeholder="Tell us about your motivation for joining TechAI Foundation..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum 50 characters required
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
                            <Textarea
                              placeholder="Describe your career aspirations after completing the program..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum 50 characters required
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1}
                  >
                    Previous
                  </Button>

                  {step < totalSteps ? (
                    <Button type="button" variant="gradient" onClick={nextStep}>
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
