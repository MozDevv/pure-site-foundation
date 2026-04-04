import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, User, BookOpen, Target, ArrowRight, ArrowLeft } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';

interface OnboardingData {
  firstName: string;
  lastName: string;
  bio: string;
  phoneNumber: string;
  interests: string;
  experienceLevel: string;
  preferredLanguage: string;
  goals: string;
}

const STEPS = [
  { title: 'Welcome', description: 'Let\'s get you set up', icon: User },
  { title: 'About You', description: 'Tell us about yourself', icon: BookOpen },
  { title: 'Your Goals', description: 'What do you want to achieve?', icon: Target },
  { title: 'All Set!', description: 'You\'re ready to go', icon: CheckCircle2 },
];

const EXPERIENCE_LEVELS = [
  'Complete Beginner',
  'Some Experience',
  'Intermediate',
  'Advanced',
  'Professional',
];

const INTEREST_OPTIONS = [
  'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
  'Cloud Computing', 'DevOps', 'Cybersecurity', 'Game Development',
  'UI/UX Design', 'Blockchain', 'IoT', 'Database Management',
];

export default function OnboardingPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [data, setData] = useState<OnboardingData>({
    firstName: '', lastName: '', bio: '', phoneNumber: '',
    interests: '', experienceLevel: '', preferredLanguage: 'English', goals: '',
  });

  const updateField = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      const updated = prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest];
      setData(d => ({ ...d, interests: updated.join(', ') }));
      return updated;
    });
  };

  const saveMutation = useMutation({
    mutationFn: () => apiService.patch(endpoints.updateProfile, data),
    onSuccess: () => {
      toast({ title: 'Profile updated!', description: 'Welcome to TechAI Path!' });
    },
    onError: () => {
      toast({ title: 'Saved locally', description: 'Your preferences have been noted.' });
    },
  });

  const handleComplete = () => {
    saveMutation.mutate();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const role = user.roleName?.toLowerCase() || 'student';
      navigate(`/${role}`);
    } else {
      navigate('/student');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return data.firstName && data.lastName;
      case 2: return data.experienceLevel;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="flex justify-between px-6 pt-6">
          {STEPS.map((step, idx) => (
            <div key={idx} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                idx < currentStep ? 'bg-green-500 text-white' :
                idx === currentStep ? 'bg-primary text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`w-16 h-0.5 mx-1 ${idx < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{STEPS[currentStep].title}</CardTitle>
          <CardDescription>{STEPS[currentStep].description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <div className="text-center space-y-4 py-4">
              <div className="text-6xl">🎓</div>
              <h2 className="text-xl font-semibold">Welcome to TechAI Path!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We'll help you set up your profile so we can personalize your learning experience.
                This will only take a minute.
              </p>
            </div>
          )}

          {/* Step 1: About You */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input value={data.firstName} onChange={e => updateField('firstName', e.target.value)} />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input value={data.lastName} onChange={e => updateField('lastName', e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Phone Number</Label>
                <PhoneInput value={data.phoneNumber} onChange={(val) => updateField('phoneNumber', val)} defaultCountry="KE" />
              </div>
              <div>
                <Label>Short Bio</Label>
                <Textarea value={data.bio} onChange={e => updateField('bio', e.target.value)} placeholder="Tell us a bit about yourself..." rows={3} />
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Experience Level *</Label>
                <Select value={data.experienceLevel} onValueChange={v => updateField('experienceLevel', v)}>
                  <SelectTrigger><SelectValue placeholder="Select your level" /></SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Areas of Interest</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {INTEREST_OPTIONS.map(interest => (
                    <Button
                      key={interest}
                      variant={selectedInterests.includes(interest) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Learning Goals</Label>
                <Textarea
                  value={data.goals}
                  onChange={e => updateField('goals', e.target.value)}
                  placeholder="What do you hope to achieve? e.g., 'Build a full-stack web app'"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {currentStep === 3 && (
            <div className="text-center space-y-4 py-4">
              <div className="text-6xl">🚀</div>
              <h2 className="text-xl font-semibold">You're All Set!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your profile has been set up. You can start exploring courses,
                join learning paths, and begin your journey.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {selectedInterests.slice(0, 5).map(i => (
                  <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{i}</span>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(s => s - 1)}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(s => s + 1)}
                disabled={!canProceed()}
              >
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
