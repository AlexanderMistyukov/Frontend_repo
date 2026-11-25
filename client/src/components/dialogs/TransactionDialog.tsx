import { FC, useState } from 'react';
import { Dialog } from '../dialog';
import { DropDown } from '../dropDown';
import { TextField } from '../textField';
import { dateInputToIso, getErrorMessage, parseAmount, toDateInputValue } from '../../utils';
import { TransactionDialogProps } from './DialogsProps';

interface FormErrors {
  title?: string;
  amount?: string;
  counterparty?: string;
  date?: string;
}

const TransactionDialogForm: FC<TransactionDialogProps> = ({
  isOpen,
  mode,
  categories,
  defaultCategoryId,
  initial,
  onSave,
  onCancel,
}) => {
  const [categoryId, setCategoryId] = useState<string>(
    String(initial?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? '')
  );
  const [title, setTitle] = useState<string>(initial?.title ?? '');
  const [amount, setAmount] = useState<string>(initial ? String(initial.amount) : '');
  const [date, setDate] = useState<string>(toDateInputValue(initial?.transactionDate));
  const [counterparty, setCounterparty] = useState<string>(initial?.counterparty ?? '');
  const [notes, setNotes] = useState<string>(initial?.notes ?? '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);


  const saveHandler = async () => {
    const parsedAmount = parseAmount(amount);
    const newErrors: FormErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Введите название';
    }
    if (parsedAmount === null) {
      newErrors.amount = 'Введите сумму больше нуля';
    }
    if (!counterparty.trim()) {
      newErrors.counterparty = 'Укажите контрагента';
    }
    if (!date) {
      newErrors.date = 'Укажите дату';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0 || parsedAmount === null || !categoryId) {
      return;
    }

    setBusy(true);
    try {
      await onSave({
        categoryId: Number(categoryId),
        title: title.trim(),
        amount: parsedAmount,
        transactionDate: dateInputToIso(date),
        counterparty: counterparty.trim(),
        notes: notes.trim(),
      });
    } catch (e) {
      setError(getErrorMessage(e));
      setBusy(false);
    }
  };

  return (
    <Dialog
      title={mode === 'edit' ? 'Изменить транзакцию' : 'Добавить транзакцию'}
      isOpen={isOpen}
      onOk={saveHandler}
      onCancel={onCancel}
      error={error}
      busy={busy}
    >
      <DropDown
        label="Категория"
        value={categoryId}
        items={categories.map((category) => ({ value: category.id, label: category.name }))}
        onChange={setCategoryId}
      />
      <TextField
        label="Название"
        name="transaction-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        info={errors.title}
        infoType="error"
      />
      <TextField
        label="Сумма, ₽"
        name="transaction-amount"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        info={errors.amount}
        infoType="error"
      />
      <TextField
        label="Дата"
        name="transaction-date"
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        info={errors.date}
        infoType="error"
      />
      <TextField
        label="Контрагент"
        name="transaction-counterparty"
        value={counterparty}
        onChange={(event) => setCounterparty(event.target.value)}
        info={errors.counterparty}
        infoType="error"
      />
      <TextField
        label="Примечание"
        name="transaction-notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        multiline
      />
    </Dialog>
  );
};

// Форма создаётся заново при каждом открытии окна, поэтому начальные значения берутся один раз
// и не сбрасываются, когда store обновляется во время сохранения
export const TransactionDialog: FC<TransactionDialogProps> = (props) => (props.isOpen ? <TransactionDialogForm {...props} /> : null);
