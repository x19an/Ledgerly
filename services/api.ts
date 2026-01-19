
import { Account, AccountStatus, CreateAccountPayload, SummaryStats, PurchasePayload, SellPayload, LossPayload } from '../types.ts';

// Using relative path to work correctly with Vite's dev proxy and production serving
const API_BASE = '/api';
const STORAGE_KEY = 'ledgerly_offline_data_v2';

let serverActive: boolean | null = null;
let lastCheckTime = 0;

const getLocalData = (): Account[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const setLocalData = (data: Account[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP Error ${response.status}`);
  }
  return response.json();
}

const checkServer = async (force = false): Promise<boolean> => {
  const now = Date.now();
  if (!force && serverActive !== null && (now - lastCheckTime < 10000)) {
    return serverActive;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200); // Relaxed timeout
    const res = await fetch(`${API_BASE}/summary`, { 
        method: 'GET', 
        signal: controller.signal 
    });
    clearTimeout(timeoutId);
    serverActive = res.ok;
  } catch {
    serverActive = false;
  }
  lastCheckTime = now;
  return serverActive;
};

export const api = {
  getAccounts: async (status?: AccountStatus): Promise<Account[]> => {
    if (await checkServer()) {
      try {
        const query = status ? `?status=${status}` : '';
        const res = await fetch(`${API_BASE}/accounts${query}`);
        return await handleResponse<Account[]>(res);
      } catch (e) {
        console.warn("Server failed during getAccounts, falling back.");
      }
    }
    const all = getLocalData();
    return status ? all.filter(a => a.status === status) : all;
  },

  getSummary: async (): Promise<SummaryStats> => {
    if (await checkServer()) {
      try {
        const res = await fetch(`${API_BASE}/summary`);
        return await handleResponse<SummaryStats>(res);
      } catch (e) {
        console.warn("Server failed during getSummary, falling back.");
      }
    }

    const all = getLocalData();
    const purchased = all.filter(a => a.status === AccountStatus.PURCHASED);
    const sold = all.filter(a => a.status === AccountStatus.SOLD);
    const losses = all.filter(a => a.status === AccountStatus.LOSSES);

    const totalSpent = all.reduce((sum, a) => sum + (a.buy_price || 0), 0);
    const totalEarned = sold.reduce((sum, a) => sum + (a.sell_price || 0), 0);
    const totalLost = losses.reduce((sum, a) => sum + (a.buy_price || 0), 0);
    
    const realizedProfit = sold.reduce((sum, a) => sum + ((a.sell_price || 0) - (a.buy_price || 0)), 0);
    const netProfit = realizedProfit - totalLost;
    const potentialRevenue = purchased.reduce((sum, a) => sum + (a.potential_income || 0), 0);

    return {
      total_spent: totalSpent,
      total_earned: totalEarned,
      total_lost: totalLost,
      net_profit: netProfit,
      potential_revenue: potentialRevenue,
      counts: {
        watchlist: all.filter(a => a.status === AccountStatus.WATCHLIST).length,
        purchased: purchased.length,
        sold: sold.length,
        losses: losses.length,
      },
      profit_trend: [0, realizedProfit * 0.5, netProfit]
    };
  },

  checkDuplicateLink: async (link: string): Promise<{ exists: boolean; identifier?: string }> => {
    if (await checkServer()) {
        try {
            const res = await fetch(`${API_BASE}/accounts/check-duplicate?link=${encodeURIComponent(link)}`);
            return await handleResponse<{ exists: boolean; identifier?: string }>(res);
        } catch {}
    }
    const all = getLocalData();
    const existing = all.find(a => a.link === link);
    return { exists: !!existing, identifier: existing?.identifier };
  },

  createAccount: async (data: CreateAccountPayload): Promise<Account> => {
    if (await checkServer()) {
      try {
        const res = await fetch(`${API_BASE}/accounts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return await handleResponse<Account>(res);
      } catch {}
    }

    const all = getLocalData();
    const newAcc: Account = {
      ...data,
      id: Date.now(),
      status: AccountStatus.WATCHLIST,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLocalData([...all, newAcc]);
    return newAcc;
  },

  updateAccount: async (id: number, data: Partial<Account>): Promise<Account> => {
    if (await checkServer()) {
      try {
        const res = await fetch(`${API_BASE}/accounts/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return await handleResponse<Account>(res);
      } catch {}
    }

    const all = getLocalData();
    const index = all.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Not found");
    const updated = { ...all[index], ...data, updated_at: new Date().toISOString() };
    all[index] = updated;
    setLocalData(all);
    return updated;
  },

  purchaseAccount: async (id: number, data: PurchasePayload): Promise<void> => {
    if (await checkServer()) {
      try {
        const res = await fetch(`${API_BASE}/accounts/${id}/purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return await handleResponse<void>(res);
      } catch {}
    }

    const all = getLocalData();
    const index = all.findIndex(a => a.id === id);
    if (index !== -1) {
      all[index] = { 
        ...all[index], 
        status: AccountStatus.PURCHASED, 
        buy_price: data.buy_price, 
        potential_income: data.potential_income,
        updated_at: new Date().toISOString() 
      };
      setLocalData(all);
    }
  },

  sellAccount: async (id: number, data: SellPayload): Promise<void> => {
    if (await checkServer()) {
      try {
        const res = await fetch(`${API_BASE}/accounts/${id}/sell`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return await handleResponse<void>(res);
      } catch {}
    }

    const all = getLocalData();
    const index = all.findIndex(a => a.id === id);
    if (index !== -1) {
      all[index] = { 
        ...all[index], 
        status: AccountStatus.SOLD, 
        sell_price: data.sell_price, 
        updated_at: new Date().toISOString() 
      };
      setLocalData(all);
    }
  },

  reportLoss: async (id: number, data: LossPayload): Promise<void> => {
    if (await checkServer()) {
      try {
        const res = await fetch(`${API_BASE}/accounts/${id}/loss`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return await handleResponse<void>(res);
      } catch {}
    }

    const all = getLocalData();
    const index = all.findIndex(a => a.id === id);
    if (index !== -1) {
      all[index] = { 
        ...all[index], 
        status: AccountStatus.LOSSES, 
        loss_reason: data.loss_reason, 
        updated_at: new Date().toISOString() 
      };
      setLocalData(all);
    }
  },
  
  deleteAccount: async (id: number): Promise<void> => {
      if (await checkServer()) {
        try {
            const res = await fetch(`${API_BASE}/accounts/${id}`, { method: 'DELETE' });
            return await handleResponse<void>(res);
        } catch {}
      }
      const all = getLocalData();
      setLocalData(all.filter(a => a.id !== id));
  },

  importDatabase: async (base64Data: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/import-db`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data }),
    });
    return await handleResponse<void>(res);
  }
};
