
import { AccountStatus, AccountWithTransaction, FinancialSummary, Account } from './types';

const API_BASE = 'http://localhost:3001/api';

export const initDB = async () => {
  // Now handled by the backend server
  return Promise.resolve();
};

export const dbService = {
  getAccountsByStatus: async (status: AccountStatus): Promise<AccountWithTransaction[]> => {
    const res = await fetch(`${API_BASE}/accounts?status=${status}`);
    return res.json();
  },

  addWatchlistAccount: async (identifier: string, link: string, expectedPrice: number) => {
    await fetch(`${API_BASE}/accounts/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, link, expected_price: expectedPrice })
    });
  },

  updateAccount: async (account: Partial<Account> & { id: number }) => {
    const { id, ...updates } = account;
    await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  },

  purchaseAccount: async (accountId: number, buyPrice: number, potentialIncome: number) => {
    await fetch(`${API_BASE}/accounts/${accountId}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buy_price: buyPrice, potential_income: potentialIncome })
    });
  },

  sellAccount: async (accountId: number, sellPrice: number) => {
    await fetch(`${API_BASE}/accounts/${accountId}/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sell_price: sellPrice })
    });
  },

  markAsLost: async (accountId: number, reason: string) => {
    await fetch(`${API_BASE}/accounts/${accountId}/loss`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
  },

  deleteAccount: async (accountId: number) => {
    await fetch(`${API_BASE}/accounts/${accountId}`, { method: 'DELETE' });
  },

  getSummary: async (): Promise<FinancialSummary> => {
    const res = await fetch(`${API_BASE}/summary`);
    return res.json();
  }
};
