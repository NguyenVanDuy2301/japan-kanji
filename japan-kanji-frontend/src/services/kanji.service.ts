import api from "./api";
import type { VocabularyResponse } from "../types/vocabulary.types";

export type { VocabularyResponse };

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
  searchKanji: async (
    query?: string,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<KanjiResponse>> => {
    const response = await api.get("/api/kanji/search", {
      params: { q: query, page, size },
    });
    const data = response.data;
    // Hỗ trợ cả cấu trúc PageImpl phẳng và PagedModel lồng (Spring Boot 3.3+/4.0)
    return {
      content: data.content ?? [],
      totalPages: data.totalPages ?? data.page?.totalPages ?? 0,
      totalElements: data.totalElements ?? data.page?.totalElements ?? 0,
      number: data.number ?? data.page?.number ?? page,
      size: data.size ?? data.page?.size ?? size,
    };
  },

  getKanjiDetails: async (character: string): Promise<KanjiDetailsResponse> => {
    const response = await api.get(`/api/kanji/${character}`);
    return response.data;
  },
};
