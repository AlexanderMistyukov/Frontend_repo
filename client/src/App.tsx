import { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components';
import { Pages } from './constants/commonConstants';
import { AdministrationPage, LoginPage, MainPage, NoPermissionsPage, RegistrationPage } from './pages';
import './styles/globalStyles.scss';

export const App: FC = () => {
  return (
    <Routes>
      <Route path={Pages.Login} element={<LoginPage />} />
      <Route path={Pages.Registration} element={<RegistrationPage />} />
      <Route
        path={Pages.Main}
        element={
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={Pages.Administration}
        element={
          <ProtectedRoute roles={['admin']}>
            <AdministrationPage />
          </ProtectedRoute>
        }
      />
      <Route path={Pages.NoPermissions} element={<NoPermissionsPage />} />
      {/* Несуществующий адрес: возвращаем на страницу входа */}
      <Route path="*" element={<Navigate to={Pages.Login} replace />} />
    </Routes>
  );
};
