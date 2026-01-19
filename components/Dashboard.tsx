import React from 'react';
import { SummaryStats } from '../types';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps {
  stats: SummaryStats | null;
  loading: boolean;
}

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string; // e.g., "text-blue-600"
  darkColorClass?: string;
  subtext?: string;
  index: number;
}> = ({ title, value, icon, colorClass, subtext, index }) => {
    
  // Extract base color name for background opacity logic (simple parsing)
  const baseColor = colorClass.replace('text-', '').split('-')[0]; // e.g. "emerald"
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, type: "spring", stiffness: 100 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-800 flex items-start justify-between transition-all"
    >
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
        <h3 className={`text-2xl font-bold mt-2 ${colorClass} dark:text-white`}>{value}</h3>
        {subtext && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl bg-opacity-10 dark:bg-opacity-20 bg-${baseColor}-500 dark:bg-${baseColor}-400`}>
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `w-6 h-6 ${colorClass}` })}
      </div>
    </motion.div>
  );
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
       <StatCard
        index={0}
        title="Net Profit"
        value={formatCurrency(stats.net_profit)}
        icon={<TrendingUp />}
        colorClass={stats.net_profit >= 0 ? "text-emerald-600" : "text-red-600"}
        subtext="Realized (Sold - Buy)"
      />
      <StatCard
        index={1}
        title="Total Spent"
        value={formatCurrency(stats.total_spent)}
        icon={<Wallet />}
        colorClass="text-slate-600"
      />
      <StatCard
        index={2}
        title="Total Earned"
        value={formatCurrency(stats.total_earned)}
        icon={<DollarSign />}
        colorClass="text-blue-600"
      />
      <StatCard
        index={3}
        title="Total Lost"
        value={formatCurrency(stats.total_lost)}
        icon={<TrendingDown />}
        colorClass="text-red-500"
        subtext="Sunk cost in Losses"
      />
      <StatCard
        index={4}
        title="Potential Revenue"
        value={formatCurrency(stats.potential_revenue)}
        icon={<AlertCircle />}
        colorClass="text-amber-500"
        subtext="From purchased inventory"
      />
    </div>
  );
};