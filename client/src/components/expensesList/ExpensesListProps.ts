import { Expense } from '../../types/models';

export interface ExpensesListProps {
  items: Expense[];
  onDeleteClick?: (id: number) => void;
}
