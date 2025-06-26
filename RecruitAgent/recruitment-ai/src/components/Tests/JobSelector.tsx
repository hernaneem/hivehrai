import React from 'react';
import { Briefcase } from 'lucide-react';
import type { Job } from '../../hooks/useJobs';

interface Props {
  jobs: Job[];
  jobsLoading: boolean;
  selectedJobId: string;
  setSelectedJobId: (id: string) => void;
}

/**
 * Componente presentacional para seleccionar un trabajo.
 * Extraído de Tests.tsx para mejorar la legibilidad del componente principal.
 */
const JobSelector: React.FC<Props> = ({ jobs, jobsLoading, selectedJobId, setSelectedJobId }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center space-x-3 mb-4">
        <Briefcase className="h-5 w-5 text-white/70" />
        <h2 className="text-lg font-semibold text-white">Seleccionar Trabajo</h2>
      </div>

      {jobsLoading ? (
        <div className="flex items-center space-x-2 text-white/70">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500" />
          <span>Cargando trabajos...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {jobs.map(job => (
            <button
              key={job.id}
              onClick={() => setSelectedJobId(job.id)}
              className={`p-4 rounded-lg border transition-all text-left ${
                selectedJobId === job.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 text-white'
                  : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="font-semibold">{job.title}</div>
              <div className="text-sm opacity-75">{job.company}</div>
              <div className="text-xs mt-2 opacity-60">
                {job.approved_candidates_count} candidatos viables
              </div>
            </button>
          ))}

          {jobs.length === 0 && (
            <div className="col-span-full text-center py-8 text-white/50">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay trabajos activos con candidatos viables</p>
              <p className="text-sm mt-1">
                Los candidatos aparecerán aquí una vez que tengas CVs aprobados o viables
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobSelector;
