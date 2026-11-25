import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, UsersList } from '../../components';
import { Pages } from '../../constants/commonConstants';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxToolkitHooks';
import { Layout } from '../../layouts';
import { fetchUsers, setUserRole } from '../../services';
import { clearAdministrationError } from '../../store/slices/administrationSlices';
import { UserRole } from '../../types/models';
import './administrationPageStyles.scss';

export const AdministrationPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.administration);
  const username = useAppSelector((state) => state.user.username);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const roleChangeHandler = (userId: number, role: UserRole) => {
    dispatch(setUserRole({ userId, role }));
  };

  return (
    <Layout>
      <div className="administration-page">
        <div className="administration-page__header">
          <h2>Администрирование пользователей</h2>
          <Button title="Назад" appearance="secondary" onClick={() => navigate(Pages.Main)} />
        </div>
        <div className="administration-page__note">
          Роль вступает в силу после следующего входа пользователя в систему.
        </div>
        {error && (
          <div className="administration-page__error" onClick={() => dispatch(clearAdministrationError())}>
            {error} (нажмите, чтобы скрыть)
          </div>
        )}
        <div className="administration-page__content">
          {loading && users.length === 0 ? (
            <div className="administration-page__loading">Загрузка…</div>
          ) : (
            <UsersList users={users} currentUsername={username} onRoleChange={roleChangeHandler} />
          )}
        </div>
      </div>
    </Layout>
  );
};
