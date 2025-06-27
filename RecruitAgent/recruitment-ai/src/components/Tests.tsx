import React, { useState } from 'react';
import useJobs from '../hooks/useJobs';
import JobSelector from './Tests/JobSelector';

// Importar hooks personalizados
import { useTestsManager, useTestFilters } from './Tests/hooks';

// Importar componentes
import { 
  TestHeader, 
  TestStats, 
  TestFilters, 
  TestTable, 
  TestLinkModal, 
  ResultsDashboard 
} from './Tests/components';

// Importar utilidades
import { generateTestLink, calculateStats } from './Tests/utils/testHelpers';

// Importar tipos
import type { TestType } from './Tests/types';

const Tests = () => {
  const [activeTab, setActiveTab] = useState<TestType>('cleaver');
  
  // Hook para manejar trabajos
  const { jobs, selectedJobId, setSelectedJobId, jobsLoading } = useJobs();

  // Hook principal para manejar tests
  const {
    currentCandidates,
    candidatesByType,
    currentLoading,
    currentError,
    selectedCandidate,
    setSelectedCandidate,
    showLinkModal,
    setShowLinkModal,
    testResults,
    setTestResults,
    showResultsDashboard,
    setShowResultsDashboard,
    sendInvitation,
    viewResults,
    exportResults
  } = useTestsManager(activeTab);

  // Hook para manejar filtros - usar any[] para evitar conflictos de tipos
  const { filter, setFilter, filteredCandidates } = useTestFilters(
    currentCandidates as any[],
    activeTab,
    selectedJobId
  );

  // Calcular estadísticas - usar any[] para evitar conflictos de tipos
  const currentStats = calculateStats(currentCandidates as any[], activeTab);

  // Función para generar link del test actual
  const generateCurrentTestLink = (candidateId: string) => {
    return generateTestLink(candidateId, activeTab, selectedCandidate as any, candidatesByType as any);
  };

  // Manejo de estados de carga y error
  if (currentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Cargando candidatos...</p>
        </div>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
        <p className="text-red-300">Error: {currentError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con Tabs */}
      <TestHeader 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Selector de Trabajos */}
      <JobSelector
        jobs={jobs}
        jobsLoading={jobsLoading}
        selectedJobId={selectedJobId}
        setSelectedJobId={setSelectedJobId}
      />

      {/* Estadísticas */}
      <TestStats stats={currentStats} />

      {/* Filtros */}
      <TestFilters 
        filter={filter} 
        onFilterChange={setFilter} 
      />

      {/* Tabla de candidatos */}
      <TestTable
        candidates={filteredCandidates}
        activeTab={activeTab}
        selectedJobId={selectedJobId}
        onSendInvitation={sendInvitation}
        onViewResults={viewResults}
        onExportResults={exportResults}
        onCopyLink={(candidate) => {
          setSelectedCandidate(candidate as any);
          setShowLinkModal(true);
        }}
      />

      {/* Modal de enlace generado */}
      {selectedCandidate && showLinkModal && (
        <TestLinkModal
          candidate={selectedCandidate as any}
          activeTab={activeTab}
          generateLink={generateCurrentTestLink}
          onClose={() => {
            setSelectedCandidate(null);
            setShowLinkModal(false);
          }}
        />
      )}

      {/* Dashboard de resultados */}
      <ResultsDashboard
        show={showResultsDashboard}
        testResults={testResults}
        activeTab={activeTab}
        onClose={() => {
          setShowResultsDashboard(false);
          setTestResults(null);
        }}
      />
    </div>
  );
};

export default Tests; 