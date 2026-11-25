import { FC, useState } from 'react';
import { Dialog } from '../dialog';
import { TextField } from '../textField';
import { dateInputToIso, getErrorMessage, parseAmount, toDateInputValue } from '../../utils';
import { IncomeDialogProps } from './DialogsProps';

interface FormErrors {
  source?: string;
  purpose?: string;
  amount?: string;
  date?: string;
}

const IncomeDialogForm: FC<IncomeDialogProps> = ({ isOpen, mode, onSave, onCancel }) => {
  const [source, setSource] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(toDateInputValue());
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);


  const saveHandler = async () => {
    const parsedAmount = parseAmount(amount);
    const newErrors: FormErrors = {};
    if (!source.trim()) {
      newErrors.source = 'Укажите источник поступления';
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
        source: source.trim(),
        purpose: purpose.trim(),
        amount: parsedAmount,
        incomeDate: dateInputToIso(date),
      });
    } catch (e) {
      setError(getErrorMessage(e));
      setBusy(false);
    }
  };

  return (
    <Dialog
      title={mode === 'edit' ? 'Изменить поступление' : 'Добавить поступление'}
      isOpen={isOpen}
      onOk={saveHandler}
      onCancel={onCancel}
      error={error}
      busy={busy}
    >
      <TextField
        label="Источник"
        name="income-source"
        value={source}
        onChange={(event) => setSource(event.target.value)}
        info={errors.source}
        infoType="error"
      />
      <TextField
        label="Назначение"
        name="income-purpose"
        value={purpose}
        onChange={(event) => setPurpose(event.target.value)}
        info={errors.purpose}
        infoType="error"
      />
      <TextField
        label="Сумма, ₽"
        name="income-amount"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        info={errors.amount}
        infoType="error"
      />
      <TextField
        label="Дата"
        name="income-date"
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
export const IncomeDialog: FC<IncomeDialogProps> = (props) => (props.isOpen ? <IncomeDialogForm {...props} /> : null);
