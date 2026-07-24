package com.duy.japankanji.service;

import com.duy.japankanji.entity.ReviewProgress;
import com.duy.japankanji.entity.User;
import com.duy.japankanji.entity.Vocabulary;
import com.duy.japankanji.repository.ReviewProgressRepository;
import com.duy.japankanji.repository.UserRepository;
import com.duy.japankanji.repository.VocabularyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudyServiceTest {

    @Mock
    private ReviewProgressRepository reviewProgressRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VocabularyRepository vocabularyRepository;

    @Mock
    private Sm2Service sm2Service;

    @InjectMocks
    private StudyService studyService;

    private User user;
    private Vocabulary vocab;
    private ReviewProgress progress;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        vocab = new Vocabulary();
        vocab.setId(10L);
        vocab.setKanji("日");

        progress = new ReviewProgress();
        progress.setUser(user);
        progress.setVocabulary(vocab);
    }

    @Test
    void submitReview_shouldCallSm2ServiceWithQuality() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(vocabularyRepository.findById(10L)).thenReturn(Optional.of(vocab));
        when(reviewProgressRepository.findByUserIdAndVocabularyId(1L, 10L)).thenReturn(Optional.of(progress));

        int quality = 4; // Good

        // Act
        studyService.submitReview("testuser", 10L, quality);

        // Assert
        verify(sm2Service, times(1)).updateProgress(progress, quality);
        verify(reviewProgressRepository, times(1)).save(progress);
    }
}
