import { useState, useMemo, useCallback } from 'react';
import { useCleaver } from '../../../contexts/CleaverContext';
import { useMoss } from '../../../contexts/MossContext';
import { useZavic } from '../../../contexts/ZavicContext';
import { useTermanCandidates } from './useTermanCandidates';
import { useRavenCandidates } from './useRavenCandidates';
import type { 
  AnyCandidate, 
  TestType, 
  CandidateWithTestInfo, 
  CandidateWithMossInfo,
  CandidateWithZavicInfo,
  CandidateWithTermanInfo,
  CandidateWithRavenInfo 
} from '../types';

export const useTestsManager = (activeTab: TestType) => {
  // Hooks de contexto existentes
  const {
    candidates: cleaverCandidates,
    loading: cleaverLoading,
    error: cleaverError,
    createTest: createCleaverTest,
    getTestResults: getCleaverTestResults,
    exportTestResults: exportCleaverTestResults
  } = useCleaver();

  const {
    candidates: mossCandidates,
    loading: mossLoading,
    error: mossError,
    createTest: createMossTest,
    getTestResults: getMossTestResults,
    exportTestResults: exportMossTestResults
  } = useMoss();

  const {
    candidates: zavicCandidates,
    loading: zavicLoading,
    error: zavicError,
    createTest: createZavicTest,
    getTestResults: getZavicTestResults,
    exportTestResults: exportZavicTestResults
  } = useZavic();

  // Nuevos hooks personalizados
  const {
    candidates: termanCandidates,
    loading: termanLoading,
    error: termanError,
    createTest: createTermanTest,
    getTestResults: getTermanTestResults,
    exportTestResults: exportTermanTestResults
  } = useTermanCandidates();

  const {
    candidates: ravenCandidates,
    loading: ravenLoading,
    error: ravenError,
    createTest: createRavenTest,
    getTestResults: getRavenTestResults,
    exportTestResults: exportRavenTestResults
  } = useRavenCandidates();

  // Estado para el candidato seleccionado y el modal
  const [selectedCandidate, setSelectedCandidate] = useState<AnyCandidate | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showResultsDashboard, setShowResultsDashboard] = useState(false);

  // Obtener candidatos según el tab activo - con cast a AnyCandidate[]
  const currentCandidates = useMemo((): AnyCandidate[] => {
    switch (activeTab) {
      case 'cleaver': return cleaverCandidates as unknown as AnyCandidate[];
      case 'moss': return mossCandidates as unknown as AnyCandidate[];
      case 'terman': return termanCandidates as AnyCandidate[];
      case 'raven': return ravenCandidates as AnyCandidate[];
      case 'zavic': return zavicCandidates as unknown as AnyCandidate[];
      default: return [];
    }
  }, [activeTab, cleaverCandidates, mossCandidates, termanCandidates, ravenCandidates, zavicCandidates]);

  // Obtener estado de carga según el tab activo
  const currentLoading = useMemo(() => {
    switch (activeTab) {
      case 'cleaver': return cleaverLoading;
      case 'moss': return mossLoading;
      case 'terman': return termanLoading;
      case 'raven': return ravenLoading;
      case 'zavic': return zavicLoading;
      default: return false;
    }
  }, [activeTab, cleaverLoading, mossLoading, termanLoading, ravenLoading, zavicLoading]);

  // Obtener error según el tab activo
  const currentError = useMemo(() => {
    switch (activeTab) {
      case 'cleaver': return cleaverError;
      case 'moss': return mossError;
      case 'terman': return termanError;
      case 'raven': return ravenError;
      case 'zavic': return zavicError;
      default: return '';
    }
  }, [activeTab, cleaverError, mossError, termanError, ravenError, zavicError]);

  // Mapa de candidatos por tipo de test
  const candidatesByType = useMemo(() => ({
    cleaver: cleaverCandidates as unknown as AnyCandidate[],
    moss: mossCandidates as unknown as AnyCandidate[],
    terman: termanCandidates as AnyCandidate[],
    raven: ravenCandidates as AnyCandidate[],
    zavic: zavicCandidates as unknown as AnyCandidate[]
  }), [cleaverCandidates, mossCandidates, termanCandidates, ravenCandidates, zavicCandidates]);

  // Función para enviar invitación
  const sendInvitation = useCallback(async (candidateId: string) => {
    try {
      const candidate = currentCandidates.find(c => c.id === candidateId);
      if (!candidate?.job_id) {
        alert('Error: No se puede enviar invitación, falta información del trabajo');
        return;
      }

      let createdTest;
      let candidateWithTest: AnyCandidate;

      switch (activeTab) {
        case 'cleaver':
          createdTest = await createCleaverTest(candidateId, candidate.job_id);
          candidateWithTest = {
            ...candidate,
            cleaver_status: 'pending',
            invitation_sent: true,
            test_id: createdTest.id,
            test_token: createdTest.test_token
          } as CandidateWithTestInfo as AnyCandidate;
          break;

        case 'moss':
          createdTest = await createMossTest(candidateId, candidate.job_id);
          candidateWithTest = {
            ...candidate,
            moss_status: 'pending',
            invitation_sent: true,
            test_id: createdTest.id,
            test_token: createdTest.test_token
          } as CandidateWithMossInfo as AnyCandidate;
          break;

        case 'terman':
          createdTest = await createTermanTest(candidateId, candidate.job_id);
          candidateWithTest = {
            ...candidate,
            terman_status: 'pending',
            invitation_sent: true,
            test_id: createdTest.id,
            test_token: createdTest.test_token
          } as CandidateWithTermanInfo;
          break;

        case 'raven':
          createdTest = await createRavenTest(candidateId, candidate.job_id);
          candidateWithTest = {
            ...candidate,
            raven_status: 'pending',
            invitation_sent: true,
            test_id: createdTest.id,
            test_token: createdTest.test_token
          } as CandidateWithRavenInfo;
          break;

        case 'zavic':
          createdTest = await createZavicTest(candidateId, candidate.job_id);
          candidateWithTest = {
            ...candidate,
            zavic_status: 'pending',
            invitation_sent: true,
            test_id: createdTest.id.toString(), // Convertir number a string
            test_token: createdTest.test_token
          } as CandidateWithZavicInfo;
          break;

        default:
          throw new Error('Tipo de test no válido');
      }

      setSelectedCandidate(candidateWithTest);
      setShowLinkModal(true);
    } catch (error) {
      alert(`Error enviando invitación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [activeTab, currentCandidates, createCleaverTest, createMossTest, createTermanTest, createRavenTest, createZavicTest]);

  // Función para ver resultados
  const viewResults = useCallback(async (candidate: AnyCandidate) => {
    try {
      if (!candidate.test_id && activeTab !== 'zavic') {
        alert('No hay test disponible para ver resultados');
        return;
      }

      let results;

      switch (activeTab) {
        case 'cleaver':
          const cleaverCandidate = candidate as CandidateWithTestInfo;
          if (!cleaverCandidate.test_id) {
            alert('No hay test disponible para ver resultados');
            return;
          }
          results = await getCleaverTestResults(cleaverCandidate.test_id);
          if (!results) {
            alert('No se encontraron resultados para este test');
            return;
          }
          setTestResults({
            id: results.test.id,
            candidate: {
              name: results.test.candidate?.name || candidate.name,
              email: results.test.candidate?.email || candidate.email
            },
            job: {
              title: results.test.job?.title || candidate.position || 'No especificado',
              company: results.test.job?.company
            },
            status: results.test.status,
            completed_at: results.test.completed_at || '',
            time_spent_minutes: results.test.time_spent_minutes,
            scores: {
              D: { 
                M: results.scores?.d_most || 0, 
                L: results.scores?.d_least || 0, 
                T: results.scores?.d_total || 0 
              },
              I: { 
                M: results.scores?.i_most || 0, 
                L: results.scores?.i_least || 0, 
                T: results.scores?.i_total || 0 
              },
              S: { 
                M: results.scores?.s_most || 0, 
                L: results.scores?.s_least || 0, 
                T: results.scores?.s_total || 0 
              },
              C: { 
                M: results.scores?.c_most || 0, 
                L: results.scores?.c_least || 0, 
                T: results.scores?.c_total || 0 
              }
            },
            percentiles: {
              D: results.scores?.d_percentile || 50,
              I: results.scores?.i_percentile || 50,
              S: results.scores?.s_percentile || 50,
              C: results.scores?.c_percentile || 50
            },
            interpretation: results.interpretation ? {
              dominant_profile: results.interpretation.dominant_profile || 'Perfil balanceado',
              strengths: results.interpretation.strengths || [],
              development_areas: results.interpretation.development_areas || [],
              recommendations: results.interpretation.recommendations || []
            } : undefined
          });
          break;

        case 'moss':
          const mossCandidate = candidate as CandidateWithMossInfo;
          if (!mossCandidate.test_id) {
            alert('No hay test disponible para ver resultados');
            return;
          }
          results = await getMossTestResults(mossCandidate.test_id);
          if (!results) {
            alert('No se encontraron resultados para este test');
            return;
          }
          setTestResults({
            id: results.id,
            candidate: {
              name: results.candidate?.name || candidate.name,
              email: results.candidate?.email || candidate.email
            },
            job: {
              title: results.job?.title || candidate.position || 'No especificado',
              company: results.job?.company
            },
            status: results.status,
            completed_at: results.completed_at || '',
            time_spent_minutes: results.time_spent_minutes,
            scores: {
              HS: { 
                score: results.hs_score || 0, 
                percentage: results.hs_percentage || 0, 
                level: results.hs_level || 'Sin evaluar' 
              },
              CDRH: { 
                score: results.cdrh_score || 0, 
                percentage: results.cdrh_percentage || 0, 
                level: results.cdrh_level || 'Sin evaluar' 
              },
              CEPI: { 
                score: results.cepi_score || 0, 
                percentage: results.cepi_percentage || 0, 
                level: results.cepi_level || 'Sin evaluar' 
              },
              HERI: { 
                score: results.heri_score || 0, 
                percentage: results.heri_percentage || 0, 
                level: results.heri_level || 'Sin evaluar' 
              },
              SCTRI: { 
                score: results.sctri_score || 0, 
                percentage: results.sctri_percentage || 0, 
                level: results.sctri_level || 'Sin evaluar' 
              }
            },
            total_percentage: results.total_percentage || 0,
            recommendation: results.total_percentage! >= 83 ? 'Altamente Recomendado' : 
                           results.total_percentage! >= 64 ? 'Recomendado' : 
                           results.total_percentage! >= 42 ? 'Aceptable' : 'No Recomendado'
          });
          break;

        case 'terman':
          const termanCandidate = candidate as CandidateWithTermanInfo;
          results = await getTermanTestResults(termanCandidate.id);
          if (!results) {
            alert('No se encontraron resultados para este candidato');
            return;
          }
          setTestResults(results);
          break;

        case 'raven':
          const ravenCandidate = candidate as CandidateWithRavenInfo;
          if (ravenCandidate.test_id) {
            results = await getRavenTestResults(ravenCandidate.test_id);
            if (!results) {
              alert('No se encontraron resultados para este candidato');
              return;
            }
            setTestResults(results);
          }
          break;

        case 'zavic':
          const zavicCandidate = candidate as CandidateWithZavicInfo;
          // Para ZAVIC, test_id puede ser string o number, necesitamos convertirlo
          const zavicTestId = typeof zavicCandidate.test_id === 'string' 
            ? parseInt(zavicCandidate.test_id) 
            : zavicCandidate.test_id;
            
          if (!zavicTestId) {
            alert('No hay test disponible para ver resultados');
            return;
          }
          
          results = await getZavicTestResults(zavicTestId);
          if (!results) {
            alert('No se encontraron resultados para este test');
            return;
          }
          setTestResults({
            id: results.id,
            candidate: {
              name: results.candidate?.name || candidate.name,
              email: results.candidate?.email || candidate.email
            },
            job: {
              title: results.job?.title || candidate.position || 'No especificado',
              company: results.job?.company
            },
            status: results.status,
            completed_at: results.completed_at || '',
            time_spent_minutes: results.time_spent_minutes,
            scores: {
              moral: results.moral_score || 0,
              legalidad: results.legalidad_score || 0,
              indiferencia: results.indiferencia_score || 0,
              corrupcion: results.corrupcion_score || 0,
              economico: results.economico_score || 0,
              politico: results.politico_score || 0,
              social: results.social_score || 0,
              religioso: results.religioso_score || 0,
            },
            total_score: results.total_score || 0
          });
          break;
      }

      setShowResultsDashboard(true);
    } catch (error) {
      alert(`Error cargando resultados: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [activeTab, getCleaverTestResults, getMossTestResults, getTermanTestResults, getRavenTestResults, getZavicTestResults]);

  // Función para exportar resultados
  const exportResults = useCallback(async (candidate: AnyCandidate) => {
    try {
      switch (activeTab) {
        case 'cleaver':
          const cleaverCandidate = candidate as CandidateWithTestInfo;
          if (!cleaverCandidate.test_id) {
            alert('No hay test disponible para exportar');
            return;
          }
          await exportCleaverTestResults(cleaverCandidate.test_id);
          break;

        case 'moss':
          const mossCandidate = candidate as CandidateWithMossInfo;
          if (!mossCandidate.test_id) {
            alert('No hay test disponible para exportar');
            return;
          }
          await exportMossTestResults(mossCandidate.test_id);
          break;

        case 'terman':
          await exportTermanTestResults(candidate as CandidateWithTermanInfo);
          break;

        case 'raven':
          await exportRavenTestResults(candidate as CandidateWithRavenInfo);
          break;

        case 'zavic':
          const zavicCandidate = candidate as CandidateWithZavicInfo;
          const zavicTestId = typeof zavicCandidate.test_id === 'string' 
            ? parseInt(zavicCandidate.test_id) 
            : zavicCandidate.test_id;
            
          if (!zavicTestId) {
            alert('No hay test disponible para exportar');
            return;
          }
          await exportZavicTestResults(zavicTestId);
          break;
      }
    } catch (error) {
      alert(`Error exportando resultados: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [activeTab, exportCleaverTestResults, exportMossTestResults, exportTermanTestResults, exportRavenTestResults, exportZavicTestResults]);

  return {
    // Candidatos
    currentCandidates,
    candidatesByType,
    
    // Estado
    currentLoading,
    currentError,
    
    // Modal
    selectedCandidate,
    setSelectedCandidate,
    showLinkModal,
    setShowLinkModal,
    
    // Resultados
    testResults,
    setTestResults,
    showResultsDashboard,
    setShowResultsDashboard,
    
    // Acciones
    sendInvitation,
    viewResults,
    exportResults
  };
}; 