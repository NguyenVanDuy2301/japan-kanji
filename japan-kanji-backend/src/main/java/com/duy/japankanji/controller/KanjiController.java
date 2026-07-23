package com.duy.japankanji.controller;

import com.duy.japankanji.dto.KanjiDetailsResponse;
import com.duy.japankanji.dto.KanjiResponse;
import com.duy.japankanji.service.KanjiService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kanji")
public class KanjiController {

    private final KanjiService kanjiService;

    public KanjiController(KanjiService kanjiService) {
        this.kanjiService = kanjiService;
    }

    @GetMapping("/search")
    public ResponseEntity<Page<KanjiResponse>> searchKanji(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(kanjiService.searchKanji(query, page, size));
    }

    @GetMapping("/{character}")
    public ResponseEntity<KanjiDetailsResponse> getKanjiDetails(@PathVariable String character) {
        return ResponseEntity.ok(kanjiService.getKanjiDetails(character));
    }
}
