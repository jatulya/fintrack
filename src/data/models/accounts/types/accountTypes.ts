export enum AccountType {
  Checking = 'Checking',
  Savings = 'Savings',
  Cash = 'Cash',
  Investment = 'Investment',
  Wallet = 'Wallet',
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  openingBalance: number;
  color: string;
  icon: string;
  lastActivity: string;
  isArchived: boolean;
  trend30Days: number; // Percentage change
}

export interface AccountSummary {
  totalNetWorth: number;
  accounts: Account[];
}
