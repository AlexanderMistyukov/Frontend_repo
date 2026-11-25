import { getAxiosInstance } from './axiosInstance';
import { DownloadFileRequestDto, UploadFileRequestDto } from '../types/apiTypes';

export const FilesApi = () => {
  const api = getAxiosInstance();

  return {
    uploadFile: (data: UploadFileRequestDto) => api.axiosPost<{ fileId: number }>('/files/upload', data),
    downloadFile: (data: DownloadFileRequestDto) => api.axiosBlob('/files/download', data),
    deleteFile: (id: number) => api.axiosDelete<void>(`/files/${id}`),
  };
};
