import api from "./api";
export interface VocabularyResponse {
    id: number;
    kanji: string;
    onyomi: string;
    kunyomi: string;
    hanViet: string;
    meaning: string;
    jlptLevel: string;
    wordType: string;
}

export interface KanjiResponse {
    id: number;
    character: string;
    onyomi: string;
    kunyomi: string;
    hanViet: string;
    meaning: string;
    strokeCount: number;
    radical: string;
    jlptLevel: string;
}

export interface KanjiDetailsResponse extends KanjiResponse {
    examples: VocabularyResponse[];
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

export const kanjiService = {
    searchKanji: async (query?: string, page: number = 0, size: number = 10): Promise<PageResponse<KanjiResponse>> => {
        const response = await api.get('/api/kanji/search', {
            params: { q: query, page, size }
        });
        return response.data;
    },

    getKanjiDetails: async (character: string): Promise<KanjiDetailsResponse> => {
        const response = await api.get(`/api/kanji/${character}`);
        return response.data;
    }
};
