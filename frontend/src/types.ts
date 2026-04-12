export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  volume: string;
  dayLow: number;
  dayHigh: number;
  description: string;
  sector: string;
  icon: string;
}

export interface PortfolioItem extends Stock {
  shares: number;
  avgCost: number;
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdraw';
  symbol?: string;
  amount: number;
  price?: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  balance: number;
  totalInvested: number;
  portfolioValue: number;
}
