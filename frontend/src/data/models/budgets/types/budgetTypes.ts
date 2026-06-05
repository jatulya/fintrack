export interface BudgetLimit {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string; // YYYY-MM
}

export interface FinancialHealthScore {
  score: number; // 0-100
  savingsRate: number;
  budgetAdherence: number;
  consistency: number;
  investmentRate: number;
}
