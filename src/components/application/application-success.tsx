import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, Mail, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type ApplicationSuccessProps = {
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    age?: number;
    location?: string;
    educationLevel?: string;
    fieldOfStudy?: string;
    institutionName?: string;
    programmingExperience?: string;
    programmingLanguages?: string;
    techInterests?: string;
    motivation?: string;
    careerGoals?: string;
    availableHours?: string;
    portfolioLinks?: string;
    hearAboutUs?: string;
    additionalInfo?: string;
  };
  onReturnHome: () => void;
};

export function ApplicationSuccess({ data, onReturnHome }: ApplicationSuccessProps) {
  const formatEducationLevel = (level: string) => {
    const levels: Record<string, string> = {
      'high-school': 'High School',
      'diploma': 'Diploma',
      'bachelor': "Bachelor's Degree",
      'master': "Master's Degree",
      'phd': 'PhD',
      'other': 'Other'
    };
    return levels[level] || level;
  };

  const formatProgrammingExperience = (exp: string) => {
    const experiences: Record<string, string> = {
      'none': 'None',
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced'
    };
    return experiences[exp] || exp;
  };

  const formatAvailableHours = (hours: string) => {
    const hoursMap: Record<string, string> = {
      '<5': 'Less than 5 hours',
      '5-10': '5-10 hours',
      '10-20': '10-20 hours',
      '20+': '20+ hours'
    };
    return hoursMap[hours] || hours;
  };

  const formatHearAboutUs = (source: string) => {
    const sourceMap: Record<string, string> = {
      'friend-referral': 'Friend/Referral',
      'social-media': 'Social Media',
      'website': 'Website',
      'other': 'Other'
    };
    return sourceMap[source] || source;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-12">
      <div className="container max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            🎉 Application Submitted Successfully!
          </h1>
          <p className="text-xl text-muted-foreground">
            Thank you for applying to the TechAI Foundation Program
          </p>
        </div>

        {/* Confirmation Message */}
        <Card className="shadow-elegant mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
              <Mail className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Next Steps</h3>
                <p className="text-green-700">
                  We've captured your details. Please wait for a confirmation email with further instructions within 48 hours.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">Processing Time</h3>
                <p className="text-blue-700">
                  Our team will review your application and get back to you soon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Summary */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Application Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{data.firstName || 'N/A'} {data.lastName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{data.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{data.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age & Location</p>
                  <p className="font-medium">{data.age || 'N/A'} years old, {data.location || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Education Background */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Education Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Education Level</p>
                  <p className="font-medium">{data.educationLevel ? formatEducationLevel(data.educationLevel) : 'N/A'}</p>
                </div>
                {data.fieldOfStudy && (
                  <div>
                    <p className="text-sm text-muted-foreground">Field of Study</p>
                    <p className="font-medium">{data.fieldOfStudy}</p>
                  </div>
                )}
                {data.institutionName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Institution</p>
                    <p className="font-medium">{data.institutionName}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Technical Background */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Technical Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Programming Experience</p>
                  <p className="font-medium">{data.programmingExperience ? formatProgrammingExperience(data.programmingExperience) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Hours per Week</p>
                  <p className="font-medium">{data.availableHours ? formatAvailableHours(data.availableHours) : 'N/A'}</p>
                </div>
                {data.programmingLanguages && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Programming Languages</p>
                    <p className="font-medium">{data.programmingLanguages}</p>
                  </div>
                )}
                {data.techInterests && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Tech/AI Interests</p>
                    <p className="font-medium">{data.techInterests}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Goals & Motivation */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Goals & Motivation</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Why join the program?</p>
                  <p className="font-medium">{data.motivation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Career Goals</p>
                  <p className="font-medium">{data.careerGoals || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">How did you hear about us?</p>
                  <p className="font-medium">{data.hearAboutUs ? formatHearAboutUs(data.hearAboutUs) : 'N/A'}</p>
                </div>
                {data.portfolioLinks && (
                  <div>
                    <p className="text-sm text-muted-foreground">Portfolio/Links</p>
                    <p className="font-medium">{data.portfolioLinks}</p>
                  </div>
                )}
                {data.additionalInfo && (
                  <div>
                    <p className="text-sm text-muted-foreground">Additional Notes</p>
                    <p className="font-medium">{data.additionalInfo}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center mt-8 gap-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Homepage
          </Button>
          <Button 
            variant="hero"
            onClick={() => window.location.href = '/student-dashboard'}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}