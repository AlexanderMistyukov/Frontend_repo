import { UserRole } from '../types/models';

// Адрес бэкенда. Можно переопределить в файле .env (REACT_APP_API_URL=...)
export const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:5164';

export enum Pages {
  Login = '/login',
  Registration = '/registration',
  Main = '/main',
  Administration = '/administration',
  NoPermissions = '/no-permissions',
}

export const TOKEN_KEY = 'access_token';
export const USERNAME_KEY = 'username';
export const ROLE_KEY = 'role';

export const ROLE_TITLES: Record<UserRole, string> = {
  admin: 'Администратор',
  manager: 'Менеджер',
  user: 'Пользователь',
};

export const ALL_ROLES: UserRole[] = ['admin', 'manager', 'user'];

// Ограничения совпадают с ограничениями бэкенда (FilesController)
export const FILE_ACCEPT = '.pdf,.txt,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv';
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
