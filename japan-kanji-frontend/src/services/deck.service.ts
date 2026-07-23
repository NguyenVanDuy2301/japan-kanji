import api from './api';

export interface DeckResponse {
  id: number;
  title: string;
  description: string;
  isOfficial: boolean;
  vocabularyCount: number;
}

export const deckService = {
  getOfficialDecks: async (): Promise<DeckResponse[]> => {
    const response = await api.get<DeckResponse[]>('/api/decks/official');
    return response.data;
  },
  
  getCustomDecks: async (): Promise<DeckResponse[]> => {
    const response = await api.get<DeckResponse[]>(`/api/decks/custom`);
    return response.data;
  },

  getDeck: async (deckId: number): Promise<DeckResponse> => {
    const response = await api.get<DeckResponse>(`/api/decks/${deckId}`);
    return response.data;
  },

  createCustomDeck: async (title: string, description: string): Promise<DeckResponse> => {
    const response = await api.post<DeckResponse>(`/api/decks`, { title, description });
    return response.data;
  },

  updateCustomDeck: async (deckId: number, title: string, description: string): Promise<DeckResponse> => {
    const response = await api.put<DeckResponse>(`/api/decks/${deckId}`, { title, description });
    return response.data;
  },

  deleteCustomDeck: async (deckId: number): Promise<void> => {
    await api.delete(`/api/decks/${deckId}`);
  },

  addVocabulary: async (deckId: number, vocabId: number): Promise<void> => {
    await api.post(`/api/decks/${deckId}/vocabularies/${vocabId}`);
  },

  removeVocabulary: async (deckId: number, vocabId: number): Promise<void> => {
    await api.delete(`/api/decks/${deckId}/vocabularies/${vocabId}`);
  },

  getSavedDecks: async (): Promise<DeckResponse[]> => {
    const response = await api.get<DeckResponse[]>('/api/decks/saved');
    return response.data;
  },

  saveDeck: async (deckId: number): Promise<void> => {
    await api.post(`/api/decks/${deckId}/save`);
  },

  unsaveDeck: async (deckId: number): Promise<void> => {
    await api.delete(`/api/decks/${deckId}/save`);
  }
};
