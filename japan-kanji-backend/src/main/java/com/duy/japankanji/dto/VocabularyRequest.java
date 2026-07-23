package com.duy.japankanji.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VocabularyRequest(
        @NotBlank(message = "Kanji không được để trống")
        String kanji,

        String onyomi,
        String kunyomi,

        String hanViet,

        @NotBlank(message = "Nghĩa tiếng Việt không được để trống")
        String meaning,

        @NotBlank(message = "JLPT Level không được để trống")
        @Pattern(regexp = "^N[1-5]$", message = "JLPT Level phải là N1, N2, N3, N4, hoặc N5")
        String jlptLevel,

        String wordType
) {}
