import axios from 'axios';
import { API_URL, Pages } from '../constants/commonConstants';
import { clearSession, getToken } from '../utils/session';

// Возвращает набор методов для запросов к бэкенду. Токен читается в момент вызова.
export const getAxiosInstance = () => {
  const token = getToken();

  const client = axios.create({
    baseURL: API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  // Токен просрочен или недействителен: чистим сессию и отправляем на страницу входа
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401 && token) {
        clearSession();
        window.location.assign(Pages.Login);
      }
      return Promise.reject(error);
    }
  );

  const axiosGet = async <T>(url: string, params?: object): Promise<T> => {
    const response = await client.get<T>(url, { params });
    return response.data;
  };

  const axiosPost = async <T>(url: string, data?: unknown, params?: object): Promise<T> => {
    const response = await client.post<T>(url, data, { params });
    return response.data;
  };

  const axiosPut = async <T>(url: string, data?: unknown, params?: object): Promise<T> => {
    const response = await client.put<T>(url, data, { params });
    return response.data;
  };

  const axiosDelete = async <T>(url: string, params?: object): Promise<T> => {
    const response = await client.delete<T>(url, { params });
    return response.data;
  };

  // POST-запрос, который возвращает файл
  const axiosBlob = async (url: string, data?: unknown): Promise<Blob> => {
    const response = await client.post<Blob>(url, data, { responseType: 'blob' });
    return response.data;
  };

  return { axiosGet, axiosPost, axiosPut, axiosDelete, axiosBlob };
};
