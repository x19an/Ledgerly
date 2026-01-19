
import React from 'react';
import { FinancialSummary } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Zap, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  summary: FinancialSummary;
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ summary, isDarkMode }) => {
  const chartData = [
    { name: 'Watchlist', count: summary.watchlistCount },
    { name: 'Purchased', count: summary.purchasedCount },
    { name: 'Sold', count: summary.soldCount },
    { name: 'Losses', count: summary.lossesCount },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const cardClass = isDarkMode 
    ? "bg-[#111] border-white/5 text-white" 
    : "bg-white border-slate-200 text-slate-900";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Investment" 
          value={formatCurrency(summary.totalSpent)} 
          sub="Capital outflow"
          icon={<ArrowDownRight className="text-rose-500" />}
          cardClass={cardClass}
          isDarkMode={isDarkMode}
        />
        <StatCard 
          label="Total Loss" 
          value={formatCurrency(summary.totalLost)} 
          sub="Failed acquisitions"
          color="text-rose-600"
          icon={<AlertTriangle className="text-rose-600" />}
          cardClass={cardClass}
          isDarkMode={isDarkMode}
        />
        <StatCard 
          label="Realized Profit" 
          value={formatCurrency(summary.netProfit)} 
          sub="Actual net gain"
          color={summary.netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}
          icon={<TrendingUp className={summary.netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'} />}
          cardClass={cardClass}
          isDarkMode={isDarkMode}
        />
        <StatCard 
          label="Projected Total" 
          value={formatCurrency(summary.netProfit + summary.potentialRevenue)} 
          sub="Max reachable profit"
          icon={<Zap className="text-amber-500" />}
          cardClass={cardClass}
          isDarkMode={isDarkMode}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className={`${cardClass} p-6 rounded-2xl border shadow-sm lg:col-span-2`}>
          <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Volume Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#222" : "#f1f5f9"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#555' : '#64748b', fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#555' : '#64748b', fontSize: 11}} />
                <Tooltip 
                  cursor={{fill: isDarkMode ? '#222' : '#f8fafc'}} 
                  contentStyle={{
                    borderRadius: '12px', 
                    border: 'none', 
                    backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
                    color: isDarkMode ? '#fff' : '#000',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#64748b', '#10b981', '#3b82f6', '#ef4444'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Panel */}
        <div className={`${cardClass} p-6 rounded-2xl border shadow-sm`}>
          <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Ledger Pipeline</h3>
          <div className="space-y-4">
            <PipelineItem label="Watchlist" count={summary.watchlistCount} total={summary.watchlistCount + summary.purchasedCount + summary.soldCount + summary.lossesCount} color="bg-slate-400" isDarkMode={isDarkMode} />
            <PipelineItem label="Purchased" count={summary.purchasedCount} total={summary.watchlistCount + summary.purchasedCount + summary.soldCount + summary.lossesCount} color="bg-emerald-500" isDarkMode={isDarkMode} />
            <PipelineItem label="Sold" count={summary.soldCount} total={summary.watchlistCount + summary.purchasedCount + summary.soldCount + summary.lossesCount} color="bg-blue-500" isDarkMode={isDarkMode} />
            <PipelineItem label="Losses" count={summary.lossesCount} total={summary.watchlistCount + summary.purchasedCount + summary.soldCount + summary.lossesCount} color="bg-rose-500" isDarkMode={isDarkMode} />
          </div>
          <div className={`mt-8 pt-8 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
             <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest opacity-40">
               <span>Success Rate</span>
               <span className="text-emerald-500">
                 {summary.soldCount + summary.lossesCount > 0 
                   ? ((summary.soldCount / (summary.soldCount + summary.lossesCount)) * 100).toFixed(0) 
                   : 0}%
               </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; sub: string; icon: React.ReactNode; color?: string; cardClass: string; isDarkMode: boolean }> = ({ label, value, sub, icon, color, cardClass, isDarkMode }) => (
  <div className={`${cardClass} p-6 rounded-2xl border shadow-sm flex flex-col gap-1`}>
    <div className="flex justify-between items-start">
      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</span>
      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>{icon}</div>
    </div>
    <span className={`text-2xl font-bold ${color || ''}`}>{value}</span>
    <span className="text-xs font-medium opacity-30">{sub}</span>
  </div>
);

const PipelineItem: React.FC<{ label: string; count: number; total: number; color: string; isDarkMode: boolean }> = ({ label, count, total, color, isDarkMode }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium opacity-80">{label}</span>
        <span className="opacity-40">{count}</span>
      </div>
      <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
        <div 
          className={`h-full ${color} transition-all duration-1000`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
