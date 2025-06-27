import React from 'react';
import { Brain } from 'lucide-react';
import TestTabs from './TestTabs';
import type { TestType } from '../types';

interface TestHeaderProps {
  activeTab: TestType;
  onTabChange: (tab: TestType) => void;
}

const TestHeader: React.FC<TestHeaderProps> = ({ activeTab, onTabChange }) => {
  const getDescription = () => {
    switch (activeTab) {
      case 'cleaver':
        return 'Gestión de evaluaciones Cleaver (DISC) para candidatos';
      case 'moss':
        return 'Gestión de evaluaciones MOSS (Habilidades Interpersonales) para candidatos';
      case 'terman':
        return 'Gestión de evaluaciones Terman-Merrill (Inteligencia) para candidatos';
      case 'raven':
        return 'Gestión de evaluaciones Raven Progressive Matrices para candidatos';
      case 'zavic':
        return 'Gestión de evaluaciones ZAVIC (Valores e Intereses) para candidatos';
      default:
        return 'Gestión de evaluaciones psicométricas para candidatos';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">
          Tests Psicométricos
        </h1>
      </div>

      <TestTabs activeTab={activeTab} onTabChange={onTabChange} />

      <p className="text-white/70">
        {getDescription()}
      </p>
    </div>
  );
};

export default TestHeader; 