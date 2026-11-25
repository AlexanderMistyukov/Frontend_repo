import { getAxiosInstance } from './axiosInstance';
import { SetUserRoleRequestDto, SetUserRoleResponseDto } from '../types/apiTypes';
import { UserInfo } from '../types/models';

export const AdministrationApi = () => {
  const api = getAxiosInstance();

  return {
    getUsers: () => api.axiosGet<UserInfo[]>('/administration/users'),
    setUserRole: (data: SetUserRoleRequestDto) =>
      api.axiosPut<SetUserRoleResponseDto>('/administration/userrole', data),
  };
};
