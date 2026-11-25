import { createAsyncThunk } from '@reduxjs/toolkit';
import { AuthApi } from '../api';
import { LoginRequestDto, LoginResponseDto, RegistrationRequestDto } from '../types/apiTypes';
import { UserRole } from '../types/models';
import { getErrorMessage, saveSession } from '../utils';

export const signIn = createAsyncThunk<LoginResponseDto, LoginRequestDto, { rejectValue: string }>(
  'user/signIn',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthApi().signIn(data);
      const result: LoginResponseDto = { ...response, role: response.role.toLowerCase() as UserRole };
      saveSession({ token: result.access_token, username: result.username, role: result.role });
      return result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// После регистрации сразу выполняем вход, чтобы получить токен
export const signUp = createAsyncThunk<LoginResponseDto, RegistrationRequestDto, { rejectValue: string }>(
  'user/signUp',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      await AuthApi().signUp(data);
      return await dispatch(signIn({ username: data.login, password: data.password })).unwrap();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
