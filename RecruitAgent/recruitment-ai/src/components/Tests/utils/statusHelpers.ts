import type { TestType, TestStatus } from '../types';
import type { CandidateWithTestInfo } from '../../../contexts/CleaverContext';
import type { CandidateWithMossInfo } from '../../../contexts/MossContext';
import type { CandidateWithZavicInfo } from '../../../contexts/ZavicContext';
import type { CandidateWithTermanInfo, CandidateWithRavenInfo } from '../types';

type AnyCandidate = CandidateWithTestInfo | CandidateWithMossInfo | CandidateWithTermanInfo | CandidateWithRavenInfo | CandidateWithZavicInfo;

export const getTestStatus = (candidate: AnyCandidate, testType: TestType): TestStatus => {
  switch (testType) {
    case 'cleaver':
      return (candidate as CandidateWithTestInfo).cleaver_status || 'not-started';
    case 'moss':
      return (candidate as CandidateWithMossInfo).moss_status || 'not-started';
    case 'terman':
      return (candidate as CandidateWithTermanInfo).terman_status || 'not-started';
    case 'raven':
      return (candidate as CandidateWithRavenInfo).raven_status || 'not-started';
    case 'zavic':
      return (candidate as CandidateWithZavicInfo).zavic_status || 'not-started';
    default:
      return 'not-started';
  }
};

export const getStatusBadgeConfig = (status: string) => {
  const badges = {
    'pending': { color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', text: 'Pendiente' },
    'completed': { color: 'bg-green-500/20 text-green-300 border border-green-500/30', text: 'Completado' },
    'in-progress': { color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', text: 'En progreso' },
    'not-started': { color: 'bg-gray-500/20 text-gray-300 border border-gray-500/30', text: 'No iniciado' },
    'approved': { color: 'bg-green-500/20 text-green-300 border border-green-500/30', text: 'Aprobado' },
    'reviewing': { color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', text: 'En revisión' },
    'rejected': { color: 'bg-red-500/20 text-red-300 border border-red-500/30', text: 'Rechazado' }
  } as const;
  
  return badges[status as keyof typeof badges] || badges['not-started'];
}; 