import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Job {
  id: string;
  title: string;
  company: string;
  status: string;
  created_at: string;
  approved_candidates_count?: number;
}

interface UseJobsReturn {
  jobs: Job[];
  selectedJobId: string;
  setSelectedJobId: (id: string) => void;
  jobsLoading: boolean;
}

/**
 * Hook responsable de cargar los trabajos activos de un recruiter
 * y contar los candidatos aprobados (yes | maybe) por cada trabajo.
 */
export default function useJobs(): UseJobsReturn {
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [jobsLoading, setJobsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadActiveJobs = async () => {
      if (!user?.id) return;

      try {
        setJobsLoading(true);

        // Obtener trabajos activos del recruiter
        const { data: allJobsData, error: allJobsError } = await supabase
          .from('jobs')
          .select('id, title, company, status, created_at')
          .eq('recruiter_id', user.id)
          .eq('status', 'active');

        if (allJobsError) throw allJobsError;

        const jobsWithCounts: Job[] = [];

        for (const job of allJobsData || []) {
          const { data: candidatesCount, error: countError } = await supabase
            .from('candidate_analyses')
            .select('candidate_id')
            .eq('job_id', job.id)
            .in('recommendation', ['yes', 'maybe']);

          if (countError) {
            console.error('Error contando candidatos para trabajo:', job.id, countError);
            continue;
          }

          const uniqueCandidates = new Set(candidatesCount?.map(c => c.candidate_id) || []);

          if (uniqueCandidates.size > 0) {
            jobsWithCounts.push({
              id: job.id,
              title: job.title,
              company: job.company,
              status: job.status,
              created_at: job.created_at,
              approved_candidates_count: uniqueCandidates.size,
            });
          }
        }

        setJobs(jobsWithCounts);
      } catch (error) {
        console.error('Error cargando trabajos:', error);
      } finally {
        setJobsLoading(false);
      }
    };

    loadActiveJobs();
  }, [user?.id]);

  return { jobs, selectedJobId, setSelectedJobId, jobsLoading };
}
