import { UserInfo, UserRole } from '../../types/models';

export interface UsersListProps {
  users: UserInfo[];
  currentUsername: string | null;
  onRoleChange: (userId: number, role: UserRole) => void;
}
