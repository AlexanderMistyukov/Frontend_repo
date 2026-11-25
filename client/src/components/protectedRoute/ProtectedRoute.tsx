import { FC } from 'react';
import { Navigate } from 'react-router-dom';
import { Pages } from '../../constants/commonConstants';
import { useAppSelector } from '../../hooks/reduxToolkitHooks';
import { ProtectedRouteProps } from './ProtectedRouteProps';

// Пропускает на страницу только авторизованных пользователей (и только с нужной ролью, если она указана)
export const ProtectedRoute: FC<ProtectedRouteProps> = ({ roles, children }) => {
  const { isAuthenticated, role } = useAppSelector((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to={Pages.Login} replace />;
  }

  if (roles && (!role || !roles.includes(role))) {
    return <Navigate to={Pages.NoPermissions} replace />;
  }

  return <>{children}</>;
};
