import { TransactionFile } from '../../types/models';

export interface FilesListProps {
  items: TransactionFile[];
  onDownloadClick: (file: TransactionFile) => void;
  onDeleteClick?: (file: TransactionFile) => void;
}
