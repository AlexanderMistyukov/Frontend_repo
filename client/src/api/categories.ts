import { getAxiosInstance } from './axiosInstance';
import { AddCategoryRequestDto, UpdateCategoryRequestDto } from '../types/apiTypes';
import { Category } from '../types/models';

export const CategoriesApi = () => {
  const api = getAxiosInstance();

  return {
    getCategories: () => api.axiosGet<Category[]>('/categories'),
    addCategory: (data: AddCategoryRequestDto) => api.axiosPost<{ categoryId: number }>('/categories/category', data),
    updateCategory: (data: UpdateCategoryRequestDto) => api.axiosPut<void>('/categories/category', data),
    deleteCategory: (id: number) => api.axiosDelete<void>('/categories/category', { id }),
  };
};
