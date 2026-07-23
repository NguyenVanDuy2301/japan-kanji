package com.duy.japankanji.dto;

import java.time.LocalDate;

public record ReviewProgressResponse(
        Long vocabularyId,
        String kanji,
        String meaning,
        Double easeFactor,
        Integer intervalDays,
        Integer repetitions,
        LocalDate nextReviewDate
) {}