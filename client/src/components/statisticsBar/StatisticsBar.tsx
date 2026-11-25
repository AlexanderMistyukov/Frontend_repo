import { FC, useState } from 'react';
import { formatMoney } from '../../utils';
import { StatisticsBarProps } from './StatisticsBarProps';
import './statisticsBarStyles.scss';

export const StatisticsBar: FC<StatisticsBarProps> = ({ statistics }) => {
  const [showCategories, setShowCategories] = useState<boolean>(false);

  const items = [
    { id: 1, title: 'Общий остаток', value: formatMoney(statistics?.totalBalance ?? 0), modifier: '' },
    { id: 2, title: 'Всего поступило', value: formatMoney(statistics?.totalIncome ?? 0), modifier: 'income' },
    { id: 3, title: 'Всего потрачено', value: formatMoney(statistics?.totalExpense ?? 0), modifier: 'expense' },
    { id: 4, title: 'Транзакций', value: String(statistics?.transactionsCount ?? 0), modifier: '' },
  ];

  const categoriesStats = statistics?.categoriesStats ?? [];

  return (
    <div className="statistics">
      <div className="statistics-bar">
        {items.map((item) => (
          <div key={item.id} className="statistics-bar__item">
            <div className="statistics-bar__title">{item.title}</div>
            <div className={`statistics-bar__value statistics-bar__value_${item.modifier || 'default'}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {categoriesStats.length > 0 && (
        <>
          <div className="statistics__toggle" onClick={() => setShowCategories((previous) => !previous)}>
            {showCategories ? 'Скрыть сводку по категориям' : 'Показать сводку по категориям'}
          </div>
          {showCategories && (
            <div className="statistics-table">
              <div className="statistics-table__row statistics-table__row_head">
                <div className="statistics-table__name">Категория</div>
                <div className="statistics-table__cell">Транзакций</div>
                <div className="statistics-table__cell">Поступило</div>
                <div className="statistics-table__cell">Потрачено</div>
                <div className="statistics-table__cell">Остаток</div>
              </div>
              {categoriesStats.map((item, index) => (
                <div key={`${item.categoryName}-${index}`} className="statistics-table__row">
                  <div className="statistics-table__name">{item.categoryName}</div>
                  <div className="statistics-table__cell">{item.transactionsCount}</div>
                  <div className="statistics-table__cell statistics-table__cell_income">
                    {formatMoney(item.incomesSum)}
                  </div>
                  <div className="statistics-table__cell statistics-table__cell_expense">
                    {formatMoney(item.expensesSum)}
                  </div>
                  <div
                    className={
                      item.balance < 0
                        ? 'statistics-table__cell statistics-table__cell_expense'
                        : 'statistics-table__cell'
                    }
                  >
                    {formatMoney(item.balance)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
