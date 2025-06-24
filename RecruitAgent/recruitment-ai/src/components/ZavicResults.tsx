import React from 'react';
import { BarChart3, X, Download } from 'lucide-react';

interface ZavicResult {
  id: number;
  candidate_id: string;
  completed_at: string;
  factors: {
    economic: number;
    theoretical: number;
    social: number;
    political: number;
    religious: number;
    aesthetic: number;
  };
  interpretation?: string;
}

interface Props {
  result: ZavicResult;
  candidateName?: string;
  onClose?: () => void;
  onDownloadReport?: () => void;
}

const factorColors: Record<string, string> = {
  economic: 'from-amber-500 to-yellow-500',
  theoretical: 'from-sky-500 to-indigo-500',
  social: 'from-emerald-500 to-green-600',
  political: 'from-red-500 to-pink-500',
  religious: 'from-purple-500 to-fuchsia-500',
  aesthetic: 'from-cyan-500 to-teal-500'
};

const friendlyName: Record<string, string> = {
  economic: 'Económico',
  theoretical: 'Teórico',
  social: 'Social',
  political: 'Político',
  religious: 'Religioso',
  aesthetic: 'Estético'
};

const ZavicResults: React.FC<Props> = ({ result, candidateName = 'Candidato', onClose, onDownloadReport }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-h-full overflow-y-auto bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-xl py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="flex justify-between items-start bg-white/10 p-6 rounded-xl border border-white/20">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Resultados Test Zavic</h1>
              <p className="text-white/70 text-sm">{candidateName} • {new Date(result.completed_at).toLocaleDateString()}</p>
            </div>
            <div className="flex space-x-3">
              {onDownloadReport && (
                <button onClick={onDownloadReport} className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
                  <Download className="h-5 w-5" />
                  <span>Descargar</span>
                </button>
              )}
              {onClose && (
                <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </header>

          {/* Factor bars */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(result.factors).map(([key, value]) => (
              <div key={key} className="bg-white/10 p-5 rounded-xl border border-white/20">
                <h3 className="text-white mb-3 flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-amber-400" />
                  <span className="font-medium">{friendlyName[key]}</span>
                </h3>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${factorColors[key]}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <p className="text-white/80 text-xs mt-2">{value}%</p>
              </div>
            ))}
          </section>

          {result.interpretation && (
            <section className="bg-white/10 p-6 rounded-xl border border-white/20">
              <h3 className="text-white font-semibold mb-3">Interpretación</h3>
              <p className="text-white/80 leading-relaxed text-sm whitespace-pre-line">{result.interpretation}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZavicResults;
