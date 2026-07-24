package com.duy.japankanji.service;

import com.duy.japankanji.dto.VocabularyRequest;
import com.duy.japankanji.dto.VocabularyResponse;
import com.duy.japankanji.entity.Vocabulary;
import com.duy.japankanji.repository.ReviewProgressRepository;
import com.duy.japankanji.repository.VocabularyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VocabularyServiceTest {

    @Mock
    private VocabularyRepository vocabularyRepository;

    @Mock
    private ReviewProgressRepository reviewProgressRepository;

    @InjectMocks
    private VocabularyService vocabularyService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void saveBulk_shouldSaveNewVocabularies_andSkipExistingOnes() {
        // Arrange
        VocabularyRequest req1 = new VocabularyRequest("学", "ガク", "まな.ぶ", "HỌC", "Học tập", "N5", "noun", 8);
        VocabularyRequest req2 = new VocabularyRequest("校", "コウ", "-", "HIỆU", "Trường học", "N5", "noun", 10);
        List<VocabularyRequest> bulkRequests = List.of(req1, req2);

        // Giả lập: "学" đã tồn tại trong DB, "校" chưa tồn tại
        when(vocabularyRepository.existsByKanji("学")).thenReturn(true);
        when(vocabularyRepository.existsByKanji("校")).thenReturn(false);

        Vocabulary savedKou = new Vocabulary(2L, "校", "コウ", "-", "HIỆU", "Trường học", "N5", "noun", 10);
        when(vocabularyRepository.save(any(Vocabulary.class))).thenReturn(savedKou);

        // Act
        List<VocabularyResponse> result = vocabularyService.saveBulk(bulkRequests);

        // Assert
        // Chỉ lưu 1 từ (chữ 校), chữ 学 bị bỏ qua
        verify(vocabularyRepository, times(1)).save(any(Vocabulary.class));
        assertThat(result).hasSize(1);
        assertThat(result.get(0).kanji()).isEqualTo("校");
    }
}
