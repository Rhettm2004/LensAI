import React from 'react';
import type { ScreenId } from '../../types';
import { WORKFLOW_STEPS, getCurrentStepIndex } from '../../state';

const REPORT_WORKSPACE_STEP_INDEX = 4;

export type WorkflowStepperProps = {
  currentScreen: ScreenId;
  maxStepReached: number;
  hasAnyReportGenerated: boolean;
  onStepClick: (screen: ScreenId) => void;
};

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentScreen,
  maxStepReached,
  hasAnyReportGenerated,
  onStepClick,
}) => {
  const currentIndex = getCurrentStepIndex(currentScreen);

  return (
    <nav className="workflow-stepper" aria-label="Analysis workflow">
      {WORKFLOW_STEPS.map((step, index) => {
        const isCurrent = step.id === currentScreen;
        const isCompleted = index < currentIndex;
        const stepUnlockedByProgress = index <= maxStepReached;
        const isReportWorkspaceStep = index === REPORT_WORKSPACE_STEP_INDEX;
        const step5Clickable = isReportWorkspaceStep ? stepUnlockedByProgress : true;
        const isClickable = stepUnlockedByProgress && step5Clickable;
        const isUnlockedFuture = index > currentIndex && isClickable;
        const isLocked = !isClickable;

        const stepClass = [
          'workflow-stepper-step',
          isCurrent && 'current',
          isCompleted && 'completed',
          isUnlockedFuture && 'unlocked-future',
          isLocked && 'locked',
          isClickable && 'clickable',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div key={step.id} className={stepClass}>
            <button
              type="button"
              className="workflow-step-trigger"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step.id)}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`${step.label}${isCurrent ? ' (current)' : isCompleted ? ' (completed)' : isUnlockedFuture ? ' (go to step)' : ''}`}
            >
              <span className="workflow-step-circle">
                <span className="workflow-step-number">{index + 1}</span>
                <span className="workflow-step-check" aria-hidden>✓</span>
              </span>
              <span className="workflow-step-label">{step.label}</span>
            </button>
          </div>
        );
      })}
    </nav>
  );
};
