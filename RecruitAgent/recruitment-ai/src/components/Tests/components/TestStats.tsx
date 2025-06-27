import React from 'react';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import type { TestStats } from '../types';

interface TestStatsProps {
  stats: TestStats;
}

const TestStatsComponent: React.FC<TestStatsProps> = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Candidatos',
      value: stats.totalCandidates,
      icon: <Users className="h-8 w-8 text-blue-400" />,
      color: 'text-blue-400'
    },
    {
      label: 'CVs Aprobados',
      value: stats.cvsApproved,
      icon: <FileText className="h-8 w-8 text-green-400" />,
      color: 'text-green-400'
    },
    {
      label: 'Tests Completados',
      value: stats.testsCompleted,
      icon: <CheckCircle className="h-8 w-8 text-green-400" />,
      color: 'text-green-400'
    },
    {
      label: 'Pendientes',
      value: stats.testsPending,
      icon: <Clock className="h-8 w-8 text-yellow-400" />,
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestStatsComponent; 