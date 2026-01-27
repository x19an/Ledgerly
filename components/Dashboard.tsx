
import React from 'react';
import { SummaryStats } from '../types.ts';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Wallet, RotateCcw, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps {
  stats: SummaryStats | null;
  loading: boolean;
  onRecalculate?: () => void;
}

const Sparkline: React.FC<{ data: number[], color: string }> = ({ data, color }) => {
  if (!data || data.length < 2) return <div className="h-[30px] w-full mt-2 bg-slate-100/50 dark:bg-slate-800/50 rounded animate-pulse" />;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = (max - min) || 1; // Prevent division by zero
  const width = 100;
  const height = 30;
  const padding = 2;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = (height - padding) - (((val - min) / range) * (height - 2 * padding)) + padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="h-[30px] w-full mt-3 overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
        <defs>
          <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <path
          d={`M 0 ${height} L ${points} L ${width} ${height} Z`}
          fill={`url(#grad-${color})`}
          className="transition-all duration-500"
        />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
          className="transition-all duration-500"
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
  const hexColor = colorClass.includes('emerald') ? '#10b981' : colorClass.includes('red') ? '#ef4444' : colorClass.includes('blue') ? '#3b82f6' : colorClass.includes('amber') ? '#f59e0b' : '#6b7280';

  // Calculate percentage change if trend is available
  const getTrendIndicator = () => {
    if (!trend || trend.length < 2) return null;
    const last = trend[trend.length - 1];
    const prev = trend[trend.length - 2];
    if (prev === 0) return null;
    const diff = ((last - prev) / Math.abs(prev)) * 100;
    const isUp = diff >= 0;
    
    return (
      <div className={`flex items-center gap-0.5 text-[9px] font-bold ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
        {isUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
        {Math.abs(diff).toFixed(1)}%
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all group relative hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</span>
            {tooltip && (
              <div className="group/tooltip relative inline-flex items-center">
                <Info className="w-3 h-3 text-slate-300 cursor-help hover:text-slate-500 transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block w-48 p-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl shadow-2xl z-50 leading-relaxed font-medium">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl font-black ${colorClass} tracking-tight`}>{value}</h3>
            {getTrendIndicator()}
          </div>
          {subtext && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{subtext}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
            <div className={`p-2.5 rounded-xl bg-${baseColor}-50 dark:bg-${baseColor}-900/20 border border-${baseColor}-100/50 dark:border-${baseColor}-800/50`}>
              {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `w-5 h-5 ${colorClass}` })}
            </div>
            {action && <div className="opacity-0 group-hover:opacity-100 transition-opacity">{action}</div>}
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
        colorClass={stats.net_profit >= 0 ? "text-emerald-500" : "text-red-500"}
        subtext="Realized Profit"
        tooltip="Calculated as: (Sold Sum - Sold Buy Price Sum) - Losses Sunk Cost"
        trend={stats.profit_trend}
      />
      <StatCard
        index={1}
        title="Total Spent"
        value={formatCurrency(stats.total_spent)}
        icon={<Wallet />}
        colorClass="text-slate-600 dark:text-slate-300"
        tooltip="Total amount paid for all inventory including sold, purchased, and losses"
        action={
            onRecalculate && (
                <button onClick={(e) => { e.stopPropagation(); onRecalculate(); }} className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-500 transition-all">
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
        colorClass="text-blue-500"
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
        title="Inventory"
        value={formatCurrency(stats.potential_revenue)}
        icon={<AlertCircle />}
        colorClass="text-amber-500"
        subtext="Potential Revenue"
        tooltip="Sum of 'Potential Sale Price' for all currently purchased accounts"
      />
    </div>
  );
};
