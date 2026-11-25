import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import { PencilIcon, PlusIcon, TrashIcon, UploadIcon } from '../../assets/icons';
import {
  Button,
  CategoryDialog,
  DropDown,
  ExpenseDialog,
  ExpensesList,
  FilesList,
  IncomeDialog,
  IncomesList,
  StatisticsBar,
  TransactionDialog,
  TransactionsList,
} from '../../components';
import {
  CategoryFormData,
  ExpenseFormData,
  IncomeFormData,
  TransactionFormData,
} from '../../components/dialogs/DialogsProps';
import { FILE_ACCEPT, MAX_FILE_SIZE } from '../../constants/commonConstants';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxToolkitHooks';
import { Layout } from '../../layouts';
import {
  addCategory,
  addExpense,
  addIncome,
  addTransaction,
  deleteCategory,
  deleteExpense,
  deleteFile,
  deleteIncome,
  deleteTransaction,
  downloadFile,
  fetchCategories,
  fetchStatistics,
  updateCategory,
  updateTransaction,
  uploadFile,
} from '../../services';
import { clearCharityError } from '../../store/slices/charitySlices';
import { DialogMode } from '../../types/commonTypes';
import { TransactionFile } from '../../types/models';
import { fileToBase64, formatDate, formatMoney, getErrorMessage } from '../../utils';
import './mainPageStyles.scss';

interface DialogState {
  isOpen: boolean;
  mode: DialogMode;
}

const closedDialog: DialogState = { isOpen: false, mode: 'create' };

export const MainPage: FC = () => {
  const dispatch = useAppDispatch();
  const { categories, statistics, loading, error } = useAppSelector((state) => state.charity);
  const role = useAppSelector((state) => state.user.role);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string>('');

  const [categoryDialog, setCategoryDialog] = useState<DialogState>(closedDialog);
  const [transactionDialog, setTransactionDialog] = useState<DialogState>(closedDialog);
  const [incomeDialogOpen, setIncomeDialogOpen] = useState<boolean>(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = role === 'admin';
  const canWrite = role === 'admin' || role === 'manager';

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchStatistics());
  }, [dispatch]);

  // Выбранная категория; пока пользователь ничего не выбрал, показываем первую
  const category = categories.find((item) => item.id === selectedCategoryId) ?? categories[0] ?? null;
  const transaction = category?.transactions.find((item) => item.id === selectedTransactionId) ?? null;

  // Выполняет действие и показывает ошибку, если сервер её вернул
  const runAction = async (action: () => Promise<unknown>) => {
    setActionError('');
    try {
      await action();
    } catch (e) {
      setActionError(getErrorMessage(e));
    }
  };

  const dismissError = () => {
    setActionError('');
    dispatch(clearCharityError());
  };

  // ---------- Категории ----------
  const categoryChangeHandler = (value: string) => {
    setSelectedCategoryId(Number(value));
    setSelectedTransactionId(null);
  };

  const saveCategoryHandler = async (data: CategoryFormData) => {
    if (categoryDialog.mode === 'edit' && category) {
      await dispatch(updateCategory({ id: category.id, ...data })).unwrap();
    } else {
      await dispatch(addCategory(data)).unwrap();
    }
    setCategoryDialog(closedDialog);
  };

  const deleteCategoryHandler = () => {
    if (!category || !window.confirm(`Удалить категорию «${category.name}»?`)) {
      return;
    }
    runAction(async () => {
      await dispatch(deleteCategory(category.id)).unwrap();
      setSelectedCategoryId(null);
      setSelectedTransactionId(null);
    });
  };

  // ---------- Транзакции ----------
  const saveTransactionHandler = async (data: TransactionFormData) => {
    if (transactionDialog.mode === 'edit' && transaction) {
      await dispatch(updateTransaction({ id: transaction.id, data })).unwrap();
      setSelectedCategoryId(data.categoryId);
    } else {
      const newId = await dispatch(addTransaction(data)).unwrap();
      setSelectedCategoryId(data.categoryId);
      setSelectedTransactionId(newId);
    }
    setTransactionDialog(closedDialog);
  };

  const deleteTransactionHandler = () => {
    if (
      !transaction ||
      !window.confirm(`Удалить транзакцию «${transaction.title}» вместе с поступлениями, расходами и файлами?`)
    ) {
      return;
    }
    runAction(async () => {
      await dispatch(deleteTransaction(transaction.id)).unwrap();
      setSelectedTransactionId(null);
    });
  };

  // ---------- Поступления и расходы ----------
  const saveIncomeHandler = async (data: IncomeFormData) => {
    if (!transaction) {
      return;
    }
    await dispatch(addIncome({ transactionId: transaction.id, ...data })).unwrap();
    setIncomeDialogOpen(false);
  };

  const deleteIncomeHandler = (id: number) => {
    if (window.confirm('Удалить поступление?')) {
      runAction(() => dispatch(deleteIncome(id)).unwrap());
    }
  };

  const saveExpenseHandler = async (data: ExpenseFormData) => {
    if (!transaction) {
      return;
    }
    await dispatch(addExpense({ transactionId: transaction.id, ...data })).unwrap();
    setExpenseDialogOpen(false);
  };

  const deleteExpenseHandler = (id: number) => {
    if (window.confirm('Удалить расход?')) {
      runAction(() => dispatch(deleteExpense(id)).unwrap());
    }
  };

  // ---------- Файлы ----------
  // Иконка загрузки открывает выбор файла через скрытый <input type="file">
  const uploadClickHandler = () => {
    fileInputRef.current?.click();
  };

  const fileSelectHandler = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // чтобы можно было выбрать тот же файл ещё раз
    if (!file || !transaction) {
      return;
    }

    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!FILE_ACCEPT.split(',').includes(extension)) {
      setActionError(`Недопустимый тип файла. Разрешены: ${FILE_ACCEPT.split(',').join(', ')}`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setActionError('Файл слишком большой. Максимальный размер — 10 МБ.');
      return;
    }

    runAction(async () => {
      const fileContentBase64 = await fileToBase64(file);
      await dispatch(
        uploadFile({ fileName: file.name, fileContentBase64, transactionId: transaction.id })
      ).unwrap();
    });
  };

  const downloadFileHandler = (file: TransactionFile) => {
    runAction(() =>
      dispatch(downloadFile({ systemName: file.systemName, displayName: file.displayName })).unwrap()
    );
  };

  const deleteFileHandler = (file: TransactionFile) => {
    if (window.confirm(`Удалить файл «${file.displayName}»?`)) {
      runAction(() => dispatch(deleteFile(file.id)).unwrap());
    }
  };

  // ---------- Отображение ----------
  const renderLeftPanel = () => {
    if (categories.length === 0) {
      return (
        <div className="main-page__empty">
          {loading ? 'Загрузка…' : 'Категорий пока нет.'}
          {!loading && isAdmin && (
            <Button
              title="Добавить категорию"
              className="main-page__add"
              onClick={() => setCategoryDialog({ isOpen: true, mode: 'create' })}
            />
          )}
        </div>
      );
    }

    return (
      <>
        <div className="main-page__category">
          <DropDown
            label="Категория"
            lblWeight="strong"
            value={category?.id ?? ''}
            items={categories.map((item) => ({ value: item.id, label: item.name }))}
            onChange={categoryChangeHandler}
          />
          {isAdmin && (
            <div className="main-page__category-actions">
              <span title="Изменить категорию">
                <PencilIcon size={22} onClick={() => setCategoryDialog({ isOpen: true, mode: 'edit' })} />
              </span>
              <span title="Удалить категорию">
                <TrashIcon size={22} onClick={deleteCategoryHandler} />
              </span>
              <span title="Добавить категорию">
                <PlusIcon size={22} onClick={() => setCategoryDialog({ isOpen: true, mode: 'create' })} />
              </span>
            </div>
          )}
        </div>
        {category?.description && <div className="main-page__description">{category.description}</div>}
        {canWrite && (
          <Button
            title="Добавить транзакцию"
            className="main-page__add"
            onClick={() => setTransactionDialog({ isOpen: true, mode: 'create' })}
          />
        )}
        <div className="main-page__list">
          <TransactionsList
            items={category?.transactions ?? []}
            selectedId={transaction?.id ?? null}
            onItemClick={setSelectedTransactionId}
          />
        </div>
      </>
    );
  };

  const renderTransactionCard = () => {
    if (!transaction) {
      return <div className="main-page__placeholder">Выберите транзакцию в списке слева</div>;
    }

    return (
      <div className="transaction-card">
        <div className="transaction-card__header">
          <div className="transaction-card__info">
            <h2 className="transaction-card__title">{transaction.title}</h2>
            <div className="transaction-card__meta">
              {transaction.counterparty} · {formatDate(transaction.transactionDate)}
            </div>
            {transaction.notes && <div className="transaction-card__notes">{transaction.notes}</div>}
          </div>
          <div className="transaction-card__actions">
            {canWrite && (
              <span title="Загрузить файл">
                <UploadIcon size={24} onClick={uploadClickHandler} />
              </span>
            )}
            {isAdmin && (
              <span title="Изменить транзакцию">
                <PencilIcon size={24} onClick={() => setTransactionDialog({ isOpen: true, mode: 'edit' })} />
              </span>
            )}
            {isAdmin && (
              <span title="Удалить транзакцию">
                <TrashIcon size={24} onClick={deleteTransactionHandler} />
              </span>
            )}
          </div>
        </div>

        <div className="transaction-card__summary">
          <div className="transaction-card__tile">
            <div className="transaction-card__tile-title">Сумма операции</div>
            <div className="transaction-card__tile-value">{formatMoney(transaction.amount)}</div>
          </div>
          <div className="transaction-card__tile">
            <div className="transaction-card__tile-title">Поступило</div>
            <div className="transaction-card__tile-value transaction-card__tile-value_income">
              {formatMoney(transaction.totalIncome)}
            </div>
          </div>
          <div className="transaction-card__tile">
            <div className="transaction-card__tile-title">Потрачено</div>
            <div className="transaction-card__tile-value transaction-card__tile-value_expense">
              {formatMoney(transaction.totalExpense)}
            </div>
          </div>
          <div className="transaction-card__tile">
            <div className="transaction-card__tile-title">Остаток</div>
            <div
              className={
                transaction.balance < 0
                  ? 'transaction-card__tile-value transaction-card__tile-value_expense'
                  : 'transaction-card__tile-value'
              }
            >
              {formatMoney(transaction.balance)}
            </div>
          </div>
        </div>

        <div className="transaction-card__sections">
          <div className="transaction-card__section">
            <div className="transaction-card__section-header">
              <span>Файлы</span>
            </div>
            <FilesList
              items={transaction.files}
              onDownloadClick={downloadFileHandler}
              onDeleteClick={isAdmin ? deleteFileHandler : undefined}
            />
          </div>
          <div className="transaction-card__section">
            <div className="transaction-card__section-header">
              <span>Поступления</span>
              {canWrite && (
                <span title="Добавить поступление">
                  <PlusIcon size={22} onClick={() => setIncomeDialogOpen(true)} />
                </span>
              )}
            </div>
            <IncomesList
              items={transaction.incomes}
              onDeleteClick={isAdmin ? deleteIncomeHandler : undefined}
            />
          </div>
          <div className="transaction-card__section">
            <div className="transaction-card__section-header">
              <span>Расходы</span>
              {canWrite && (
                <span title="Добавить расход">
                  <PlusIcon size={22} onClick={() => setExpenseDialogOpen(true)} />
                </span>
              )}
            </div>
            <ExpensesList
              items={transaction.expenses}
              onDeleteClick={isAdmin ? deleteExpenseHandler : undefined}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="main-page">
        <StatisticsBar statistics={statistics} />

        {(actionError || error) && (
          <div className="main-page__error" onClick={dismissError}>
            {actionError || error} <span>(нажмите, чтобы скрыть)</span>
          </div>
        )}

        <div className="main-page__content">
          <div className="main-page__left">{renderLeftPanel()}</div>
          <div className="main-page__right">{renderTransactionCard()}</div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept={FILE_ACCEPT}
        onChange={fileSelectHandler}
      />

      <CategoryDialog
        isOpen={categoryDialog.isOpen}
        mode={categoryDialog.mode}
        initial={categoryDialog.mode === 'edit' ? category : null}
        onSave={saveCategoryHandler}
        onCancel={() => setCategoryDialog(closedDialog)}
      />
      <TransactionDialog
        isOpen={transactionDialog.isOpen}
        mode={transactionDialog.mode}
        categories={categories}
        defaultCategoryId={category?.id ?? null}
        initial={transactionDialog.mode === 'edit' ? transaction : null}
        onSave={saveTransactionHandler}
        onCancel={() => setTransactionDialog(closedDialog)}
      />
      <IncomeDialog
        isOpen={incomeDialogOpen}
        mode="create"
        onSave={saveIncomeHandler}
        onCancel={() => setIncomeDialogOpen(false)}
      />
      <ExpenseDialog
        isOpen={expenseDialogOpen}
        mode="create"
        onSave={saveExpenseHandler}
        onCancel={() => setExpenseDialogOpen(false)}
      />
    </Layout>
  );
};
