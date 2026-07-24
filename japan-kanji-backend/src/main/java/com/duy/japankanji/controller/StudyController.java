package com.duy.japankanji.controller;

import com.duy.japankanji.dto.StudyStatisticsResponse;
import com.duy.japankanji.dto.VocabularyResponse;
import com.duy.japankanji.service.StudyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study")
public class StudyController {

    private final StudyService studyService;

    public StudyController(StudyService studyService) {
        this.studyService = studyService;
    }

    @GetMapping("/lessons/{deckId}")
    public ResponseEntity<List<VocabularyResponse>> getLessons(
            @PathVariable Long deckId,
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        return ResponseEntity.ok(studyService.getLessons(deckId, authentication.getName(), limit));
    }

    @GetMapping("/practice/{deckId}")
    public ResponseEntity<List<VocabularyResponse>> getPractice(
            @PathVariable Long deckId) {
        return ResponseEntity.ok(studyService.getPractice(deckId));
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<VocabularyResponse>> getDueReviews(Authentication authentication) {
        return ResponseEntity.ok(studyService.getDueReviews(authentication.getName()));
    }

    @GetMapping("/statistics")
    public ResponseEntity<StudyStatisticsResponse> getStatistics(Authentication authentication) {
        return ResponseEntity.ok(studyService.getUserStatistics(authentication.getName()));
    }

    @PostMapping("/submit-review")
    public ResponseEntity<Void> submitReview(
            @RequestParam Long vocabularyId,
            @RequestParam int quality,
            Authentication authentication) {
        studyService.submitReview(authentication.getName(), vocabularyId, quality);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/force-due")
    public ResponseEntity<Void> forceDueReviews(Authentication authentication) {
        studyService.forceDueReviews(authentication.getName());
        return ResponseEntity.ok().build();
    }
}
