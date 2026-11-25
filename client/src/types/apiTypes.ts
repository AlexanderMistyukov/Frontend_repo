import { UserRole } from './models';

// ---------- Авторизация ----------
export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  access_token: string;
  username: string;
  role: UserRole;
  expires_in: number;
}

export interface RegistrationRequestDto {
  login: string;
  password: string;
}

export interface RegistrationResponseDto {
  userId: number;
  message: string;
}

// ---------- Категории ----------
export interface AddCategoryRequestDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequestDto {
  id: number;
  name: string;
  description?: string;
}

// ---------- Транзакции ----------
export interface TransactionRequestDto {
  categoryId: number;
  title: string;
  amount: number;
  transactionDate: string;
  counterparty: string;
  notes?: string;
}

export interface UpdateTransactionRequestDto {
  id: number;
  data: TransactionRequestDto;
}

export interface CreateTransactionResponseDto {
  transactionId: number;
  message: string;
}

export interface IncomeRequestDto {
  transactionId: number;
  source: string;
  purpose: string;
  amount: number;
  incomeDate: string;
}

export interface ExpenseRequestDto {
  transactionId: number;
  recipient: string;
  expensePurpose: string;
  amount: number;
  expenseDate: string;
}

// ---------- Файлы ----------
export interface UploadFileRequestDto {
  fileName: string;
  fileContentBase64: string;
  transactionId: number;
}

export interface DownloadFileRequestDto {
  fileName: string;
}

export interface DownloadFileArgs {
  systemName: string;
  displayName: string;
}

// ---------- Администрирование ----------
export interface SetUserRoleRequestDto {
  userId: number;
  role: UserRole;
}

export interface SetUserRoleResponseDto {
  userId: number;
  role: UserRole;
  message: string;
}
