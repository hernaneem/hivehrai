import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';
import type { CandidateWithTermanInfo, TermanTest } from '../types';

export const useTermanCandidates = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateWithTermanInfo[]>([]);
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

      // Get Terman tests
      const { data: termanTests, error: termanError } = await supabase
        .from('terman_tests')
        .select('*')
        .in('candidate_id', candidateIds)
        .eq('recruiter_id', user.id);
      
      if (termanError) throw termanError;

      // Process Terman candidates
      const termanCandidatesData: CandidateWithTermanInfo[] = candidatesData?.map(candidate => {
        const analysis = candidate.candidate_analyses?.[0];
        const test = termanTests?.find(t => t.candidate_id === candidate.id);
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
          terman_status: test?.status || 'not-started',
          invitation_sent: !!test?.invitation_sent_at,
          test_id: test?.id,
          test_token: test?.test_token,
          terman_results: test?.status === 'completed' ? {
            completed_at: test.completed_at!,
            total_score: test.total_score || 0,
            iq: test.ci || 0,
            iq_classification: test.ci_classification || 'Sin clasificar',
            series_scores: [],
            interpretation: {
              strengths: test.strengths || [],
              development_areas: test.development_areas || [],
              generalAssessment: 'Evaluación completada'
            }
          } : undefined
        };
      }) || [];

      setCandidates(termanCandidatesData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
      console.error('Error loading Terman candidates:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const createTest = async (candidateId: string, jobId: string): Promise<TermanTest> => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    try {
      // Generar token único
      const token = btoa(`terman_${candidateId}_${Date.now()}_${Math.random()}`);

      const { data: testData, error: testError } = await supabase
        .from('terman_tests')
        .insert({
          candidate_id: candidateId,
          job_id: jobId,
          recruiter_id: user.id,
          test_token: token,
          status: 'not-started',
          expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
          invitation_sent_at: new Date().toISOString()
        })
        .select()
        .single();

      if (testError) throw testError;

      // Recargar candidatos para reflejar el cambio
      await loadCandidates();
      
      return testData;
    } catch (error) {
      console.error('Error creating Terman test:', error);
      throw error;
    }
  };

  const getTestResults = async (candidateId: string) => {
    try {
      const { data, error } = await supabase
        .from('terman_results')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('completed_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const dbResult = data[0];

      return {
        id: dbResult.id,
        candidateId: dbResult.candidate_id,
        totalScore: dbResult.total_score,
        mentalAge: dbResult.mental_age,
        iq: dbResult.iq,
        iqClassification: dbResult.iq_classification,
        seriesScores: dbResult.series_scores ?? [],
        completedAt: dbResult.completed_at,
        interpretation: dbResult.interpretation ?? {
          strengths: [],
          weaknesses: [],
          generalAssessment: ''
        }
      };
    } catch (error) {
      console.error('Error fetching Terman results:', error);
      throw error;
    }
  };

  const exportTestResults = async (candidate: CandidateWithTermanInfo) => {
    if (!candidate.test_id) {
      throw new Error('No hay test disponible para exportar');
    }
    // Implementar exportación de resultados Terman-Merrill
    alert('Función de exportación de Terman-Merrill en desarrollo');
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