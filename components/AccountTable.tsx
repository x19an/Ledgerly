
import React, { useState } from 'react';
import { AccountStatus, AccountWithTransaction } from '../types';
import { dbService } from '../db';
import { Trash2, TrendingUp, DollarSign, CheckCircle, X, Zap, AlertTriangle, ExternalLink } from 'lucide-react';

interface AccountTableProps {
  status: AccountStatus;
  accounts: AccountWithTransaction[];
  onUpdate: () => void;
  onSelectAccount: (account: AccountWithTransaction) => void;
  isDarkMode: boolean;
}

const AccountTable: React.FC<AccountTableProps> = ({ status, accounts, onUpdate, onSelectAccount, isDarkMode }) => {
  const [transitioningId, setTransitioningId] = useState<number | null>(null);
  const [lossTransitioningId, setLossTransitioningId] = useState<number | null>(null);
  const [buyPrice, setBuyPrice] = useState<string>('');
  const [potentialIncome, setPotentialIncome] = useState<string>('');
  const [lossReason, setLossReason] = useState<string>('');

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('Permanently delete this account record?')) {
      await dbService.deleteAccount(id);
      onUpdate();
    }
  };

  const handleStatusTransition = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    
    if (status === AccountStatus.WATCHLIST) {
      const buy = parseFloat(buyPrice);
      const potential = parseFloat(potentialIncome);
      if (isNaN(buy) || isNaN(potential)) {
        alert('Please enter valid buy price and potential income');
        return;
      }
      await dbService.purchaseAccount(id, buy, potential);
    } else if (status === AccountStatus.PURCHASED) {
      const sell = parseFloat(buyPrice);
      if (isNaN(sell)) {
        alert('Please enter a valid selling price');
        return;
      }
      await dbService.sellAccount(id, sell);
    }

    setTransitioningId(null);
    setBuyPrice('');
    setPotentialIncome('');
    onUpdate();
  };

  const handleLossTransition = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!lossReason.trim()) {
      alert('Please provide a reason for the loss');
      return;
    }
    await dbService.markAsLost(id, lossReason);
    setLossTransitioningId(null);
    setLossReason('');
    onUpdate();
  };

  const formatCurrency = (val: number | null) => {
    if (val === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const getProfit = (buy: number | null, sell: number | null) => {
    if (buy === null || sell === null) return null;
    return sell - buy;
  };

  const containerClass = isDarkMode 
    ? "bg-[#111] border-white/5" 
    : "bg-white border-slate-200";

  const headClass = isDarkMode ? "bg-[#1a1a1a] border-white/5" : "bg-slate-50 border-slate-200";
  const rowClass = isDarkMode 
    ? "border-white/5 hover:bg-white/[0.02]" 
    : "border-slate-100 hover:bg-slate-50/50";
  const textPrimary = isDarkMode ? "text-white" : "text-slate-900";
  const textSecondary = isDarkMode ? "text-slate-500" : "text-slate-400";

  return (
    <div className="animate-in fade-in duration-300">
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${containerClass}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={`border-b ${headClass}`}>
              <tr>
                <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Identifier</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider opacity-60">Source</th>
                {status === AccountStatus.WATCHLIST && <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider opacity-60">Expected</th>}
                {status !== AccountStatus.WATCHLIST && <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider opacity-60">Purchase</th>}
                {status === AccountStatus.PURCHASED && <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider opacity-60">Target Income</th>}
                {status === AccountStatus.SOLD && <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider opacity-60">Revenue</th>}
                {status === AccountStatus.SOLD && <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider opacity-60">Net Profit</th>}
                {status === AccountStatus.LOSSES && <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider opacity-60">Reason</th>}
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider opacity-60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`px-6 py-12 text-center italic ${textSecondary}`}>
                    Category is currently empty
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr 
                    key={acc.id} 
                    onClick={() => onSelectAccount(acc)}
                    className={`transition-all group cursor-pointer ${rowClass} ${status !== AccountStatus.WATCHLIST ? 'hover:shadow-inner' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className={`font-semibold transition-colors ${textPrimary} group-hover:text-emerald-500`}>{acc.identifier}</div>
                      <div className={`text-xs ${textSecondary}`}>Ref: #{acc.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      {acc.link ? (
                        <a 
                          href={acc.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className={`flex items-center gap-1.5 text-xs font-bold uppercase transition-colors px-2 py-1 rounded-lg ${
                            isDarkMode ? 'bg-white/5 text-blue-400 hover:bg-blue-500/10' : 'bg-slate-100 text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          <ExternalLink size={12} /> Link
                        </a>
                      ) : (
                        <span className={`text-xs font-black px-2 py-1 rounded-lg opacity-20 ${isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                          No Source
                        </span>
                      )}
                    </td>
                    
                    {status === AccountStatus.WATCHLIST && (
                      <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {formatCurrency(acc.expected_price)}
                      </td>
                    )}

                    {status !== AccountStatus.WATCHLIST && (
                      <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {formatCurrency(acc.buy_price)}
                      </td>
                    )}

                    {status === AccountStatus.PURCHASED && (
                      <td className={`px-6 py-4 font-medium text-amber-500`}>
                        {formatCurrency(acc.potential_income)}
                      </td>
                    )}

                    {status === AccountStatus.SOLD && (
                      <td className={`px-6 py-4 font-black ${isDarkMode ? 'text-white' : 'text-slate-600'}`}>
                        {formatCurrency(acc.sell_price)}
                      </td>
                    )}

                    {status === AccountStatus.SOLD && (
                      <td className="px-6 py-4 font-bold">
                        {(() => {
                          const profit = getProfit(acc.buy_price, acc.sell_price);
                          if (profit === null) return '-';
                          return (
                            <span className={profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                              {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                            </span>
                          );
                        })()}
                      </td>
                    )}

                    {status === AccountStatus.LOSSES && (
                      <td className={`px-6 py-4 text-xs font-medium text-rose-500`}>
                        {acc.loss_reason || 'N/A'}
                      </td>
                    )}

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {transitioningId === acc.id ? (
                          <div className={`flex flex-col md:flex-row items-center gap-2 animate-in slide-in-from-right-2 p-2 rounded-xl backdrop-blur-md border shadow-2xl z-50 ${
                            isDarkMode ? 'bg-[#222]/90 border-white/10' : 'bg-white/95 border-slate-200 shadow-xl shadow-slate-200/50'
                          }`}>
                            <input 
                              type="number"
                              autoFocus
                              placeholder={status === AccountStatus.WATCHLIST ? "Cost" : "Sold For"}
                              className={`px-3 py-2 border rounded-lg text-sm w-24 outline-none focus:ring-2 focus:ring-emerald-500 ${
                                isDarkMode ? 'bg-[#111] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                              value={buyPrice}
                              onChange={(e) => setBuyPrice(e.target.value)}
                            />
                            {status === AccountStatus.WATCHLIST && (
                              <input 
                                type="number"
                                placeholder="Potential"
                                className={`px-3 py-2 border rounded-lg text-sm w-24 outline-none focus:ring-2 focus:ring-amber-500 ${
                                  isDarkMode ? 'bg-[#111] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                                value={potentialIncome}
                                onChange={(e) => setPotentialIncome(e.target.value)}
                              />
                            )}
                            <div className="flex gap-1">
                              <button 
                                onClick={(e) => handleStatusTransition(e, acc.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-transform active:scale-95"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setTransitioningId(null); setBuyPrice(''); setPotentialIncome(''); }}
                                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ) : lossTransitioningId === acc.id ? (
                          <div className={`flex flex-col md:flex-row items-center gap-2 animate-in slide-in-from-right-2 p-2 rounded-xl backdrop-blur-md border shadow-2xl z-50 ${
                            isDarkMode ? 'bg-[#331111]/90 border-rose-500/20' : 'bg-white/95 border-rose-100 shadow-xl shadow-rose-200/50'
                          }`}>
                            <input 
                              type="text"
                              autoFocus
                              placeholder="Reason (e.g. Banned)"
                              className={`px-3 py-2 border rounded-lg text-sm w-48 outline-none focus:ring-2 focus:ring-rose-500 ${
                                isDarkMode ? 'bg-[#111] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                              value={lossReason}
                              onChange={(e) => setLossReason(e.target.value)}
                            />
                            <div className="flex gap-1">
                              <button 
                                onClick={(e) => handleLossTransition(e, acc.id)}
                                className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-lg transition-transform active:scale-95"
                              >
                                <AlertTriangle size={16} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setLossTransitioningId(null); setLossReason(''); }}
                                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {status === AccountStatus.PURCHASED && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setLossTransitioningId(acc.id); }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    isDarkMode ? 'text-rose-500 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'
                                  }`}
                                  title="Mark as Lost"
                                >
                                  <AlertTriangle size={16} />
                                </button>
                            )}
                            {(status === AccountStatus.WATCHLIST || status === AccountStatus.PURCHASED) && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); setTransitioningId(acc.id); }}
                                className={`flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5 rounded-lg transition-all ${
                                  isDarkMode 
                                    ? 'text-emerald-400 hover:bg-white/5 border border-transparent hover:border-emerald-400/20' 
                                    : 'text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-600/20'
                                }`}
                              >
                                {status === AccountStatus.WATCHLIST ? <DollarSign size={14} /> : <TrendingUp size={14} />}
                                {status === AccountStatus.WATCHLIST ? 'Purchase' : 'Sold'}
                              </button>
                            )}
                            <button 
                              onClick={(e) => handleDelete(e, acc.id)}
                              className={`p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                                isDarkMode ? 'text-white/10 hover:text-rose-500 hover:bg-rose-500/10' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'
                              }`}
                              title="Delete Account"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountTable;
