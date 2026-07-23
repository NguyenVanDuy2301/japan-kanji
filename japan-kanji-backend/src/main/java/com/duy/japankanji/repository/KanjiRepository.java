package com.duy.japankanji.repository;

import com.duy.japankanji.entity.Kanji;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KanjiRepository extends JpaRepository<Kanji, Long> {
    Optional<Kanji> findByCharacter(String character);

    @Query("SELECT k FROM Kanji k WHERE LOWER(k.character) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(k.onyomi) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(k.kunyomi) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(k.hanViet) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Kanji> searchKanji(@Param("query") String query, Pageable pageable);
}
