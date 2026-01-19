
import React, { useState } from 'react';
import { Account, AccountStatus } from '../types.ts';
import { StatusBadge } from './StatusBadge.tsx';
import { ExternalLink, ShoppingCart, DollarSign, XCircle, Trash2, Search, Filter, Tag, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface AccountTableProps {
  accounts: Account[];
  status: AccountStatus;
  onPurchase: (account: Account) => void;
  onSell: (account: Account) => void;
  onLoss: (account: Account) => void;
  onDelete: (id: number) => void;
  onView: (account: Account) => void;
  onSearch: (term: string) => void;
}

export const AccountTable: React.FC<AccountTableProps> = ({ 
  accounts, 
  status, 
  onPurchase, 
  onSell, 
  onLoss,
  onDelete,
  onView,
  onSearch
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (val?: number) => 
    val !== undefined ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val) : '-';

  const getRelativeTime = (dateStr: string) => {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (isNaN(diff)) return 'N/A';
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
      return date.toLocaleDateString();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      onSearch(e.target.value);
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-2">
          <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search identifier, notes, or category..." 
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={handleSearchChange}
              />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 scrollbar-hide">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-blue-500 transition-colors">
                  <Filter className="w-3 h-3" /> Filters
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-blue-500 transition-colors whitespace-nowrap">
                  Highest Potential
              </button>
          </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Item</th>
                {status === AccountStatus.WATCHLIST && <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Expected</th>}
                {status === AccountStatus.WATCHLIST && <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Proj. Profit</th>}
                {status === AccountStatus.PURCHASED && <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Buy Price</th>}
                {status === AccountStatus.PURCHASED && <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Potential Sale</th>}
                {status === AccountStatus.SOLD && <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Sold For</th>}
                {status === AccountStatus.SOLD && <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Profit</th>}
                {status === AccountStatus.LOSSES && <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Loss Amount</th>}
                {status === AccountStatus.LOSSES && <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Reason</th>}
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Updated</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-50">
                        <ShoppingCart className="w-12 h-12 mb-3 text-slate-300" />
                        <p className="text-slate-500 font-medium">No records matching your view.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                accounts.map((acc, i) => (
                  <motion.tr 
                    key={acc.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    onClick={() => onView(acc)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200 dark:border-slate-700">
                            {acc.thumbnail_url ? <img src={acc.thumbnail_url} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[150px]">{acc.identifier}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                              {acc.category && (
                                  <span className="flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 uppercase font-bold tracking-tight">
                                      <Tag className="w-2 h-2" /> {acc.category}
                                  </span>
                              )}
                              {acc.link && (
                                <a href={acc.link} onClick={e => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                                  Link <ExternalLink className="w-2 h-2 ml-0.5" />
                                </a>
                              )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {status === AccountStatus.WATCHLIST && (
                      <>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{formatCurrency(acc.expected_price)}</td>
                        <td className="px-6 py-4 text-slate-400 dark:text-slate-500 italic">TBD</td>
                      </>
                    )}

                    {status === AccountStatus.PURCHASED && (
                      <>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{formatCurrency(acc.buy_price)}</td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(acc.potential_income)}</span>
                                <span className="text-[10px] text-emerald-500/60 font-bold">+{formatCurrency((acc.potential_income || 0) - (acc.buy_price || 0))} Est.</span>
                            </div>
                        </td>
                      </>
                    )}

                    {status === AccountStatus.SOLD && (
                      <>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{formatCurrency(acc.sell_price)}</td>
                        <td className={`px-6 py-4 font-bold ${(acc.sell_price || 0) - (acc.buy_price || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency((acc.sell_price || 0) - (acc.buy_price || 0))}
                        </td>
                      </>
                    )}

                    {status === AccountStatus.LOSSES && (
                      <>
                        <td className="px-6 py-4 text-red-600 dark:text-red-400 font-bold">{formatCurrency(acc.buy_price)}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-500 italic">{acc.loss_reason || 'N/A'}</td>
                      </>
                    )}

                    <td className="px-6 py-4 text-slate-400 text-xs">{getRelativeTime(acc.updated_at)}</td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {status === AccountStatus.WATCHLIST && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onPurchase(acc); }}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        )}
                        {status === AccountStatus.PURCHASED && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); onSell(acc); }}
                              className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onLoss(acc); }}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); if(confirm('Delete?')) onDelete(acc.id); }}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
