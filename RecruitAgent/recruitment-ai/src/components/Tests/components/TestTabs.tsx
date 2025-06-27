import React from 'react';
import { Brain, Target, Heart } from 'lucide-react';
import type { TestType } from '../types';

interface TestTabsProps {
  activeTab: TestType;
  onTabChange: (tab: TestType) => void;
}

const TestTabs: React.FC<TestTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: { key: TestType; label: string; icon: React.ReactNode }[] = [
    { key: 'cleaver', label: 'Test Cleaver (DISC)', icon: <Brain className="h-5 w-5" /> },
    { key: 'moss', label: 'Test MOSS', icon: <Target className="h-5 w-5" /> },
    { key: 'terman', label: 'Test Terman-Merrill', icon: <Brain className="h-5 w-5" /> },
    { key: 'raven', label: 'Test Raven (RPM)', icon: <Brain className="h-5 w-5" /> },
    { key: 'zavic', label: 'Test ZAVIC (Valores)', icon: <Heart className="h-5 w-5" /> }
  ];

  return (
    <div className="flex space-x-4 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
            activeTab === tab.key
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TestTabs; 