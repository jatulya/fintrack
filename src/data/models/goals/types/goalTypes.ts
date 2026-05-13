export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  color: string;
}

export interface Investment {
  id: string;
  name: string;
  type: string; // SIP, Stock, Mutual Fund, Crypto
  investedAmount: number;
  currentValue: number;
  lastUpdated: string;
}
