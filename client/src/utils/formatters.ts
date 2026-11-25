import { format, parseISO } from 'date-fns';

export const formatDate = (value: string): string => {
  const date = parseISO(value);
  return isNaN(date.getTime()) ? '' : format(date, 'dd.MM.yyyy');
};

export const formatMoney = (value: number): string => {
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value)} ₽`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} Б`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} КБ`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
};

// Значение для <input type="date"> (yyyy-MM-dd) из строки с датой от сервера
export const toDateInputValue = (value?: string): string => {
  const date = value ? parseISO(value) : new Date();
  return isNaN(date.getTime()) ? format(new Date(), 'yyyy-MM-dd') : format(date, 'yyyy-MM-dd');
};

// Из yyyy-MM-dd в строку UTC для сервера. Берём полдень, чтобы дата не «съезжала» из-за часового пояса.
export const dateInputToIso = (value: string): string => {
  return new Date(`${value}T12:00:00`).toISOString();
};
