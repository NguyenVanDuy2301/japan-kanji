package com.duy.japankanji.entity.enums;

import lombok.Getter;

@Getter
public enum BadgeType {
    // N5 Badges
    JLPT_N5_10_PERCENT("N5 Starter", "Học được 10% từ vựng N5", "N5", 10),
    JLPT_N5_50_PERCENT("N5 Halfway", "Học được 50% từ vựng N5", "N5", 50),
    JLPT_N5_100_PERCENT("N5 Master", "Hoàn thành 100% từ vựng N5", "N5", 100),
    
    // N4 Badges
    JLPT_N4_10_PERCENT("N4 Starter", "Học được 10% từ vựng N4", "N4", 10),
    JLPT_N4_50_PERCENT("N4 Halfway", "Học được 50% từ vựng N4", "N4", 50),
    JLPT_N4_100_PERCENT("N4 Master", "Hoàn thành 100% từ vựng N4", "N4", 100),

    // N3 Badges
    JLPT_N3_10_PERCENT("N3 Starter", "Học được 10% từ vựng N3", "N3", 10),
    JLPT_N3_50_PERCENT("N3 Halfway", "Học được 50% từ vựng N3", "N3", 50),
    JLPT_N3_100_PERCENT("N3 Master", "Hoàn thành 100% từ vựng N3", "N3", 100),

    // N2 Badges
    JLPT_N2_10_PERCENT("N2 Starter", "Học được 10% từ vựng N2", "N2", 10),
    JLPT_N2_50_PERCENT("N2 Halfway", "Học được 50% từ vựng N2", "N2", 50),
    JLPT_N2_100_PERCENT("N2 Master", "Hoàn thành 100% từ vựng N2", "N2", 100),

    // N1 Badges
    JLPT_N1_10_PERCENT("N1 Starter", "Học được 10% từ vựng N1", "N1", 10),
    JLPT_N1_50_PERCENT("N1 Halfway", "Học được 50% từ vựng N1", "N1", 50),
    JLPT_N1_100_PERCENT("N1 Master", "Hoàn thành 100% từ vựng N1", "N1", 100);

    private final String title;
    private final String description;
    private final String jlptLevel;
    private final int requiredPercentage;

    BadgeType(String title, String description, String jlptLevel, int requiredPercentage) {
        this.title = title;
        this.description = description;
        this.jlptLevel = jlptLevel;
        this.requiredPercentage = requiredPercentage;
    }
}
