package com.duy.japankanji.controller;

import com.duy.japankanji.dto.ReviewAnswerRequest;
import com.duy.japankanji.dto.ReviewProgressResponse;
import com.duy.japankanji.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/due")
    public List<ReviewProgressResponse> getWordsDueForReview(Authentication authentication) {
        String username = authentication.getName();
        return reviewService.getWordsDueForReview(username);
    }

    @PostMapping("/answer")
    public ReviewProgressResponse submitAnswer(
            Authentication authentication,
            @Valid @RequestBody ReviewAnswerRequest request
    ) {
        String username = authentication.getName();
        return reviewService.submitAnswer(username, request);
    }
}