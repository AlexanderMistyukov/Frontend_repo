import { getAxiosInstance } from './axiosInstance';
import {
  CreateTransactionResponseDto,
  ExpenseRequestDto,
  IncomeRequestDto,
  TransactionRequestDto,
} from '../types/apiTypes';
import { Statistics } from '../types/models';

export const TransactionsApi = () => {
  const api = getAxiosInstance();

  return {
    addTransaction: (data: TransactionRequestDto) =>
      api.axiosPost<CreateTransactionResponseDto>('/transactions/transaction', data),
    updateTransaction: (id: number, data: TransactionRequestDto) =>
      api.axiosPut<void>('/transactions/transaction', data, { id }),
    deleteTransaction: (id: number) => api.axiosDelete<void>('/transactions/transaction', { id }),

    addIncome: (data: IncomeRequestDto) => api.axiosPost<{ incomeId: number }>('/transactions/income', data),
    deleteIncome: (id: number) => api.axiosDelete<void>('/transactions/income', { id }),

    addExpense: (data: ExpenseRequestDto) => api.axiosPost<{ expenseId: number }>('/transactions/expense', data),
    deleteExpense: (id: number) => api.axiosDelete<void>('/transactions/expense', { id }),

    getStatistics: () => api.axiosGet<Statistics>('/transactions/statistics'),
  };
};
