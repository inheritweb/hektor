import type {
  LearnerExperienceSummary,
  LearningExperienceSummary,
  LearningScenarioSummary,
} from './learning-experiences';
import type { LearnerCarePlan, LearnerCarePlanContent } from './care-plans';

/** Supported activity behaviours; reflections and essays both use writing. */
export enum ActivityType {
  Writing = 'writing',
  CarePlan = 'care_plan',
}

/** A configured task owned by a Learning Experience. */
export interface Activity {
  id: string;
  learningExperience: LearningExperienceSummary;
  type: ActivityType;
  title: string;
  instructions: string;
  /** Ordering within the experience, independent of clinical progression. */
  position: number;
  scenarios: LearningScenarioSummary[];
}

export type ActivitySummary = Pick<
  Activity,
  'id' | 'learningExperience' | 'type' | 'title'
>;

interface ActivityResponseBase {
  id: string;
  activity: ActivitySummary;
  learnerExperience: LearnerExperienceSummary;
  /** Starts at 1; saves must match the current revision. */
  revision: number;
  createdAt: string;
  updatedAt: string;
}

export interface WritingActivityResponse extends ActivityResponseBase {
  type: ActivityType.Writing;
  text: string;
}

export interface CarePlanActivityResponse extends ActivityResponseBase {
  type: ActivityType.CarePlan;
  /** References the authoritative clinical document, not a second copy. */
  carePlan: Pick<LearnerCarePlan, 'id' | 'title'>;
}

export type ActivityResponse =
  WritingActivityResponse | CarePlanActivityResponse;

/** Identity and document IDs are derived by the service, not supplied on save. */
export type SaveActivityResponseInput = {
  /** null creates the first response; a number updates an existing revision. */
  expectedRevision: number | null;
} & (
  | { type: ActivityType.Writing; text: string }
  | {
      type: ActivityType.CarePlan;
      scenarioId: string;
      carePlan: LearnerCarePlanContent;
    }
);

/** Read model for an activity and its saved work, including the clinical document. */
export interface LearnerActivityWork {
  activity: Activity;
  learnerExperience: LearnerExperienceSummary;
  response: ActivityResponse;
  /** Required for a care-plan response and absent for a writing response. */
  carePlan?: LearnerCarePlan;
}
