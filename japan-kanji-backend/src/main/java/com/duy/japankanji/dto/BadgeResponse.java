package com.duy.japankanji.dto;

import java.time.LocalDateTime;

public record BadgeResponse(
    String badgeType,
    String title,
    String description,
    String jlptLevel,
    int requiredPercentage,
    LocalDateTime unlockedAt
) {}
