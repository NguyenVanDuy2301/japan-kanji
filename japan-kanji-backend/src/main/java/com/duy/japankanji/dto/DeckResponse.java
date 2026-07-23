package com.duy.japankanji.dto;

import com.duy.japankanji.entity.Deck;

public record DeckResponse(
        Long id,
        String title,
        String description,
        Boolean isOfficial,
        int vocabularyCount
) {
    public static DeckResponse fromEntity(Deck deck) {
        return new DeckResponse(
                deck.getId(),
                deck.getTitle(),
                deck.getDescription(),
                deck.getIsOfficial(),
                deck.getVocabularies().size()
        );
    }
}
