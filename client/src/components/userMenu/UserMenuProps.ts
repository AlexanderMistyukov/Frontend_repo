export interface UserMenuItem {
  id: number;
  title: string;
  onClick: () => void;
}

export interface UserMenuProps {
  username: string;
  role: string;
  items: UserMenuItem[];
}
