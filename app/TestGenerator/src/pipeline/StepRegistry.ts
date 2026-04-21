import { Step } from './Step.js';
import { Step01VerifyAuth } from './steps/Step01VerifyAuth.js';
import { Step02FindTicket } from './steps/Step02FindTicket.js';
import { Step03ReviewTicket } from './steps/Step03ReviewTicket.js';
import { Step04ReviewCode } from './steps/Step04ReviewCode.js';
import { Step05DraftTestPlan } from './steps/Step05DraftTestPlan.js';
import { Step06WriteGherkin } from './steps/Step06WriteGherkin.js';
import { Step07WriteAutomatedTests } from './steps/Step07WriteAutomatedTests.js';
import { Step08ExecuteTests } from './steps/Step08ExecuteTests.js';
import { Step09DetermineResults } from './steps/Step09DetermineResults.js';
import { Step10PostResults } from './steps/Step10PostResults.js';
import { Step11TransitionTicket } from './steps/Step11TransitionTicket.js';

const STEP_CLASSES: Record<number, new () => Step> = {
  1: Step01VerifyAuth,
  2: Step02FindTicket,
  3: Step03ReviewTicket,
  4: Step04ReviewCode,
  5: Step05DraftTestPlan,
  6: Step06WriteGherkin,
  7: Step07WriteAutomatedTests,
  8: Step08ExecuteTests,
  9: Step09DetermineResults,
  10: Step10PostResults,
  11: Step11TransitionTicket,
};

export function createStep(stepNumber: number): Step {
  const StepClass = STEP_CLASSES[stepNumber];
  if (!StepClass) {
    throw new Error(`Unknown step number: ${stepNumber}`);
  }
  return new StepClass();
}

export function getStepNumbers(): number[] {
  return Object.keys(STEP_CLASSES).map(Number).sort((a, b) => a - b);
}
