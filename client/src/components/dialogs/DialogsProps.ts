import { Category, Expense, Income, Transaction } from '../../types/models';
import { DialogMode } from '../../types/commonTypes';

interface BaseDialogProps {
  isOpen: boolean;
  mode: DialogMode;
  onCancel: () => void;
}

export interface CategoryFormData {
  name: string;
  description: string;
}

export interface CategoryDialogProps extends BaseDialogProps {
  initial: Category | null;
  onSave: (data: CategoryFormData) => Promise<void>;
}

export interface TransactionFormData {
  categoryId: number;
  title: string;
  amount: number;
  transactionDate: string;
  counterparty: string;
  notes: string;
}

export interface TransactionDialogProps extends BaseDialogProps {
  categories: Category[];
  defaultCategoryId: number | null;
  initial: Transaction | null;
  onSave: (data: TransactionFormData) => Promise<void>;
}

export interface IncomeFormData {
  source: string;
  purpose: string;
  amount: number;
  incomeDate: string;
}

export interface IncomeDialogProps extends BaseDialogProps {
  initial?: Income | null;
  onSave: (data: IncomeFormData) => Promise<void>;
}

export interface ExpenseFormData {
  recipient: string;
  expensePurpose: string;
  amount: number;
  expenseDate: string;
}

export interface ExpenseDialogProps extends BaseDialogProps {
  initial?: Expense | null;
  onSave: (data: ExpenseFormData) => Promise<void>;
}
