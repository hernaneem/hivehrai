import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';
import type { CandidateWithRavenInfo, RavenTest } from '../types';

export const useRavenCandidates = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateWithRavenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCandidates = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Get candidates with approved analyses
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select(`
          id,
          name,
          email,
          phone,
          years_experience,
          created_at,
          candidate_analyses!inner (
            id,
            job_id,
            recommendation,
            processed_at,
            jobs!inner (
              id,
              title,
              company,
              recruiter_id
            )
          )
        `)
        .eq('candidate_analyses.jobs.recruiter_id', user.id)
        .in('candidate_analyses.recommendation', ['yes', 'maybe']);

      if (candidatesError) throw candidatesError;

      const candidateIds = candidatesData?.map(c => c.id) || [];

      // Get Raven tests
      const { data: ravenTests, error: ravenError } = await supabase
        .from('raven_tests')
        .select('*')
        .in('candidate_id', candidateIds)
        .eq('recruiter_id', user.id);
      
      if (ravenError) throw ravenError;

      // Process Raven candidates
      const ravenCandidatesData: CandidateWithRavenInfo[] = candidatesData?.map(candidate => {
        const analysis = candidate.candidate_analyses?.[0];
        const test = ravenTests?.find(t => t.candidate_id === candidate.id);
        const jobInfo = analysis?.jobs?.[0];
        
        return {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          position: jobInfo?.title || 'Sin especificar',
          job_title: jobInfo?.title,
          job_id: analysis?.job_id,
          cv_status: analysis?.recommendation === 'yes' ? 'approved' as const : 'reviewing' as const,
          cv_review_date: analysis?.processed_at,
          years_experience: candidate.years_experience,
          created_at: candidate.created_at,
          raven_status: test?.status || 'not-started',
          invitation_sent: !!test?.created_at,
          test_id: test?.id,
          test_token: test?.test_token,
          raven_results: test?.status === 'completed' ? {
            completed_at: test.completed_at!,
            raw_score: 0,
            percentile: 0,
            diagnostic_rank: '',
            interpretation: {}
          } : undefined
        };
      }) || [];

      setCandidates(ravenCandidatesData);
    } catch (error) {
      console.error('Error loading Raven candidates:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const createTest = async (candidateId: string, jobId?: string): Promise<RavenTest> => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    try {
      // Generar token único
      const token = btoa(`raven_${candidateId}_${Date.now()}_${Math.random()}`);

      const { data: testData, error: testError } = await supabase
        .from('raven_tests')
        .insert({
          candidate_id: candidateId,
          job_id: jobId || null,
          recruiter_id: user.id,
          test_token: token,
          status: 'not-started',
          expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
          time_limit_minutes: 45,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (testError) throw testError;

      // Recargar candidatos para reflejar el cambio
      await loadCandidates();
      
      return testData;
    } catch (error) {
      console.error('Error creating Raven test:', error);
      throw error;
    }
  };

  const getTestResults = async (testId: string) => {
    try {
      const { data, error } = await supabase
        .from('raven_scores')
        .select('*')
        .eq('test_id', testId)
        .order('calculated_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const dbResult = data[0];

      // También obtener interpretación si existe
      const { data: interpretationData } = await supabase
        .from('raven_interpretations')
        .select('*')
        .eq('test_id', testId)
        .order('generated_at', { ascending: false })
        .limit(1);

      const candidate = candidates.find(c => c.test_id === testId);

      return {
        id: dbResult.id,
        candidateId: candidate?.id || '',
        candidateName: candidate?.name || '',
        completedAt: dbResult.calculated_at,
        rawScore: dbResult.raw_score,
        percentile: dbResult.percentile,
        diagnosticRank: dbResult.diagnostic_rank,
        interpretation: interpretationData?.[0] || null
      };
    } catch (error) {
      console.error('Error fetching Raven results:', error);
      throw error;
    }
  };

  const exportTestResults = async (candidate: CandidateWithRavenInfo) => {
    if (!candidate.test_id) {
      throw new Error('No hay test disponible para exportar');
    }
    // Implementar exportación de resultados Raven
    alert('Función de exportación de Raven en desarrollo');
  };

  useEffect(() => {
    if (user?.id) {
      loadCandidates();
    }
  }, [user?.id, loadCandidates]);

  return {
    candidates,
    loading,
    error,
    createTest,
    getTestResults,
    exportTestResults,
    refreshCandidates: loadCandidates
  };
}; 