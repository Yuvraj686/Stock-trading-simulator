import { Stock, PortfolioItem, Transaction } from './types';

export const MOCK_STOCKS: Stock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 189.42,
    change: 2.14,
    changePercent: 1.14,
    marketCap: '2.98T',
    volume: '52.4M',
    dayLow: 187.10,
    dayHigh: 190.55,
    sector: 'Technology',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
    icon: 'apple'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 2842.10,
    change: -12.85,
    changePercent: -0.45,
    marketCap: '1.82T',
    volume: '1.2M',
    dayLow: 2830.00,
    dayHigh: 2865.50,
    sector: 'Communication Services',
    description: 'Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
    icon: 'google'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 242.10,
    change: 11.12,
    changePercent: 4.82,
    marketCap: '764.2B',
    volume: '115.8M',
    dayLow: 235.50,
    dayHigh: 245.00,
    sector: 'Consumer Cyclical',
    description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
    icon: 'zap'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    price: 328.70,
    change: 0.39,
    changePercent: 0.12,
    marketCap: '2.45T',
    volume: '22.1M',
    dayLow: 325.00,
    dayHigh: 330.50,
    sector: 'Technology',
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
    icon: 'box'
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com',
    price: 135.25,
    change: -1.54,
    changePercent: -1.12,
    marketCap: '1.39T',
    volume: '45.7M',
    dayLow: 133.80,
    dayHigh: 137.20,
    sector: 'Consumer Cyclical',
    description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.',
    icon: 'shopping-cart'
  }
];

export const MOCK_PORTFOLIO: PortfolioItem[] = MOCK_STOCKS.slice(0, 3).map(stock => ({
  ...stock,
  shares: Math.floor(Math.random() * 50) + 1,
  avgCost: stock.price * 0.9,
  totalValue: 0, // Calculated later
  totalGain: 0,
  totalGainPercent: 0
})).map(item => {
  const totalValue = item.shares * item.price;
  const totalCost = item.shares * item.avgCost;
  return {
    ...item,
    totalValue,
    totalGain: totalValue - totalCost,
    totalGainPercent: ((totalValue - totalCost) / totalCost) * 100
  };
});

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'buy', symbol: 'AAPL', amount: 1894.20, price: 189.42, date: '2023-08-24', status: 'completed' },
  { id: '2', type: 'deposit', amount: 5000.00, date: '2023-08-20', status: 'completed' },
  { id: '3', type: 'sell', symbol: 'MSFT', amount: 3287.00, price: 328.70, date: '2023-08-15', status: 'completed' },
];

export const MOCK_CHART_DATA = [
  { time: '09:30', price: 187.50 },
  { time: '10:30', price: 188.20 },
  { time: '11:30', price: 187.80 },
  { time: '12:30', price: 188.90 },
  { time: '13:30', price: 189.10 },
  { time: '14:30', price: 188.50 },
  { time: '15:30', price: 189.42 },
];
