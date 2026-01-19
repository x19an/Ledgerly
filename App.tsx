
import React, { useState, useEffect, useCallback } from 'react';
import { initDB, dbService } from './db';
import { AccountStatus, AccountWithTransaction, FinancialSummary } from './types';
import Dashboard from './components/Dashboard';
import AccountTable from './components/AccountTable';
import AddAccountModal from './components/AddAccountModal';
import AccountDetailModal from './components/AccountDetailModal';
import { LayoutGrid, ClipboardList, Wallet, CheckCircle, Plus, Moon, Sun, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState<AccountStatus | 'dashboard'>('dashboard');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [accounts, setAccounts] = useState<AccountWithTransaction[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
    const sum = dbService.getSummary();
    setSummary(sum);
    
    if (activeTab !== 'dashboard') {
      const data = dbService.getAccountsByStatus(activeTab as AccountStatus);
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

  if (!isReady) {
    return (
      <div className={`flex h-screen items-center justify-center ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-lg font-medium">Initializing Ledgerly SQLite Core...</p>
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
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus size={20} />
            Add Account
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
            Engine: <span className="text-emerald-500 font-medium font-mono">SQLite V3</span>
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
