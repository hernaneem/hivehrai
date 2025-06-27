import { useState, useMemo } from 'react';
import type { TestType, FilterType } from '../types';
import type { CandidateWithTestInfo } from '../../../contexts/CleaverContext';
import type { CandidateWithMossInfo } from '../../../contexts/MossContext';
import type { CandidateWithZavicInfo } from '../../../contexts/ZavicContext';
import type { CandidateWithTermanInfo, CandidateWithRavenInfo } from '../types';
import { getTestStatus } from '../utils/statusHelpers';

type AnyCandidate = CandidateWithTestInfo | CandidateWithMossInfo | CandidateWithTermanInfo | CandidateWithRavenInfo | CandidateWithZavicInfo;

export const useTestFilters = (
  candidates: AnyCandidate[],
  activeTab: TestType,
  selectedJobId: string
) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      // Filtrar por trabajo seleccionado
      if (selectedJobId !== 'all' && candidate.job_id !== selectedJobId) {
        return false;
      }
      
      // Filtrar por estado
      if (filter === 'all') return true;
      if (filter === 'cv-approved') return candidate.cv_status === 'approved' || candidate.cv_status === 'reviewing';
      
      const testStatus = getTestStatus(candidate, activeTab);
      
      if (filter === 'test-pending') return testStatus === 'pending';
      if (filter === 'test-completed') return testStatus === 'completed';
      
      return true;
    });
  }, [candidates, selectedJobId, filter, activeTab]);

  return {
    filter,
    setFilter,
    filteredCandidates
  };
}; 