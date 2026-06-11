export interface Account {
  id: string;
  name: string;
  amount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountInput {
  name: string;
  amount?: number;
  notes?: string;
}
