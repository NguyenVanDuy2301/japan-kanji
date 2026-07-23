package com.duy.japankanji.dto;

public record KanjiResponse(
        Long id,
        String character,
        String onyomi,
        String kunyomi,
        String hanViet,
        String meaning,
        Integer strokeCount,
        String radical,
        String jlptLevel
) {}
