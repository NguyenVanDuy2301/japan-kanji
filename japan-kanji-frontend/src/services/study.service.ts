import api from './api';
import type { VocabularyResponse } from '../types/vocabulary.types';

export const studyService = {
  getLessons: async (deckId: number, limit: number = 10): Promise<VocabularyResponse[]> => {
    const response = await api.get<VocabularyResponse[]>(`/api/study/lessons/${deckId}?limit=${limit}`);
    return response.data;
  },
  getPractice: async (deckId: number): Promise<VocabularyResponse[]> => {
    const response = await api.get<VocabularyResponse[]>(`/api/study/practice/${deckId}`);
    return response.data;
  },

  getDueReviews: async (): Promise<VocabularyResponse[]> => {
    const response = await api.get<VocabularyResponse[]>('/api/study/reviews');
    return response.data;
  },

  submitReview: async (vocabularyId: number, quality: number): Promise<void> => {
    await api.post(`/api/study/submit-review?vocabularyId=${vocabularyId}&quality=${quality}`);
  }
};
