import { FC, useState } from 'react';
import { UserIcon } from '../../assets/icons';
import { UserMenuProps } from './UserMenuProps';
import './userMenuStyles.scss';

export const UserMenu: FC<UserMenuProps> = ({ username, role, items }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const showMenuHandler = () => setIsOpen((previous) => !previous);
  const closeMenuHandler = () => setIsOpen(false);

  return (
    <>
      {/* Прозрачная подложка: клик в любом месте формы закрывает меню */}
      {isOpen && <div className="user-menu__overlay" onClick={closeMenuHandler} />}
      <div className="user-menu">
        <UserIcon size={36} className="user-menu__icon" onClick={showMenuHandler} />
        {isOpen && (
          <div className="user-menu__list">
            <div className="user-menu__info">
              <strong>{username}</strong>
              <span>{role}</span>
            </div>
            {items.map((item) => (
              <div
                key={item.id}
                className="user-menu__item"
                onClick={() => {
                  closeMenuHandler();
                  item.onClick();
                }}
              >
                {item.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
