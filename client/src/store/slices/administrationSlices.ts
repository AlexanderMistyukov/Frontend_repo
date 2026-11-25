import { createSlice } from '@reduxjs/toolkit';
import { fetchUsers, setUserRole } from '../../services/administrationService';
import { UserInfo } from '../../types/models';
import { logout } from './userSlices';

export interface AdministrationState {
  users: UserInfo[];
  loading: boolean;
  error: string | null;
}

const initialState: AdministrationState = {
  users: [],
  loading: false,
  error: null,
};

export const administrationSlice = createSlice({
  name: 'administration',
  initialState,
  reducers: {
    clearAdministrationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Не удалось загрузить пользователей';
      })
      .addCase(setUserRole.rejected, (state, action) => {
        state.error = action.payload ?? 'Не удалось изменить роль';
      })
      // При выходе данные предыдущего пользователя не должны оставаться в store
      .addCase(logout, () => initialState);
  },
});

export const { clearAdministrationError } = administrationSlice.actions;
export const administrationReducer = administrationSlice.reducer;
