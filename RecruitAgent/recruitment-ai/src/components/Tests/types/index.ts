// Re-exportar tipos de los contextos
export type { CandidateWithTestInfo } from '../../../contexts/CleaverContext';
export type { CandidateWithMossInfo } from '../../../contexts/MossContext';

// Test types
export type TestType = 'cleaver' | 'moss' | 'terman' | 'raven' | 'zavic';
export type TestStatus = 'not-started' | 'pending' | 'in-progress' | 'completed' | 'expired';
export type CVStatus = 'approved' | 'reviewing' | 'rejected';

// Base candidate interface para Terman y Raven (que no tienen contextos)
interface BaseCandidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  job_title?: string;
  job_id: string;
  cv_status: CVStatus;
  cv_review_date?: string;
  years_experience?: number;
  created_at: string;
  invitation_sent: boolean;
  test_id?: string;
  test_token?: string;
}

// ZAVIC types - importado del contexto pero con test_id como number
import type { CandidateWithZavicInfo as ZavicInfo } from '../../../contexts/ZavicContext';
export interface CandidateWithZavicInfo extends Omit<ZavicInfo, 'test_id'> {
  test_id?: number | string;
}

// Terman-Merrill types
export interface CandidateWithTermanInfo extends BaseCandidate {
  terman_status: TestStatus;
  terman_results?: {
    completed_at: string;
    total_score: number;
    iq: number;
    iq_classification: string;
    series_scores: Record<string, unknown>[];
    interpretation: Record<string, unknown>;
  };
}

export interface TermanTest {
  id: string;
  candidate_id: string;
  job_id: string;
  recruiter_id: string;
  test_token: string;
  status: TestStatus;
  created_at: string;
  invitation_sent_at?: string;
  started_at?: string;
  completed_at?: string;
  expires_at: string;
  time_spent_minutes?: number;
  total_score?: number;
  ci?: number;
  mental_age?: number;
  ci_classification?: string;
  strengths?: string[];
  development_areas?: string[];
  candidate?: {
    id: string;
    name: string;
    email: string;
  };
  job?: {
    id: string;
    title: string;
    company?: string;
  };
}

// Raven Progressive Matrices types
export interface CandidateWithRavenInfo extends BaseCandidate {
  raven_status: TestStatus;
  raven_results?: {
    completed_at: string;
    raw_score: number;
    percentile: number;
    diagnostic_rank: string;
    interpretation: Record<string, unknown>;
  };
}

export interface RavenTest {
  id: string;
  candidate_id: string;
  job_id?: string;
  recruiter_id: string;
  test_token: string;
  status: TestStatus;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  expires_at: string;
  time_limit_minutes: number;
  time_spent_seconds?: number;
  updated_at: string;
  candidate?: {
    id: string;
    name: string;
    email: string;
  };
  job?: {
    id: string;
    title: string;
    company?: string;
  };
}

// Importar los tipos correctamente para AnyCandidate
import type { CandidateWithTestInfo as CleaverInfo } from '../../../contexts/CleaverContext';
import type { CandidateWithMossInfo as MossInfo } from '../../../contexts/MossContext';

// Union type for all candidate types
export type AnyCandidate = CleaverInfo | MossInfo | CandidateWithTermanInfo | CandidateWithRavenInfo | CandidateWithZavicInfo;

// Stats interface
export interface TestStats {
  totalCandidates: number;
  cvsApproved: number;
  testsCompleted: number;
  testsPending: number;
  testsInProgress: number;
}

// Filter type
export type FilterType = 'all' | 'cv-approved' | 'test-pending' | 'test-completed'; 