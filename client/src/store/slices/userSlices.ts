import { createSlice } from '@reduxjs/toolkit';
import { signIn, signUp } from '../../services/userService';
import { LoginResponseDto } from '../../types/apiTypes';
import { UserRole } from '../../types/models';
import { loadSession } from '../../utils/session';

export interface UserState {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
}

// Если пользователь уже входил, восстанавливаем сессию из localStorage
const session = loadSession();

const initialState: UserState = {
  isAuthenticated: session !== null,
  token: session?.token ?? null,
  username: session?.username ?? null,
  role: session?.role ?? null,
  loading: false,
  error: null,
};

const applyLogin = (state: UserState, payload: LoginResponseDto) => {
  state.isAuthenticated = true;
  state.token = payload.access_token;
  state.username = payload.username;
  state.role = payload.role;
  state.loading = false;
  state.error = null;
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.username = null;
      state.role = null;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        applyLogin(state, action.payload);
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Не удалось войти';
      })
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        applyLogin(state, action.payload);
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Не удалось зарегистрироваться';
      });
  },
});

export const { logout, clearError } = userSlice.actions;
export const userReducer = userSlice.reducer;
