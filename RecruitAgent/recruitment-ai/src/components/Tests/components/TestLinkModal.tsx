import React from 'react';
import { Copy } from 'lucide-react';
import type { TestType } from '../types';
import type { CandidateWithTestInfo } from '../../../contexts/CleaverContext';
import type { CandidateWithMossInfo } from '../../../contexts/MossContext';
import type { CandidateWithZavicInfo } from '../../../contexts/ZavicContext';
import type { CandidateWithTermanInfo, CandidateWithRavenInfo } from '../types';
import { getTestTitle, getTestDescription, getTestInstructions } from '../utils/testHelpers';

type AnyCandidate = CandidateWithTestInfo | CandidateWithMossInfo | CandidateWithTermanInfo | CandidateWithRavenInfo | CandidateWithZavicInfo;

interface TestLinkModalProps {
  candidate: AnyCandidate | null;
  activeTab: TestType;
  generateLink: (candidateId: string) => string;
  onClose: () => void;
}

const TestLinkModal: React.FC<TestLinkModalProps> = ({ 
  candidate, 
  activeTab, 
  generateLink, 
  onClose 
}) => {
  if (!candidate) return null;

  const handleCopyLink = () => {
    const link = generateLink(candidate.id);
    if (link) {
      navigator.clipboard.writeText(link);
      alert('📋 Enlace copiado!');
    }
  };

  const testLink = generateLink(candidate.id);
  const instructions = getTestInstructions(activeTab);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 w-full max-w-lg">
        <h3 className="text-lg font-bold text-white mb-4">
          {getTestTitle(activeTab)}
        </h3>
        <p className="text-white/70 text-sm mb-4">
          Comparte este enlace con <strong className="text-white">{candidate.name}</strong> para que realice el test {getTestDescription(activeTab)}:
        </p>

        {/* Información del candidato */}
        <div className="bg-black/20 p-3 rounded-lg mb-4 border border-white/10">
          <div className="text-sm text-white/80 mb-2">
            <strong>Candidato:</strong> {candidate.name}
          </div>
          <div className="text-sm text-white/80 mb-2">
            <strong>Email:</strong> {candidate.email}
          </div>
          <div className="text-sm text-white/80">
            <strong>Puesto:</strong> {candidate.position}
          </div>
        </div>

        {/* Enlace */}
        <div className="bg-black/30 p-4 rounded-lg mb-4 border border-white/10">
          <div className="text-xs text-white/60 mb-2">Enlace del test:</div>
          <div className="flex items-center space-x-2">
            <code className="text-sm text-green-300 break-all font-mono flex-1 p-2 bg-black/30 rounded border">
              {testLink || 'Generando enlace...'}
            </code>
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mb-4">
          <div className="text-xs text-blue-300 mb-1">📋 Instrucciones para el candidato:</div>
          <ul className="text-xs text-blue-200 space-y-1">
            {instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              handleCopyLink();
              alert('✅ Enlace copiado al portapapeles');
            }}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-medium"
          >
            📋 Copiar Enlace
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestLinkModal; 