
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { api } from './services/api.ts';
import { Account, AccountStatus, SummaryStats, CreateAccountPayload, PurchasePayload, SellPayload, LossPayload } from './types.ts';
import { Dashboard } from './components/Dashboard.tsx';
import { AccountTable } from './components/AccountTable.tsx';
import { CreateAccountModal, PurchaseModal, SellModal, LossModal, AccountDetailsModal } from './components/Modals.tsx';
import { Plus, Moon, Sun, RefreshCw, Layers, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [activeTab, setActiveTab] = useState<AccountStatus>(AccountStatus.WATCHLIST);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    } catch (error) {
      console.error("Failed to fetch data", error);
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRefreshing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      try {
        await api.importDatabase(base64);
        alert('Database restored successfully!');
        fetchData(true);
      } catch (err: any) {
        alert('Failed to import database: ' + err.message);
      } finally {
        setRefreshing(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
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
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter">Ledgerly<span className="text-blue-600">.</span></h1>
          </div>
          <div className="flex items-center space-x-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".db" className="hidden" />
            <button 
              onClick={handleImportClick} 
              title="Restore database from .db file"
              className="p-2 text-slate-500 hover:text-blue-600 transition-colors"
            >
              <Database className="w-4 h-4" />
            </button>
            <button onClick={() => fetchData(true)} className="p-2 text-slate-500 hover:text-blue-600 transition-colors">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
            <button onClick={() => setIsDark(!isDark)} className="p-2 text-slate-500 hover:text-yellow-500 transition-colors">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setIsAddOpen(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Item</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard stats={summary} loading={loading && !summary} />

        <div className="border-b border-slate-200 dark:border-slate-800 mb-6 flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative whitespace-nowrap py-4 px-6 font-bold text-xs uppercase tracking-widest transition-colors ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
              {tab.label}
              {summary && summary.counts[tab.id] > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded text-[10px] font-bold ${activeTab === tab.id ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
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

      <CreateAccountModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSubmit={handleCreate} />
      <PurchaseModal isOpen={isPurchaseOpen} onClose={() => setIsPurchaseOpen(false)} onSubmit={handlePurchase} account={selectedAccount || undefined} />
      <SellModal isOpen={isSellOpen} onClose={() => setIsSellOpen(false)} onSubmit={handleSell} />
      <LossModal isOpen={isLossOpen} onClose={() => setIsLossOpen(false)} onSubmit={handleLoss} />
      <AccountDetailsModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} account={selectedAccount} onSave={handleUpdateDetails} />
    </div>
  );
}
