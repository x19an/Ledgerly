<<<<<<< HEAD
=======

>>>>>>> b462a0c3e1989d82e4e235195ce17108cf6ef656
export enum AccountStatus {
  WATCHLIST = 'watchlist',
  PURCHASED = 'purchased',
  SOLD = 'sold',
  LOSSES = 'losses'
}

export interface Account {
  id: number;
  identifier: string;
<<<<<<< HEAD
  link?: string;
  status: AccountStatus;
  expected_price?: number;
  potential_income?: number;
  loss_reason?: string;
=======
  link: string;
  status: AccountStatus;
  expected_price: number | null;
  potential_income: number | null;
  loss_reason?: string;
  // Specific credential fields
>>>>>>> b462a0c3e1989d82e4e235195ce17108cf6ef656
  email?: string;
  password?: string;
  account_email?: string;
  account_password?: string;
  account_2nd_email?: string;
  account_2nd_password?: string;
  notes?: string;
  created_at: string;
<<<<<<< HEAD
  // Joins
  buy_price?: number;
  sell_price?: number;
  transaction_date?: string;
}

export interface SummaryStats {
  total_spent: number;
  total_earned: number;
  total_lost: number;
  net_profit: number; // Realized profit
  potential_revenue: number;
  counts: {
    watchlist: number;
    purchased: number;
    sold: number;
    losses: number;
  };
}

export interface CreateAccountPayload {
  identifier: string;
  link?: string;
  expected_price?: number;
  notes?: string;
}

export interface PurchasePayload {
  buy_price: number;
  potential_income?: number;
}

export interface SellPayload {
  sell_price: number;
}

export interface LossPayload {
  loss_reason: string;
=======
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
>>>>>>> b462a0c3e1989d82e4e235195ce17108cf6ef656
}
