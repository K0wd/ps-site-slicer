import { Step } from './Step.js';
import { Step01VerifyAuth } from '../../generator/steps/Step01VerifyAuth.js';
import { Step02FindTicket } from '../../generator/steps/Step02FindTicket.js';
import { Step03ReviewTicket } from '../../generator/steps/Step03ReviewTicket.js';
import { Step04ReviewCode } from '../../generator/steps/Step04ReviewCode.js';
import { Step05DraftTestPlan } from '../../generator/steps/Step05DraftTestPlan.js';
import { Step06WriteGherkin } from '../../generator/steps/Step06WriteGherkin.js';
import { Step07WriteAutomatedTests } from '../../generator/steps/Step07WriteAutomatedTests.js';
import { Step08ExecuteTests } from '../../automator/steps/Step08ExecuteTests.js';
import { Step09DetermineResults } from '../../automator/steps/Step09DetermineResults.js';
import { Step10PostResults } from '../../automator/steps/Step10PostResults.js';
import { Step11TransitionTicket } from '../../automator/steps/Step11TransitionTicket.js';
import { Eng01CheckSteps } from '../../automator/steps/Eng01CheckSteps.js';
import { Eng02RunTests } from '../../automator/steps/Eng02RunTests.js';
import { Eng03HealScenario } from '../../automator/steps/Eng03HealScenario.js';
import { Eng04Decalcification } from '../../automator/steps/Eng04Decalcification.js';
import { Eng05AppScraper } from '../../automator/steps/Eng05AppScraper.js';

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
  101: Eng01CheckSteps,
  102: Eng02RunTests,
  103: Eng03HealScenario,
  104: Eng04Decalcification,
  105: Eng05AppScraper,
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
