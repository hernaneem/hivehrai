import React from 'react';
import { Send, Eye, Download, Copy, AlertCircle, Users, Briefcase } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { getTestStatus } from '../utils/statusHelpers';
import type { TestType } from '../types';
import type { CandidateWithTestInfo } from '../../../contexts/CleaverContext';
import type { CandidateWithMossInfo } from '../../../contexts/MossContext';
import type { CandidateWithZavicInfo } from '../../../contexts/ZavicContext';
import type { CandidateWithTermanInfo, CandidateWithRavenInfo } from '../types';

type AnyCandidate = CandidateWithTestInfo | CandidateWithMossInfo | CandidateWithTermanInfo | CandidateWithRavenInfo | CandidateWithZavicInfo;

interface TestTableProps {
  candidates: AnyCandidate[];
  activeTab: TestType;
  selectedJobId: string;
  onSendInvitation: (candidateId: string) => void;
  onViewResults: (candidate: AnyCandidate) => void;
  onExportResults: (candidate: AnyCandidate) => void;
  onCopyLink: (candidate: AnyCandidate) => void;
}

const TestTable: React.FC<TestTableProps> = ({
  candidates,
  activeTab,
  selectedJobId,
  onSendInvitation,
  onViewResults,
  onExportResults,
  onCopyLink
}) => {
  // Helper para verificar si el candidato tiene test token
  const hasTestToken = (candidate: AnyCandidate): boolean => {
    switch (activeTab) {
      case 'cleaver':
        return !!(candidate as CandidateWithTestInfo).test_token;
      case 'moss':
        return !!(candidate as CandidateWithMossInfo).test_token;
      case 'terman':
        return !!(candidate as CandidateWithTermanInfo).test_token;
      case 'raven':
        return !!(candidate as CandidateWithRavenInfo).test_token;
      case 'zavic':
        return !!(candidate as CandidateWithZavicInfo).test_token;
      default:
        return false;
    }
  };

  // Si no hay candidatos, mostrar mensaje vacío
  if (candidates.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <div className="text-white/50 mb-4">
          {selectedJobId === 'all' ? (
            <>
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No hay candidatos disponibles</h3>
              <p className="text-sm">
                No tienes candidatos viables para aplicar tests.
              </p>
              <p className="text-sm mt-2">
                Los candidatos aparecerán aquí una vez que tengas CVs aprobados o viables en la sección de Análisis.
              </p>
            </>
          ) : (
            <>
              <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No hay candidatos para este trabajo</h3>
              <p className="text-sm">
                No tienes candidatos viables para este trabajo específico.
              </p>
              <p className="text-sm mt-2">
                Prueba a seleccionar otro trabajo o revisa la sección de Análisis.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Candidato
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Puesto
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Estado CV
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Estado Test
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {candidates.map((candidate) => {
              const testStatus = getTestStatus(candidate, activeTab);
              const canCreateTest = (candidate.cv_status === 'approved' || candidate.cv_status === 'reviewing') && !hasTestToken(candidate);
              const canCopyLink = (candidate.cv_status === 'approved' || candidate.cv_status === 'reviewing') && hasTestToken(candidate) && testStatus !== 'completed';

              return (
                <tr key={candidate.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{candidate.name}</div>
                      <div className="text-sm text-white/60">{candidate.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{candidate.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={candidate.cv_status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={testStatus} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {/* Botón Crear Test */}
                      {canCreateTest && (
                        <button
                          onClick={() => onSendInvitation(candidate.id)}
                          className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-colors"
                        >
                          <Send className="h-4 w-4" />
                          <span>Crear Test</span>
                        </button>
                      )}

                      {/* Botón Copiar Enlace */}
                      {canCopyLink && (
                        <button
                          onClick={() => onCopyLink(candidate)}
                          className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                          <span>Copiar Enlace</span>
                        </button>
                      )}

                      {/* Botones Ver Resultados y Exportar */}
                      {testStatus === 'completed' && (
                        <>
                          <button
                            onClick={() => onViewResults(candidate)}
                            className="text-green-400 hover:text-green-300 flex items-center space-x-1 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Ver Resultados</span>
                          </button>
                          
                          <button
                            onClick={() => onExportResults(candidate)}
                            className="text-white/70 hover:text-white flex items-center space-x-1 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            <span>Exportar</span>
                          </button>
                        </>
                      )}

                      {/* Estado: Esperando respuesta */}
                      {hasTestToken(candidate) && testStatus === 'pending' && (
                        <span className="text-yellow-400 flex items-center space-x-1">
                          <AlertCircle className="h-4 w-4" />
                          <span>Esperando respuesta</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestTable; 