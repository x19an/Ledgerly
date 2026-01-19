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
