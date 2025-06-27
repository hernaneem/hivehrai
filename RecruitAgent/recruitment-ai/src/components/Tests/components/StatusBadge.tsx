import React from 'react';
import { getStatusBadgeConfig } from '../utils/statusHelpers';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const badge = getStatusBadgeConfig(status);
  
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${badge.color}`}>
      {badge.text}
    </span>
  );
};

export default StatusBadge; 