import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Tour step definition ──
export interface TourStep {
  /** CSS selector for the element to highlight (e.g. '[data-tour="sidebar"]') */
  target: string;
  /** Title shown in the tooltip */
  title: string;
  /** Description text */
  content: string;
  /** Where to position the tooltip relative to the target */
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourContextValue {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  startTour: (steps: TourStep[]) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within <OnboardingTourProvider>');
  return ctx;
}

const TOUR_COMPLETED_KEY = 'techai_onboarding_completed';

// ── Default tour steps for the dashboard ──
export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    target: '[data-sidebar="sidebar"]',
    title: 'Navigation Sidebar',
    content: 'Use the sidebar to navigate between different sections of the platform — courses, assessments, chat, and more.',
    placement: 'right',
  },
  {
    target: '[data-tour="search"]',
    title: 'Quick Search',
    content: 'Press ⌘K or click here to search for courses, users, and pages instantly.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="theme-toggle"]',
    title: 'Theme Toggle',
    content: 'Switch between light and dark mode to match your preference.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="notifications"]',
    title: 'Notifications',
    content: 'Stay updated with real-time notifications about assignments, events, and messages.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="user-menu"]',
    title: 'Your Profile',
    content: 'Access your profile, settings, and manage your account from here.',
    placement: 'bottom',
  },
];

// ── Tooltip positioning ──
function getTooltipPosition(rect: DOMRect, placement: string) {
  const gap = 16;
  switch (placement) {
    case 'right':
      return { top: rect.top + rect.height / 2 - 80, left: rect.right + gap };
    case 'left':
      return { top: rect.top + rect.height / 2 - 80, left: rect.left - gap - 320 };
    case 'top':
      return { top: rect.top - gap - 160, left: rect.left + rect.width / 2 - 160 };
    case 'bottom':
    default:
      return { top: rect.bottom + gap, left: rect.left + rect.width / 2 - 160 };
  }
}

// ── Tour Provider ──
export function OnboardingTourProvider({ children }: { children: ReactNode }) {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  const startTour = useCallback((tourSteps: TourStep[]) => {
    setSteps(tourSteps);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    setSteps([]);
    setCurrentStep(0);
    setSpotlightRect(null);
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour();
    }
  }, [currentStep, steps.length, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Position the tooltip and spotlight when step changes
  useEffect(() => {
    if (!isActive || steps.length === 0) return;

    const step = steps[currentStep];
    const el = document.querySelector(step.target);

    if (el) {
      const rect = el.getBoundingClientRect();
      setSpotlightRect(rect);
      setTooltipPos(getTooltipPosition(rect, step.placement || 'bottom'));

      // Scroll element into view if needed
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // If element not found, skip to next step
      setSpotlightRect(null);
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  }, [isActive, currentStep, steps]);

  // Handle escape key
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') endTour();
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isActive, endTour, nextStep, prevStep]);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <TourContext.Provider value={{ isActive, currentStep, totalSteps: steps.length, startTour, endTour, nextStep, prevStep }}>
      {children}

      <AnimatePresence>
        {isActive && step && (
          <>
            {/* Overlay with spotlight cutout */}
            <motion.div
              key="tour-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998]"
              onClick={endTour}
              style={{
                background: spotlightRect
                  ? `radial-gradient(
                      ellipse ${spotlightRect.width + 24}px ${spotlightRect.height + 24}px at 
                      ${spotlightRect.left + spotlightRect.width / 2}px 
                      ${spotlightRect.top + spotlightRect.height / 2}px, 
                      transparent 50%, rgba(0,0,0,0.55) 51%
                    )`
                  : 'rgba(0,0,0,0.55)',
              }}
            />

            {/* Tooltip card */}
            <motion.div
              key={`tour-tooltip-${currentStep}`}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed z-[9999] w-80 rounded-xl border border-border bg-card shadow-xl"
              style={{ top: tooltipPos.top, left: Math.max(16, Math.min(tooltipPos.left, window.innerWidth - 336)) }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="text-small font-medium text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <button onClick={endTour} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="px-4 pb-2">
                <h3 className="text-h4-sb text-foreground">{step.title}</h3>
                <p className="text-input text-muted-foreground mt-1">{step.content}</p>
              </div>

              {/* Progress bar */}
              <div className="px-4 py-2">
                <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between px-4 pb-4 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={cn('gap-1', currentStep === 0 && 'invisible')}
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button size="sm" onClick={nextStep} className="gap-1">
                  {isLastStep ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Done
                    </>
                  ) : (
                    <>
                      Next <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </TourContext.Provider>
  );
}
