import { createSlice } from '@reduxjs/toolkit';
import { fetchCategories, fetchStatistics } from '../../services/charityService';
import { Category, Statistics } from '../../types/models';
import { logout } from './userSlices';

export interface CharityState {
  categories: Category[];
  statistics: Statistics | null;
  loading: boolean;
  error: string | null;
}

const initialState: CharityState = {
  categories: [],
  statistics: null,
  loading: false,
  error: null,
};

export const charitySlice = createSlice({
  name: 'charity',
  initialState,
  reducers: {
    clearCharityError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Не удалось загрузить данные';
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      })
      // При выходе данные предыдущего пользователя не должны оставаться в store
      .addCase(logout, () => initialState);
  },
});

export const { clearCharityError } = charitySlice.actions;
export const charityReducer = charitySlice.reducer;
