import { FC } from 'react';
import { TrashIcon } from '../../assets/icons';
import { formatDate, formatMoney } from '../../utils';
import { ExpensesListProps } from './ExpensesListProps';
import './expensesListStyles.scss';

export const ExpensesList: FC<ExpensesListProps> = ({ items, onDeleteClick }) => {
  if (items.length === 0) {
    return <div className="expenses-list__empty">Расходов пока нет</div>;
  }

  return (
    <div className="expenses-list">
      {items.map((item) => (
        <div key={item.id} className="expenses-list__item">
          <div className="expenses-list__main">
            <div className="expenses-list__title">{item.recipient}</div>
            <div className="expenses-list__sub">
              {item.expensePurpose} · {formatDate(item.expenseDate)}
            </div>
          </div>
          <div className="expenses-list__amount">− {formatMoney(item.amount)}</div>
          {onDeleteClick && (
            <TrashIcon size={20} className="expenses-list__icon" onClick={() => onDeleteClick(item.id)} />
          )}
        </div>
      ))}
    </div>
  );
};
