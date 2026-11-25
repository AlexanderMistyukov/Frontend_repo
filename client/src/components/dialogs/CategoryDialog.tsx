import { FC, useState } from 'react';
import { Dialog } from '../dialog';
import { TextField } from '../textField';
import { getErrorMessage } from '../../utils';
import { CategoryDialogProps } from './DialogsProps';

const CategoryDialogForm: FC<CategoryDialogProps> = ({ isOpen, mode, initial, onSave, onCancel }) => {
  const [name, setName] = useState<string>(initial?.name ?? '');
  const [description, setDescription] = useState<string>(initial?.description ?? '');
  const [nameError, setNameError] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);


  const saveHandler = async () => {
    if (!name.trim()) {
      setNameError('Введите название категории');
      return;
    }
    setNameError('');
    setBusy(true);
    try {
      await onSave({ name: name.trim(), description: description.trim() });
    } catch (e) {
      setError(getErrorMessage(e));
      setBusy(false);
    }
  };

  return (
    <Dialog
      title={mode === 'edit' ? 'Изменить категорию' : 'Добавить категорию'}
      isOpen={isOpen}
      onOk={saveHandler}
      onCancel={onCancel}
      error={error}
      busy={busy}
    >
      <TextField
        label="Название"
        name="category-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        info={nameError}
        infoType="error"
      />
      <TextField
        label="Описание"
        name="category-description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        multiline
      />
    </Dialog>
  );
};

// Форма создаётся заново при каждом открытии окна, поэтому начальные значения берутся один раз
// и не сбрасываются, когда store обновляется во время сохранения
export const CategoryDialog: FC<CategoryDialogProps> = (props) => (props.isOpen ? <CategoryDialogForm {...props} /> : null);
