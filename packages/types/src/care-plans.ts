import type {
  LearnerExperienceSummary,
  LearningScenarioSummary,
} from './learning-experiences';
import type { PatientHistoricalCarePlan } from './patient-profiles';

/** Clinical content, without the historical record's boundary-specific status. */
export interface LearnerCarePlanContent extends Pick<
  PatientHistoricalCarePlan,
  'need' | 'goals' | 'interventions' | 'evaluation'
> {
  title: string;
}

/** A clinical document belonging to an individual learner's simulated record. */
export interface LearnerCarePlan extends LearnerCarePlanContent {
  id: string;
  learnerExperience: LearnerExperienceSummary;
  scenario: LearningScenarioSummary;
  createdAt: string;
  updatedAt: string;
}
