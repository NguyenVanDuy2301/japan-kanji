package com.duy.japankanji.repository;

import com.duy.japankanji.entity.ReviewProgress;
import com.duy.japankanji.entity.User;
import com.duy.japankanji.entity.Vocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReviewProgressRepository extends JpaRepository<ReviewProgress, Long> {

    Optional<ReviewProgress> findByUserAndVocabulary(User user, Vocabulary vocabulary);

    // Lấy danh sách từ cần ôn hôm nay (hoặc quá hạn) của 1 user
    List<ReviewProgress> findByUserAndNextReviewDateLessThanEqual(User user, LocalDate date);

    boolean existsByVocabularyId(Long vocabularyId);

    @Query("SELECT r FROM ReviewProgress r WHERE r.user.id = :userId AND r.nextReviewDate <= :date ORDER BY r.nextReviewDate ASC")
    List<ReviewProgress> findDueReviews(@Param("userId") Long userId, @Param("date") java.time.LocalDate date);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE ReviewProgress r SET r.nextReviewDate = :date WHERE r.user.id = :userId")
    void forceDueReviewsForUser(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT v FROM Deck d JOIN d.vocabularies v WHERE d.id = :deckId AND NOT EXISTS (SELECT r FROM ReviewProgress r WHERE r.user.id = :userId AND r.vocabulary.id = v.id)")
    List<Vocabulary> findUnstudiedVocabulariesInDeck(@Param("deckId") Long deckId, @Param("userId") Long userId, org.springframework.data.domain.Pageable pageable);

    Optional<ReviewProgress> findByUserIdAndVocabularyId(Long userId, Long vocabularyId);

    @Query("SELECT COUNT(r) FROM ReviewProgress r WHERE r.user.id = :userId AND r.intervalDays > 21")
    long countMasteredByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM ReviewProgress r WHERE r.user.id = :userId AND r.intervalDays <= 21 AND r.repetitions > 0")
    long countLearningByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM ReviewProgress r WHERE r.user.id = :userId AND r.vocabulary.jlptLevel = :jlptLevel AND r.repetitions > 0")
    long countLearnedByUserIdAndJlptLevel(@Param("userId") Long userId, @Param("jlptLevel") String jlptLevel);
}