import React from 'react';
import { UserPlus, Search, ShieldCheck, Radar } from 'lucide-react';

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
    label: 'Scan!',
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
    <nav className="flex items-center justify-center mb-8 select-none">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isUpcoming = idx > currentIdx;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                  ${isCompleted ? 'bg-green-100 border-green-500 text-green-700' : ''}
                  ${isCurrent ? 'bg-blue-100 border-blue-500 text-blue-700 animate-pulse' : ''}
                  ${isUpcoming ? 'bg-gray-100 border-gray-300 text-gray-400' : ''}
                `}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-500'}`}>{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded transition-colors
                ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-300' : 'bg-gray-200'}`}
                style={{ minWidth: 32 }}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}; 