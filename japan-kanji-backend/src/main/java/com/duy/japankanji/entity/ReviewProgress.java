package com.duy.japankanji.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "review_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "vocabulary_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class ReviewProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vocabulary_id", nullable = false)
    private Vocabulary vocabulary;

    // ==== Các field cốt lõi của thuật toán SM-2 ====

    @Column(name = "ease_factor", nullable = false)
    private Double easeFactor = 2.5; // hệ số "độ dễ" — càng cao thì khoảng cách ôn càng giãn nhanh

    @Column(name = "interval_days", nullable = false)
    private Integer intervalDays = 0; // số ngày tới lần ôn tiếp theo

    @Column(nullable = false)
    private Integer repetitions = 0; // số lần trả lời đúng liên tiếp

    @Column(name = "next_review_date", nullable = false)
    private LocalDate nextReviewDate = LocalDate.now(); // ngày cần ôn lại

    @Column(name = "last_reviewed_at")
    private LocalDateTime lastReviewedAt; // lần ôn gần nhất, null nếu chưa ôn lần nào
}