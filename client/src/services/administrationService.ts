import { createAsyncThunk } from '@reduxjs/toolkit';
import { AdministrationApi } from '../api';
import { SetUserRoleRequestDto } from '../types/apiTypes';
import { UserInfo } from '../types/models';
import { getErrorMessage } from '../utils';

export const fetchUsers = createAsyncThunk<UserInfo[], void, { rejectValue: string }>(
  'administration/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await AdministrationApi().getUsers();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const setUserRole = createAsyncThunk<void, SetUserRoleRequestDto, { rejectValue: string }>(
  'administration/setUserRole',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      await AdministrationApi().setUserRole(data);
      await dispatch(fetchUsers());
      return undefined;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
