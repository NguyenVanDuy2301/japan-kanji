package com.duy.japankanji.service;

import com.duy.japankanji.dto.PageResponse;
import com.duy.japankanji.dto.VocabularyRequest;
import com.duy.japankanji.dto.VocabularyResponse;
import com.duy.japankanji.entity.Kanji;
import com.duy.japankanji.entity.Vocabulary;
import com.duy.japankanji.repository.KanjiRepository;
import com.duy.japankanji.repository.ReviewProgressRepository;
import com.duy.japankanji.repository.VocabularyRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class VocabularyService {

    private final VocabularyRepository vocabularyRepository;
    private final ReviewProgressRepository reviewProgressRepository;
    private final KanjiRepository kanjiRepository;

    public VocabularyService(VocabularyRepository vocabularyRepository, ReviewProgressRepository reviewProgressRepository, KanjiRepository kanjiRepository) {
        this.vocabularyRepository = vocabularyRepository;
        this.reviewProgressRepository = reviewProgressRepository;
        this.kanjiRepository = kanjiRepository;
    }

    public PageResponse<VocabularyResponse> getVocabularies(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Vocabulary> vocabularyPage;

        if (keyword != null && !keyword.trim().isEmpty()) {
            vocabularyPage = vocabularyRepository.findByKanjiContainingIgnoreCaseOrHanVietContainingIgnoreCase(keyword, keyword, pageable);
        } else {
            vocabularyPage = vocabularyRepository.findAll(pageable);
        }

        return new PageResponse<>(
                vocabularyPage.getContent().stream().map(this::toResponse).toList(),
                vocabularyPage.getNumber(),
                vocabularyPage.getSize(),
                vocabularyPage.getTotalElements(),
                vocabularyPage.getTotalPages()
        );
    }

    public VocabularyResponse getVocabularyById(Long id) {
        Vocabulary vocabulary = findById(id);
        return toResponse(vocabulary);
    }

    public VocabularyResponse createVocabulary(VocabularyRequest request) {
        Vocabulary vocabulary = new Vocabulary();
        updateEntityFromRequest(vocabulary, request);
        Vocabulary saved = vocabularyRepository.save(vocabulary);
        syncWithKanji(saved);
        return toResponse(saved);
    }

    public VocabularyResponse updateVocabulary(Long id, VocabularyRequest request) {
        Vocabulary vocabulary = findById(id);
        updateEntityFromRequest(vocabulary, request);
        Vocabulary saved = vocabularyRepository.save(vocabulary);
        syncWithKanji(saved);
        return toResponse(saved);
    }

    public java.util.List<VocabularyResponse> saveBulk(java.util.List<VocabularyRequest> requests) {
        java.util.List<VocabularyResponse> saved = new java.util.ArrayList<>();
        for (VocabularyRequest req : requests) {
            if (!vocabularyRepository.existsByKanji(req.kanji())) {
                Vocabulary vocabulary = new Vocabulary();
                updateEntityFromRequest(vocabulary, req);
                Vocabulary savedVocab = vocabularyRepository.save(vocabulary);
                syncWithKanji(savedVocab);
                saved.add(toResponse(savedVocab));
            }
        }
        return saved;
    }

    public void deleteVocabulary(Long id) {
        Vocabulary vocabulary = findById(id);
        if (reviewProgressRepository.existsByVocabularyId(id)) {
            throw new IllegalArgumentException("Không thể xóa từ vựng đã có người học");
        }
        
        // Also delete from Kanji table if it's a single character kanji
        if (vocabulary.getKanji() != null && vocabulary.getKanji().length() == 1) {
            kanjiRepository.findByCharacter(vocabulary.getKanji())
                .ifPresent(kanjiRepository::delete);
        }
        
        vocabularyRepository.delete(vocabulary);
    }

    private Vocabulary findById(Long id) {
        return vocabularyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy từ vựng id=" + id));
    }

    private void updateEntityFromRequest(Vocabulary vocabulary, VocabularyRequest request) {
        vocabulary.setKanji(request.kanji());
        vocabulary.setOnyomi(request.onyomi());
        vocabulary.setKunyomi(request.kunyomi());
        vocabulary.setHanViet(request.hanViet());
        vocabulary.setMeaning(request.meaning());
        vocabulary.setJlptLevel(request.jlptLevel());
        vocabulary.setWordType(request.wordType());
        vocabulary.setStrokeCount(request.strokeCount());
    }

    private void syncWithKanji(Vocabulary vocabulary) {
        if (vocabulary.getKanji() != null && vocabulary.getKanji().length() == 1) {
            Kanji kanji = kanjiRepository.findByCharacter(vocabulary.getKanji()).orElse(new Kanji());
            kanji.setCharacter(vocabulary.getKanji());
            kanji.setOnyomi(vocabulary.getOnyomi());
            kanji.setKunyomi(vocabulary.getKunyomi());
            kanji.setHanViet(vocabulary.getHanViet());
            kanji.setMeaning(vocabulary.getMeaning());
            kanji.setStrokeCount(vocabulary.getStrokeCount());
            kanji.setJlptLevel(vocabulary.getJlptLevel());
            if (kanji.getRadical() == null) {
                kanji.setRadical("-");
            }
            kanjiRepository.save(kanji);
        }
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
                vocabulary.getStrokeCount()
        );
    }
}
