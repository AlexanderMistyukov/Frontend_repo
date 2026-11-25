import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoIcon } from '../../assets/icons';
import { UserMenu } from '../../components';
import { ROLE_TITLES, Pages } from '../../constants/commonConstants';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxToolkitHooks';
import { logout } from '../../store/slices/userSlices';
import { clearSession } from '../../utils';
import { LayoutProps } from './LayoutProps';
import './layoutStyles.scss';

export const Layout: FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { username, role } = useAppSelector((state) => state.user);

  const logoutHandler = () => {
    clearSession();
    dispatch(logout());
    navigate(Pages.Login);
  };

  const menuItems = [
    ...(role === 'admin'
      ? [{ id: 1, title: 'Администрирование', onClick: () => navigate(Pages.Administration) }]
      : []),
    { id: 2, title: 'Главная', onClick: () => navigate(Pages.Main) },
    { id: 3, title: 'Выход', onClick: logoutHandler },
  ];

  return (
    <div className="layout">
      <div className="layout__header">
        <div className="layout__logo" onClick={() => navigate(Pages.Main)}>
          <LogoIcon size={32} />
        </div>
        <div className="layout__title">Мониторинг благотворительных средств</div>
        <UserMenu
          username={username ?? ''}
          role={role ? ROLE_TITLES[role] : ''}
          items={menuItems}
        />
      </div>
      <div className="layout__body">{children}</div>
    </div>
  );
};
