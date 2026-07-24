package com.duy.japankanji.dto;

public record VocabularyResponse(
        Long id,
        String kanji,
        String onyomi,
        String kunyomi,
        String hanViet,
        String meaning,
        String jlptLevel,
        String wordType,
        Integer strokeCount
) {}
