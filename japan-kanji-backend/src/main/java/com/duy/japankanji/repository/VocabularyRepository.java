package com.duy.japankanji.repository;

import com.duy.japankanji.entity.Vocabulary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {
    List<Vocabulary> findByJlptLevel(String jlptLevel);
    
    long countByJlptLevel(String jlptLevel);
    
    Page<Vocabulary> findByKanjiContainingIgnoreCaseOrHanVietContainingIgnoreCase(String kanji, String hanViet, Pageable pageable);

    @Query("SELECT v FROM Deck d JOIN d.vocabularies v WHERE d.id = :deckId")
    List<Vocabulary> findByDeckId(@Param("deckId") Long deckId);

    List<Vocabulary> findByKanjiContaining(String kanji);

    @Query("SELECT COUNT(DISTINCT v.id) FROM Deck d JOIN d.vocabularies v WHERE d.author.id = :userId OR d IN (SELECT sd FROM User u JOIN u.savedDecks sd WHERE u.id = :userId) OR d.isOfficial = true")
    long countTotalVocabulariesForUser(@Param("userId") Long userId);

    boolean existsByKanji(String kanji);

    @Query("SELECT v.kanji FROM Vocabulary v WHERE v.kanji IN :kanjis")
    List<String> findKanjisIn(@Param("kanjis") List<String> kanjis);
}