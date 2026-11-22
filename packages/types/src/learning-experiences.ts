import type { Activity } from './activities';
import type { EhrConfiguration } from './ehr';
import type {
  OrganisationGroup,
  OrganisationMembershipUserSummary,
  OrganisationSummary,
} from './organisations';
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

export interface LearningScenarioSnapshot {
  scenario: PatientScenario;
  baseEhr: EhrConfiguration;
}

/** Captured at assignment; persistence must enforce immutability. */
export interface LearningExperienceSnapshot {
  experience: LearningExperience;
  scenarios: LearningScenarioSnapshot[];
}

export interface LearningExperienceAssignment {
  id: string;
  organisation: Pick<OrganisationSummary, 'id' | 'name'>;
  group: Pick<OrganisationGroup, 'id' | 'name'>;
  assignedBy: Pick<OrganisationMembershipUserSummary, 'id' | 'user'>;
  snapshot: LearningExperienceSnapshot;
  createdAt: string;
}

export type LearningExperienceAssignmentSummary = Pick<
  LearningExperienceAssignment,
  'id' | 'group' | 'createdAt'
>;

export interface CreateLearningExperienceAssignmentInput {
  experienceId: string;
  groupId: string;
}

/** One captured recipient per assignment; repeat assignments create new work. */
export interface LearnerExperience {
  id: string;
  assignment: LearningExperienceAssignmentSummary;
  learningExperience: LearningExperienceSummary;
  learner: Pick<OrganisationMembershipUserSummary, 'id' | 'user'>;
  createdAt: string;
}

export type LearnerExperienceSummary = Pick<
  LearnerExperience,
  'id' | 'assignment' | 'learningExperience' | 'learner'
>;
