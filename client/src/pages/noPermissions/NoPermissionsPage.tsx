import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components';
import { Pages } from '../../constants/commonConstants';
import { WidgetLayout } from '../../layouts';
import './noPermissionsPageStyles.scss';

export const NoPermissionsPage: FC = () => {
  const navigate = useNavigate();

  return (
    <WidgetLayout>
      <div className="no-permissions-page">
        <div className="no-permissions-page__code">403</div>
        <div className="no-permissions-page__title">Недостаточно прав</div>
        <div className="no-permissions-page__text">
          У вашей учётной записи нет доступа к этой странице. Обратитесь к администратору.
        </div>
        <Button title="На главную" onClick={() => navigate(Pages.Main)} />
      </div>
    </WidgetLayout>
  );
};
