import { FC } from 'react';
import { DropDown } from '../dropDown';
import { ALL_ROLES, ROLE_TITLES } from '../../constants/commonConstants';
import { UserRole } from '../../types/models';
import { UsersListProps } from './UsersListProps';
import './usersListStyles.scss';

const roleItems = ALL_ROLES.map((role) => ({ value: role, label: ROLE_TITLES[role] }));

export const UsersList: FC<UsersListProps> = ({ users, currentUsername, onRoleChange }) => {
  return (
    <div className="users-list">
      <div className="users-list__row users-list__row_head">
        <div className="users-list__id">№</div>
        <div className="users-list__login">Логин</div>
        <div className="users-list__role">Роль</div>
      </div>
      {users.map((user) => {
        const isCurrent = user.login === currentUsername;
        return (
          <div key={user.id} className="users-list__row">
            <div className="users-list__id">{user.id}</div>
            <div className="users-list__login">
              {user.login}
              {isCurrent && <span className="users-list__you"> (это вы)</span>}
            </div>
            <div className="users-list__role">
              <DropDown
                label=""
                value={user.role}
                items={roleItems}
                disabled={isCurrent}
                onChange={(value) => onRoleChange(user.id, value as UserRole)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
