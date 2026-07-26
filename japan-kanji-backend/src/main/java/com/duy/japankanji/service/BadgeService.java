package com.duy.japankanji.service;

import com.duy.japankanji.dto.BadgeResponse;
import com.duy.japankanji.entity.UserBadge;
import com.duy.japankanji.repository.UserBadgeRepository;
import com.duy.japankanji.repository.UserRepository;
import com.duy.japankanji.repository.ReviewProgressRepository;
import com.duy.japankanji.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeService {

    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;
    private final ReviewProgressRepository reviewProgressRepository;
    private final VocabularyRepository vocabularyRepository;

    public List<BadgeResponse> getUserBadges(String username) {
        Long userId = userRepository.findByUsername(username).orElseThrow().getId();
        return userBadgeRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void checkAndGrantBadges(Long userId, String jlptLevel) {
        if (jlptLevel == null || jlptLevel.isEmpty()) return;

        long totalVocab = vocabularyRepository.countByJlptLevel(jlptLevel);
        if (totalVocab == 0) return;

        long learnedVocab = reviewProgressRepository.countLearnedByUserIdAndJlptLevel(userId, jlptLevel);
        double percentage = (double) learnedVocab / totalVocab * 100;

        for (com.duy.japankanji.entity.enums.BadgeType badgeType : com.duy.japankanji.entity.enums.BadgeType.values()) {
            if (badgeType.getJlptLevel().equals(jlptLevel) && percentage >= badgeType.getRequiredPercentage()) {
                if (!userBadgeRepository.existsByUserIdAndBadgeType(userId, badgeType)) {
                    grantBadge(userId, badgeType);
                }
            }
        }
    }

    private void grantBadge(Long userId, com.duy.japankanji.entity.enums.BadgeType badgeType) {
        Optional<com.duy.japankanji.entity.User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            UserBadge userBadge = new UserBadge();
            userBadge.setUser(userOpt.get());
            userBadge.setBadgeType(badgeType);
            userBadge.setUnlockedAt(LocalDateTime.now());
            userBadgeRepository.save(userBadge);
            log.info("Granted badge {} to user {}", badgeType.name(), userId);
        }
    }

    private BadgeResponse toResponse(UserBadge userBadge) {
        return new BadgeResponse(
                userBadge.getBadgeType().name(),
                userBadge.getBadgeType().getTitle(),
                userBadge.getBadgeType().getDescription(),
                userBadge.getBadgeType().getJlptLevel(),
                userBadge.getBadgeType().getRequiredPercentage(),
                userBadge.getUnlockedAt()
        );
    }
}
