import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Clock, AlertCircle, Send, Eye, Download, Filter, Brain, Target, Copy, Briefcase, Heart } from 'lucide-react';
import { useCleaver } from '../contexts/CleaverContext';
import { useMoss } from '../contexts/MossContext';
import { useZavic } from '../contexts/ZavicContext';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { CandidateWithTestInfo } from '../contexts/CleaverContext';
import type { CandidateWithMossInfo } from '../contexts/MossContext';
import type { CandidateWithZavicInfo } from '../contexts/ZavicContext';
import CleaverResultsDashboard from './CleaverResultsDashboard';
import MossResultsDashboard from './MossResultsDashboard';
import ZavicResultsDashboard from './ZavicResultsDashboard';
import PsychometricTests from './PsychometricTests';
import RavenTests from './RavenTests';
import useJobs from '../hooks/useJobs';
import JobSelector from './Tests/JobSelector';

// Job type is now imported from useJobs hook

const Tests = () => {
  const { user } = useAuth();
  const { 
    candidates: cleaverCandidates, 
    stats: cleaverStats, 
    loading: cleaverLoading, 
    error: cleaverError, 
    createTest: createCleaverTest, 
    getTestResults: getCleaverTestResults, 
    exportTestResults: exportCleaverTestResults 
  } = useCleaver();

  const {
    candidates: mossCandidates,
    stats: mossStats,
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

  const [activeTab, setActiveTab] = useState<'cleaver' | 'moss' | 'terman' | 'raven' | 'zavic'>('cleaver');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithTestInfo | null>(null);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [testResults, setTestResults] = useState<any>(null);
  const [showResultsDashboard, setShowResultsDashboard] = useState(false);

  // Estados y lógica de trabajos delegados al hook useJobs
  const { jobs, selectedJobId, setSelectedJobId, jobsLoading } = useJobs();

  const getStatusBadge = (status: string) => {
    const badges = {
      'pending': { color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', text: 'Pendiente' },
      'completed': { color: 'bg-green-500/20 text-green-300 border border-green-500/30', text: 'Completado' },
      'in-progress': { color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', text: 'En progreso' },
      'not-started': { color: 'bg-gray-500/20 text-gray-300 border border-gray-500/30', text: 'No iniciado' },
      'approved': { color: 'bg-green-500/20 text-green-300 border border-green-500/30', text: 'Aprobado' },
      'reviewing': { color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', text: 'En revisión' },
      'rejected': { color: 'bg-red-500/20 text-red-300 border border-red-500/30', text: 'Rechazado' }
    } as const;
    
    const badge = badges[status as keyof typeof badges] || badges['not-started'];
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const sendCleaverInvitation = async (candidateId: string) => {
    try {
      const candidate = cleaverCandidates.find(c => c.id === candidateId);
      if (!candidate?.job_id) {
        alert('Error: No se puede enviar invitación, falta información del trabajo');
        return;
      }

      // Crear el test y obtener los datos del test creado
      const createdTest = await createCleaverTest(candidateId, candidate.job_id);
      
      // Crear un candidato temporal con la información del test para mostrar inmediatamente
      const candidateWithTest: CandidateWithTestInfo = {
        ...candidate,
        cleaver_status: 'pending',
        invitation_sent: true,
        test_id: createdTest.id,
        test_token: createdTest.test_token
      };
      
      setSelectedCandidate(candidateWithTest);
      setShowLinkModal(true);
      
    } catch (error) {
      alert(`Error enviando invitación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const sendMossInvitation = async (candidateId: string) => {
    try {
      const candidate = mossCandidates.find(c => c.id === candidateId);
      if (!candidate?.job_id) {
        alert('Error: No se puede enviar invitación, falta información del trabajo');
        return;
      }

      // Crear el test y obtener los datos del test creado
      const createdTest = await createMossTest(candidateId, candidate.job_id);
      
      // Crear un candidato temporal con la información del test para mostrar inmediatamente
      const candidateWithTest = {
        ...candidate,
        moss_status: 'pending' as const,
        invitation_sent: true,
        test_id: createdTest.id,
        test_token: createdTest.test_token
      };
      
      // Para MOSS, usamos el mismo modal que Cleaver pero con datos MOSS
      setSelectedCandidate(candidateWithTest as any);
      setShowLinkModal(true);
      
    } catch (error) {
      alert(`Error enviando invitación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const sendZavicInvitation = async (candidateId: string) => {
    try {
      const candidate = zavicCandidates.find(c => c.id === candidateId);
      if (!candidate?.job_id) {
        alert('Error: No se puede enviar invitación, falta información del trabajo');
        return;
      }

      // Crear el test y obtener los datos del test creado
      const createdTest = await createZavicTest(candidateId, candidate.job_id);
      
      // Crear un candidato temporal con la información del test para mostrar inmediatamente
      const candidateWithTest = {
        ...candidate,
        zavic_status: 'pending' as const,
        zavic_invitation_sent: true,
        zavic_test_id: createdTest.id,
        zavic_test_token: createdTest.test_token
      };
      
      // Para ZAVIC, usamos el mismo modal
      setSelectedCandidate(candidateWithTest as any);
      setShowLinkModal(true);
      
    } catch (error) {
      alert(`Error enviando invitación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const generateCleaverLink = (candidateId: string) => {
    // Primero buscar en selectedCandidate si coincide el ID
    if (selectedCandidate?.id === candidateId && selectedCandidate?.test_token) {
      return `${window.location.origin}/cleaver-test/${selectedCandidate.test_token}`;
    }
    
    // Luego buscar en la lista de candidatos
    const candidate = cleaverCandidates.find(c => c.id === candidateId);
    if (candidate?.test_token) {
      return `${window.location.origin}/cleaver-test/${candidate.test_token}`;
    }
    
    return '';
  };

  const generateMossLink = (candidateId: string) => {
    // Primero buscar en selectedCandidate si coincide el ID
    if (selectedCandidate?.id === candidateId && (selectedCandidate as any)?.test_token) {
      return `${window.location.origin}/moss-test/${(selectedCandidate as any).test_token}`;
    }
    
    // Luego buscar en la lista de candidatos
    const candidate = mossCandidates.find(c => c.id === candidateId);
    if (candidate?.test_token) {
      return `${window.location.origin}/moss-test/${candidate.test_token}`;
    }
    
    return '';
  };

  const generateZavicLink = (candidateId: string) => {
    // Primero buscar en selectedCandidate si coincide el ID
    if (selectedCandidate?.id === candidateId && (selectedCandidate as any)?.zavic_test_token) {
      return `${window.location.origin}/zavic-test/${(selectedCandidate as any).zavic_test_token}`;
    }
    
    // Luego buscar en la lista de candidatos
    const candidate = zavicCandidates.find(c => c.id === candidateId);
    if (candidate?.zavic_test_token) {
      return `${window.location.origin}/zavic-test/${candidate.zavic_test_token}`;
    }
    
    return '';
  };

  const filteredCandidates = () => {
    const candidates = activeTab === 'cleaver' ? cleaverCandidates 
                     : activeTab === 'moss' ? mossCandidates 
                     : zavicCandidates;
    
    return candidates.filter(candidate => {
      // Filtrar por trabajo seleccionado
      if (selectedJobId !== 'all' && candidate.job_id !== selectedJobId) {
        return false;
      }
      
      // Filtrar por estado
      if (filter === 'all') return true;
      if (filter === 'cv-approved') return candidate.cv_status === 'approved' || candidate.cv_status === 'reviewing';
      
      if (activeTab === 'cleaver') {
        const cleaverCandidate = candidate as CandidateWithTestInfo;
        if (filter === 'test-pending') return cleaverCandidate.cleaver_status === 'pending';
        if (filter === 'test-completed') return cleaverCandidate.cleaver_status === 'completed';
      } else if (activeTab === 'moss') {
        const mossCandidate = candidate as CandidateWithMossInfo;
        if (filter === 'test-pending') return mossCandidate.moss_status === 'pending';
        if (filter === 'test-completed') return mossCandidate.moss_status === 'completed';
      } else if (activeTab === 'zavic') {
        const zavicCandidate = candidate as CandidateWithZavicInfo;
        if (filter === 'test-pending') return zavicCandidate.zavic_status === 'pending';
        if (filter === 'test-completed') return zavicCandidate.zavic_status === 'completed';
      }
      
      return true;
    });
  };

  const viewCleaverResults = async (candidate: CandidateWithTestInfo) => {
    try {
      if (!candidate.test_id) {
        alert('No hay test disponible para ver resultados');
        return;
      }
      const results = await getCleaverTestResults(candidate.test_id);
      
      if (!results) {
        alert('No se encontraron resultados para este test');
        return;
      }

      // Adaptar el formato de datos para el dashboard
      const adaptedResults = {
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
      };

      setTestResults(adaptedResults);
      setShowResultsDashboard(true);
    } catch (error) {
      alert(`Error cargando resultados: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const viewMossResults = async (candidate: CandidateWithMossInfo) => {
    try {
      if (!candidate.test_id) {
        alert('No hay test disponible para ver resultados');
        return;
      }
      const results = await getMossTestResults(candidate.test_id);
      
      if (!results) {
        alert('No se encontraron resultados para este test');
        return;
      }

      // Adaptar el formato de datos para el dashboard
      console.log('🔍 DEBUG: Datos originales del test MOSS:', results);
      console.log('🔍 DEBUG: Porcentajes originales:', {
        hs_percentage: results.hs_percentage,
        cdrh_percentage: results.cdrh_percentage,
        cepi_percentage: results.cepi_percentage,
        heri_percentage: results.heri_percentage,
        sctri_percentage: results.sctri_percentage,
        total_percentage: results.total_percentage
      });

      const adaptedResults = {
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
        recommendation: candidate.moss_results?.hs_level ? 
          (results.total_percentage! >= 83 ? 'Altamente Recomendado' : 
           results.total_percentage! >= 64 ? 'Recomendado' : 
           results.total_percentage! >= 42 ? 'Aceptable' : 'No Recomendado') : 'Sin evaluar'
      };

      setTestResults(adaptedResults);
      setShowResultsDashboard(true);
    } catch (error) {
      alert(`Error cargando resultados: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const viewZavicResults = async (candidate: CandidateWithZavicInfo) => {
    try {
      if (!candidate.zavic_test_id) {
        alert('No hay test disponible para ver resultados');
        return;
      }
      const results = await getZavicTestResults(candidate.zavic_test_id);
      
      if (!results) {
        alert('No se encontraron resultados para este test');
        return;
      }

      // Adaptar el formato de datos para el dashboard
      const adaptedResults = {
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
      };

      setTestResults(adaptedResults);
      setShowResultsDashboard(true);
    } catch (error) {
      console.error('Error al cargar resultados ZAVIC:', error);
      alert(`Error cargando resultados: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const exportResults = async (candidate: CandidateWithTestInfo | CandidateWithMossInfo | CandidateWithZavicInfo) => {
    try {
      if (activeTab === 'cleaver') {
        const cleaverCandidate = candidate as CandidateWithTestInfo;
        if (!cleaverCandidate.test_id) {
          alert('No hay test disponible para exportar');
          return;
        }
        await exportCleaverTestResults(cleaverCandidate.test_id);
      } else if (activeTab === 'moss') {
        const mossCandidate = candidate as CandidateWithMossInfo;
        if (!mossCandidate.test_id) {
          alert('No hay test disponible para exportar');
          return;
        }
        await exportMossTestResults(mossCandidate.test_id);
      } else if (activeTab === 'zavic') {
        const zavicCandidate = candidate as CandidateWithZavicInfo;
        if (!zavicCandidate.zavic_test_id) {
          alert('No hay test disponible para exportar');
          return;
        }
        await exportZavicTestResults(zavicCandidate.zavic_test_id);
      }
    } catch (error) {
      alert(`Error exportando resultados: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const currentStats = activeTab === 'cleaver'
    ? cleaverStats
    : activeTab === 'moss'
    ? mossStats
    : activeTab === 'zavic'
    ? {
        totalCandidates: zavicCandidates.length,
        cvsApproved: zavicCandidates.filter(c => c.cv_status === 'approved' || c.cv_status === 'reviewing').length,
        testsCompleted: zavicCandidates.filter(c => c.zavic_status === 'completed').length,
        testsPending: zavicCandidates.filter(c => c.zavic_status === 'pending').length,
        testsInProgress: zavicCandidates.filter(c => c.zavic_status === 'in-progress').length
      }
    : {
        totalCandidates: 0,
        cvsApproved: 0,
        testsCompleted: 0,
        testsPending: 0,
        testsInProgress: 0
      };
  const currentLoading = activeTab === 'cleaver' ? cleaverLoading : activeTab === 'moss' ? mossLoading : zavicLoading;
  const currentError = activeTab === 'cleaver' ? cleaverError : activeTab === 'moss' ? mossError : zavicError;

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
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Tests Psicométricos
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab('cleaver')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'cleaver'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Brain className="h-5 w-5" />
            <span>Test Cleaver (DISC)</span>
          </button>
          <button
            onClick={() => setActiveTab('moss')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'moss'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Target className="h-5 w-5" />
            <span>Test MOSS</span>
          </button>
          <button
            onClick={() => setActiveTab('terman')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'terman'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Brain className="h-5 w-5" />
            <span>Test Terman-Merrill</span>
          </button>
          <button
            onClick={() => setActiveTab('raven')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'raven'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Brain className="h-5 w-5" />
            <span>Test Raven (RPM)</span>
          </button>
          <button
            onClick={() => setActiveTab('zavic')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'zavic'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Heart className="h-5 w-5" />
            <span>Test ZAVIC (Valores)</span>
          </button>
        </div>

        <p className="text-white/70">
          {activeTab === 'cleaver' 
            ? 'Gestión de evaluaciones Cleaver (DISC) para candidatos'
            : activeTab === 'moss'
            ? 'Gestión de evaluaciones MOSS (Habilidades Interpersonales) para candidatos'
            : activeTab === 'raven'
            ? 'Gestión de evaluaciones Raven Progressive Matrices para candidatos'
            : activeTab === 'zavic'
            ? 'Gestión de evaluaciones ZAVIC (Valores e Intereses) para candidatos'
            : 'Gestión de evaluaciones Terman-Merrill (Inteligencia) para candidatos'
          }
        </p>
      </div>

      {/* Selector de Trabajos */}
      <JobSelector
        jobs={jobs}
        jobsLoading={jobsLoading}
        selectedJobId={selectedJobId}
        setSelectedJobId={setSelectedJobId}
      />

      {/* Estadísticas */}
      {(activeTab === 'cleaver' || activeTab === 'moss' || activeTab === 'zavic') && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Candidatos</p>
                <p className="text-2xl font-bold text-white">{currentStats.totalCandidates}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">CVs Aprobados</p>
                <p className="text-2xl font-bold text-white">{currentStats.cvsApproved}</p>
              </div>
              <FileText className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Tests Completados</p>
                <p className="text-2xl font-bold text-white">{currentStats.testsCompleted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Pendientes</p>
                <p className="text-2xl font-bold text-white">{currentStats.testsPending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>
      )}

      {/* Renderizar contenido según pestaña activa */}
      {activeTab === 'terman' ? (
        // Componente de Tests Psicométricos Terman-Merrill
        <PsychometricTests />
      ) : activeTab === 'raven' ? (
        // Componente de Raven Progressive Matrices
        <RavenTests />
      ) : (
        <>
          {/* Filtros */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-white/70" />
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'all' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter('cv-approved')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'cv-approved' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                CV Viable
              </button>
              <button
                onClick={() => setFilter('test-pending')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'test-pending' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                Test Pendiente
              </button>
              <button
                onClick={() => setFilter('test-completed')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === 'test-completed' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                Test Completado
              </button>
            </div>
          </div>

          {/* Tabla de candidatos */}
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
                  {filteredCandidates().map((candidate) => {
                    const testStatus = activeTab === 'cleaver' 
                      ? (candidate as CandidateWithTestInfo).cleaver_status
                      : activeTab === 'moss'
                      ? (candidate as CandidateWithMossInfo).moss_status
                      : (candidate as CandidateWithZavicInfo).zavic_status;

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
                          {getStatusBadge(candidate.cv_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(testStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            {(candidate.cv_status === 'approved' || candidate.cv_status === 'reviewing') && 
                             !((activeTab === 'cleaver' && (candidate as CandidateWithTestInfo).test_token) ||
                               (activeTab === 'moss' && (candidate as CandidateWithMossInfo).test_token) ||
                               (activeTab === 'zavic' && (candidate as CandidateWithZavicInfo).zavic_test_token)) && (
                              <button
                                onClick={() => {
                                  if (activeTab === 'cleaver') sendCleaverInvitation(candidate.id);
                                  else if (activeTab === 'moss') sendMossInvitation(candidate.id);
                                  else if (activeTab === 'zavic') sendZavicInvitation(candidate.id);
                                }}
                                className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-colors"
                              >
                                <Send className="h-4 w-4" />
                                <span>Crear Test</span>
                              </button>
                            )}

                            {(candidate.cv_status === 'approved' || candidate.cv_status === 'reviewing') && 
                             ((activeTab === 'cleaver' && (candidate as CandidateWithTestInfo).test_token) ||
                              (activeTab === 'moss' && (candidate as CandidateWithMossInfo).test_token) ||
                              (activeTab === 'zavic' && (candidate as CandidateWithZavicInfo).zavic_test_token)) && 
                             testStatus !== 'completed' && (
                              <button
                                onClick={() => {
                                  setSelectedCandidate(candidate as any);
                                  setShowLinkModal(true);
                                }}
                                className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 transition-colors"
                              >
                                <Copy className="h-4 w-4" />
                                <span>Copiar Enlace</span>
                              </button>
                            )}

                            {testStatus === 'completed' && (
                              <>
                                {activeTab === 'cleaver' && (
                                  <button
                                    onClick={() => viewCleaverResults(candidate as CandidateWithTestInfo)}
                                    className="text-green-400 hover:text-green-300 flex items-center space-x-1 transition-colors"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span>Ver Resultados</span>
                                  </button>
                                )}
                                
                                {activeTab === 'moss' && (
                                  <button
                                    onClick={() => viewMossResults(candidate as CandidateWithMossInfo)}
                                    className="text-green-400 hover:text-green-300 flex items-center space-x-1 transition-colors"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span>Ver Resultados</span>
                                  </button>
                                )}

                                {activeTab === 'zavic' && (
                                  <button
                                    onClick={() => viewZavicResults(candidate as CandidateWithZavicInfo)}
                                    className="text-green-400 hover:text-green-300 flex items-center space-x-1 transition-colors"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span>Ver Resultados</span>
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => exportResults(candidate)}
                                  className="text-white/70 hover:text-white flex items-center space-x-1 transition-colors"
                                >
                                  <Download className="h-4 w-4" />
                                  <span>Exportar</span>
                                </button>
                              </>
                            )}

                            {((activeTab === 'cleaver' && (candidate as CandidateWithTestInfo).test_token) ||
                              (activeTab === 'moss' && (candidate as CandidateWithMossInfo).test_token) ||
                              (activeTab === 'zavic' && (candidate as CandidateWithZavicInfo).zavic_test_token)) && 
                             testStatus === 'pending' && (
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

          {/* Mensaje cuando no hay candidatos */}
          {filteredCandidates().length === 0 && (
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
          )}
        </>
      )}

      {/* Modal de enlace generado - Para ambos tipos de tests */}
      {selectedCandidate && showLinkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-white mb-4">
              {activeTab === 'cleaver' ? '🧠 Enlace de Test Cleaver' 
               : activeTab === 'moss' ? '🎯 Enlace de Test MOSS'
               : '❤️ Enlace de Test ZAVIC'}
            </h3>
            <p className="text-white/70 text-sm mb-4">
              Comparte este enlace con <strong className="text-white">{selectedCandidate?.name}</strong> para que realice el test {activeTab === 'cleaver' ? 'psicométrico' : activeTab === 'moss' ? 'de habilidades interpersonales' : 'de valores e intereses'}:
            </p>

            {/* Información del candidato */}
            <div className="bg-black/20 p-3 rounded-lg mb-4 border border-white/10">
              <div className="text-sm text-white/80 mb-2">
                <strong>Candidato:</strong> {selectedCandidate?.name}
              </div>
              <div className="text-sm text-white/80 mb-2">
                <strong>Email:</strong> {selectedCandidate?.email}
              </div>
              <div className="text-sm text-white/80">
                <strong>Puesto:</strong> {selectedCandidate?.position}
              </div>
            </div>

            {/* Enlace */}
            <div className="bg-black/30 p-4 rounded-lg mb-4 border border-white/10">
              <div className="text-xs text-white/60 mb-2">Enlace del test:</div>
              <div className="flex items-center space-x-2">
                <code className="text-sm text-green-300 break-all font-mono flex-1 p-2 bg-black/30 rounded border">
                  {selectedCandidate ? (
                    activeTab === 'cleaver' 
                      ? generateCleaverLink(selectedCandidate.id)
                      : activeTab === 'moss'
                      ? generateMossLink(selectedCandidate.id)
                      : generateZavicLink(selectedCandidate.id)
                  ) : 'Generando enlace...'}
                </code>
                <button
                  onClick={() => {
                    if (selectedCandidate) {
                      const link = activeTab === 'cleaver' 
                        ? generateCleaverLink(selectedCandidate.id)
                        : activeTab === 'moss'
                        ? generateMossLink(selectedCandidate.id)
                        : generateZavicLink(selectedCandidate.id);
                      if (link) {
                        navigator.clipboard.writeText(link);
                        alert('📋 Enlace copiado!');
                      }
                    }
                  }}
                  className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs transition-colors"
                >
                  📋
                </button>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mb-4">
              <div className="text-xs text-blue-300 mb-1">📋 Instrucciones para el candidato:</div>
              <ul className="text-xs text-blue-200 space-y-1">
                {activeTab === 'cleaver' ? (
                  <>
                    <li>• El test tiene una duración aproximada de 15-20 minutos</li>
                    <li>• Debe completarse en una sola sesión</li>
                    <li>• El enlace expira en 7 días</li>
                    <li>• No hay respuestas correctas o incorrectas</li>
                  </>
                ) : activeTab === 'moss' ? (
                  <>
                    <li>• El test tiene una duración aproximada de 20-25 minutos</li>
                    <li>• Consta de 30 preguntas sobre situaciones interpersonales</li>
                    <li>• Debe completarse en una sola sesión</li>
                    <li>• El enlace expira en 7 días</li>
                    <li>• Responde de forma espontánea y honesta</li>
                  </>
                ) : (
                  <>
                    <li>• El test tiene una duración aproximada de 25-30 minutos</li>
                    <li>• Consta de 20 preguntas sobre situaciones éticas y de valores</li>
                    <li>• Debe asignar valores del 1 al 4 a cada opción</li>
                    <li>• El enlace expira en 7 días</li>
                    <li>• Responde según tu verdadera escala de valores</li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  if (selectedCandidate) {
                    const link = activeTab === 'cleaver' 
                      ? generateCleaverLink(selectedCandidate.id)
                      : activeTab === 'moss'
                      ? generateMossLink(selectedCandidate.id)
                      : generateZavicLink(selectedCandidate.id);
                    if (link) {
                      navigator.clipboard.writeText(link);
                      alert('✅ Enlace copiado al portapapeles');
                    } else {
                      alert('❌ No hay enlace disponible');
                    }
                  }
                }}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-medium"
              >
                📋 Copiar Enlace
              </button>
              <button
                onClick={() => {
                  setSelectedCandidate(null);
                  setShowLinkModal(false);
                }}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard de resultados - Cleaver */}
      {showResultsDashboard && testResults && activeTab === 'cleaver' && (
        <CleaverResultsDashboard
          result={testResults}
          onClose={() => {
            setShowResultsDashboard(false);
            setTestResults(null);
          }}
        />
      )}

      {/* Dashboard de resultados - MOSS */}
      {showResultsDashboard && testResults && activeTab === 'moss' && (
        <MossResultsDashboard
          result={testResults}
          onClose={() => {
            setShowResultsDashboard(false);
            setTestResults(null);
          }}
        />
      )}

      {/* Dashboard de resultados - ZAVIC */}
      {showResultsDashboard && testResults && activeTab === 'zavic' && (
        <ZavicResultsDashboard
          results={testResults}
          onClose={() => {
            setShowResultsDashboard(false);
            setTestResults(null);
          }}
        />
      )}
    </div>
  );
};

export default Tests; 