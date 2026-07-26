package com.duy.japankanji.controller;

import com.duy.japankanji.dto.BadgeResponse;
import com.duy.japankanji.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    @GetMapping("/me")
    public ResponseEntity<List<BadgeResponse>> getMyBadges(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(badgeService.getUserBadges(username));
    }
}
