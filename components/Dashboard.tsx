
import React from 'react';
import { SummaryStats } from '../types.ts';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Wallet, RotateCcw, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps {
  stats: SummaryStats | null;
  loading: boolean;
  onRecalculate?: () => void;
}

const Sparkline: React.FC<{ data: number[], color: string }> = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min;
  const width = 100;
  const height = 30;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="h-[30px] w-full mt-2 overflow-hidden opacity-60">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
      </svg>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string; 
  subtext?: string;
  tooltip?: string;
  index: number;
  trend?: number[];
  action?: React.ReactNode;
}> = ({ title, value, icon, colorClass, subtext, tooltip, index, trend, action }) => {
  const baseColor = colorClass.replace('text-', '').split('-')[0];
  const hexColor = colorClass.includes('emerald') ? '#10b981' : colorClass.includes('red') ? '#ef4444' : colorClass.includes('blue') ? '#3b82f6' : '#6b7280';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all group relative"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">{title}</p>
            {tooltip && (
              <div className="group/tooltip relative">
                <Info className="w-3 h-3 text-slate-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl z-50">
                  {tooltip}
                </div>
              </div>
            )}
            {action && <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">{action}</div>}
          </div>
          <h3 className={`text-xl font-bold ${colorClass} dark:text-white`}>{value}</h3>
          {subtext && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{subtext}</p>}
        </div>
        <div className={`p-2.5 rounded-xl bg-${baseColor}-500/10 dark:bg-${baseColor}-400/10`}>
          {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `w-5 h-5 ${colorClass}` })}
        </div>
      </div>
      {trend && <Sparkline data={trend} color={hexColor} />}
    </motion.div>
  );
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, loading, onRecalculate }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
       <StatCard
        index={0}
        title="Net Profit"
        value={formatCurrency(stats.net_profit)}
        icon={<TrendingUp />}
        colorClass={stats.net_profit >= 0 ? "text-emerald-600" : "text-red-600"}
        subtext="Realized Profit"
        tooltip="Calculated as: (Sold Sum - Sold Buy Price Sum) - Losses Sunk Cost"
        trend={stats.profit_trend}
      />
      <StatCard
        index={1}
        title="Total Spent"
        value={formatCurrency(stats.total_spent)}
        icon={<Wallet />}
        colorClass="text-slate-600"
        tooltip="Total amount paid for all inventory including sold, purchased, and losses"
        action={
            onRecalculate && (
                <button onClick={(e) => { e.stopPropagation(); onRecalculate(); }} className="p-1 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500">
                    <RotateCcw className="w-3 h-3" />
                </button>
            )
        }
      />
      <StatCard
        index={2}
        title="Total Earned"
        value={formatCurrency(stats.total_earned)}
        icon={<DollarSign />}
        colorClass="text-blue-600"
        tooltip="Gross revenue from all sales"
      />
      <StatCard
        index={3}
        title="Total Lost"
        value={formatCurrency(stats.total_lost)}
        icon={<TrendingDown />}
        colorClass="text-red-500"
        subtext="Sunk cost"
        tooltip="Total purchase cost of accounts marked as 'Losses'"
      />
      <StatCard
        index={4}
        title="Potential"
        value={formatCurrency(stats.potential_revenue)}
        icon={<AlertCircle />}
        colorClass="text-amber-500"
        subtext="Pending inventory"
        tooltip="Sum of 'Potential Sale Price' for all currently purchased accounts"
      />
    </div>
  );
};
