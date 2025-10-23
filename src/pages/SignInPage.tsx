import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { useToast } from '@/hooks/use-toast';
import { apiService, endpoints } from '@/lib/api';
import Autoplay from 'embla-carousel-autoplay';
import { Loader2 } from 'lucide-react';

const carouselImages = [
  {
    src: '/leader-discussing-with-shareholders-about-increasing-profit-strategy.jpg',
    alt: 'Students learning technology',
  },
  {
    src: '/city-committed-education-collage-concept.jpg',
    alt: 'Interactive coding session',
  },
  {
    src: '/learning-education-ideas-insight-intelligence-study-concept.jpg',
    alt: 'Collaborative learning environment',
  },
];

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.login(endpoints.login, {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });

        // Navigate based on user role
        const role = response.data?.role?.toLowerCase() || 'student';
        navigate(`/${role}`);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description:
          error.response?.data?.message ||
          'Invalid email or password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Half - Image Carousel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Image - cover the whole column */}
        <img
          src="/leader-discussing-with-shareholders-about-increasing-profit-strategy.jpg"
          alt="Students learning"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
        />
        {/* Gradient overlay: very subtle at top -> stronger at bottom */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-primary/10 via-primary/30 to-primary/100 mix-blend-multiply" />{' '}
        {/* Overlay Text */}
        <div className="absolute bottom-12 left-12 text-white z-10 max-w-md">
          <h2 className="text-4xl font-bold mb-4">Welcome to TechAI LMS</h2>
          <p className="text-lg opacity-90">
            Empowering the next generation of tech leaders through quality
            education and mentorship.
          </p>
        </div>
      </div>
      {/* Right Half - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-card rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Sign In</h1>
            <p className="text-muted-foreground mt-2">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: undefined });
                }}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: undefined });
                }}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Don't have an account?{' '}
            </span>
            <a
              href="/apply"
              className="text-primary font-medium hover:underline"
            >
              Apply now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
