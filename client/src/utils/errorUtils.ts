import axios from 'axios';

// Приводит любую ошибку к понятному тексту для пользователя
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Не удалось связаться с сервером. Проверьте, что бэкенд запущен.';
    }

    const data = error.response.data as
      | { errorText?: string; title?: string; errors?: Record<string, string[]> }
      | undefined;

    if (data && typeof data === 'object') {
      if (data.errorText) {
        return data.errorText;
      }
      if (data.errors) {
        const messages = Object.values(data.errors).flat();
        if (messages.length > 0) {
          return messages.join(' ');
        }
      }
      if (data.title) {
        return data.title;
      }
    }

    if (error.response.status === 403) {
      return 'Недостаточно прав для этого действия.';
    }
    if (error.response.status === 401) {
      return 'Сессия истекла. Войдите заново.';
    }
    return `Ошибка сервера (${error.response.status}).`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Произошла неизвестная ошибка.';
};
