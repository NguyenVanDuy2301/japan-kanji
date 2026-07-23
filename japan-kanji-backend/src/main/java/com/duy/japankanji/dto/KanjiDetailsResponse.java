package com.duy.japankanji.dto;

import java.util.List;

public record KanjiDetailsResponse(
        Long id,
        String character,
        String onyomi,
        String kunyomi,
        String hanViet,
        String meaning,
        Integer strokeCount,
        String radical,
        String jlptLevel,
        List<VocabularyResponse> examples
) {}
