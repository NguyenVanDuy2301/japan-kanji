package com.duy.japankanji.controller;

import com.duy.japankanji.dto.PageResponse;
import com.duy.japankanji.dto.VocabularyRequest;
import com.duy.japankanji.dto.VocabularyResponse;
import com.duy.japankanji.service.VocabularyService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/vocabularies")
public class VocabularyController {

    private final VocabularyService vocabularyService;

    public VocabularyController(VocabularyService vocabularyService) {
        this.vocabularyService = vocabularyService;
    }

    @GetMapping
    public PageResponse<VocabularyResponse> getVocabularies(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return vocabularyService.getVocabularies(keyword, page, size);
    }

    @GetMapping("/{id}")
    public VocabularyResponse getVocabularyById(@PathVariable Long id) {
        return vocabularyService.getVocabularyById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VocabularyResponse createVocabulary(@Valid @RequestBody VocabularyRequest request) {
        return vocabularyService.createVocabulary(request);
    }

    @PutMapping("/{id}")
    public VocabularyResponse updateVocabulary(
            @PathVariable Long id,
            @Valid @RequestBody VocabularyRequest request
    ) {
        return vocabularyService.updateVocabulary(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteVocabulary(@PathVariable Long id) {
        vocabularyService.deleteVocabulary(id);
    }
}
