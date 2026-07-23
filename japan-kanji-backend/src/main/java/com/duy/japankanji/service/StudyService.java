package com.duy.japankanji.service;

import com.duy.japankanji.dto.StudyStatisticsResponse;
import com.duy.japankanji.dto.VocabularyResponse;
import com.duy.japankanji.entity.ReviewProgress;
import com.duy.japankanji.entity.User;
import com.duy.japankanji.entity.Vocabulary;
import com.duy.japankanji.repository.ReviewProgressRepository;
import com.duy.japankanji.repository.UserRepository;
import com.duy.japankanji.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
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

    public List<VocabularyResponse> getLessons(Long deckId, String username, int limit) {
        User user = userRepository.findByUsername(username).orElseThrow();
        List<Vocabulary> unstudied = reviewProgressRepository.findUnstudiedVocabulariesInDeck(deckId, user.getId(), PageRequest.of(0, limit));
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
        if (unseen < 0) unseen = 0;

        return new StudyStatisticsResponse(mastered, learning, unseen);
    }

    @Transactional
    public void submitReview(String username, Long vocabularyId, boolean isCorrect) {
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

        if (isCorrect) {
            if (progress.getRepetitions() == 0) {
                progress.setIntervalDays(1);
            } else if (progress.getRepetitions() == 1) {
                progress.setIntervalDays(6);
            } else {
                progress.setIntervalDays((int) Math.round(progress.getIntervalDays() * progress.getEaseFactor()));
            }
            progress.setRepetitions(progress.getRepetitions() + 1);
        } else {
            progress.setRepetitions(0);
            progress.setIntervalDays(1);
            progress.setEaseFactor(Math.max(1.3, progress.getEaseFactor() - 0.2));
        }

        progress.setNextReviewDate(LocalDate.now().plusDays(progress.getIntervalDays()));
        reviewProgressRepository.save(progress);
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
                vocabulary.getWordType()
        );
    }
}
