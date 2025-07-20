import React from 'react';
import { BudgetLiteSearchiOS } from '../../lite/BudgetLiteSearchiOS';

interface BudgetSearchAdvancedProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearSearch: () => void;
  resultCount: number;
}

export const BudgetSearchAdvanced: React.FC<BudgetSearchAdvancedProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  resultCount
}) => {
  return (
    <div className="space-y-3">
      <BudgetLiteSearchiOS 
        searchTerm={searchTerm} 
        onSearchChange={onSearchChange} 
        onClearSearch={onClearSearch} 
      />
      
      {searchTerm && (
        <div className="text-sm text-muted-foreground px-1">
          {resultCount} {resultCount === 1 ? 'resultado encontrado' : 'resultados encontrados'} 
          para "{searchTerm}"
        </div>
      )}
    </div>
  );
};