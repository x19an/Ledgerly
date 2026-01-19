<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { api } from './services/api';
import { Account, AccountStatus, SummaryStats, CreateAccountPayload, PurchasePayload, SellPayload, LossPayload } from './types';
import { Dashboard } from './components/Dashboard';
import { AccountTable } from './components/AccountTable';
import { CreateAccountModal, PurchaseModal, SellModal, LossModal } from './components/Modals';
import { Plus, LayoutDashboard } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AccountStatus>(AccountStatus.WATCHLIST);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isLossOpen, setIsLossOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accs, stats] = await Promise.all([
        api.getAccounts(activeTab),
        api.getSummary()
      ]);
      setAccounts(accs);
      setSummary(stats);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Handlers
  const handleCreate = async (data: CreateAccountPayload) => {
    await api.createAccount(data);
    fetchData();
  };

  const handlePurchase = async (data: PurchasePayload) => {
    if (selectedAccount) {
      await api.purchaseAccount(selectedAccount.id, data);
      fetchData();
    }
  };

  const handleSell = async (data: SellPayload) => {
    if (selectedAccount) {
      await api.sellAccount(selectedAccount.id, data);
      fetchData();
    }
  };

  const handleLoss = async (data: LossPayload) => {
    if (selectedAccount) {
      await api.reportLoss(selectedAccount.id, data);
      fetchData();
    }
  };

  const handleDelete = async (id: number) => {
      await api.deleteAccount(id);
      fetchData();
  }

  const tabs = [
    { id: AccountStatus.WATCHLIST, label: 'Watchlist' },
    { id: AccountStatus.PURCHASED, label: 'Purchased' },
    { id: AccountStatus.SOLD, label: 'Sold' },
    { id: AccountStatus.LOSSES, label: 'Losses' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Ledgerly</h1>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard */}
        <Dashboard stats={summary} loading={loading} />

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6 overflow-x-auto">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                `}
              >
                {tab.label}
                {summary && summary.counts[tab.id] > 0 && (
                  <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {summary.counts[tab.id]}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* List */}
        <AccountTable
          accounts={accounts}
          status={activeTab}
          onPurchase={(acc) => { setSelectedAccount(acc); setIsPurchaseOpen(true); }}
          onSell={(acc) => { setSelectedAccount(acc); setIsSellOpen(true); }}
          onLoss={(acc) => { setSelectedAccount(acc); setIsLossOpen(true); }}
          onDelete={handleDelete}
        />
      </main>

      {/* Modals */}
      <CreateAccountModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleCreate}
      />
      <PurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
        onSubmit={handlePurchase}
        account={selectedAccount || undefined}
      />
      <SellModal
        isOpen={isSellOpen}
        onClose={() => setIsSellOpen(false)}
        onSubmit={handleSell}
      />
      <LossModal
        isOpen={isLossOpen}
        onClose={() => setIsLossOpen(false)}
        onSubmit={handleLoss}
      />
    </div>
  );
}
=======

import React, { useState, useEffect, useCallback } from 'react';
import { initDB, dbService } from './db';
import { AccountStatus, AccountWithTransaction, FinancialSummary } from './types';
import Dashboard from './components/Dashboard';
import AccountTable from './components/AccountTable';
import AddAccountModal from './components/AddAccountModal';
import RecordLossModal from './components/RecordLossModal';
import AccountDetailModal from './components/AccountDetailModal';
import { LayoutGrid, ClipboardList, Wallet, CheckCircle, Plus, Moon, Sun, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState<AccountStatus | 'dashboard'>('dashboard');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [accounts, setAccounts] = useState<AccountWithTransaction[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRecordLossModalOpen, setIsRecordLossModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountWithTransaction | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const refreshData = useCallback(async () => {
    const sum = await dbService.getSummary();
    setSummary(sum);
    
    if (activeTab !== 'dashboard') {
      const data = await dbService.getAccountsByStatus(activeTab as AccountStatus);
      setAccounts(data);
      
      if (selectedAccount) {
        const updated = data.find(a => a.id === selectedAccount.id);
        if (updated) setSelectedAccount(updated);
      }
    }
  }, [activeTab, selectedAccount]);

  useEffect(() => {
    initDB().then(() => {
      setIsReady(true);
      refreshData();
    });
  }, [refreshData]);

  const handleAddAction = () => {
    if (activeTab === AccountStatus.LOSSES) {
      setIsRecordLossModalOpen(true);
    } else {
      setIsAddModalOpen(true);
    }
  };

  if (!isReady) {
    return (
      <div className={`flex h-screen items-center justify-center ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-lg font-medium">Connecting to Ledgerly Server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col md:flex-row ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-slate-50'}`}>
      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 flex-shrink-0 md:sticky md:top-0 md:h-screen transition-colors duration-300 border-r ${
        isDarkMode ? 'bg-[#111] border-white/5 text-slate-400' : 'bg-slate-900 border-transparent text-slate-300'
      }`}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="bg-emerald-600 p-1.5 rounded-lg">LG</span>
            Ledgerly
          </h1>
        </div>
        
        <nav className="px-3 space-y-1">
          <NavItem 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            icon={<LayoutGrid size={20} />}
            label="Analytics"
            isDarkMode={isDarkMode}
          />
          <NavItem 
            active={activeTab === AccountStatus.WATCHLIST} 
            onClick={() => setActiveTab(AccountStatus.WATCHLIST)}
            icon={<ClipboardList size={20} />}
            label="Watchlist"
            badge={summary?.watchlistCount}
            isDarkMode={isDarkMode}
          />
          <NavItem 
            active={activeTab === AccountStatus.PURCHASED} 
            onClick={() => setActiveTab(AccountStatus.PURCHASED)}
            icon={<Wallet size={20} />}
            label="Purchased"
            badge={summary?.purchasedCount}
            isDarkMode={isDarkMode}
          />
          <NavItem 
            active={activeTab === AccountStatus.SOLD} 
            onClick={() => setActiveTab(AccountStatus.SOLD)}
            icon={<CheckCircle size={20} />}
            label="Sold"
            badge={summary?.soldCount}
            isDarkMode={isDarkMode}
          />
          <NavItem 
            active={activeTab === AccountStatus.LOSSES} 
            onClick={() => setActiveTab(AccountStatus.LOSSES)}
            icon={<AlertTriangle size={20} />}
            label="Losses"
            badge={summary?.lossesCount}
            isDarkMode={isDarkMode}
          />
        </nav>
        
        <div className="absolute bottom-6 left-3 right-3 space-y-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-full flex items-center justify-center gap-3 font-semibold py-2.5 px-4 rounded-xl transition-all border ${
              isDarkMode 
                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                : 'bg-slate-800 border-transparent text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <button 
            onClick={handleAddAction}
            className={`w-full flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg ${
              activeTab === AccountStatus.LOSSES
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
            }`}
          >
            {activeTab === AccountStatus.LOSSES ? <AlertTriangle size={20} /> : <Plus size={20} />}
            {activeTab === AccountStatus.LOSSES ? 'Record Loss' : 'Add Account'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <header className={`px-8 py-4 flex items-center justify-between sticky top-0 z-10 border-b backdrop-blur-md transition-colors duration-300 ${
          isDarkMode ? 'bg-[#0a0a0a]/80 border-white/5' : 'bg-white/80 border-slate-200'
        }`}>
          <h2 className={`text-2xl font-bold capitalize transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            {activeTab === 'dashboard' ? 'Overview' : activeTab === AccountStatus.LOSSES ? 'Losses' : activeTab}
          </h2>
          <div className="text-sm opacity-50">
            Engine: <span className="text-emerald-500 font-medium font-mono">SQLite V3 (Server)</span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && summary ? (
            <Dashboard summary={summary} isDarkMode={isDarkMode} />
          ) : (
            <AccountTable 
              status={activeTab as AccountStatus} 
              accounts={accounts} 
              onUpdate={refreshData}
              onSelectAccount={(acc) => setSelectedAccount(acc)}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </main>

      <AddAccountModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdded={refreshData}
        isDarkMode={isDarkMode}
      />

      <RecordLossModal
        isOpen={isRecordLossModalOpen}
        onClose={() => setIsRecordLossModalOpen(false)}
        onAdded={refreshData}
        isDarkMode={isDarkMode}
      />

      <AccountDetailModal 
        account={selectedAccount}
        onClose={() => setSelectedAccount(null)}
        onUpdate={refreshData}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  isDarkMode: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ active, onClick, icon, label, badge, isDarkMode }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
      active 
        ? (isDarkMode ? 'bg-emerald-600/20 text-emerald-400' : 'bg-emerald-600/10 text-emerald-400') 
        : (isDarkMode ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-800 hover:text-white')
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
        active ? 'bg-emerald-600 text-white' : (isDarkMode ? 'bg-white/5 text-slate-500' : 'bg-slate-800 text-slate-400')
      }`}>
        {badge}
      </span>
    )}
  </button>
);

export default App;
>>>>>>> b462a0c3e1989d82e4e235195ce17108cf6ef656
