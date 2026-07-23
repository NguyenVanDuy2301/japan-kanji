import api from './api';

export interface StudyStatisticsResponse {
    masteredCount: number;
    learningCount: number;
    unseenCount: number;
}

export const statisticsService = {
    getStatistics: async (): Promise<StudyStatisticsResponse> => {
        const response = await api.get('/api/study/statistics');
        return response.data;
    }
};
