
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { api } from './services/api.ts';
import { Account, AccountStatus, SummaryStats, CreateAccountPayload, PurchasePayload, SellPayload, LossPayload } from './types.ts';
import { Dashboard } from './components/Dashboard.tsx';
import { AccountTable } from './components/AccountTable.tsx';
import { CreateAccountModal, PurchaseModal, SellModal, LossModal, AccountDetailsModal } from './components/Modals.tsx';
import { UpdateNotification } from './components/UpdateNotification.tsx';
import { Plus, Moon, Sun, RefreshCw, Layers, Database, Link as LinkIcon, Download, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [activeTab, setActiveTab] = useState<AccountStatus>(AccountStatus.WATCHLIST);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDbMenuOpen, setIsDbMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dbMenuRef = useRef<HTMLDivElement>(null);
  
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dbMenuRef.current && !dbMenuRef.current.contains(event.target as Node)) {
        setIsDbMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isLossOpen, setIsLossOpen] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [accs, stats] = await Promise.all([
        api.getAccounts(activeTab),
        api.getSummary()
      ]);
      const filtered = searchTerm 
        ? accs.filter(a => a.identifier.toLowerCase().includes(searchTerm.toLowerCase()) || (a.category && a.category.toLowerCase().includes(searchTerm.toLowerCase())))
        : accs;
      setAccounts(filtered);
      setSummary(stats);
      setIsOnline(true);
    } catch (error) {
      console.error("Failed to fetch data", error);
      setIsOnline(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (data: CreateAccountPayload) => { await api.createAccount(data); fetchData(true); };
  const handlePurchase = async (data: PurchasePayload) => { if (selectedAccount) { await api.purchaseAccount(selectedAccount.id, data); fetchData(true); } };
  const handleSell = async (data: SellPayload) => { if (selectedAccount) { await api.sellAccount(selectedAccount.id, data); fetchData(true); } };
  const handleLoss = async (data: LossPayload) => { if (selectedAccount) { await api.reportLoss(selectedAccount.id, data); fetchData(true); } };
  const handleDelete = async (id: number) => { await api.deleteAccount(id); fetchData(true); };
  const handleUpdateDetails = async (id: number, data: Partial<Account>) => { await api.updateAccount(id, data); fetchData(true); };
  const handleView = (account: Account) => { setSelectedAccount(account); setIsDetailsOpen(true); };

  const handleLinkDatabase = async () => {
    setIsDbMenuOpen(false);
    try {
      const result = await api.pickDatabase();
      if (result.success) {
        alert('Database linked successfully!');
        window.location.reload();
      }
    } catch (err: any) {
      alert('Error linking database: ' + err.message);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm('This will overwrite your current app database with the selected file. Continue?')) {
        e.target.value = '';
        return;
    }
    setRefreshing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      try {
        await api.importDatabase(base64);
        alert('Database restored successfully!');
        window.location.reload();
      } catch (err: any) {
        alert('Failed to import database: ' + err.message);
      } finally {
        setRefreshing(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const tabs = [
    { id: AccountStatus.WATCHLIST, label: 'Watchlist' },
    { id: AccountStatus.PURCHASED, label: 'Purchased' },
    { id: AccountStatus.SOLD, label: 'Sold' },
    { id: AccountStatus.LOSSES, label: 'Losses' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Layers className="w-5 h-5 text-white" />
            </motion.div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Ledgerly<span className="text-blue-600">.</span></h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative" ref={dbMenuRef}>
              <button 
                onClick={() => setIsDbMenuOpen(!isDbMenuOpen)} 
                className={`p-2 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 ${isDbMenuOpen ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400'}`}
              >
                <Database className="w-4 h-4" />
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
              </button>
              
              <AnimatePresence>
                {isDbMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-1"
                  >
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Database Sync</p>
                      {isOnline && <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500"><CheckCircle2 className="w-3 h-3" /> Online</span>}
                    </div>
                    <button 
                      onClick={handleLinkDatabase}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl flex items-center space-x-3 transition-colors group"
                    >
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Link External File</p>
                        <p className="text-[10px] text-slate-400">Sync with existing .db file</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => { fileInputRef.current?.click(); setIsDbMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl flex items-center space-x-3 transition-colors mt-1"
                    >
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Restore Backup</p>
                        <p className="text-[10px] text-slate-400">Overwrite local storage</p>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".db" className="hidden" />
            
            <button onClick={() => fetchData(true)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
            <button onClick={() => setIsDark(!isDark)} className="p-2 text-slate-400 hover:text-amber-500 transition-colors">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setIsAddOpen(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg shadow-blue-500/20 active:scale-95">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">ADD PRODUCT</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard stats={summary} loading={loading && !summary} onRecalculate={() => fetchData(true)} />

        <div className="border-b border-slate-200 dark:border-slate-800 mb-6 flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative whitespace-nowrap py-4 px-6 font-black text-[10px] uppercase tracking-widest transition-colors ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              {tab.label}
              {summary && summary.counts[tab.id] > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-[9px] font-black ${activeTab === tab.id ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                  {summary.counts[tab.id]}
                </span>
              )}
              {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <AccountTable
                accounts={accounts}
                status={activeTab}
                onPurchase={(acc) => { setSelectedAccount(acc); setIsPurchaseOpen(true); }}
                onSell={(acc) => { setSelectedAccount(acc); setIsSellOpen(true); }}
                onLoss={(acc) => { setSelectedAccount(acc); setIsLossOpen(true); }}
                onDelete={handleDelete}
                onView={handleView}
                onSearch={setSearchTerm}
                />
            </motion.div>
        </AnimatePresence>
      </main>

      <UpdateNotification />

      <CreateAccountModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSubmit={handleCreate} />
      <PurchaseModal isOpen={isPurchaseOpen} onClose={() => setIsPurchaseOpen(false)} onSubmit={handlePurchase} account={selectedAccount || undefined} />
      <SellModal isOpen={isSellOpen} onClose={() => setIsSellOpen(false)} onSubmit={handleSell} />
      <LossModal isOpen={isLossOpen} onClose={() => setIsLossOpen(false)} onSubmit={handleLoss} />
      <AccountDetailsModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} account={selectedAccount} onSave={handleUpdateDetails} />
    </div>
  );
}
