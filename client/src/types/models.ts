export type UserRole = 'admin' | 'manager' | 'user';

export interface TransactionFile {
  id: number;
  displayName: string;
  systemName: string;
  fileSize: number;
  uploadDate: string;
}

export interface Income {
  id: number;
  source: string;
  purpose: string;
  amount: number;
  incomeDate: string;
}

export interface Expense {
  id: number;
  recipient: string;
  expensePurpose: string;
  amount: number;
  expenseDate: string;
}

export interface Transaction {
  id: number;
  categoryId: number | null;
  title: string;
  amount: number;
  transactionDate: string;
  counterparty: string;
  notes: string;
  incomes: Income[];
  expenses: Expense[];
  files: TransactionFile[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  transactions: Transaction[];
}

export interface CategoryStats {
  categoryName: string;
  totalAmount: number;
  transactionsCount: number;
  incomesSum: number;
  expensesSum: number;
  balance: number;
}

export interface Statistics {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  transactionsAmount: number;
  transactionsCount: number;
  incomesCount: number;
  expensesCount: number;
  categoriesStats: CategoryStats[];
}

export interface UserInfo {
  id: number;
  login: string;
  role: UserRole;
}
