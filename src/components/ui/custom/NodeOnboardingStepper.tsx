import React from 'react';
import { UserPlus, Search, ShieldCheck, Radar } from 'lucide-react';
import { cn } from '@/lib/utils';

export type OnboardingStep = 'add' | 'discover' | 'validate' | 'scan';

interface NodeOnboardingStepperProps {
  currentStep: OnboardingStep;
}

const steps = [
  {
    key: 'add',
    label: 'Add Node',
    icon: UserPlus,
  },
  {
    key: 'discover',
    label: 'Discover',
    icon: Search,
  },
  {
    key: 'validate',
    label: 'Validate',
    icon: ShieldCheck,
  },
  {
    key: 'scan',
    label: 'Scan',
    icon: Radar,
  },
] as const;

type StepKey = typeof steps[number]['key'];

function getStepIndex(step: OnboardingStep): number {
  return steps.findIndex(s => s.key === step);
}

export const NodeOnboardingStepper: React.FC<NodeOnboardingStepperProps> = ({ currentStep }) => {
  const currentIdx = getStepIndex(currentStep);

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <nav className="flex items-center justify-between relative">
        {/* Progress bar background */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-border rounded-full" />
        
        {/* Progress bar fill */}
        <div 
          className="absolute top-6 left-0 h-0.5 bg-accent rounded-full transition-all duration-600 ease-smooth"
          style={{ 
            width: `${Math.max(0, Math.min(100, (currentIdx / (steps.length - 1)) * 100))}%` 
          }}
        />
        
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isUpcoming = idx > currentIdx;
          
          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              {/* Step circle */}
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-400 ease-smooth relative",
                  "shadow-sm hover:shadow-md",
                  isCompleted && [
                    "bg-accent border-accent text-white",
                    "shadow-glow"
                  ],
                  isCurrent && [
                    "bg-surface border-accent text-accent",
                    "shadow-glow-lg animate-pulse-slow"
                  ],
                  isUpcoming && [
                    "bg-surface border-border text-muted",
                    "hover:border-muted hover:text-secondary"
                  ]
                )}
              >
                <Icon className="h-5 w-5" />
                
                {/* Checkmark for completed steps */}
                {isCompleted && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg 
                      className="h-4 w-4 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={3} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Step label */}
              <div className="mt-3 text-center max-w-24">
                <div
                  className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    isCompleted && "text-accent",
                    isCurrent && "text-primary",
                    isUpcoming && "text-muted"
                  )}
                >
                  {step.label}
                </div>
              </div>
              

            </div>
          );
        })}
      </nav>
    </div>
  );
}; 