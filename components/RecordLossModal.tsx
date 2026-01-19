
import React, { useState, useEffect } from 'react';
import { dbService } from '../db';
import { AccountStatus, AccountWithTransaction } from '../types';
import { X, AlertTriangle, Search, Package } from 'lucide-react';

interface RecordLossModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
  isDarkMode: boolean;
}

const RecordLossModal: React.FC<RecordLossModalProps> = ({ isOpen, onClose, onAdded, isDarkMode }) => {
  const [purchasedAccounts, setPurchasedAccounts] = useState<AccountWithTransaction[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [lossReason, setLossReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      dbService.getAccountsByStatus(AccountStatus.PURCHASED).then(setPurchasedAccounts);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId || !lossReason.trim()) {
      alert('Please select an account and provide a reason');
      return;
    }

    await dbService.markAsLost(selectedAccountId, lossReason);
    onAdded();
    onClose();
    setSelectedAccountId(null);
    setLossReason('');
  };

  const filteredAccounts = purchasedAccounts.filter(acc => 
    acc.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerClass = isDarkMode ? "bg-[#1a1a1a] text-white border-white/5" : "bg-white text-slate-800 border-transparent";
  const itemClass = isDarkMode ? "hover:bg-white/5 border-white/5" : "hover:bg-slate-50 border-slate-100";
  const selectedItemClass = isDarkMode ? "bg-rose-500/20 border-rose-500/50" : "bg-rose-50 border-rose-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] ${containerClass}`}>
        <div className={`px-6 py-4 flex justify-between items-center border-b ${isDarkMode ? 'bg-[#222] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-500" />
            <h3 className="text-lg font-bold">Record Loss from Inventory</h3>
          </div>
          <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest opacity-40">Select Purchased Account</label>
              <div className={`relative flex items-center mb-2 px-3 py-2 border rounded-xl ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <Search size={14} className="opacity-30 mr-2" />
                <input 
                  type="text" 
                  placeholder="Filter inventory..."
                  className="bg-transparent outline-none text-sm w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {filteredAccounts.length === 0 ? (
                  <div className="py-8 text-center opacity-30 italic text-sm">No purchased accounts found</div>
                ) : (
                  filteredAccounts.map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`flex justify-between items-center px-4 py-3 border rounded-xl text-left transition-all ${
                        selectedAccountId === acc.id ? selectedItemClass : itemClass
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Package size={16} className="opacity-40" />
                        <div>
                          <div className="text-sm font-bold">{acc.identifier}</div>
                          <div className="text-[10px] opacity-40">Ref: #{acc.id}</div>
                        </div>
                      </div>
                      <div className="text-xs font-mono font-bold opacity-60">
                        ${acc.buy_price}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest opacity-40">Reason for Loss</label>
              <textarea 
                placeholder="e.g. Account recovered by original owner, Chargeback, Banned..."
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none h-24 text-sm ${
                  isDarkMode ? 'bg-[#111] border-white/5 text-white focus:border-rose-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-500/50'
                }`}
                value={lossReason}
                onChange={(e) => setLossReason(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={`px-6 py-4 flex gap-3 border-t ${isDarkMode ? 'bg-[#222] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <button 
              type="button" 
              onClick={onClose}
              className={`flex-1 px-4 py-3 font-bold rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'}`}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!selectedAccountId || !lossReason.trim()}
              className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all"
            >
              Confirm Loss
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 100, 100, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 100, 100, 0.4); }
      `}</style>
    </div>
  );
};

export default RecordLossModal;
