import { ChangeEvent, FC, FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoIcon } from '../../assets/icons';
import { Button, TextField } from '../../components';
import { Pages } from '../../constants/commonConstants';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxToolkitHooks';
import { signIn } from '../../services';
import { clearError } from '../../store/slices/userSlices';
import { WidgetLayout } from '../../layouts';
import './loginPageStyles.scss';

export const LoginPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.user);

  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  // Если пользователь уже вошёл (или только что вошёл), открываем главную страницу
  useEffect(() => {
    if (isAuthenticated) {
      navigate(Pages.Main, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Ошибка прошлой попытки (например, со страницы регистрации) не должна показываться при открытии формы
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const loginChangeHandler = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLogin(event.target.value);
  };

  const passwordChangeHandler = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPassword(event.target.value);
  };

  const loginHandler = (event?: FormEvent) => {
    event?.preventDefault();
    if (!login.trim() || !password) {
      setValidationError('Введите логин и пароль');
      return;
    }
    setValidationError('');
    dispatch(signIn({ username: login.trim(), password }));
  };

  const registrationHandler = () => {
    navigate(Pages.Registration);
  };

  return (
    <WidgetLayout>
      <form className="login-page" onSubmit={loginHandler}>
        <div className="login-page__header">
          <LogoIcon size={40} color="#1f7a5c" />
          <div className="login-page__title">Мониторинг благотворительных средств</div>
          <div className="login-page__subtitle">Вход в систему</div>
        </div>
        <div className="login-page__fields">
          <TextField label="Логин" name="login" value={login} onChange={loginChangeHandler} />
          <TextField
            label="Пароль"
            name="password"
            type="password"
            value={password}
            onChange={passwordChangeHandler}
          />
        </div>
        {(validationError || error) && <div className="login-page__error">{validationError || error}</div>}
        <div className="login-page__actions">
          <Button title="Войти" submit disabled={loading} />
          <Button title="Зарегистрироваться" appearance="secondary" onClick={registrationHandler} />
        </div>
      </form>
    </WidgetLayout>
  );
};
