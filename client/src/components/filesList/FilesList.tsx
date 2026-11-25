import { FC } from 'react';
import { DownloadIcon, TrashIcon } from '../../assets/icons';
import { formatDate, formatFileSize } from '../../utils';
import { FilesListProps } from './FilesListProps';
import './filesListStyles.scss';

export const FilesList: FC<FilesListProps> = ({ items, onDownloadClick, onDeleteClick }) => {
  if (items.length === 0) {
    return <div className="files-list__empty">Файлов пока нет</div>;
  }

  return (
    <div className="files-list">
      {items.map((item) => (
        <div key={item.id} className="files-list__item">
          <div className="files-list__main">
            <div className="files-list__title">{item.displayName}</div>
            <div className="files-list__sub">
              {formatFileSize(item.fileSize)} · {formatDate(item.uploadDate)}
            </div>
          </div>
          <DownloadIcon size={20} className="files-list__icon" onClick={() => onDownloadClick(item)} />
          {onDeleteClick && (
            <TrashIcon
              size={20}
              className="files-list__icon files-list__icon_danger"
              onClick={() => onDeleteClick(item)}
            />
          )}
        </div>
      ))}
    </div>
  );
};
