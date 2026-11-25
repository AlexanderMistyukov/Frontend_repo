import { ROLE_KEY, TOKEN_KEY, USERNAME_KEY } from '../constants/commonConstants';
import { UserRole } from '../types/models';

export interface Session {
  token: string;
  username: string;
  role: UserRole;
}

// localStorage может быть недоступен (приватный режим и т.п.), поэтому всё в try/catch
export const saveSession = (session: Session): void => {
  try {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USERNAME_KEY, session.username);
    localStorage.setItem(ROLE_KEY, session.role);
  } catch {
    // ничего не делаем: пользователь просто войдёт заново после перезагрузки
  }
};

export const loadSession = (): Session | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const username = localStorage.getItem(USERNAME_KEY);
    const role = localStorage.getItem(ROLE_KEY) as UserRole | null;
    if (token && username && role) {
      return { token, username, role };
    }
  } catch {
    // см. выше
  }
  return null;
};

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const clearSession = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(ROLE_KEY);
  } catch {
    // см. выше
  }
};
