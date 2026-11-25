import { createAsyncThunk } from '@reduxjs/toolkit';
import { CategoriesApi, FilesApi, TransactionsApi } from '../api';
import {
  AddCategoryRequestDto,
  DownloadFileArgs,
  ExpenseRequestDto,
  IncomeRequestDto,
  TransactionRequestDto,
  UpdateCategoryRequestDto,
  UpdateTransactionRequestDto,
  UploadFileRequestDto,
} from '../types/apiTypes';
import { Category, Statistics } from '../types/models';
import { getErrorMessage, saveBlob } from '../utils';

type ThunkConfig = { rejectValue: string };

// ---------- Получение данных ----------
export const fetchCategories = createAsyncThunk<Category[], void, ThunkConfig>(
  'charity/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await CategoriesApi().getCategories();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchStatistics = createAsyncThunk<Statistics, void, ThunkConfig>(
  'charity/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      return await TransactionsApi().getStatistics();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ---------- Изменение данных ----------
// После каждого изменения заново загружаем категории и статистику, чтобы экран всегда показывал данные сервера
const createMutation = <Arg>(type: string, request: (arg: Arg) => Promise<unknown>) =>
  createAsyncThunk<void, Arg, ThunkConfig>(type, async (arg, { dispatch, rejectWithValue }) => {
    try {
      await request(arg);
      await Promise.all([dispatch(fetchCategories()), dispatch(fetchStatistics())]);
      return undefined;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  });

export const addCategory = createMutation<AddCategoryRequestDto>('charity/addCategory', (data) =>
  CategoriesApi().addCategory(data)
);

export const updateCategory = createMutation<UpdateCategoryRequestDto>('charity/updateCategory', (data) =>
  CategoriesApi().updateCategory(data)
);

export const deleteCategory = createMutation<number>('charity/deleteCategory', (id) =>
  CategoriesApi().deleteCategory(id)
);

export const updateTransaction = createMutation<UpdateTransactionRequestDto>(
  'charity/updateTransaction',
  ({ id, data }) => TransactionsApi().updateTransaction(id, data)
);

export const deleteTransaction = createMutation<number>('charity/deleteTransaction', (id) =>
  TransactionsApi().deleteTransaction(id)
);

export const addIncome = createMutation<IncomeRequestDto>('charity/addIncome', (data) =>
  TransactionsApi().addIncome(data)
);

export const deleteIncome = createMutation<number>('charity/deleteIncome', (id) =>
  TransactionsApi().deleteIncome(id)
);

export const addExpense = createMutation<ExpenseRequestDto>('charity/addExpense', (data) =>
  TransactionsApi().addExpense(data)
);

export const deleteExpense = createMutation<number>('charity/deleteExpense', (id) =>
  TransactionsApi().deleteExpense(id)
);

export const uploadFile = createMutation<UploadFileRequestDto>('charity/uploadFile', (data) =>
  FilesApi().uploadFile(data)
);

export const deleteFile = createMutation<number>('charity/deleteFile', (id) => FilesApi().deleteFile(id));

// Создание транзакции возвращает её id, чтобы страница могла сразу её выбрать
export const addTransaction = createAsyncThunk<number, TransactionRequestDto, ThunkConfig>(
  'charity/addTransaction',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await TransactionsApi().addTransaction(data);
      await Promise.all([dispatch(fetchCategories()), dispatch(fetchStatistics())]);
      return response.transactionId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Скачивание файла: данные в store не меняются, браузер просто сохраняет файл
export const downloadFile = createAsyncThunk<void, DownloadFileArgs, ThunkConfig>(
  'charity/downloadFile',
  async ({ systemName, displayName }, { rejectWithValue }) => {
    try {
      const blob = await FilesApi().downloadFile({ fileName: systemName });
      saveBlob(blob, displayName);
      return undefined;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
