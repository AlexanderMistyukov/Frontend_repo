import { getAxiosInstance } from './axiosInstance';
import {
  LoginRequestDto,
  LoginResponseDto,
  RegistrationRequestDto,
  RegistrationResponseDto,
} from '../types/apiTypes';

export const AuthApi = () => {
  const api = getAxiosInstance();

  return {
    signIn: (data: LoginRequestDto) => api.axiosPost<LoginResponseDto>('/login', data),
    signUp: (data: RegistrationRequestDto) => api.axiosPost<RegistrationResponseDto>('/register', data),
  };
};
