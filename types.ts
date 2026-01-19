
export enum AccountStatus {
  WATCHLIST = 'watchlist',
  PURCHASED = 'purchased',
  SOLD = 'sold',
  LOSSES = 'losses'
}

export interface Account {
  id: number;
  identifier: string;
  level: string;
  status: AccountStatus;
  expected_price: number | null;
  potential_income: number | null;
  loss_reason?: string;
  // Specific credential fields
  email?: string;
  password?: string;
  account_email?: string;
  account_password?: string;
  account_2nd_email?: string;
  account_2nd_password?: string;
  notes?: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  buy_price: number | null;
  sell_price: number | null;
  transaction_date: string;
}

export interface AccountWithTransaction extends Account {
  buy_price: number | null;
  sell_price: number | null;
  transaction_date: string | null;
}

export interface FinancialSummary {
  totalSpent: number;
  totalEarned: number;
  totalLost: number;
  netProfit: number;
  potentialRevenue: number;
  watchlistCount: number;
  purchasedCount: number;
  soldCount: number;
  lossesCount: number;
}
