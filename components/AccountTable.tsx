import React from 'react';
import { Account, AccountStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { ExternalLink, ShoppingCart, DollarSign, XCircle, Trash2, MoreHorizontal } from 'lucide-react';

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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">No accounts found</h3>
        <p className="text-slate-500 mt-1">There are no accounts in this category yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Identifier</th>
              {status === AccountStatus.WATCHLIST && <th className="px-6 py-4 font-semibold text-slate-700">Expected Price</th>}
              {status === AccountStatus.PURCHASED && <th className="px-6 py-4 font-semibold text-slate-700">Buy Price</th>}
              {status === AccountStatus.PURCHASED && <th className="px-6 py-4 font-semibold text-slate-700">Potential</th>}
              {status === AccountStatus.SOLD && <th className="px-6 py-4 font-semibold text-slate-700">Sold For</th>}
              {status === AccountStatus.SOLD && <th className="px-6 py-4 font-semibold text-slate-700">Profit</th>}
              {status === AccountStatus.LOSSES && <th className="px-6 py-4 font-semibold text-slate-700">Loss Amount</th>}
              {status === AccountStatus.LOSSES && <th className="px-6 py-4 font-semibold text-slate-700">Reason</th>}
              <th className="px-6 py-4 font-semibold text-slate-700">Notes</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{acc.identifier}</div>
                  {acc.link && (
                    <a href={acc.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center mt-1">
                      Link <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </td>

                {status === AccountStatus.WATCHLIST && (
                  <td className="px-6 py-4 text-slate-600">{formatCurrency(acc.expected_price)}</td>
                )}

                {status === AccountStatus.PURCHASED && (
                  <>
                    <td className="px-6 py-4 text-slate-600">{formatCurrency(acc.buy_price)}</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">{formatCurrency(acc.potential_income)}</td>
                  </>
                )}

                {status === AccountStatus.SOLD && (
                  <>
                    <td className="px-6 py-4 text-slate-600">{formatCurrency(acc.sell_price)}</td>
                    <td className={`px-6 py-4 font-bold ${(acc.sell_price || 0) - (acc.buy_price || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency((acc.sell_price || 0) - (acc.buy_price || 0))}
                    </td>
                  </>
                )}

                {status === AccountStatus.LOSSES && (
                  <>
                    <td className="px-6 py-4 text-red-600 font-medium">{formatCurrency(acc.buy_price)}</td>
                    <td className="px-6 py-4 text-slate-500 italic">{acc.loss_reason || 'No reason provided'}</td>
                  </>
                )}

                <td className="px-6 py-4 text-slate-500 truncate max-w-xs">{acc.notes || '-'}</td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {status === AccountStatus.WATCHLIST && (
                      <button
                        onClick={() => onPurchase(acc)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors title='Purchase'"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    )}
                    {status === AccountStatus.PURCHASED && (
                      <>
                        <button
                          onClick={() => onSell(acc)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Mark Sold"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onLoss(acc)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Mark Loss"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                     <button
                        onClick={() => {
                            if(window.confirm('Are you sure you want to delete this account permanently?')) {
                                onDelete(acc.id);
                            }
                        }}
                        className="p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
