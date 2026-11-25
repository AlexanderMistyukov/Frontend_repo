import { Transaction } from '../../types/models';

export interface TransactionsListProps {
  items: Transaction[];
  selectedId: number | null;
  onItemClick: (id: number) => void;
}
