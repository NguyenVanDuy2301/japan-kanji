package com.duy.japankanji.service;

import com.duy.japankanji.dto.StudyStatisticsResponse;
import com.duy.japankanji.dto.VocabularyResponse;
import com.duy.japankanji.entity.ReviewProgress;
import com.duy.japankanji.entity.User;
import com.duy.japankanji.entity.Vocabulary;
import com.duy.japankanji.repository.ReviewProgressRepository;
import com.duy.japankanji.repository.UserRepository;
import com.duy.japankanji.repository.VocabularyRepository;
import com.duy.japankanji.event.VocabularyLearnedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudyService {

    private final ReviewProgressRepository reviewProgressRepository;
    private final UserRepository userRepository;
    private final VocabularyRepository vocabularyRepository;
    private final Sm2Service sm2Service;
    private final ApplicationEventPublisher eventPublisher;

    public List<VocabularyResponse> getLessons(Long deckId, String username, int limit) {
        User user = userRepository.findByUsername(username).orElseThrow();
        List<Vocabulary> unstudied = reviewProgressRepository.findUnstudiedVocabulariesInDeck(deckId, user.getId(),
                PageRequest.of(0, limit));
        return unstudied.stream().map(this::toResponse).toList();
    }

    public List<VocabularyResponse> getDueReviews(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        List<ReviewProgress> dueReviews = reviewProgressRepository.findDueReviews(user.getId(), LocalDate.now());
        return dueReviews.stream().map(rp -> toResponse(rp.getVocabulary())).toList();
    }

    public List<VocabularyResponse> getPractice(Long deckId) {
        return vocabularyRepository.findByDeckId(deckId).stream()
                .map(this::toResponse)
                .toList();
    }

    public StudyStatisticsResponse getUserStatistics(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        Long userId = user.getId();

        long totalVocab = vocabularyRepository.countTotalVocabulariesForUser(userId);
        long mastered = reviewProgressRepository.countMasteredByUserId(userId);
        long learning = reviewProgressRepository.countLearningByUserId(userId);
        long unseen = totalVocab - mastered - learning;
        if (unseen < 0)
            unseen = 0;

        return new StudyStatisticsResponse(mastered, learning, unseen);
    }

    @Transactional
    public void submitReview(String username, Long vocabularyId, int quality) {
        User user = userRepository.findByUsername(username).orElseThrow();
        Vocabulary vocabulary = vocabularyRepository.findById(vocabularyId).orElseThrow();

        ReviewProgress progress = reviewProgressRepository.findByUserIdAndVocabularyId(user.getId(), vocabularyId)
                .orElseGet(() -> {
                    ReviewProgress rp = new ReviewProgress();
                    rp.setUser(user);
                    rp.setVocabulary(vocabulary);
                    rp.setEaseFactor(2.5);
                    rp.setIntervalDays(0);
                    rp.setRepetitions(0);
                    return rp;
                });

        sm2Service.updateProgress(progress, quality);

        reviewProgressRepository.save(progress);
        
        eventPublisher.publishEvent(new VocabularyLearnedEvent(this, user.getId(), vocabulary.getJlptLevel()));
    }

    private VocabularyResponse toResponse(Vocabulary vocabulary) {
        return new VocabularyResponse(
                vocabulary.getId(),
                vocabulary.getKanji(),
                vocabulary.getOnyomi(),
                vocabulary.getKunyomi(),
                vocabulary.getHanViet(),
                vocabulary.getMeaning(),
                vocabulary.getJlptLevel(),
                vocabulary.getWordType(),
                vocabulary.getStrokeCount());
    }

    @Transactional
    public void forceDueReviews(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        reviewProgressRepository.forceDueReviewsForUser(user.getId(), LocalDate.now().minusDays(1));
    }
}
