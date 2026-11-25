import { ReactNode } from 'react';
import { UserRole } from '../../types/models';

export interface ProtectedRouteProps {
  roles?: UserRole[];
  children: ReactNode;
}
