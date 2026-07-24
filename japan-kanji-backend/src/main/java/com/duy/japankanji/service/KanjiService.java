package com.duy.japankanji.service;

import com.duy.japankanji.dto.KanjiDetailsResponse;
import com.duy.japankanji.dto.KanjiResponse;
import com.duy.japankanji.dto.VocabularyResponse;
import com.duy.japankanji.entity.Kanji;
import com.duy.japankanji.entity.Vocabulary;
import com.duy.japankanji.repository.KanjiRepository;
import com.duy.japankanji.repository.VocabularyRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class KanjiService {

    private final KanjiRepository kanjiRepository;
    private final VocabularyRepository vocabularyRepository;

    public KanjiService(KanjiRepository kanjiRepository, VocabularyRepository vocabularyRepository) {
        this.kanjiRepository = kanjiRepository;
        this.vocabularyRepository = vocabularyRepository;
    }

    @Transactional(readOnly = true)
    public Page<KanjiResponse> searchKanji(String query, int page, int size) {
        Page<Kanji> kanjis;
        if (query == null || query.trim().isEmpty()) {
            kanjis = kanjiRepository.findAll(PageRequest.of(page, size));
        } else {
            kanjis = kanjiRepository.searchKanji(query.trim(), PageRequest.of(page, size));
        }
        
        return kanjis.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public KanjiDetailsResponse getKanjiDetails(String character) {
        Kanji kanji = kanjiRepository.findByCharacter(character)
                .orElseThrow(() -> new RuntimeException("Kanji not found: " + character));

        List<Vocabulary> vocabularies = vocabularyRepository.findByKanjiContaining(character);
        List<VocabularyResponse> examples = vocabularies.stream().map(this::mapToVocabularyResponse).toList();

        return new KanjiDetailsResponse(
                kanji.getId(),
                kanji.getCharacter(),
                kanji.getOnyomi(),
                kanji.getKunyomi(),
                kanji.getHanViet(),
                kanji.getMeaning(),
                kanji.getStrokeCount(),
                kanji.getRadical(),
                kanji.getJlptLevel(),
                examples
        );
    }

    private KanjiResponse mapToResponse(Kanji kanji) {
        return new KanjiResponse(
                kanji.getId(),
                kanji.getCharacter(),
                kanji.getOnyomi(),
                kanji.getKunyomi(),
                kanji.getHanViet(),
                kanji.getMeaning(),
                kanji.getStrokeCount(),
                kanji.getRadical(),
                kanji.getJlptLevel()
        );
    }

    private VocabularyResponse mapToVocabularyResponse(Vocabulary vocab) {
        return new VocabularyResponse(
                vocab.getId(),
                vocab.getKanji(),
                vocab.getOnyomi(),
                vocab.getKunyomi(),
                vocab.getHanViet(),
                vocab.getMeaning(),
                vocab.getJlptLevel(),
                vocab.getWordType(),
                vocab.getStrokeCount()
        );
    }
}
