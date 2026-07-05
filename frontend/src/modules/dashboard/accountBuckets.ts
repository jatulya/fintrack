import type { Account } from '../../data/models/accounts/types/accountTypes';

const INVESTMENT_PATTERN = /invest|mutual|stock|sip|crypto|fund|portfolio|vanguard|index/i;

export function isInvestmentAccount(account: Account): boolean {
  const text = `${account.name} ${account.notes}`;
  return INVESTMENT_PATTERN.test(text);
}

export function sumAccounts(accounts: Account[]): number {
  return accounts.reduce((acc, account) => acc + account.amount, 0);
}

export function splitAccountsByBucket(accounts: Account[]) {
  const investmentAccounts = accounts.filter(isInvestmentAccount);
  const savingsAccounts = accounts.filter((account) => !isInvestmentAccount(account));

  return {
    savingsTotal: sumAccounts(savingsAccounts),
    investmentTotal: sumAccounts(investmentAccounts),
  };
}
