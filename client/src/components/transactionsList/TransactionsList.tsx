import { FC } from 'react';
import classNames from 'classnames';
import { formatDate, formatMoney } from '../../utils';
import { TransactionsListProps } from './TransactionsListProps';
import './transactionsListStyles.scss';

export const TransactionsList: FC<TransactionsListProps> = ({ items, selectedId, onItemClick }) => {
  if (items.length === 0) {
    return <div className="transactions-list__empty">В этой категории пока нет транзакций</div>;
  }

  return (
    <div className="transactions-list">
      {items.map((item) => (
        <div
          key={item.id}
          className={classNames('transactions-list__item', {
            'transactions-list__item_selected': item.id === selectedId,
          })}
          onClick={() => onItemClick(item.id)}
        >
          <div className="transactions-list__main">
            <div className="transactions-list__title">{item.title}</div>
            <div className="transactions-list__sub">
              {item.counterparty} · {formatDate(item.transactionDate)}
            </div>
          </div>
          <div className="transactions-list__amount">{formatMoney(item.amount)}</div>
        </div>
      ))}
    </div>
  );
};
