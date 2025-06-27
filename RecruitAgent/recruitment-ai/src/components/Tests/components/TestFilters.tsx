import React from 'react';
import { Filter } from 'lucide-react';
import type { FilterType } from '../types';

interface TestFiltersProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const TestFilters: React.FC<TestFiltersProps> = ({ filter, onFilterChange }) => {
  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'cv-approved', label: 'CV Viable' },
    { key: 'test-pending', label: 'Test Pendiente' },
    { key: 'test-completed', label: 'Test Completado' }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <div className="flex items-center space-x-4">
        <Filter className="h-5 w-5 text-white/70" />
        {filters.map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => onFilterChange(filterOption.key)}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === filterOption.key 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TestFilters; 