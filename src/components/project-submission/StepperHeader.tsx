import React from 'react';
import { Check, Users, FileText, Layers, Info, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectSubmission } from './ProjectSubmissionContext';

const STEPS = [
  { id: 1, title: 'Manage Team', icon: Users },
  { id: 2, title: 'Project Overview', icon: FileText },
  { id: 3, title: 'Project Details', icon: Layers },
  { id: 4, title: 'Additional Info', icon: Info },
  { id: 5, title: 'Submit', icon: Send },
];

export function StepperHeader() {
  const { currentStep, setCurrentStep, stepStatuses, isSaving } = useProjectSubmission();

  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Mobile view */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </span>
            {isSaving && (
              <span className="text-xs text-muted-foreground animate-pulse">
                Saving...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {React.createElement(STEPS[currentStep - 1].icon, {
              className: 'h-5 w-5 text-primary',
            })}
            <span className="font-medium">{STEPS[currentStep - 1].title}</span>
          </div>
          <div className="flex gap-1 mt-3">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  step.id < currentStep || stepStatuses[step.id]?.completed
                    ? 'bg-primary'
                    : step.id === currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
                )}
              />
            ))}
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden md:flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = stepStatuses[step.id]?.completed;
            const isCurrent = step.id === currentStep;
            const isClickable = true; // Non-linear navigation

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => isClickable && setCurrentStep(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-all',
                    isClickable && 'cursor-pointer hover:bg-muted/50',
                    isCurrent && 'bg-primary/10'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : isCurrent
                        ? 'bg-primary/20 text-primary border-2 border-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-left">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        isCurrent ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isCompleted ? 'Completed' : isCurrent ? 'In progress' : 'Pending'}
                    </p>
                  </div>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-2',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
