
export enum AccountStatus {
  WATCHLIST = 'watchlist',
  PURCHASED = 'purchased',
  SOLD = 'sold',
  LOSSES = 'losses'
}

export interface Account {
  id: number;
  identifier: string;
  link?: string;
  thumbnail_url?: string;
  category?: string;
  status: AccountStatus;
  expected_price?: number;
  potential_income?: number;
  loss_reason?: string;
  email?: string;
  password?: string;
  account_email?: string;
  account_password?: string;
  account_2nd_email?: string;
  account_2nd_password?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joins
  buy_price?: number;
  sell_price?: number;
  transaction_date?: string;
}

export interface SummaryStats {
  total_spent: number;
  total_earned: number;
  total_lost: number;
  net_profit: number; 
  potential_revenue: number;
  counts: {
    watchlist: number;
    purchased: number;
    sold: number;
    losses: number;
  };
  // Trend simulation data
  profit_trend: number[]; 
}

export interface CreateAccountPayload {
  identifier: string;
  link?: string;
  category?: string;
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
}
