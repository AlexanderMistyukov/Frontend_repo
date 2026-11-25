import { Income } from '../../types/models';

export interface IncomesListProps {
  items: Income[];
  onDeleteClick?: (id: number) => void;
}
