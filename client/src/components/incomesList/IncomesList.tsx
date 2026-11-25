import { FC } from 'react';
import { TrashIcon } from '../../assets/icons';
import { formatDate, formatMoney } from '../../utils';
import { IncomesListProps } from './IncomesListProps';
import './incomesListStyles.scss';

export const IncomesList: FC<IncomesListProps> = ({ items, onDeleteClick }) => {
  if (items.length === 0) {
    return <div className="incomes-list__empty">Поступлений пока нет</div>;
  }

  return (
    <div className="incomes-list">
      {items.map((item) => (
        <div key={item.id} className="incomes-list__item">
          <div className="incomes-list__main">
            <div className="incomes-list__title">{item.source}</div>
            <div className="incomes-list__sub">
              {item.purpose} · {formatDate(item.incomeDate)}
            </div>
          </div>
          <div className="incomes-list__amount">+ {formatMoney(item.amount)}</div>
          {onDeleteClick && (
            <TrashIcon size={20} className="incomes-list__icon" onClick={() => onDeleteClick(item.id)} />
          )}
        </div>
      ))}
    </div>
  );
};
