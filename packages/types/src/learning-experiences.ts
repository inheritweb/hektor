import type { Activity } from './activities';
import type { OrganisationMembershipUserSummary } from './organisations';
import type { PatientScenario } from './patient-scenarios';

export type LearningScenarioSummary = Pick<PatientScenario, 'id' | 'title'>;

/** Reusable content; assignment, scheduling and learner work are separate. */
export interface LearningExperience {
  id: string;
  title: string;
  description: string;
  /** Ordered scenarios used in this experience. */
  scenarios: LearningScenarioSummary[];
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
}

/** Experience context without recursively including its activities. */
export type LearningExperienceSummary = Pick<
  LearningExperience,
  'id' | 'title'
>;

/** Individual participation; the assignment relationship follows in slice 2. */
export interface LearnerExperience {
  id: string;
  learningExperience: LearningExperienceSummary;
  learner: Pick<OrganisationMembershipUserSummary, 'id' | 'user'>;
  createdAt: string;
}

export type LearnerExperienceSummary = Pick<
  LearnerExperience,
  'id' | 'learningExperience' | 'learner'
>;
