type TransactionType = 'income' | 'expense';

export interface TransactionPayload {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
}

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  referenceId: string | null;
  timestamp: string;
  balanceBefore: number;
  balanceAfter: number;
}

export interface TransactionHistory {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
export interface TransactionResponse {
  transaction: Transaction;
}
