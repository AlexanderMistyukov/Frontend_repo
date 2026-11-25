import { ChangeEvent, FC, FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoIcon } from '../../assets/icons';
import { Button, TextField } from '../../components';
import { Pages } from '../../constants/commonConstants';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxToolkitHooks';
import { signUp } from '../../services';
import { clearError } from '../../store/slices/userSlices';
import { WidgetLayout } from '../../layouts';
import './registrationPageStyles.scss';

interface RegistrationForm {
  login: string;
  password: string;
  passwordRepeat: string;
}

const emptyForm: RegistrationForm = { login: '', password: '', passwordRepeat: '' };

export const RegistrationPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.user);

  const [form, setForm] = useState<RegistrationForm>(emptyForm);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(Pages.Main, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Один обработчик на все поля: имя поля совпадает с ключом в состоянии формы
  const changeHandler = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const registrationHandler = (event?: FormEvent) => {
    event?.preventDefault();
    if (form.login.trim().length < 3) {
      setValidationError('Логин должен содержать не менее 3 символов');
      return;
    }
    if (form.password.length < 4) {
      setValidationError('Пароль должен содержать не менее 4 символов');
      return;
    }
    if (form.password !== form.passwordRepeat) {
      setValidationError('Пароли не совпадают');
      return;
    }
    setValidationError('');
    dispatch(signUp({ login: form.login.trim(), password: form.password }));
  };

  const backHandler = () => {
    navigate(Pages.Login);
  };

  return (
    <WidgetLayout>
      <form className="registration-page" onSubmit={registrationHandler}>
        <div className="registration-page__header">
          <LogoIcon size={40} color="#1f7a5c" />
          <div className="registration-page__title">Регистрация</div>
        </div>
        <div className="registration-page__fields">
          <TextField label="Логин" name="login" value={form.login} onChange={changeHandler} />
          <TextField
            label="Пароль"
            name="password"
            type="password"
            value={form.password}
            onChange={changeHandler}
          />
          <TextField
            label="Повторите пароль"
            name="passwordRepeat"
            type="password"
            value={form.passwordRepeat}
            onChange={changeHandler}
          />
        </div>
        {(validationError || error) && (
          <div className="registration-page__error">{validationError || error}</div>
        )}
        <div className="registration-page__actions">
          <Button title="Зарегистрироваться" submit disabled={loading} />
          <Button title="Назад ко входу" appearance="secondary" onClick={backHandler} />
        </div>
      </form>
    </WidgetLayout>
  );
};
