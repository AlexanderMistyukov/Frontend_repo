import { FC, useState } from 'react';
import { Dialog } from '../dialog';
import { TextField } from '../textField';
import { dateInputToIso, getErrorMessage, parseAmount, toDateInputValue } from '../../utils';
import { ExpenseDialogProps } from './DialogsProps';

interface FormErrors {
  recipient?: string;
  purpose?: string;
  amount?: string;
  date?: string;
}

const ExpenseDialogForm: FC<ExpenseDialogProps> = ({ isOpen, mode, onSave, onCancel }) => {
  const [recipient, setRecipient] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(toDateInputValue());
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);


  const saveHandler = async () => {
    const parsedAmount = parseAmount(amount);
    const newErrors: FormErrors = {};
    if (!recipient.trim()) {
      newErrors.recipient = 'Укажите получателя';
    }
    if (!purpose.trim()) {
      newErrors.purpose = 'Укажите назначение';
    }
    if (parsedAmount === null) {
      newErrors.amount = 'Введите сумму больше нуля';
    }
    if (!date) {
      newErrors.date = 'Укажите дату';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0 || parsedAmount === null) {
      return;
    }

    setBusy(true);
    try {
      await onSave({
        recipient: recipient.trim(),
        expensePurpose: purpose.trim(),
        amount: parsedAmount,
        expenseDate: dateInputToIso(date),
      });
    } catch (e) {
      setError(getErrorMessage(e));
      setBusy(false);
    }
  };

  return (
    <Dialog
      title={mode === 'edit' ? 'Изменить расход' : 'Добавить расход'}
      isOpen={isOpen}
      onOk={saveHandler}
      onCancel={onCancel}
      error={error}
      busy={busy}
    >
      <TextField
        label="Получатель"
        name="expense-recipient"
        value={recipient}
        onChange={(event) => setRecipient(event.target.value)}
        info={errors.recipient}
        infoType="error"
      />
      <TextField
        label="Назначение"
        name="expense-purpose"
        value={purpose}
        onChange={(event) => setPurpose(event.target.value)}
        info={errors.purpose}
        infoType="error"
      />
      <TextField
        label="Сумма, ₽"
        name="expense-amount"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        info={errors.amount}
        infoType="error"
      />
      <TextField
        label="Дата"
        name="expense-date"
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        info={errors.date}
        infoType="error"
      />
    </Dialog>
  );
};

// Форма создаётся заново при каждом открытии окна, поэтому начальные значения берутся один раз
// и не сбрасываются, когда store обновляется во время сохранения
export const ExpenseDialog: FC<ExpenseDialogProps> = (props) => (props.isOpen ? <ExpenseDialogForm {...props} /> : null);
