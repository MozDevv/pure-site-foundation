import { useState } from 'react';
import { UserCheck, Target, Send, ChevronRight, Heart } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMentorship } from '@/components/mentorship/MentorshipContext';
import { useToast } from '@/hooks/use-toast';

const EXPERTISE_OPTIONS = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Cloud Computing',
  'DevOps',
  'UI/UX Design',
  'Product Management',
  'Cybersecurity',
  'Blockchain',
  'Career Guidance',
  'Leadership',
  'Entrepreneurship',
  'Software Architecture',
  'Database Management',
];

const MEETING_FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly (Recommended)' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'flexible', label: 'Flexible' },
];

export function FindMentorPage() {
  const { createRequest } = useMentorship();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    interests: [] as string[],
    goals: '',
    preferredMeetingFrequency: '',
    additionalNotes: '',
  });

  const canProceedStep1 = formData.interests.length > 0;
  const canProceedStep2 =
    formData.goals.trim().length > 10 && formData.preferredMeetingFrequency;
  const canSubmit = canProceedStep1 && canProceedStep2;

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const result = await createRequest({
        requestedExpertise: formData.interests,
        goals: formData.goals,
        preferredMeetingFrequency: formData.preferredMeetingFrequency,
        additionalNotes: formData.additionalNotes,
      });

      if (result) {
        setShowSuccessDialog(true);
        // Reset form
        setFormData({
          interests: [],
          goals: '',
          preferredMeetingFrequency: '',
          additionalNotes: '',
        });
        setStep(1);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit your request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          What are you interested in?
        </CardTitle>
        <CardDescription>
          Select the areas where you'd like mentorship. Choose at least one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {EXPERTISE_OPTIONS.map((interest) => (
            <div
              key={interest}
              onClick={() => handleInterestToggle(interest)}
              className={`
                flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                ${
                  formData.interests.includes(interest)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }
              `}
            >
              <Checkbox
                checked={formData.interests.includes(interest)}
                onCheckedChange={() => handleInterestToggle(interest)}
                className="pointer-events-none"
              />
              <span className="text-sm font-medium">{interest}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Tell us about your goals
        </CardTitle>
        <CardDescription>
          Help us understand what you want to achieve with mentorship.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="goals">What are your mentorship goals? *</Label>
          <Textarea
            id="goals"
            placeholder="E.g., I want to transition from frontend to full-stack development, learn best practices for building scalable applications, and get career advice for becoming a senior engineer..."
            value={formData.goals}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, goals: e.target.value }))
            }
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Minimum 10 characters. Be specific about what you want to learn.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Preferred meeting frequency *</Label>
          <Select
            value={formData.preferredMeetingFrequency}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                preferredMeetingFrequency: value,
              }))
            }
          >
            <SelectTrigger id="frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {MEETING_FREQUENCY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any specific preferences, availability constraints, or additional information..."
            value={formData.additionalNotes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                additionalNotes: e.target.value,
              }))
            }
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button onClick={() => setStep(3)} disabled={!canProceedStep2}>
            Review & Submit
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Review Your Request
        </CardTitle>
        <CardDescription>
          Please review your information before submitting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Interests</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Goals</Label>
              <p className="text-sm mt-1">{formData.goals}</p>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">
                Meeting Frequency
              </Label>
              <p className="text-sm mt-1 capitalize">
                {formData.preferredMeetingFrequency}
              </p>
            </div>

            {formData.additionalNotes && (
              <div>
                <Label className="text-xs text-muted-foreground">
                  Additional Notes
                </Label>
                <p className="text-sm mt-1">{formData.additionalNotes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(2)}>
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const steps = [
    { number: 1, title: 'Interests', icon: Heart },
    { number: 2, title: 'Goals', icon: Target },
    { number: 3, title: 'Review', icon: Send },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find a Mentor</h1>
        <p className="text-muted-foreground">
          Connect with experienced mentors to accelerate your growth
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 py-4">
        {steps.map((s, idx) => (
          <div key={s.number} className="flex items-center">
            <div
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-all
                ${
                  step === s.number
                    ? 'bg-primary text-primary-foreground'
                    : step > s.number
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }
              `}
            >
              <s.icon className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">
                {s.title}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <ChevronRight
                className={`mx-2 h-4 w-4 ${
                  step > s.number ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <UserCheck className="h-5 w-5" />
              Request Submitted Successfully!
            </DialogTitle>
            <DialogDescription>
              Your mentor request has been submitted. An administrator will
              review your request and match you with a suitable mentor. You'll
              receive a notification once matched.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>Got it!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
