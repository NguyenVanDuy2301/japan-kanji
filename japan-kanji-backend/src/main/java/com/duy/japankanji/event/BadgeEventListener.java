package com.duy.japankanji.event;

import com.duy.japankanji.service.BadgeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class BadgeEventListener {

    private final BadgeService badgeService;

    public BadgeEventListener(BadgeService badgeService) {
        this.badgeService = badgeService;
    }

    @EventListener
    public void handleVocabularyLearnedEvent(VocabularyLearnedEvent event) {
        Long userId = event.getUserId();
        String jlptLevel = event.getJlptLevel();

        badgeService.checkAndGrantBadges(userId, jlptLevel);
    }
}
