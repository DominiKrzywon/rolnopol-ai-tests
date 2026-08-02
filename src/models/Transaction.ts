export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  referenceId: string;
  timestamp: string;
  balanceBefore: number;
  balanceAfter: number;
}
