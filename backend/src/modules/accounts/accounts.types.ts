export interface AccountRow {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PublicAccount {
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
