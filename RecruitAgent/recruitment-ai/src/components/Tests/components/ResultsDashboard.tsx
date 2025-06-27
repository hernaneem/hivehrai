import React from 'react';
import CleaverResultsDashboard from '../../CleaverResultsDashboard';
import MossResultsDashboard from '../../MossResultsDashboard';
import TermanMerrillResults from '../../TermanMerrillResults';
import RavenResultsDashboard from '../../RavenResultsDashboard';
import ZavicResultsDashboard from '../../ZavicResultsDashboard';
import type { TestType } from '../types';

interface ResultsDashboardProps {
  show: boolean;
  testResults: any;
  activeTab: TestType;
  onClose: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  show,
  testResults,
  activeTab,
  onClose
}) => {
  if (!show || !testResults) return null;

  const handleClose = () => {
    onClose();
  };

  switch (activeTab) {
    case 'cleaver':
      return (
        <CleaverResultsDashboard
          result={testResults}
          onClose={handleClose}
        />
      );
    
    case 'moss':
      return (
        <MossResultsDashboard
          result={testResults}
          onClose={handleClose}
        />
      );
    
    case 'terman':
      return (
        <TermanMerrillResults
          result={testResults}
          onClose={handleClose}
        />
      );
    
    case 'raven':
      return (
        <RavenResultsDashboard
          result={testResults}
          onClose={handleClose}
        />
      );
    
    case 'zavic':
      return (
        <ZavicResultsDashboard
          results={testResults}
          onClose={handleClose}
        />
      );
    
    default:
      return null;
  }
};

export default ResultsDashboard; 