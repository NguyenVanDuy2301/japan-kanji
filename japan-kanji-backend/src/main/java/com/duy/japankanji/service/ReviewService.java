package com.duy.japankanji.service;

import com.duy.japankanji.dto.ReviewAnswerRequest;
import com.duy.japankanji.dto.ReviewProgressResponse;
import com.duy.japankanji.entity.ReviewProgress;
import com.duy.japankanji.entity.User;
import com.duy.japankanji.entity.Vocabulary;
import com.duy.japankanji.repository.ReviewProgressRepository;
import com.duy.japankanji.repository.UserRepository;
import com.duy.japankanji.repository.VocabularyRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewProgressRepository reviewProgressRepository;
    private final UserRepository userRepository;
    private final VocabularyRepository vocabularyRepository;
    private final Sm2Service sm2Service;

    public ReviewService(
            ReviewProgressRepository reviewProgressRepository,
            UserRepository userRepository,
            VocabularyRepository vocabularyRepository,
            Sm2Service sm2Service
    ) {
        this.reviewProgressRepository = reviewProgressRepository;
        this.userRepository = userRepository;
        this.vocabularyRepository = vocabularyRepository;
        this.sm2Service = sm2Service;
    }

    public List<ReviewProgressResponse> getWordsDueForReview(String username) {
        User user = findUserByUsername(username);

        List<ReviewProgress> dueList = reviewProgressRepository
                .findByUserAndNextReviewDateLessThanEqual(user, LocalDate.now());

        return dueList.stream()
                .map(this::toResponse)
                .toList();
    }

    public ReviewProgressResponse submitAnswer(String username, ReviewAnswerRequest request) {
        User user = findUserByUsername(username);

        Vocabulary vocabulary = vocabularyRepository.findById(request.vocabularyId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Không tìm thấy từ vựng id=" + request.vocabularyId()));

        ReviewProgress progress = reviewProgressRepository
                .findByUserAndVocabulary(user, vocabulary)
                .orElseGet(() -> createNewProgress(user, vocabulary));

        sm2Service.updateProgress(progress, request.quality());

        ReviewProgress saved = reviewProgressRepository.save(progress);
        return toResponse(saved);
    }

    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user: " + username));
    }

    private ReviewProgress createNewProgress(User user, Vocabulary vocabulary) {
        ReviewProgress progress = new ReviewProgress();
        progress.setUser(user);
        progress.setVocabulary(vocabulary);
        return progress;
    }

    private ReviewProgressResponse toResponse(ReviewProgress progress) {
        Vocabulary vocabulary = progress.getVocabulary();
        return new ReviewProgressResponse(
                vocabulary.getId(),
                vocabulary.getKanji(),
                vocabulary.getMeaning(),
                progress.getEaseFactor(),
                progress.getIntervalDays(),
                progress.getRepetitions(),
                progress.getNextReviewDate()
        );
    }
}