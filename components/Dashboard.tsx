import React from 'react';
import { SummaryStats } from '../types';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Wallet } from 'lucide-react';

interface DashboardProps {
  stats: SummaryStats | null;
  loading: boolean;
}

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  subtext?: string;
}> = ({ title, value, icon, colorClass, subtext }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{title}</p>
      <h3 className={`text-2xl font-bold mt-2 ${colorClass}`}>{value}</h3>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg bg-opacity-10 ${colorClass.replace('text-', 'bg-').replace('600', '100').replace('500', '100')}`}>
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `w-6 h-6 ${colorClass}` })}
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
       <StatCard
        title="Net Profit"
        value={formatCurrency(stats.net_profit)}
        icon={<TrendingUp />}
        colorClass={stats.net_profit >= 0 ? "text-emerald-600" : "text-red-600"}
        subtext="Realized (Sold - Buy)"
      />
      <StatCard
        title="Total Spent"
        value={formatCurrency(stats.total_spent)}
        icon={<Wallet />}
        colorClass="text-slate-600"
      />
      <StatCard
        title="Total Earned"
        value={formatCurrency(stats.total_earned)}
        icon={<DollarSign />}
        colorClass="text-blue-600"
      />
      <StatCard
        title="Total Lost"
        value={formatCurrency(stats.total_lost)}
        icon={<TrendingDown />}
        colorClass="text-red-500"
        subtext="Sunk cost in Losses"
      />
      <StatCard
        title="Potential Revenue"
        value={formatCurrency(stats.potential_revenue)}
        icon={<AlertCircle />}
        colorClass="text-amber-500"
        subtext="From purchased inventory"
      />
    </div>
  );
};