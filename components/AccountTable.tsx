import React from 'react';
import { Account, AccountStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { ExternalLink, ShoppingCart, DollarSign, XCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AccountTableProps {
  accounts: Account[];
  status: AccountStatus;
  onPurchase: (account: Account) => void;
  onSell: (account: Account) => void;
  onLoss: (account: Account) => void;
  onDelete: (id: number) => void;
}

export const AccountTable: React.FC<AccountTableProps> = ({ 
  accounts, 
  status, 
  onPurchase, 
  onSell, 
  onLoss,
  onDelete 
}) => {
  const formatCurrency = (val?: number) => 
    val !== undefined ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val) : '-';

  if (accounts.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center"
      >
        <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No accounts found</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-1">There are no accounts in this category yet.</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Identifier</th>
              {status === AccountStatus.WATCHLIST && <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Expected Price</th>}
              {status === AccountStatus.PURCHASED && <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Buy Price</th>}
              {status === AccountStatus.PURCHASED && <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Potential</th>}
              {status === AccountStatus.SOLD && <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Sold For</th>}
              {status === AccountStatus.SOLD && <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Profit</th>}
              {status === AccountStatus.LOSSES && <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Loss Amount</th>}
              {status === AccountStatus.LOSSES && <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Reason</th>}
              <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Notes</th>
              <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {accounts.map((acc, i) => (
              <motion.tr 
                key={acc.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{acc.identifier}</div>
                  {acc.link && (
                    <a href={acc.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center mt-1">
                      Link <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </td>

                {status === AccountStatus.WATCHLIST && (
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatCurrency(acc.expected_price)}</td>
                )}

                {status === AccountStatus.PURCHASED && (
                  <>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatCurrency(acc.buy_price)}</td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(acc.potential_income)}</td>
                  </>
                )}

                {status === AccountStatus.SOLD && (
                  <>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatCurrency(acc.sell_price)}</td>
                    <td className={`px-6 py-4 font-bold ${(acc.sell_price || 0) - (acc.buy_price || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency((acc.sell_price || 0) - (acc.buy_price || 0))}
                    </td>
                  </>
                )}

                {status === AccountStatus.LOSSES && (
                  <>
                    <td className="px-6 py-4 text-red-600 dark:text-red-400 font-medium">{formatCurrency(acc.buy_price)}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-500 italic">{acc.loss_reason || 'No reason provided'}</td>
                  </>
                )}

                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 truncate max-w-xs">{acc.notes || '-'}</td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {status === AccountStatus.WATCHLIST && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onPurchase(acc)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Purchase"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </motion.button>
                    )}
                    {status === AccountStatus.PURCHASED && (
                      <>
                        <motion.button
                           whileHover={{ scale: 1.1 }}
                           whileTap={{ scale: 0.9 }}
                          onClick={() => onSell(acc)}
                          className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                          title="Mark Sold"
                        >
                          <DollarSign className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                           whileHover={{ scale: 1.1 }}
                           whileTap={{ scale: 0.9 }}
                          onClick={() => onLoss(acc)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Mark Loss"
                        >
                          <XCircle className="w-4 h-4" />
                        </motion.button>
                      </>
                    )}
                     <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            if(window.confirm('Are you sure you want to delete this account permanently?')) {
                                onDelete(acc.id);
                            }
                        }}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};