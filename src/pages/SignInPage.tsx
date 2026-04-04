import { useState, useEffect, useRef } from 'react';
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
import { API_BASE_URL, apiService, endpoints } from '@/lib/api';
import Autoplay from 'embla-carousel-autoplay';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

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
      const response = await axios.post(`${API_BASE_URL}${endpoints.login}`, {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        const user = {
          id: response.data.id || '',
          roleId: response.data.roleId,
          role: response.data.role || 'Student',
          name: response.data.username || `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim() || '',
          email: response.data.email || '',
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
        };
        localStorage.setItem('user', JSON.stringify(user));

        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });

        // Navigate based on user role
        const role = response.data?.role?.toLowerCase() || 'student';
        const basePath = role === 'super_admin' ? 'admin' : role;

        if (
          !response.data?.defaultPasswordChanged &&
          email !== 'superadmin@zanari.com'
        ) {
          handleSendResetLink(response.data.id);
          return;
        }
        navigate(`/${basePath}`);
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

  const handleSendResetLink = async (userId) => {
    navigate(`/reset-password/` + userId);

    try {
      const res = await apiService.login(endpoints.forgotPassword(userId));
      if (res.status === 200) {
        toast({
          title: 'Reset Link Sent',
          description: 'Please check your email for the password reset link.',
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  const [loadingReset, setLoadingReset] = useState(false);
  const handleResetUsingEmail = async (email) => {
    setLoadingReset(true);
    try {
      const res = await apiService.login(endpoints.forgotPasswordEmail(email));
      if (res.status === 200) {
        navigate(`/reset-password/` + res.data);
        toast({
          title: 'Reset Link Sent',
          description: 'Please check your email for the password reset link.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Reset Link Failed',
        description:
          error.response?.data?.message ||
          'Failed to send reset link. Please try again.',
      });
      console.log(error);
    } finally {
      setLoadingReset(false);
    }
  };
  const [showEmailReset, setShowEmailReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailError, setResetEmailError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Initialize Google Sign-In
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          callback: handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'rectangular',
        });
      }
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [showEmailReset]);

  const handleGoogleCredentialResponse = async (response: any) => {
    setIsGoogleLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}${endpoints.googleLogin}`, {
        idToken: response.credential,
      });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        const user = {
          id: res.data.id || '',
          roleId: res.data.roleId,
          role: res.data.role || 'Student',
          name: res.data.username || `${res.data.firstName || ''} ${res.data.lastName || ''}`.trim() || '',
          email: res.data.email || '',
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
        };
        localStorage.setItem('user', JSON.stringify(user));
        toast({
          title: 'Welcome!',
          description: 'Signed in with Google successfully.',
        });
        const role = res.data?.role?.toLowerCase() || 'student';
        const basePath = role === 'super_admin' ? 'admin' : role;
        navigate(`/${basePath}`);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google sign in failed',
        description: error.response?.data?.message || 'Could not sign in with Google. Please try again.',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ...existing code...

  const handleResetEmailValidate = () => {
    if (!resetEmail) {
      setResetEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setResetEmailError('Please enter a valid email address');
      return false;
    }
    setResetEmailError(null);
    return true;
  };

  const handleResetEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleResetEmailValidate()) return;
    await handleResetUsingEmail(resetEmail);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Half - Image */}
      <div className="hidden lg:flex lg:w-[54%] relative overflow-hidden flex-shrink-0">
        {/* Image - cover the whole column */}
        <img
          src="/leader-discussing-with-shareholders-about-increasing-profit-strategy.jpg"
          alt="Students learning"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-primary/10 via-primary/30 to-primary/80 dark:from-black/20 dark:via-primary/20 dark:to-black/80" />
        {/* Diagonal wedge — background colour bleeds in from the right to create zigzag edge */}
        <div
          className="absolute inset-y-0 right-0 w-24 bg-background"
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
        />
        {/* Overlay Text */}
        <div className="absolute bottom-12 left-12 text-white z-10 max-w-md">
          <h2 className="text-h2-sb mb-4">Welcome to TechAI LMS</h2>
          <p className="text-body opacity-90">
            Empowering the next generation of tech leaders through quality
            education and mentorship.
          </p>
        </div>
      </div>
      {/* Right Half - Login Form */}
      {!showEmailReset ? (
        <div className="w-full lg:flex-1 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md space-y-8 bg-card rounded-2xl p-8 shadow-lg border border-border">
            <div className="text-center">
              <h1 className="text-h2-sb text-foreground">Sign In</h1>
              <p className="text-small text-muted-foreground mt-2">
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
                <div className="text-center text-sm ">
                  <button
                    type="button"
                    className="text-primary  hover:underline"
                    onClick={() => setShowEmailReset(true)}
                  >
                    Forgot password?
                  </button>
                </div>
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

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <div className="flex justify-center">
              {isGoogleLoading ? (
                <Button variant="outline" className="w-full" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in with Google...
                </Button>
              ) : (
                <div ref={googleBtnRef} className="w-full flex justify-center" />
              )}
            </div>

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
      ) : (
        <div className="w-full lg:flex-1 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md space-y-8 bg-card rounded-2xl p-8 shadow-lg border border-border">
            <div className="text-center">
              <h1 className="text-h2-sb text-foreground">
                Reset Password
              </h1>
              <p className="text-small text-muted-foreground mt-2">
                Enter your email to reset your password
              </p>
            </div>
            <form onSubmit={handleResetEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email Address</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setResetEmailError(null);
                  }}
                  className={resetEmailError ? 'border-destructive' : ''}
                />
                {resetEmailError && (
                  <p className="text-sm text-destructive">{resetEmailError}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={loadingReset}
              >
                {loadingReset ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Send Code'
                )}
              </Button>
              <div className="text-center text-sm mt-2">
                <button
                  type="button"
                  className="text-muted-foreground hover:underline"
                  onClick={() => setShowEmailReset(false)}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignInPage;
