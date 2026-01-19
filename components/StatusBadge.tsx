import React from 'react';
import { AccountStatus } from '../types';

export const StatusBadge: React.FC<{ status: AccountStatus }> = ({ status }) => {
  const styles = {
    [AccountStatus.WATCHLIST]: 'bg-slate-100 text-slate-600 border-slate-200',
    [AccountStatus.PURCHASED]: 'bg-blue-50 text-blue-700 border-blue-200',
    [AccountStatus.SOLD]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [AccountStatus.LOSSES]: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
