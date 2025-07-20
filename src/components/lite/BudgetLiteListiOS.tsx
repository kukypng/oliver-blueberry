import React from 'react';
import { BudgetListRefactored } from '../budgets/enhanced/BudgetListRefactored';
interface BudgetLiteListiOSProps {
  userId: string;
  profile: any;
}

export const BudgetLiteListiOS = ({
  userId,
  profile
}: BudgetLiteListiOSProps) => {
  return (
    <BudgetListRefactored 
      userId={userId} 
      profile={profile} 
    />
  );
};