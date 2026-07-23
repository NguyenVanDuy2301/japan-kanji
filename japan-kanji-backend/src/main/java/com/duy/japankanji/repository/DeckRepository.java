package com.duy.japankanji.repository;

import com.duy.japankanji.entity.Deck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeckRepository extends JpaRepository<Deck, Long> {
    List<Deck> findByIsOfficialTrue();
    List<Deck> findByAuthorId(Long authorId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM user_saved_decks WHERE deck_id = :deckId", nativeQuery = true)
    void deleteFromUserSavedDecks(@org.springframework.data.repository.query.Param("deckId") Long deckId);
}
