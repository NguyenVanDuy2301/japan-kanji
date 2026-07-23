package com.duy.japankanji.dto;

public record StudyStatisticsResponse(
        long masteredCount,
        long learningCount,
        long unseenCount
) {
}
