import { Account, AccountStatus, CreateAccountPayload, SummaryStats, PurchasePayload, SellPayload, LossPayload } from '../types';

const API_BASE = 'http://localhost:3001/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP Error ${response.status}`);
  }
  return response.json();
}

export const api = {
  getAccounts: async (status?: AccountStatus): Promise<Account[]> => {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/accounts${query}`);
    return handleResponse<Account[]>(res);
  },

  getSummary: async (): Promise<SummaryStats> => {
    const res = await fetch(`${API_BASE}/summary`);
    return handleResponse<SummaryStats>(res);
  },

  createAccount: async (data: CreateAccountPayload): Promise<Account> => {
    const res = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Account>(res);
  },

  updateAccount: async (id: number, data: Partial<Account>): Promise<Account> => {
    const res = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Account>(res);
  },

  purchaseAccount: async (id: number, data: PurchasePayload): Promise<void> => {
    const res = await fetch(`${API_BASE}/accounts/${id}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<void>(res);
  },

  sellAccount: async (id: number, data: SellPayload): Promise<void> => {
    const res = await fetch(`${API_BASE}/accounts/${id}/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<void>(res);
  },

  reportLoss: async (id: number, data: LossPayload): Promise<void> => {
    const res = await fetch(`${API_BASE}/accounts/${id}/loss`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<void>(res);
  },
  
  deleteAccount: async (id: number): Promise<void> => {
      const res = await fetch(`${API_BASE}/accounts/${id}`, {
          method: 'DELETE',
      });
      return handleResponse<void>(res);
  }
};