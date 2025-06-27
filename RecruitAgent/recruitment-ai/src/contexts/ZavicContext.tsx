import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

// -------------------- Types -------------------- //
export interface ZavicCandidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  job_title?: string;
  job_id?: string;
  cv_status: 'approved' | 'reviewing' | 'rejected';
  cv_review_date?: string;
  years_experience?: number;
  created_at: string;
}

export interface ZavicTest {
  id: number;
  candidate_id: string;
  job_id: string;
  recruiter_id: string;
  test_token: string;
  status: 'not-started' | 'pending' | 'in-progress' | 'completed' | 'expired';
  created_at: string;
  invitation_sent_at?: string;
  started_at?: string;
  completed_at?: string;
  expires_at: string;
  time_spent_minutes?: number;
  invitation_email_sent: boolean;
  // Scores from merged zavic_results table
  moral_score?: number;
  legalidad_score?: number;
  indiferencia_score?: number;
  corrupcion_score?: number;
  economico_score?: number;
  politico_score?: number;
  social_score?: number;
  religioso_score?: number;
  total_score?: number;
  test_date?: string;
  answers?: any;
  // Joined candidate & job (optional)
  candidate?: ZavicCandidate;
  job?: {
    id: string;
    title: string;
    company?: string;
  };
}

export interface CandidateWithZavicInfo extends ZavicCandidate {
  zavic_status: 'not-started' | 'pending' | 'in-progress' | 'completed' | 'expired';
  invitation_sent: boolean;
  test_id?: number;
  test_token?: string;
  zavic_results?: {
    completed_at: string;
    total_score: number;
    factor_a?: number;
    factor_b?: number;
    factor_c?: number;
    factor_d?: number;
    factor_e?: number;
    time_spent_minutes?: number;
  };
}

export interface ZavicStats {
  totalCandidates: number;
  cvsApproved: number;
  testsCompleted: number;
  testsPending: number;
  testsInProgress: number;
}

interface ZavicContextType {
  candidates: CandidateWithZavicInfo[];
  stats: ZavicStats;
  loading: boolean;
  error: string;
  createTest: (candidateId: string, jobId: string) => Promise<ZavicTest>;
  getTestResults: (testId: number) => Promise<ZavicTest | null>;
  exportTestResults: (testId: number) => Promise<void>;
  refreshStats: () => Promise<void>;
}

const ZavicContext = createContext<ZavicContextType | undefined>(undefined);

export const useZavic = () => {
  const ctx = useContext(ZavicContext);
  if (ctx === undefined) {
    throw new Error('useZavic must be used within ZavicProvider');
  }
  return ctx;
};

interface ProviderProps {
  children: ReactNode;
}

export const ZavicProvider: React.FC<ProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateWithZavicInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<ZavicStats>({
    totalCandidates: 0,
    cvsApproved: 0,
    testsCompleted: 0,
    testsPending: 0,
    testsInProgress: 0
  });

  // -------------------- Data loaders -------------------- //
  const loadCandidates = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      /* 1. Candidates approved for jobs belonging to recruiter */
      const { data: candidatesData, error: candErr } = await supabase
        .from('candidates')
        .select(
          `
            id,
            name,
            email,
            phone,
            years_experience,
            created_at,
            candidate_analyses!inner(
              id,
              job_id,
              recommendation,
              processed_at,
              jobs!inner(id,title,company,recruiter_id)
            )
          `
        )
        .eq('candidate_analyses.jobs.recruiter_id', user.id)
        .in('candidate_analyses.recommendation', ['yes', 'maybe']);
      if (candErr) throw candErr;

      const candidateIds = candidatesData?.map((c) => c.id) || [];
      
      /* 2. Fetch existing Zavic tests for those candidates */
      const { data: testsData, error: testsErr } = await supabase
        .from('zavic_tests')
        .select('*')
        .in('candidate_id', candidateIds)
        .eq('recruiter_id', user.id);
      if (testsErr) throw testsErr;

      const enriched = (candidatesData || []).map((cand): CandidateWithZavicInfo => {
        const analysis = cand.candidate_analyses?.[0];
        const test = testsData?.find((t) => t.candidate_id === cand.id);
        const jobInfo = analysis?.jobs?.[0]; // jobs es un array, tomar el primer elemento
        
        return {
          id: cand.id,
          name: cand.name,
          email: cand.email,
          phone: cand.phone,
          position: jobInfo?.title || 'Sin especificar',
          job_title: jobInfo?.title,
          job_id: analysis?.job_id,
          cv_status: analysis?.recommendation === 'yes' ? 'approved' as const : 'reviewing' as const,
          cv_review_date: analysis?.processed_at,
          years_experience: cand.years_experience,
          created_at: cand.created_at,
          zavic_status: test?.status || 'not-started',
          invitation_sent: !!test?.invitation_email_sent,
          test_id: test?.id,
          test_token: test?.test_token,
          zavic_results: test?.status === 'completed' && test.total_score
            ? {
                completed_at: test.completed_at || '',
                total_score: test.total_score || 0,
                factor_a: test.moral_score,
                factor_b: test.legalidad_score,
                factor_c: test.indiferencia_score,
                factor_d: test.corrupcion_score,
                factor_e: test.economico_score,
                time_spent_minutes: test.time_spent_minutes,
              }
            : undefined,
        };
      });
      setCandidates(enriched);
      refreshStats();
    } catch (err: any) {
      console.error('Error loading Zavic candidates', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    const newStats: ZavicStats = {
      totalCandidates: candidates.length,
      cvsApproved: candidates.filter(c => c.cv_status === 'approved').length,
      testsCompleted: candidates.filter(c => c.zavic_status === 'completed').length,
      testsPending: candidates.filter(c => 
        c.zavic_status === 'pending' || 
        c.zavic_status === 'in-progress' || 
        c.zavic_status === 'not-started'
      ).length,
      testsInProgress: candidates.filter(c => c.zavic_status === 'in-progress').length
    };
    setStats(newStats);
  };

  // -------------------- CRUD helpers -------------------- //
  const createTest = async (candidateId: string, jobId: string): Promise<ZavicTest> => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    const token = btoa(`zavic_${candidateId}_${Date.now()}_${Math.random()}`);
    
    const { data, error: insErr } = await supabase
      .from('zavic_tests')
      .insert({
        candidate_id: candidateId,
        job_id: jobId,
        recruiter_id: user.id,
        test_token: token,
        status: 'not-started',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        invitation_email_sent: false,
      })
      .select('*')
      .single();
      
    if (insErr) throw insErr;
    
    await loadCandidates();
    return data as ZavicTest;
  };

  const getTestResults = async (testId: number): Promise<ZavicTest | null> => {
    try {
      const { data, error } = await supabase
        .from('zavic_tests')
        .select(
          `*,
          candidates ( id, name, email ),
          jobs ( id, title, company )
        `)
        .eq('id', testId)
        .single();
      
      if (error) throw error;
      return data as unknown as ZavicTest;
    } catch (error) {
      console.error('Error getting test results:', error);
      throw error;
    }
  };

  const exportTestResults = async (testId: number) => {
    const test = await getTestResults(testId);
    if (!test) throw new Error('Test no encontrado');

    const report = `RESULTADOS ZAVIC – ${test.candidate?.name}\n\n` +
      `Moral: ${test.moral_score || 0}\n` +
      `Legalidad: ${test.legalidad_score || 0}\n` +
      `Indiferencia: ${test.indiferencia_score || 0}\n` +
      `Corrupción: ${test.corrupcion_score || 0}\n` +
      `Económico: ${test.economico_score || 0}\n` +
      `Político: ${test.politico_score || 0}\n` +
      `Social: ${test.social_score || 0}\n` +
      `Religioso: ${test.religioso_score || 0}\n` +
      `Puntuación Total: ${test.total_score || 0}\n` +
      `Completado en: ${test.time_spent_minutes || 0} min.\n`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZAVIC_${test.candidate?.name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Initial load
  useEffect(() => {
    if (user?.id) {
      loadCandidates();
    }
  }, [user?.id]);

  // Actualizar estadísticas cuando cambien los candidatos
  useEffect(() => {
    refreshStats();
  }, [candidates]);

  const value: ZavicContextType = {
    candidates,
    stats,
    loading,
    error,
    createTest,
    getTestResults,
    exportTestResults,
    refreshStats,
  };

  return <ZavicContext.Provider value={value}>{children}</ZavicContext.Provider>;
};
