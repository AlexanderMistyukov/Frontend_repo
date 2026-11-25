import { FC } from 'react';
import classNames from 'classnames';
import { Button } from '../button';
import { DialogProps } from './DialogProps';
import './dialogStyles.scss';

export const Dialog: FC<DialogProps> = ({
  title,
  isOpen,
  onOk,
  onCancel,
  okText = 'Сохранить',
  cancelText = 'Отмена',
  error,
  busy = false,
  className,
  children,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="dialog" onClick={onCancel}>
      {/* stopPropagation: клик по самому окну не должен закрывать диалог */}
      <div className={classNames('dialog__paper', className)} onClick={(event) => event.stopPropagation()}>
        <div className="dialog__header">{title}</div>
        <div className="dialog__body">{children}</div>
        {error && <div className="dialog__error">{error}</div>}
        <div className="dialog__footer">
          <Button title={okText} onClick={onOk} disabled={busy} />
          <Button title={cancelText} appearance="secondary" onClick={onCancel} />
        </div>
      </div>
    </div>
  );
};
