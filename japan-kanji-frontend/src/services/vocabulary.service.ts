import api from './api';
import type { VocabularyResponse } from '../types/vocabulary.types';

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export const vocabularyService = {
  searchVocabularies: async (keyword: string = '', page: number = 0, size: number = 10): Promise<PageResponse<VocabularyResponse>> => {
    const response = await api.get<PageResponse<VocabularyResponse>>('/api/vocabularies', {
      params: { keyword, page, size }
    });
    return response.data;
  }
};
